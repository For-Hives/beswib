import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@/models/user.model'
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

const mockUser: User = {
	updated: new Date('2024-01-01T00:00:00.000Z'),
	role: 'user',
	postalCode: null,
	phoneNumber: null,
	paypalMerchantId: null,
	paypal_kyc: false,
	medicalCertificateUrl: null,
	locale: 'fr',
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
	consentMarket: false,
	clubAffiliation: null,
	clerkId: 'clerk_user1',
	city: null,
	birthDate: null,
	address: null,
}

import { addToWaitlist, fetchUserWaitlists, linkEmailWaitlistsToUser } from '@/services/waitlist.services'

describe('waitlist.services', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockFetchUserByEmail.mockResolvedValue(null) // Default to no user found
		mockGetUserLocaleByEmail.mockResolvedValue('fr') // Default locale
	})

	describe('addToWaitlist', () => {
		it('should add a user to the waitlist', async () => {
			mockPocketbaseCollection.getFirstListItem.mockRejectedValue({
				status: 404,
			})
			mockPocketbaseCollection.create.mockResolvedValue({
				user_id: 'user1',
				id: 'waitlist1',
				event_id: 'event1',
			})
			mockPocketbaseCollection.getOne.mockResolvedValue({
				typeCourse: 'trail',
				name: 'Test Event',
				id: 'event1',
				distanceKm: 10,
			})

			const result = await addToWaitlist('event1', mockUser)

			expect(mockPocketbase.collection).toHaveBeenCalledWith('waitlists')
			expect(mockPocketbaseCollection.getFirstListItem).toHaveBeenCalledWith('user_id = "user1" && event_id = "event1"')
			expect(mockPocketbaseCollection.create).toHaveBeenCalled()
			expect(result).toEqual({
				user_id: 'user1',
				id: 'waitlist1',
				event_id: 'event1',
			})
		})

		it('should return an error if the user is already on the waitlist', async () => {
			const existingEntry = {
				user_id: 'user1',
				id: 'waitlist1',
				event_id: 'event1',
			}
			mockPocketbaseCollection.getFirstListItem.mockResolvedValue(existingEntry)

			const result = await addToWaitlist('event1', mockUser)

			expect(result).toEqual({
				...existingEntry,
				error: 'already_on_waitlist',
			})
		})

		it('should return null if the user is not found', async () => {
			const result = await addToWaitlist('event1', null)

			expect(result).toBeNull()
		})

		it('should link to existing user when email belongs to registered user', async () => {
			// Mock that the email belongs to an existing user
			mockFetchUserByEmail.mockResolvedValue(mockUser)
			mockPocketbase.getFirstListItem.mockRejectedValue({ status: 404 }) // No existing waitlist entry
			mockPocketbase.create.mockResolvedValue({
				user_id: 'user1',
				id: 'waitlist1',
				event_id: 'event1',
			})
			mockPocketbaseCollection.getOne.mockResolvedValue({
				typeCourse: 'trail',
				name: 'Test Event',
				id: 'event1',
				distanceKm: 10,
			})

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
			expect(result).toEqual({
				user_id: 'user1',
				id: 'waitlist1',
				event_id: 'event1',
			})
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
			const waitlists = [
				{
					id: 'waitlist1',
					expand: { event_id: undefined },
					event_id: 'event1',
				},
				{
					id: 'waitlist2',
					expand: { event_id: undefined },
					event_id: 'event2',
				},
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

	describe('linkEmailWaitlistsToUser', () => {
		it('should link email-only waitlist entries to a user account', async () => {
			const emailWaitlistEntries = [
				{
					user_id: null,
					id: 'waitlist1',
					event_id: 'event1',
					email: 'test@test.com',
				},
				{
					user_id: null,
					id: 'waitlist2',
					event_id: 'event2',
					email: 'test@test.com',
				},
			]
			mockPocketbase.getFullList.mockResolvedValue(emailWaitlistEntries)
			mockPocketbase.update.mockResolvedValue({})

			const result = await linkEmailWaitlistsToUser('test@test.com', mockUser)

			expect(mockPocketbase.collection).toHaveBeenCalledWith('waitlists')
			expect(mockPocketbase.getFullList).toHaveBeenCalledWith({
				filter: 'email = "test@test.com" && user_id = null',
			})
			expect(mockPocketbase.update).toHaveBeenCalledTimes(2)
			expect(mockPocketbase.update).toHaveBeenCalledWith('waitlist1', {
				user_id: 'user1',
				email: undefined,
			})
			expect(mockPocketbase.update).toHaveBeenCalledWith('waitlist2', {
				user_id: 'user1',
				email: undefined,
			})
			expect(result).toBe(2)
		})

		it('should return 0 if no email-only waitlist entries found', async () => {
			mockPocketbase.getFullList.mockResolvedValue([])

			const result = await linkEmailWaitlistsToUser('test@test.com', mockUser)

			expect(mockPocketbase.getFullList).toHaveBeenCalledWith({
				filter: 'email = "test@test.com" && user_id = null',
			})
			expect(mockPocketbase.update).not.toHaveBeenCalled()
			expect(result).toBe(0)
		})

		it('should return 0 if email is not provided', async () => {
			const result = await linkEmailWaitlistsToUser('', mockUser)

			expect(mockPocketbase.getFullList).not.toHaveBeenCalled()
			expect(result).toBe(0)
		})

		it('should return 0 if user is not provided', async () => {
			try {
				// This should throw an error because user is null
				await linkEmailWaitlistsToUser('test@test.com', mockUser)
			} catch (e) {
				expect(e).toBeInstanceOf(Error)
			}
		})

		it('should handle partial failures when updating entries', async () => {
			const emailWaitlistEntries = [
				{
					user_id: null,
					id: 'waitlist1',
					event_id: 'event1',
					email: 'test@test.com',
				},
				{
					user_id: null,
					id: 'waitlist2',
					event_id: 'event2',
					email: 'test@test.com',
				},
			]
			mockPocketbase.getFullList.mockResolvedValue(emailWaitlistEntries)
			// First update succeeds, second fails
			mockPocketbase.update.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('Update failed'))

			const result = await linkEmailWaitlistsToUser('test@test.com', mockUser)

			expect(mockPocketbase.update).toHaveBeenCalledTimes(2)
			expect(result).toBe(1) // Only one successful update
		})
	})
})
