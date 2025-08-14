import { mockPocketbase, mockPocketbaseCollection } from '@/tests/mocks/pocketbase'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { User } from '@/models/user.model'

vi.mock('@/lib/services/pocketbase', () => ({
	pb: mockPocketbase,
}))

vi.mock('@/services/user.services', () => ({
	fetchUserByEmail: vi.fn(),
}))

const { fetchUserByEmail: mockFetchUserByEmail } = vi.mocked(await import('@/services/user.services'))

const mockUser: User = {
	updated: new Date('2024-01-01T00:00:00.000Z'),
	role: 'user',
	postalCode: null,
	phoneNumber: null,
	paypalMerchantId: null,
	medicalCertificateUrl: null,
	licenseNumber: null,
	lastName: 'User',
	id: 'user1',
	gender: null,
	firstName: 'Test',
	emergencyContactRelationship: null,
	emergencyContactPhone: null,
	emergencyContactName: null,
	email: 'test@test.com',
	created: new Date('2024-01-01T00:00:00.000Z'),
	country: null,
	contactEmail: null,
	clubAffiliation: null,
	clerkId: 'clerk_user1',
	city: null,
	birthDate: null,
	address: null,
}

import { addToWaitlist, fetchUserWaitlists } from '@/services/waitlist.services'

describe('waitlist.services', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockFetchUserByEmail.mockResolvedValue(null) // Default to no user found
	})

	describe('addToWaitlist', () => {
		it('should add a user to the waitlist', async () => {
			mockPocketbaseCollection.getFirstListItem.mockRejectedValue({ status: 404 })
			mockPocketbaseCollection.create.mockResolvedValue({ userId: 'user1', id: 'waitlist1', eventId: 'event1' })

			const result = await addToWaitlist('event1', mockUser)

			expect(mockPocketbase.collection).toHaveBeenCalledWith('waitlists')
			expect(mockPocketbaseCollection.getFirstListItem).toHaveBeenCalledWith('userId = "user1" && eventId = "event1"')
			expect(mockPocketbaseCollection.create).toHaveBeenCalled()
			expect(result).toEqual({ userId: 'user1', id: 'waitlist1', eventId: 'event1' })
		})

		it('should return an error if the user is already on the waitlist', async () => {
			const existingEntry = { userId: 'user1', id: 'waitlist1', eventId: 'event1' }
			mockPocketbaseCollection.getFirstListItem.mockResolvedValue(existingEntry)

			const result = await addToWaitlist('event1', mockUser)

			expect(result).toEqual({ ...existingEntry, error: 'already_on_waitlist' })
		})

		it('should return null if the user is not found', async () => {
			const result = await addToWaitlist('event1', null)

			expect(result).toBeNull()
		})

		it('should link to existing user when email belongs to registered user', async () => {
			// Mock that the email belongs to an existing user
			mockFetchUserByEmail.mockResolvedValue(mockUser)
			mockPocketbase.getFirstListItem.mockRejectedValue({ status: 404 }) // No existing waitlist entry
			mockPocketbase.create.mockResolvedValue({ user_id: 'user1', id: 'waitlist1', event_id: 'event1' })

			const result = await addToWaitlist('event1', null, 'test@test.com')

			expect(mockFetchUserByEmail).toHaveBeenCalledWith('test@test.com')
			expect(mockPocketbase.getFirstListItem).toHaveBeenCalledWith('user_id = "user1" && event_id = "event1"')
			expect(mockPocketbase.create).toHaveBeenCalledWith({
				user_id: 'user1',
				optionPreferences: {},
				mail_notification: true,
				event_id: 'event1',
				email: undefined, // Should be undefined since we linked to a user
				added_at: expect.any(Date) as Date,
			})
			expect(result).toEqual({ user_id: 'user1', id: 'waitlist1', event_id: 'event1' })
		})

		it('should create email-only subscription when email does not belong to registered user', async () => {
			// Mock that the email does not belong to any existing user
			mockFetchUserByEmail.mockResolvedValue(null)
			mockPocketbase.getFirstListItem.mockRejectedValue({ status: 404 }) // No existing waitlist entry
			mockPocketbase.create.mockResolvedValue({
				user_id: null,
				id: 'waitlist1',
				event_id: 'event1',
				email: 'new@test.com',
			})

			const result = await addToWaitlist('event1', null, 'new@test.com')

			expect(mockFetchUserByEmail).toHaveBeenCalledWith('new@test.com')
			expect(mockPocketbase.getFirstListItem).toHaveBeenCalledWith('email = "new@test.com" && event_id = "event1"')
			expect(mockPocketbase.create).toHaveBeenCalledWith({
				user_id: null,
				optionPreferences: {},
				mail_notification: true,
				event_id: 'event1',
				email: 'new@test.com',
				added_at: expect.any(Date) as Date,
			})
			expect(result).toEqual({
				user_id: null,
				id: 'waitlist1',
				event_id: 'event1',
				email: 'new@test.com',
			})
		})
	})

	describe('fetchUserWaitlists', () => {
		it('should fetch user waitlists', async () => {
			const waitlists = [{ id: 'waitlist1' }, { id: 'waitlist2' }]
			mockPocketbaseCollection.getFullList.mockResolvedValue(waitlists)

			const result = await fetchUserWaitlists('user1')

			expect(mockPocketbase.collection).toHaveBeenCalledWith('waitlists')
			expect(mockPocketbaseCollection.getFullList).toHaveBeenCalledWith({
				sort: '-addedAt',
				filter: 'userId = "user1"',
				expand: 'eventId',
			})
			expect(result).toEqual(waitlists)
		})

		it('should return an empty array if the user ID is empty', async () => {
			const result = await fetchUserWaitlists('')
			expect(result).toEqual([])
		})
	})
})
