import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies used by sales.services
vi.mock('@/services/paypal.services', () => ({
	createOrder: vi.fn(),
}))
vi.mock('@/services/transaction.services', () => ({
	updateTransaction: vi.fn(),
	getTransactionByOrderId: vi.fn(),
	createTransaction: vi.fn(),
}))
vi.mock('@/services/bib.services', () => ({
	updateBib: vi.fn(),
	fetchBibById: vi.fn(),
}))
vi.mock('@/services/user.services', () => ({
	fetchUserByClerkId: vi.fn(),
	getUserLocaleByEmail: vi.fn(() => Promise.resolve('fr')),
}))

import type { Transaction } from '@/models/transaction.model'
import type { User } from '@/models/user.model'
import type { Bib } from '@/models/bib.model'

import { createTransaction, updateTransaction, getTransactionByOrderId } from '@/services/transaction.services'
import { salesCreate, salesComplete } from '@/services/sales.services'
import { fetchBibById, updateBib } from '@/services/bib.services'
import { fetchUserByClerkId } from '@/services/user.services'
import { createOrder } from '@/services/paypal.services'

type MockedFn<T> = T & { mockResolvedValue: (value: unknown) => void }
const asMock = <T>(fn: T) => fn as unknown as MockedFn<T>

describe('sales.services', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('salesCreate', () => {
		it('creates a PayPal order and persists a pending transaction', async () => {
			asMock(fetchBibById).mockResolvedValue({
				validated: true,
				status: 'available',
				sellerUserId: 'seller_pb',
				registrationNumber: 'REG',
				price: 100,
				originalPrice: 80,
				optionValues: {},
				lockedAt: null,
				listed: null,
				id: 'bib1',
				eventId: 'event1',
			} satisfies Bib)
			asMock(createOrder).mockResolvedValue({ id: 'ORDER-123' })
			asMock(fetchUserByClerkId).mockResolvedValue({ id: 'buyer_pb' } as unknown as User)
			asMock(createTransaction).mockResolvedValue({ paypal_order_id: 'ORDER-123', id: 'tx1' } as unknown as Transaction)

			const result = await salesCreate({
				sellerMerchantId: 'MERCHANT-XYZ',
				buyerUserId: 'clerk_buyer',
				bibId: 'bib1',
			})

			expect(createOrder).toHaveBeenCalledWith('MERCHANT-XYZ', expect.objectContaining({ price: 100, id: 'bib1' }))
			expect(fetchUserByClerkId).toHaveBeenCalledWith('clerk_buyer')
			expect(createTransaction).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 'pending',
					seller_user_id: 'seller_pb',
					platform_fee: 10,
					paypal_order_id: 'ORDER-123',
					buyer_user_id: 'buyer_pb',
					bib_id: 'bib1',
					amount: 100,
				})
			)
			expect(result).toEqual({ transaction: { paypal_order_id: 'ORDER-123', id: 'tx1' }, orderId: 'ORDER-123' })
		})
	})

	describe('salesComplete', () => {
		it('updates transaction and marks bib as sold based on webhook capture payload', async () => {
			asMock(getTransactionByOrderId).mockResolvedValue({ id: 'tx1', buyer_user_id: 'buyer_pb', bib_id: 'bib1' })
			asMock(updateTransaction).mockResolvedValue({ id: 'tx1' } as unknown as Transaction)
			asMock(updateBib).mockResolvedValue({ status: 'sold', id: 'bib1' } as unknown as Bib)

			const input = {
				event: {
					resource: {
						update_time: '2025-01-01T00:00:00Z',
						supplementary_data: { related_ids: { order_id: 'ORDER-123', bib_id: 'bib1' } },
						status: 'COMPLETED',
						payer: { payer_id: 'PAYER-123' },
						payee: { email_address: 'seller@example.com' },
						id: 'CAPTURE-1',
						amount: { value: '100.00', currency_code: 'EUR' },
					},
				},
			} as unknown as import('@/models/sales.model').SalesCompleteInput

			const res = await salesComplete(input)

			expect(updateTransaction).toHaveBeenCalledWith(
				'tx1',
				expect.objectContaining({
					status: 'succeeded',
					paypal_order_id: 'ORDER-123',
					paypal_capture_id: 'CAPTURE-1',
					payment_status: 'COMPLETED',
					payer_id: 'PAYER-123',
					payer_email: 'seller@example.com',
					currency: 'EUR',
					capture_time: '2025-01-01T00:00:00Z',
					amount: 100,
				})
			)
			expect(updateBib).toHaveBeenCalledWith(
				'bib1',
				expect.objectContaining({ validated: true, status: 'sold', buyerUserId: 'buyer_pb' })
			)
			expect(res).toEqual({ transactionId: 'tx1', bibId: 'bib1' })
		})
	})
})
