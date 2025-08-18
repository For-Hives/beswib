import { describe, it, expect, vi, beforeEach } from 'vitest'

import { updateExpiredBibsToWithdrawn } from '@/services/bib.services'

// Mock PocketBase
vi.mock('@/lib/services/pocketbase', () => ({
	pb: {
		collection: vi.fn(() => ({
			update: vi.fn(),
			getFullList: vi.fn(),
		})),
	},
}))

// Mock date utility
vi.mock('@/lib/utils/date', () => ({
	formatDateToPbIso: vi.fn(() => '2024-01-15 12:00:00.000Z'),
}))

describe('updateExpiredBibsToWithdrawn', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should update expired bibs to withdrawn status', async () => {
		const { pb } = await import('@/lib/services/pocketbase')
		const mockCollection = {
			update: vi.fn().mockResolvedValue({}),
			getFullList: vi.fn().mockResolvedValue([
				{
					status: 'available',
					id: 'bib1',
					expand: {
						eventId: {
							name: 'Test Marathon',
							eventDate: '2024-01-10',
						},
					},
					eventId: 'event1',
				},
				{
					status: 'available',
					id: 'bib2',
					expand: {
						eventId: {
							transferDeadline: '2024-01-12',
							name: 'Test 10K',
						},
					},
					eventId: 'event2',
				},
			]),
		}

		pb.collection = vi.fn(() => mockCollection)

		const result = await updateExpiredBibsToWithdrawn()

		expect(result).toBe(2)
		expect(mockCollection.getFullList).toHaveBeenCalledWith({
			filter: expect.stringContaining("status = 'available'"),
			expand: 'eventId',
		})
		expect(mockCollection.update).toHaveBeenCalledTimes(2)
		expect(mockCollection.update).toHaveBeenCalledWith('bib1', {
			status: 'withdrawn',
			lockedAt: null,
			buyerUserId: undefined,
		})
	})

	it('should limit to specific seller when sellerUserId is provided', async () => {
		const { pb } = await import('@/lib/services/pocketbase')
		const mockCollection = {
			update: vi.fn(),
			getFullList: vi.fn().mockResolvedValue([]),
		}

		pb.collection = vi.fn(() => mockCollection)

		await updateExpiredBibsToWithdrawn('seller123')

		expect(mockCollection.getFullList).toHaveBeenCalledWith({
			filter: expect.stringContaining("sellerUserId = 'seller123'"),
			expand: 'eventId',
		})
	})

	it('should handle errors gracefully', async () => {
		const { pb } = await import('@/services/pocketbase')
		const mockCollection = {
			update: vi.fn(),
			getFullList: vi.fn().mockRejectedValue(new Error('Database error')),
		}

		pb.collection = vi.fn(() => mockCollection)

		await expect(updateExpiredBibsToWithdrawn()).rejects.toThrow('Error updating expired bibs to withdrawn')
	})

	it('should continue processing even if individual bib update fails', async () => {
		const { pb } = await import('@/services/pocketbase')
		const mockCollection = {
			update: vi
				.fn()
				.mockResolvedValueOnce({}) // First update succeeds
				.mockRejectedValueOnce(new Error('Update failed')), // Second update fails
			getFullList: vi.fn().mockResolvedValue([
				{ status: 'available', id: 'bib1', expand: { eventId: { name: 'Test' } }, eventId: 'event1' },
				{ status: 'available', id: 'bib2', expand: { eventId: { name: 'Test' } }, eventId: 'event2' },
			]),
		}

		pb.collection = vi.fn(() => mockCollection)

		const result = await updateExpiredBibsToWithdrawn()

		expect(result).toBe(1) // Only one successful update
		expect(mockCollection.update).toHaveBeenCalledTimes(2)
	})
})
