import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies used by sales.services
vi.mock('@/services/paypal.services', () => ({
	createOrder: vi.fn(),
}))
vi.mock('@/services/transaction.services', () => ({
	createTransaction: vi.fn(),
	updateTransaction: vi.fn(),
	getTransactionByOrderId: vi.fn(),
}))
vi.mock('@/services/bib.services', () => ({
	fetchBibById: vi.fn(),
	updateBib: vi.fn(),
}))
vi.mock('@/services/user.services', () => ({
	fetchUserByClerkId: vi.fn(),
}))

import { salesCreate, salesComplete } from '@/services/sales.services'
import { createOrder } from '@/services/paypal.services'
import { createTransaction, updateTransaction, getTransactionByOrderId } from '@/services/transaction.services'
import { fetchBibById, updateBib } from '@/services/bib.services'
import { fetchUserByClerkId } from '@/services/user.services'
import type { Bib } from '@/models/bib.model'
import type { User } from '@/models/user.model'
import type { Transaction } from '@/models/transaction.model'

type MockedFn<T> = T & { mockResolvedValue: (value: unknown) => void }
const asMock = <T>(fn: T) => fn as unknown as MockedFn<T>

describe('sales.services', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('salesCreate', () => {
		it('creates a PayPal order and persists a pending transaction', async () => {
			asMock(fetchBibById).mockResolvedValue({
				id: 'bib1',
				price: 100,
				originalPrice: 80,
				status: 'available',
				lockedAt: null,
				sellerUserId: 'seller_pb',
				eventId: 'event1',
				registrationNumber: 'REG',
				listed: null,
				validated: true,
				optionValues: {},
			} satisfies Bib)
			asMock(createOrder).mockResolvedValue({ id: 'ORDER-123' })
			asMock(fetchUserByClerkId).mockResolvedValue({ id: 'buyer_pb' } as unknown as User)
			asMock(createTransaction).mockResolvedValue({ id: 'tx1', paypal_order_id: 'ORDER-123' } as unknown as Transaction)

			const result = await salesCreate({
				buyerUserId: 'clerk_buyer',
				sellerMerchantId: 'MERCHANT-XYZ',
				bibId: 'bib1',
			})

			expect(createOrder).toHaveBeenCalledWith('MERCHANT-XYZ', expect.objectContaining({ id: 'bib1', price: 100 }))
			expect(fetchUserByClerkId).toHaveBeenCalledWith('clerk_buyer')
			expect(createTransaction).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 'pending',
					seller_user_id: 'seller_pb',
					buyer_user_id: 'buyer_pb',
					bib_id: 'bib1',
					amount: 100,
					platform_fee: 10,
					paypal_order_id: 'ORDER-123',
				})
			)
			expect(result).toEqual({ orderId: 'ORDER-123', transaction: { id: 'tx1', paypal_order_id: 'ORDER-123' } })
		})
	})

	describe('salesComplete', () => {
		it('updates transaction and marks bib as sold based on webhook capture payload', async () => {
			asMock(getTransactionByOrderId).mockResolvedValue({ id: 'tx1', bib_id: 'bib1', buyer_user_id: 'buyer_pb' })
			asMock(updateTransaction).mockResolvedValue({ id: 'tx1' } as unknown as Transaction)
			asMock(updateBib).mockResolvedValue({ id: 'bib1', status: 'sold' } as unknown as Bib)

			const input = {
				event: {
					resource: {
						id: 'CAPTURE-1',
						status: 'COMPLETED',
						amount: { value: '100.00', currency_code: 'EUR' },
						update_time: '2025-01-01T00:00:00Z',
						payee: { email_address: 'seller@example.com' },
						payer: { payer_id: 'PAYER-123' },
						supplementary_data: { related_ids: { order_id: 'ORDER-123', bib_id: 'bib1' } },
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
					payer_email: 'seller@example.com',
					payer_id: 'PAYER-123',
					amount: 100,
					currency: 'EUR',
					payment_status: 'COMPLETED',
					capture_time: '2025-01-01T00:00:00Z',
				})
			)
			expect(updateBib).toHaveBeenCalledWith(
				'bib1',
				expect.objectContaining({ status: 'sold', validated: true, buyerUserId: 'buyer_pb' })
			)
			expect(res).toEqual({ transactionId: 'tx1', bibId: 'bib1' })
		})
	})
})
