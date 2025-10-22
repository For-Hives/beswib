import { beforeEach, describe, expect, it, vi } from 'vitest'

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
	getUserLocaleByEmail: vi.fn(() => Promise.resolve('fr')),
	fetchUserByClerkId: vi.fn(),
}))

import type { Bib } from '@/models/bib.model'
import type { Transaction } from '@/models/transaction.model'
import type { User } from '@/models/user.model'
import { fetchBibById, updateBib } from '@/services/bib.services'
import { createOrder } from '@/services/paypal.services'
import { salesComplete, salesCreate } from '@/services/sales.services'
import { createTransaction, getTransactionByOrderId, updateTransaction } from '@/services/transaction.services'
import { fetchUserByClerkId } from '@/services/user.services'

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
				expand: {
					sellerUserId: {
						lastName: 'Doe',
						id: 'seller_pb',
						firstName: 'John',
					},
					eventId: {
						typeCourse: 'road',
						participants: 30000,
						name: 'Paris Marathon 2025',
						location: 'Paris, France',
						id: 'event1',
						eventDate: '2025-04-06',
						distanceKm: 42.2,
					},
				},
				eventId: 'event1',
			})
			asMock(createOrder).mockResolvedValue({ id: 'ORDER-123' })
			asMock(fetchUserByClerkId).mockResolvedValue({
				id: 'buyer_pb',
			} as unknown as User)
			asMock(createTransaction).mockResolvedValue({
				paypal_order_id: 'ORDER-123',
				id: 'tx1',
			} as unknown as Transaction)

			const result = await salesCreate({
				sellerMerchantId: 'MERCHANT-XYZ',
				buyerUserId: 'clerk_buyer',
				bibId: 'bib1',
			})

			/* eslint-disable @typescript-eslint/no-unsafe-assignment */
			expect(createOrder).toHaveBeenCalledWith(
				'MERCHANT-XYZ',
				expect.objectContaining({
					price: 100,
					id: 'bib1',
					event: expect.objectContaining({
						type: 'road',
						name: 'Paris Marathon 2025',
						location: 'Paris, France',
						distance: 42.2,
					}),
				}),
				undefined
			)
			/* eslint-enable @typescript-eslint/no-unsafe-assignment */
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
			expect(result).toEqual({
				transaction: { paypal_order_id: 'ORDER-123', id: 'tx1' },
				orderId: 'ORDER-123',
			})
		})

		it('creates a PayPal order with locale for return URLs', async () => {
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
				expand: {
					sellerUserId: {
						lastName: 'Smith',
						id: 'seller_pb',
						firstName: 'Jane',
					},
					eventId: {
						typeCourse: 'trail',
						participants: 5000,
						name: 'Lyon Trail 2025',
						location: 'Lyon, France',
						id: 'event1',
						eventDate: '2025-05-15',
						distanceKm: 21.1,
					},
				},
				eventId: 'event1',
			})
			asMock(createOrder).mockResolvedValue({ id: 'ORDER-123' })
			asMock(fetchUserByClerkId).mockResolvedValue({
				id: 'buyer_pb',
			} as unknown as User)
			asMock(createTransaction).mockResolvedValue({
				paypal_order_id: 'ORDER-123',
				id: 'tx1',
			} as unknown as Transaction)

			const result = await salesCreate({
				sellerMerchantId: 'MERCHANT-XYZ',
				locale: 'fr',
				buyerUserId: 'clerk_buyer',
				bibId: 'bib1',
			})

			/* eslint-disable @typescript-eslint/no-unsafe-assignment */
			expect(createOrder).toHaveBeenCalledWith(
				'MERCHANT-XYZ',
				expect.objectContaining({
					price: 100,
					id: 'bib1',
					event: expect.objectContaining({
						type: 'trail',
						name: 'Lyon Trail 2025',
						location: 'Lyon, France',
						distance: 21.1,
					}),
				}),
				'fr'
			)
			/* eslint-enable @typescript-eslint/no-unsafe-assignment */
			expect(result).toEqual({
				transaction: { paypal_order_id: 'ORDER-123', id: 'tx1' },
				orderId: 'ORDER-123',
			})
		})
	})

	describe('salesComplete', () => {
		it('updates transaction and marks bib as sold based on webhook capture payload', async () => {
			asMock(getTransactionByOrderId).mockResolvedValue({
				id: 'tx1',
				buyer_user_id: 'buyer_pb',
				bib_id: 'bib1',
			})
			asMock(updateTransaction).mockResolvedValue({
				id: 'tx1',
			} as unknown as Transaction)
			asMock(updateBib).mockResolvedValue({
				status: 'sold',
				id: 'bib1',
			} as unknown as Bib)

			const input = {
				event: {
					resource: {
						update_time: '2025-01-01T00:00:00Z',
						supplementary_data: {
							related_ids: { order_id: 'ORDER-123', bib_id: 'bib1' },
						},
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
				expect.objectContaining({
					validated: true,
					status: 'sold',
					buyerUserId: 'buyer_pb',
				})
			)
			expect(res).toEqual({ transactionId: 'tx1', bibId: 'bib1' })
		})
	})
})
