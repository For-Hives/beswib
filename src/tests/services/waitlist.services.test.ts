/** biome-ignore-all lint/suspicious/noExplicitAny: for testing purposes we need to use any */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockPocketbase, mockPocketbaseCollection } from '@/tests/mocks/pocketbase'

vi.mock('@/lib/services/pocketbase', () => ({
	pb: mockPocketbase,
}))

vi.mock('@/services/user.services', () => ({
	getUserLocaleByEmail: vi.fn(),
	fetchUserByEmail: vi.fn(),
}))

const { getUserLocaleByEmail: mockGetUserLocaleByEmail, fetchUserByEmail: mockFetchUserByEmail } = vi.mocked(
	await import('@/services/user.services')
)

import { fetchUserWaitlists } from '@/services/waitlist.services'

describe('waitlist.services', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockFetchUserByEmail.mockResolvedValue(null) // Default to no user found
		mockGetUserLocaleByEmail.mockResolvedValue('fr') // Default locale
	})

	describe('fetchUserWaitlists', () => {
		it('should fetch user waitlists', async () => {
			const waitlists = [
				{ id: 'waitlist1', expand: { event_id: undefined }, event_id: 'event1' },
				{ id: 'waitlist2', expand: { event_id: undefined }, event_id: 'event2' },
			]
			mockPocketbaseCollection.getFullList.mockResolvedValue(waitlists)
			mockPocketbaseCollection.getOne.mockImplementation((eventId: string) =>
				Promise.resolve({
					typeCourse: 'trail' as const,
					name: `Test Event ${eventId}`,
					id: eventId,
					distanceKm: 10,
				})
			)

			const result = await fetchUserWaitlists('user1')

			expect(mockPocketbase.collection).toHaveBeenCalledWith('waitlists')
			expect(mockPocketbaseCollection.getFullList).toHaveBeenCalledWith({
				sort: '-added_at',
				filter: 'user_id = "user1" && mail_notification = true',
				expand: 'event_id',
			})
			expect(result).toEqual([
				{
					id: 'waitlist1',
					expand: {
						event_id: {
							typeCourse: 'trail',
							name: 'Test Event event1',
							id: 'event1',
							distanceKm: 10,
						},
					},
					event_id: 'event1',
				},
				{
					id: 'waitlist2',
					expand: {
						event_id: {
							typeCourse: 'trail',
							name: 'Test Event event2',
							id: 'event2',
							distanceKm: 10,
						},
					},
					event_id: 'event2',
				},
			])
		})

		it('should return an empty array if the user ID is empty', async () => {
			const result = await fetchUserWaitlists('')
			expect(result).toEqual([])
		})
	})
})
