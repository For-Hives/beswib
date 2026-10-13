// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockPocketbase, mockPocketbaseCollection } from '@/tests/mocks/pocketbase'

// Who is paid for a bib. The browser sends the PayPal merchant id of the seller with the order
// (createSale): taken at its word, a buyer names their own merchant account, pays themselves, and the
// capture webhook marks the bib as sold to them. The payee is the account on the record of the seller.
// The real action and the real sales service run here, over a fake PocketBase and a fake PayPal.

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
vi.mock('@/services/transaction.services', () => ({
	updateTransaction: vi.fn(),
	getTransactionByOrderId: vi.fn(),
	createTransaction: vi.fn(),
}))
vi.mock('@/services/user.services', () => ({
	getUserLocaleByEmail: vi.fn(() => Promise.resolve('fr')),
	fetchUserById: vi.fn(),
	fetchUserByClerkId: vi.fn(),
}))

import { auth } from '@clerk/nextjs/server'
import { createSale } from '@/app/[locale]/purchase/actions'
import type { Bib } from '@/models/bib.model'
import type { Transaction } from '@/models/transaction.model'
import type { User } from '@/models/user.model'
import { createOrder } from '@/services/paypal.services'
import { createTransaction } from '@/services/transaction.services'
import { fetchUserByClerkId } from '@/services/user.services'

const TOKEN = 'Zq7Lm2Xc9Vb4Nk8Jh5Gf1Ds6Ap3Wo0Ei'
const ORDER_ID = 'ORDER-1234567890ABCDEFGH'
const SELLER_MERCHANT_ID = 'SELLERMERCHANT01'
const BUYER_MERCHANT_ID = 'BUYERMERCHANT001'

type BibRecord = Bib & { expand: { eventId: Record<string, unknown>; sellerUserId: Record<string, unknown> } }

let stored: BibRecord

function bibRecord(listed: Bib['listed'], sellerMerchantId: string | null = SELLER_MERCHANT_ID): BibRecord {
	return {
		validated: true,
		status: 'available',
		sellerUserId: 'seller_pb',
		registrationNumber: 'REG-42',
		privateListingToken: listed === 'private' ? TOKEN : undefined,
		price: 100,
		originalPrice: 120,
		optionValues: {},
		listed,
		id: 'bib_1',
		expand: {
			sellerUserId: { paypalMerchantId: sellerMerchantId, lastName: 'Seller', id: 'seller_pb', firstName: 'Sam' },
			eventId: {
				typeCourse: 'trail',
				participants: 1200,
				name: 'Trail des Crêtes',
				location: 'Annecy, France',
				id: 'event_1',
				eventDate: '2031-06-01 08:00:00.000Z',
				distanceKm: 42,
			},
		},
		eventId: 'event_1',
	}
}

beforeEach(() => {
	vi.clearAllMocks()
	vi.spyOn(console, 'error').mockImplementation(() => {})
	vi.spyOn(console, 'warn').mockImplementation(() => {})

	stored = bibRecord('public')
	vi.mocked(auth).mockResolvedValue({ userId: 'clerk_buyer' } as Awaited<ReturnType<typeof auth>>)
	vi.mocked(fetchUserByClerkId).mockResolvedValue({ id: 'buyer_pb' } as User)
	vi.mocked(createOrder).mockResolvedValue({ id: ORDER_ID })
	vi.mocked(createTransaction).mockResolvedValue({ paypal_order_id: ORDER_ID, id: 'tx_1' } as Transaction)
	mockPocketbase.collection.mockReturnValue(mockPocketbaseCollection)
	mockPocketbaseCollection.getOne.mockImplementation((id: string) =>
		id === stored.id ? Promise.resolve(stored) : Promise.reject(new Error('The requested resource was not found.'))
	)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('the payee of an order (createSale)', () => {
	it('creates the order for the PayPal account of the seller', async () => {
		const result = await createSale(stored.id, SELLER_MERCHANT_ID, 'fr')

		expect(result).toEqual({ transactionId: 'tx_1', success: true, orderId: ORDER_ID })
		expect(createOrder).toHaveBeenCalledExactlyOnceWith(
			SELLER_MERCHANT_ID,
			expect.objectContaining({ id: stored.id }),
			'fr'
		)
	})

	it.each([
		['public', undefined],
		['private', TOKEN],
	] as const)('refuses an order on a %s listing that would pay another merchant', async (listed, token) => {
		stored = bibRecord(listed)

		const result = await createSale(stored.id, BUYER_MERCHANT_ID, 'fr', token)

		expect(result).toEqual({
			success: false,
			errorKind: 'seller_not_configured',
			error: 'Seller PayPal account is not configured.',
		})
		// Nothing reached PayPal, and no transaction links an order to this bib
		expect(createOrder).not.toHaveBeenCalled()
		expect(createTransaction).not.toHaveBeenCalled()
	})

	it.each([
		['has no PayPal account linked', null],
		['unlinked their PayPal account', ''],
	])('refuses an order when the seller %s, whatever merchant is sent', async (_label, sellerMerchantId) => {
		stored = bibRecord('public', sellerMerchantId)

		expect((await createSale(stored.id, BUYER_MERCHANT_ID, 'fr')).success).toBe(false)
		expect((await createSale(stored.id, SELLER_MERCHANT_ID, 'fr')).success).toBe(false)

		expect(createOrder).not.toHaveBeenCalled()
	})

	it('does not tell a buyer without the token whether their merchant id matches', async () => {
		stored = bibRecord('private')

		const withSellerMerchant = await createSale(stored.id, SELLER_MERCHANT_ID, 'fr', 'not-the-token')
		const withOtherMerchant = await createSale(stored.id, BUYER_MERCHANT_ID, 'fr', 'not-the-token')

		expect(withSellerMerchant).toEqual({ success: false, errorKind: 'bib_not_found', error: 'Bib not found' })
		expect(withOtherMerchant).toEqual(withSellerMerchant)
		expect(createOrder).not.toHaveBeenCalled()
	})
})
