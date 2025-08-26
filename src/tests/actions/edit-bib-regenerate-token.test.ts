import { describe, it, expect, vi, beforeEach } from 'vitest'

import { handleRegeneratePrivateToken } from '@/app/[locale]/dashboard/seller/edit-bib/[bibId]/actions'

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
	auth: vi.fn(() => Promise.resolve({ userId: 'clerk-user-123' })),
}))

vi.mock('@/services/user.services', () => ({
	getUserLocaleByEmail: vi.fn(() => Promise.resolve('fr')),
	fetchUserByClerkId: vi.fn(() => Promise.resolve({ id: 'user-123', email: 'test@example.com' })),
}))

vi.mock('@/services/bib.services', () => ({
	updateBibBySeller: vi.fn(),
	generatePrivateListingToken: vi.fn(() => 'new-token-12345'),
	fetchBibByIdForSeller: vi.fn(),
}))

describe('handleRegeneratePrivateToken', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should regenerate private token for private listing', async () => {
		const { updateBibBySeller, fetchBibByIdForSeller } = await import('@/services/bib.services')

		const mockBib = {
			validated: true,
			status: 'available' as const,
			sellerUserId: 'user-123',
			registrationNumber: '12345',
			privateListingToken: 'old-token-456',
			price: 50.0,
			optionValues: {},
			listed: 'private' as const,
			id: 'bib-123',
			eventId: 'event-123',
		}

		vi.mocked(fetchBibByIdForSeller)
			.mockResolvedValueOnce(mockBib) // First call for validation
			.mockResolvedValueOnce({ ...mockBib, privateListingToken: 'new-token-12345' }) // Second call for return

		vi.mocked(updateBibBySeller).mockResolvedValue({ ...mockBib, privateListingToken: 'new-token-12345' })

		const result = await handleRegeneratePrivateToken('bib-123')

		expect(result.privateListingToken).toBe('new-token-12345')
		expect(updateBibBySeller).toHaveBeenCalledWith(
			'bib-123',
			expect.objectContaining({
				privateListingToken: 'new-token-12345',
			}),
			'user-123'
		)
	})

	it('should throw error for non-private listing', async () => {
		const { fetchBibByIdForSeller } = await import('@/services/bib.services')

		const mockBib = {
			validated: true,
			status: 'available' as const,
			sellerUserId: 'user-123',
			registrationNumber: '12345',
			price: 50.0,
			optionValues: {},
			listed: 'public' as const,
			id: 'bib-123',
			eventId: 'event-123',
		}

		vi.mocked(fetchBibByIdForSeller).mockResolvedValue(mockBib)

		await expect(handleRegeneratePrivateToken('bib-123')).rejects.toThrow(
			'Can only regenerate token for private listings.'
		)
	})

	it('should throw error for sold bib', async () => {
		const { fetchBibByIdForSeller } = await import('@/services/bib.services')

		const mockBib = {
			validated: true,
			status: 'sold' as const,
			sellerUserId: 'user-123',
			registrationNumber: '12345',
			price: 50.0,
			optionValues: {},
			listed: 'private' as const,
			id: 'bib-123',
			eventId: 'event-123',
		}

		vi.mocked(fetchBibByIdForSeller).mockResolvedValue(mockBib)

		await expect(handleRegeneratePrivateToken('bib-123')).rejects.toThrow(
			'Cannot regenerate token for bib with status: sold.'
		)
	})
})
