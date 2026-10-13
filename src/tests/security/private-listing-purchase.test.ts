// @vitest-environment node
import { inspect } from 'node:util'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockPocketbase, mockPocketbaseCollection } from '@/tests/mocks/pocketbase'

// A private listing is sold through a link that carries its token (/marketplace/<id>?tkn=<token>).
// PocketBase is reached with an admin token, so nothing but these server actions decides who may
// buy: the real actions and services run here, over a fake PocketBase and a fake PayPal.

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
import { captureOrder, checkPurchaseLock, createSale, lockBibForPurchase } from '@/app/[locale]/purchase/actions'
import { POST as validatePrivateToken } from '@/app/api/validate-private-token/route'
import { trackServer } from '@/lib/analytics/server'
import { dateToPbDateString, pbDateToLuxon } from '@/lib/utils/date'
import type { Bib } from '@/models/bib.model'
import type { SalesCompleteInput } from '@/models/sales.model'
import type { Transaction } from '@/models/transaction.model'
import type { User } from '@/models/user.model'
import { fetchPrivateBibByToken, lockBib } from '@/services/bib.services'
import {
	sendAdminSaleAlert,
	sendBuyerPurchaseConfirmation,
	sendSaleAlert,
	sendSellerSaleConfirmation,
} from '@/services/notification.service'
import { capturePayment, createOrder } from '@/services/paypal.services'
import { salesComplete } from '@/services/sales.services'
import { createTransaction, getTransactionByOrderId, updateTransaction } from '@/services/transaction.services'
import { fetchUserByClerkId, fetchUserById } from '@/services/user.services'

const TOKEN = 'Zq7Lm2Xc9Vb4Nk8Jh5Gf1Ds6Ap3Wo0Ei'
const WRONG_TOKEN = 'Zq7Lm2Xc9Vb4Nk8Jh5Gf1Ds6Ap3Wo0Ej'
const REGENERATED_TOKEN = 'Rt5Yu8Io1Pa4Sd7Fg0Hj3Kl6Zx9Cv2Bn'
const ORDER_ID = 'ORDER-1234567890ABCDEFGH'
const MERCHANT_ID = 'SELLERMERCHANT01'

type BibRecord = Bib & { expand: { eventId: Record<string, unknown>; sellerUserId: Record<string, unknown> } }

// What PocketBase holds for the bib under test: getOne reads it, update writes it
let stored: BibRecord
let lockKey: string

function bibRecord(listed: Bib['listed'], overrides: Partial<Bib> = {}): BibRecord {
	return {
		validated: true,
		status: 'available',
		sellerUserId: 'seller_pb',
		registrationNumber: 'REG-42',
		privateListingToken: listed === 'private' ? TOKEN : undefined,
		price: 100,
		originalPrice: 120,
		optionValues: {},
		// Locked half a minute ago by the buyer under test
		lockedAt: dateToPbDateString(new Date(Date.now() - 30_000)),
		listed,
		id: 'bib_private_1',
		expand: {
			sellerUserId: { paypalMerchantId: MERCHANT_ID, lastName: 'Seller', id: 'seller_pb', firstName: 'Sam' },
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
		...overrides,
	}
}

function store(record: BibRecord) {
	stored = record
	// The key the browser keeps in its URL is the lock time it got back, in ISO
	lockKey = pbDateToLuxon(record.lockedAt)?.toISO() ?? ''
}

/** What PayPal posts once the capture went through. */
const captureCompleted = {
	event: {
		resource: {
			update_time: '2031-05-01T10:01:00Z',
			supplementary_data: { related_ids: { order_id: ORDER_ID } },
			status: 'COMPLETED',
			payer: { payer_id: 'PAYER-1' },
			payee: { email_address: 'seller@example.com' },
			id: 'CAPTURE-1',
			amount: { value: '100.00', currency_code: 'EUR' },
		},
	},
} as unknown as SalesCompleteInput

function pendingTransaction(overrides: Partial<Transaction> = {}) {
	vi.mocked(getTransactionByOrderId).mockResolvedValue({
		status: 'pending',
		seller_user_id: 'seller_pb',
		paypal_order_id: ORDER_ID,
		id: 'tx_1',
		buyer_user_id: 'buyer_pb',
		bib_id: stored.id,
		amount: 100,
		...overrides,
	} as Transaction)
}

/** Everything that was written to a log, sent to PayPal, stored on the transaction, e-mailed or sent to analytics. */
function everythingThatLeft(): string {
	const spies = [
		vi.mocked(console.error),
		vi.mocked(console.warn),
		vi.mocked(createOrder),
		vi.mocked(capturePayment),
		vi.mocked(createTransaction),
		vi.mocked(updateTransaction),
		vi.mocked(trackServer),
		vi.mocked(sendSaleAlert),
		vi.mocked(sendAdminSaleAlert),
		vi.mocked(sendSellerSaleConfirmation),
		vi.mocked(sendBuyerPurchaseConfirmation),
	]
	return inspect(
		spies.map(spy => spy.mock.calls),
		{ maxStringLength: null, maxArrayLength: null, depth: null }
	)
}

beforeEach(() => {
	vi.clearAllMocks()
	vi.spyOn(console, 'error').mockImplementation(() => {})
	vi.spyOn(console, 'warn').mockImplementation(() => {})

	vi.mocked(auth).mockResolvedValue({ userId: 'clerk_buyer' } as Awaited<ReturnType<typeof auth>>)
	vi.mocked(fetchUserByClerkId).mockResolvedValue({ id: 'buyer_pb' } as User)
	vi.mocked(fetchUserById).mockImplementation(id =>
		Promise.resolve({ lastName: 'Runner', id, firstName: 'Robin', email: `${id}@example.com` } as User)
	)
	vi.mocked(createOrder).mockResolvedValue({ id: ORDER_ID })
	vi.mocked(createTransaction).mockResolvedValue({ paypal_order_id: ORDER_ID, id: 'tx_1' } as Transaction)
	vi.mocked(capturePayment).mockResolvedValue({ data: { status: 'COMPLETED', id: ORDER_ID } } as Awaited<
		ReturnType<typeof capturePayment>
	>)

	mockPocketbaseCollection.getOne.mockImplementation((id: string) =>
		id === stored.id ? Promise.resolve(stored) : Promise.reject(new Error('The requested resource was not found.'))
	)
	mockPocketbaseCollection.update.mockImplementation((id: string, data: Partial<Bib>) => {
		if (id !== stored.id) return Promise.reject(new Error('The requested resource was not found.'))
		stored = { ...stored, ...data }
		return Promise.resolve(stored)
	})
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('buying a private listing', () => {
	beforeEach(() => {
		store(bibRecord('private'))
	})

	describe('order creation (createSale)', () => {
		it('creates the PayPal order for the holder of the token', async () => {
			const result = await createSale(stored.id, MERCHANT_ID, 'fr', TOKEN)

			expect(result).toEqual({ transactionId: 'tx_1', success: true, orderId: ORDER_ID })
			expect(createOrder).toHaveBeenCalledExactlyOnceWith(MERCHANT_ID, expect.objectContaining({ id: stored.id }), 'fr')
			expect(createTransaction).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({ status: 'pending', buyer_user_id: 'buyer_pb', bib_id: stored.id, amount: 100 })
			)
		})

		it.each([
			['no token', undefined],
			['a null token', null],
			['an empty token', ''],
			['a wrong token', WRONG_TOKEN],
			['the start of the token', TOKEN.slice(0, 16)],
			['the token with something appended', `${TOKEN}x`],
			['the token in another case', TOKEN.toLowerCase()],
			['a token that is not a string', [TOKEN]],
		])('refuses with %s, before anything reaches PayPal', async (_label, token) => {
			const result = await createSale(stored.id, MERCHANT_ID, 'fr', token as string)

			expect(result.success).toBe(false)
			expect(result).not.toHaveProperty('orderId')
			expect(createOrder).not.toHaveBeenCalled()
			expect(createTransaction).not.toHaveBeenCalled()
		})

		it('refuses the token of another private listing', async () => {
			store(bibRecord('private', { privateListingToken: REGENERATED_TOKEN }))

			const result = await createSale(stored.id, MERCHANT_ID, 'fr', TOKEN)

			expect(result.success).toBe(false)
			expect(createOrder).not.toHaveBeenCalled()
		})

		it('refuses a private listing that has no token at all, whatever is sent', async () => {
			store(bibRecord('private', { privateListingToken: '' }))

			expect((await createSale(stored.id, MERCHANT_ID, 'fr', '')).success).toBe(false)
			expect((await createSale(stored.id, MERCHANT_ID, 'fr')).success).toBe(false)
			expect(createOrder).not.toHaveBeenCalled()
		})

		it('answers a refusal as a bib that is not found, the kind the lock and the capture give it', async () => {
			// The seller replaced the link while the payment dialog was open: the funnel counts a refusal
			stored = { ...stored, privateListingToken: REGENERATED_TOKEN }

			expect(await createSale(stored.id, MERCHANT_ID, 'fr', TOKEN)).toEqual({
				success: false,
				errorKind: 'bib_not_found',
				error: 'Bib not found',
			})
			expect(await checkPurchaseLock(stored.id, '', TOKEN)).toBe('unavailable')
			pendingTransaction()
			expect((await captureOrder(ORDER_ID, lockKey, TOKEN)).errorKind).toBe('bib_not_found')
		})

		it('keeps the kind "exception" for an order that PayPal did not create', async () => {
			vi.mocked(createOrder).mockRejectedValue(new Error('PayPal is unreachable'))

			expect(await createSale(stored.id, MERCHANT_ID, 'fr', TOKEN)).toEqual({
				success: false,
				errorKind: 'exception',
				error: 'PayPal is unreachable',
			})
			expect(createTransaction).not.toHaveBeenCalled()
		})

		it('still requires a signed-in buyer', async () => {
			vi.mocked(auth).mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>)

			const result = await createSale(stored.id, MERCHANT_ID, 'fr', TOKEN)

			expect(result).toMatchObject({ success: false, errorKind: 'unauthenticated' })
			expect(createOrder).not.toHaveBeenCalled()
		})
	})

	describe('capture (captureOrder)', () => {
		beforeEach(() => {
			pendingTransaction()
		})

		it('captures the payment of the holder of the token', async () => {
			const result = await captureOrder(ORDER_ID, lockKey, TOKEN)

			expect(result.error).toBeUndefined()
			expect(result.data).toEqual({ status: 'COMPLETED', id: ORDER_ID })
			expect(capturePayment).toHaveBeenCalledExactlyOnceWith(ORDER_ID)
			expect(trackServer).toHaveBeenCalledExactlyOnceWith(
				'payment_capture_success',
				expect.objectContaining({ listing: 'private', bib_id: stored.id })
			)
		})

		it.each([
			['no token', undefined],
			['a null token', null],
			['an empty token', ''],
			['a wrong token', WRONG_TOKEN],
			['the start of the token', TOKEN.slice(0, 16)],
			['a token that is not a string', { token: TOKEN }],
		])('refuses with %s, and takes no money', async (_label, token) => {
			const result = await captureOrder(ORDER_ID, lockKey, token as string)

			expect(result).toEqual({ errorKind: 'bib_not_found', error: 'Bib not found.' })
			expect(capturePayment).not.toHaveBeenCalled()
			expect(trackServer).not.toHaveBeenCalled()
		})

		it('refuses the old token once the seller has regenerated it, even for an order created before', async () => {
			expect((await createSale(stored.id, MERCHANT_ID, 'fr', TOKEN)).success).toBe(true)
			stored = { ...stored, privateListingToken: REGENERATED_TOKEN }

			const result = await captureOrder(ORDER_ID, lockKey, TOKEN)

			expect(result).toEqual({ errorKind: 'bib_not_found', error: 'Bib not found.' })
			expect(capturePayment).not.toHaveBeenCalled()
		})

		it('refuses an order that belongs to another buyer, token or not', async () => {
			pendingTransaction({ buyer_user_id: 'someone_else_pb' })

			const result = await captureOrder(ORDER_ID, lockKey, TOKEN)

			expect(result.errorKind).toBe('not_owner')
			expect(capturePayment).not.toHaveBeenCalled()
		})

		it('refuses a bib that is no longer available', async () => {
			stored = { ...stored, status: 'sold' }

			const result = await captureOrder(ORDER_ID, lockKey, TOKEN)

			expect(result.errorKind).toBe('bib_unavailable')
			expect(capturePayment).not.toHaveBeenCalled()
		})

		it('refuses without the key of the lock', async () => {
			const result = await captureOrder(ORDER_ID, null, TOKEN)

			expect(result.errorKind).toBe('lock_expired')
			expect(capturePayment).not.toHaveBeenCalled()
		})

		it('refuses while the bib is locked by someone else', async () => {
			const otherKey = pbDateToLuxon(dateToPbDateString(new Date(Date.now() - 60_000)))?.toISO() ?? ''

			const result = await captureOrder(ORDER_ID, otherKey, TOKEN)

			expect(result.errorKind).toBe('locked_by_other')
			expect(capturePayment).not.toHaveBeenCalled()
		})

		it('refuses once the lock has expired', async () => {
			store(bibRecord('private', { lockedAt: dateToPbDateString(new Date(Date.now() - 6 * 60_000)) }))
			pendingTransaction()

			const result = await captureOrder(ORDER_ID, lockKey, TOKEN)

			expect(result.errorKind).toBe('lock_expired')
			expect(capturePayment).not.toHaveBeenCalled()
		})
	})

	describe('lock (lockBibForPurchase, checkPurchaseLock)', () => {
		beforeEach(() => {
			store(bibRecord('private', { lockedAt: '' }))
		})

		it('locks the bib for the holder of the token, and answers with the lock time alone', async () => {
			const result = await lockBibForPurchase(stored.id, TOKEN)

			expect(pbDateToLuxon(stored.lockedAt)?.isValid).toBe(true)
			// The record carries the token of the listing: only the lock time may go back to the browser
			expect(Object.keys(result ?? {})).toEqual(['lockedAt'])
			expect(pbDateToLuxon(result?.lockedAt)?.toISO()).toBe(pbDateToLuxon(stored.lockedAt)?.toISO())
		})

		it('gets the lock alone from the bib service too, which is itself a server action', async () => {
			const lock = await lockBib(stored.id, 'anyone')

			expect(Object.keys(lock ?? {}).sort()).toEqual(['id', 'lockedAt'])
			expect(inspect(lock)).not.toContain(TOKEN)
			expect(inspect(lock)).not.toContain(stored.registrationNumber)
		})

		it.each([
			['no token', undefined],
			['a wrong token', WRONG_TOKEN],
			['a token that is not a string', 42],
		])('does not lock with %s', async (_label, token) => {
			const result = await lockBibForPurchase(stored.id, token as string)

			expect(result).toBeNull()
			expect(mockPocketbaseCollection.update).not.toHaveBeenCalled()
			expect(stored.lockedAt).toBe('')
		})

		it('does not lock, and tells nothing about the bib, for a visitor who is not signed in', async () => {
			vi.mocked(auth).mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>)

			expect(await lockBibForPurchase(stored.id, TOKEN)).toBeNull()
			// Not "locked": nobody else is buying the bib, the buyer has to sign in again
			expect(await checkPurchaseLock(stored.id, '', TOKEN)).toBe('unauthenticated')
			expect(await checkPurchaseLock(stored.id, '', WRONG_TOKEN)).toBe('unauthenticated')
			expect(mockPocketbaseCollection.getOne).not.toHaveBeenCalled()
			expect(mockPocketbaseCollection.update).not.toHaveBeenCalled()
		})

		it('tells the holder of the token the state of the lock', async () => {
			expect(await checkPurchaseLock(stored.id, '', TOKEN)).toBe('unlocked')

			const lock = await lockBibForPurchase(stored.id, TOKEN)
			const key = pbDateToLuxon(lock?.lockedAt)?.toISO() ?? ''

			expect(await checkPurchaseLock(stored.id, key, TOKEN)).toBe('userlocked')
			expect(await checkPurchaseLock(stored.id, '', TOKEN)).toBe('locked')
		})

		it('says "unavailable" to anyone else, whatever the lock is, and leaves the lock alone', async () => {
			store(bibRecord('private', { lockedAt: dateToPbDateString(new Date(Date.now() - 6 * 60_000)) }))

			expect(await checkPurchaseLock(stored.id, lockKey)).toBe('unavailable')
			expect(await checkPurchaseLock(stored.id, lockKey, WRONG_TOKEN)).toBe('unavailable')
			// isLocked would have cleared this expired lock
			expect(mockPocketbaseCollection.update).not.toHaveBeenCalled()

			// The same answer when the bib is free and when someone holds it: the lock is not theirs to know
			stored = { ...stored, lockedAt: '' }
			expect(await checkPurchaseLock(stored.id, '', WRONG_TOKEN)).toBe('unavailable')
			stored = { ...stored, lockedAt: dateToPbDateString(new Date(Date.now() - 30_000)) }
			expect(await checkPurchaseLock(stored.id, '', WRONG_TOKEN)).toBe('unavailable')
		})

		it('says "unavailable", not "locked", once the seller has replaced the link the buyer opened', async () => {
			expect(await checkPurchaseLock(stored.id, '', TOKEN)).toBe('unlocked')
			stored = { ...stored, privateListingToken: REGENERATED_TOKEN }

			// "locked" would tell the buyer to try again later, and that can never work with this link
			expect(await checkPurchaseLock(stored.id, '', TOKEN)).toBe('unavailable')
			expect(await lockBibForPurchase(stored.id, TOKEN)).toBeNull()
			expect(await checkPurchaseLock(stored.id, '', REGENERATED_TOKEN)).toBe('unlocked')
		})

		it('still says "locked" to the holder of the token while another buyer holds the bib', async () => {
			store(bibRecord('private'))

			expect(await checkPurchaseLock(stored.id, '', TOKEN)).toBe('locked')
			expect(await lockBibForPurchase(stored.id, TOKEN)).toBeNull()
		})
	})

	describe('PayPal capture webhook (salesComplete)', () => {
		it('marks the bib sold to the buyer of the order: PayPal sends no token, the capture was the check', async () => {
			pendingTransaction()

			const result = await salesComplete(captureCompleted)

			expect(result).toEqual({ transactionId: 'tx_1', bibId: stored.id })
			expect(updateTransaction).toHaveBeenCalledExactlyOnceWith(
				'tx_1',
				expect.objectContaining({ status: 'succeeded', paypal_order_id: ORDER_ID, paypal_capture_id: 'CAPTURE-1' })
			)
			expect(stored).toMatchObject({ validated: true, status: 'sold', buyerUserId: 'buyer_pb' })
			expect(sendSellerSaleConfirmation).toHaveBeenCalledTimes(1)
			expect(sendBuyerPurchaseConfirmation).toHaveBeenCalledTimes(1)
		})
	})

	describe('the token stays where it was', () => {
		it('is not logged, not sent to PayPal, not stored on the transaction, not e-mailed and not sent to analytics', async () => {
			pendingTransaction()

			// The whole funnel with the token, then every refusal with a wrong one
			await checkPurchaseLock(stored.id, lockKey, TOKEN)
			await createSale(stored.id, MERCHANT_ID, 'fr', TOKEN)
			await captureOrder(ORDER_ID, lockKey, TOKEN)
			await salesComplete(captureCompleted)
			stored = { ...stored, status: 'available' }
			await lockBibForPurchase(stored.id, WRONG_TOKEN)
			await checkPurchaseLock(stored.id, lockKey, WRONG_TOKEN)
			await createSale(stored.id, MERCHANT_ID, 'fr', WRONG_TOKEN)
			await captureOrder(ORDER_ID, lockKey, WRONG_TOKEN)
			await fetchPrivateBibByToken(stored.id, WRONG_TOKEN)

			expect(createOrder).toHaveBeenCalledTimes(1)
			expect(capturePayment).toHaveBeenCalledTimes(1)
			const left = everythingThatLeft()
			// The refusals did log, and the sale did go to PayPal, the transaction and analytics
			expect(left).toContain(`Invalid token access attempt for bib ${stored.id}`)
			expect(left).toContain('Error creating sale:')
			expect(left).toContain(MERCHANT_ID)
			expect(left).toContain('payment_capture_success')
			expect(left).toContain('sale_success')
			expect(left).toContain('Trail des Crêtes')
			expect(left).not.toContain(TOKEN)
			expect(left).not.toContain(WRONG_TOKEN)
		})
	})

	describe('page and token form (fetchPrivateBibByToken, /api/validate-private-token)', () => {
		const post = (body: unknown) =>
			validatePrivateToken(
				new Request('http://localhost:3000/api/validate-private-token', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				}) as Parameters<typeof validatePrivateToken>[0]
			)

		it('hands the listing to the holder of the token', async () => {
			expect((await fetchPrivateBibByToken(stored.id, TOKEN))?.id).toBe(stored.id)

			const response = await post({ token: TOKEN, bibId: stored.id })
			expect(response.status).toBe(200)
			expect(await response.json()).toEqual({ valid: true })
		})

		it('refuses a wrong token', async () => {
			expect(await fetchPrivateBibByToken(stored.id, WRONG_TOKEN)).toBeNull()
			expect(await fetchPrivateBibByToken(stored.id, TOKEN.slice(0, 16))).toBeNull()
			// ?tkn=a&tkn=b reaches the page as an array
			expect(await fetchPrivateBibByToken(stored.id, [TOKEN] as unknown as string)).toBeNull()

			const response = await post({ token: WRONG_TOKEN, bibId: stored.id })
			expect(response.status).toBe(401)
		})

		it('does not accept a token for a public listing', async () => {
			store(bibRecord('public', { privateListingToken: TOKEN }))

			expect(await fetchPrivateBibByToken(stored.id, TOKEN)).toBeNull()
			expect((await post({ token: TOKEN, bibId: stored.id })).status).toBe(401)
		})
	})
})

describe('buying a public listing, as before', () => {
	beforeEach(() => {
		store(bibRecord('public'))
		pendingTransaction()
	})

	it('creates the PayPal order without any token', async () => {
		const result = await createSale(stored.id, MERCHANT_ID, 'fr')

		expect(result).toEqual({ transactionId: 'tx_1', success: true, orderId: ORDER_ID })
		expect(createOrder).toHaveBeenCalledExactlyOnceWith(MERCHANT_ID, expect.objectContaining({ id: stored.id }), 'fr')
	})

	it('captures the payment without any token', async () => {
		const result = await captureOrder(ORDER_ID, lockKey)

		expect(result.data).toEqual({ status: 'COMPLETED', id: ORDER_ID })
		expect(capturePayment).toHaveBeenCalledExactlyOnceWith(ORDER_ID)
		expect(trackServer).toHaveBeenCalledExactlyOnceWith(
			'payment_capture_success',
			expect.objectContaining({ listing: 'public', bib_id: stored.id })
		)
	})

	it('ignores a token it does not need', async () => {
		expect((await createSale(stored.id, MERCHANT_ID, 'fr', WRONG_TOKEN)).success).toBe(true)
		expect((await captureOrder(ORDER_ID, lockKey, WRONG_TOKEN)).error).toBeUndefined()
		expect(capturePayment).toHaveBeenCalledTimes(1)
	})

	it('keeps the capture checks: buyer, availability, lock', async () => {
		expect((await captureOrder(ORDER_ID, null)).errorKind).toBe('lock_expired')

		stored = { ...stored, status: 'sold' }
		expect((await captureOrder(ORDER_ID, lockKey)).errorKind).toBe('bib_unavailable')

		pendingTransaction({ buyer_user_id: 'someone_else_pb' })
		expect((await captureOrder(ORDER_ID, lockKey)).errorKind).toBe('not_owner')

		expect(capturePayment).not.toHaveBeenCalled()
	})

	it('locks and reads the lock without any token', async () => {
		store(bibRecord('public', { lockedAt: '' }))

		expect(await checkPurchaseLock(stored.id, '')).toBe('unlocked')
		const lock = await lockBibForPurchase(stored.id)
		expect(Object.keys(lock ?? {})).toEqual(['lockedAt'])
		expect(await checkPurchaseLock(stored.id, pbDateToLuxon(lock?.lockedAt)?.toISO() ?? '')).toBe('userlocked')
	})

	it('still refuses a bib whose capture was never allowed: one without a visibility', async () => {
		store(bibRecord(null))
		pendingTransaction()

		expect(await captureOrder(ORDER_ID, lockKey)).toEqual({ errorKind: 'bib_not_found', error: 'Bib not found.' })
		expect(capturePayment).not.toHaveBeenCalled()
	})

	it('tells a buyer whose session ended to sign in again, not that someone else is buying the bib', async () => {
		store(bibRecord('public', { lockedAt: '' }))
		vi.mocked(auth).mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>)

		expect(await checkPurchaseLock(stored.id, '')).toBe('unauthenticated')
		expect(await lockBibForPurchase(stored.id)).toBeNull()
		expect(mockPocketbaseCollection.getOne).not.toHaveBeenCalled()
		expect(stored.lockedAt).toBe('')
	})
})

describe('a bib that is not listed', () => {
	// The lock, the order and the capture apply one rule: an order that the capture would refuse is
	// never created, so no buyer approves a payment that cannot go through
	it.each([
		['null', null],
		// What PocketBase answers for a select field that was never set
		['empty', '' as unknown as Bib['listed']],
	])('is refused at every step when its visibility is %s, token or not', async (_label, listed) => {
		// The token a listing keeps from the time it was private opens nothing
		store(bibRecord(listed, { privateListingToken: TOKEN, lockedAt: '' }))
		pendingTransaction()

		for (const token of [undefined, TOKEN]) {
			expect(await checkPurchaseLock(stored.id, '', token)).toBe('unavailable')
			expect(await lockBibForPurchase(stored.id, token)).toBeNull()

			const order = await createSale(stored.id, MERCHANT_ID, 'fr', token)
			expect(order.success).toBe(false)
			expect(order).not.toHaveProperty('orderId')

			expect(await captureOrder(ORDER_ID, lockKey, token)).toEqual({
				errorKind: 'bib_not_found',
				error: 'Bib not found.',
			})
		}

		expect(stored.lockedAt).toBe('')
		expect(createOrder).not.toHaveBeenCalled()
		expect(createTransaction).not.toHaveBeenCalled()
		expect(capturePayment).not.toHaveBeenCalled()
	})
})
