// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockPocketbase, mockPocketbaseCollection } from '@/tests/mocks/pocketbase'

// The order a buyer captures. The browser sends the PayPal order id (captureOrder), and the action
// finds the transaction of that order through a PocketBase filter run with the admin token, then
// answers "no such order" or "not your order". An id that closes the quote would turn each call into
// a yes/no question about anything appended to the filter. The real action and the real transaction
// and bib services run here, over a fake PocketBase and a fake PayPal.

vi.mock('@clerk/nextjs/server', () => ({
	auth: vi.fn(),
}))
vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}))
vi.mock('@/lib/services/pocketbase', () => ({
	pb: mockPocketbase,
}))
vi.mock('@/lib/analytics/server', () => ({
	trackServer: vi.fn(),
}))
vi.mock('@/services/paypal.services', () => ({
	createOrder: vi.fn(),
	capturePayment: vi.fn(),
}))
vi.mock('@/services/notification.service', () => ({
	sendSellerSaleConfirmation: vi.fn(),
	sendSaleAlert: vi.fn(),
	sendBuyerPurchaseConfirmation: vi.fn(),
	sendAdminSaleAlert: vi.fn(),
}))
vi.mock('@/services/user.services', () => ({
	getUserLocaleByEmail: vi.fn(() => Promise.resolve('fr')),
	fetchUserById: vi.fn(),
	fetchUserByClerkId: vi.fn(),
}))

import { auth } from '@clerk/nextjs/server'
import { captureOrder } from '@/app/[locale]/purchase/actions'
import { dateToPbDateString, pbDateToLuxon } from '@/lib/utils/date'
import type { Bib } from '@/models/bib.model'
import type { User } from '@/models/user.model'
import { capturePayment } from '@/services/paypal.services'
import { getTransactionByOrderId } from '@/services/transaction.services'
import { fetchUserByClerkId } from '@/services/user.services'

const ORDER_ID = 'ORDER-1234567890ABCDEFGH'
const LEGACY_ORDER_ID = '5O190127TN364715T'

// Locked half a minute ago by the buyer under test
const bib = {
	validated: true,
	status: 'available',
	sellerUserId: 'seller_pb',
	registrationNumber: 'REG-42',
	price: 100,
	originalPrice: 120,
	optionValues: {},
	lockedAt: dateToPbDateString(new Date(Date.now() - 30_000)),
	listed: 'public',
	id: 'bib_1',
	eventId: 'event_1',
} as Bib
const lockKey = pbDateToLuxon(bib.lockedAt)?.toISO() ?? ''

const notFound = () => Promise.reject(Object.assign(new Error('Not found'), { status: 404 }))

/** The transaction PocketBase holds for an order, whoever its buyer is. */
function transactionOf(orderId: string, buyerUserId: string) {
	return { status: 'pending', paypal_order_id: orderId, id: 'tx_1', buyer_user_id: buyerUserId, bib_id: bib.id }
}

beforeEach(() => {
	vi.clearAllMocks()
	vi.spyOn(console, 'error').mockImplementation(() => {})

	vi.mocked(auth).mockResolvedValue({ userId: 'clerk_buyer' } as Awaited<ReturnType<typeof auth>>)
	vi.mocked(fetchUserByClerkId).mockResolvedValue({ id: 'buyer_pb' } as User)
	vi.mocked(capturePayment).mockResolvedValue({ data: { status: 'COMPLETED', id: ORDER_ID } } as Awaited<
		ReturnType<typeof capturePayment>
	>)

	mockPocketbase.collection.mockReturnValue(mockPocketbaseCollection)
	mockPocketbaseCollection.getOne.mockImplementation((id: string) =>
		id === bib.id ? Promise.resolve(bib) : notFound()
	)
	// Holds the order of the buyer under test, found by the exact lookup of its id and by nothing else
	mockPocketbaseCollection.getFirstListItem.mockImplementation((filter: string) =>
		filter === `paypal_order_id = "${ORDER_ID}"` ? Promise.resolve(transactionOf(ORDER_ID, 'buyer_pb')) : notFound()
	)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('the order a buyer captures (captureOrder)', () => {
	it('still captures the order of the buyer, looked up by its id as before', async () => {
		const result = await captureOrder(ORDER_ID, lockKey)

		expect(result.data).toEqual({ status: 'COMPLETED', id: ORDER_ID })
		expect(mockPocketbaseCollection.getFirstListItem).toHaveBeenCalledExactlyOnceWith(`paypal_order_id = "${ORDER_ID}"`)
		expect(capturePayment).toHaveBeenCalledExactlyOnceWith(ORDER_ID)
	})

	it('still looks up an order id of the older PayPal format', async () => {
		expect(await captureOrder(LEGACY_ORDER_ID, lockKey)).toEqual({
			errorKind: 'order_not_found',
			error: 'Order not found.',
		})

		expect(mockPocketbaseCollection.getFirstListItem).toHaveBeenCalledExactlyOnceWith(
			`paypal_order_id = "${LEGACY_ORDER_ID}"`
		)
	})

	it('still tells a buyer that the order of someone else is not theirs', async () => {
		mockPocketbaseCollection.getFirstListItem.mockResolvedValue(transactionOf(ORDER_ID, 'someone_else_pb'))

		expect((await captureOrder(ORDER_ID, lockKey)).errorKind).toBe('not_owner')
		expect(capturePayment).not.toHaveBeenCalled()
	})

	it.each([
		['a quote that closes the string', `${ORDER_ID}" || buyer_user_id != "`],
		['a condition over another collection', 'x" || @collection.users.role = "admin'],
		['a backslash before the closing quote', String.raw`x\" || id != "`],
		['an order id followed by a line break', `${ORDER_ID}\n`],
		['an order id inside a list', [ORDER_ID]],
		['an object', { id: ORDER_ID }],
	])('answers %s like an unknown order, without looking anything up', async (_label, orderId) => {
		// A PocketBase whose widened filter matches: the transaction of another buyer comes back. The
		// answer used to tell the two cases apart ('not_owner' when it matched, 'order_not_found' when not)
		mockPocketbaseCollection.getFirstListItem.mockResolvedValue(transactionOf(ORDER_ID, 'someone_else_pb'))

		const result = await captureOrder(orderId as unknown as string, lockKey)

		expect(result).toEqual({ errorKind: 'order_not_found', error: 'Order not found.' })
		expect(mockPocketbaseCollection.getFirstListItem).not.toHaveBeenCalled()
		expect(mockPocketbaseCollection.getOne).not.toHaveBeenCalled()
		expect(capturePayment).not.toHaveBeenCalled()
	})

	it('asks a visitor without a session to sign in before it reads the order id', async () => {
		vi.mocked(auth).mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>)

		expect((await captureOrder('x" || id != "', lockKey)).errorKind).toBe('unauthenticated')
		expect((await captureOrder(ORDER_ID, lockKey)).errorKind).toBe('unauthenticated')
		expect(mockPocketbaseCollection.getFirstListItem).not.toHaveBeenCalled()
	})
})

describe('looking a transaction up by its order id (getTransactionByOrderId)', () => {
	it('keeps the filter of an order id as it was', async () => {
		expect(await getTransactionByOrderId(ORDER_ID)).toEqual(transactionOf(ORDER_ID, 'buyer_pb'))

		expect(mockPocketbaseCollection.getFirstListItem).toHaveBeenCalledExactlyOnceWith(`paypal_order_id = "${ORDER_ID}"`)
	})

	it.each([
		[
			'a quote that closes the string',
			`${ORDER_ID}" || buyer_user_id != "`,
			String.raw`paypal_order_id = "ORDER-1234567890ABCDEFGH\" || buyer_user_id != \""`,
		],
		[
			'a backslash before the closing quote',
			String.raw`x\" || id != "`,
			String.raw`paypal_order_id = "x\\\" || id != \""`,
		],
	])('keeps %s inside the quoted value, whoever the caller is', async (_label, orderId, filter) => {
		// The webhook handlers call the service too, with the id of the event PayPal signed
		expect(await getTransactionByOrderId(orderId)).toBeNull()

		expect(mockPocketbaseCollection.getFirstListItem).toHaveBeenCalledExactlyOnceWith(filter)
	})
})
