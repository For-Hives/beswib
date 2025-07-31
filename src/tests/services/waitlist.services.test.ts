import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockPocketbase } from '@/tests/mocks/pocketbase'

import type { User } from '@/models/user.model'

vi.mock('@/lib/pocketbaseClient', () => ({
	pb: mockPocketbase,
}))

const mockUser: User = {
	updated: new Date('2024-01-01T00:00:00.000Z'),
	role: 'user',
	postalCode: null,
	phoneNumber: null,
	paypalMerchantId: null,
	lastName: 'User',
	id: 'user1',
	firstName: 'Test',
	emergencyContactPhone: null,
	emergencyContactName: null,
	email: 'test@test.com',
	created: new Date('2024-01-01T00:00:00.000Z'),
	country: null,
	clerkId: 'clerk_user1',
	city: null,
	birthDate: null,
	address: null,
	clubAffiliation: null,
	emergencyContactRelationship: null,
	gender: null,
	licenseNumber: null,
	medicalCertificateUrl: null,
}

import { addToWaitlist, fetchUserWaitlists } from '@/services/waitlist.services'

describe('waitlist.services', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('addToWaitlist', () => {
		it('should add a user to the waitlist', async () => {
			mockPocketbase.getFirstListItem.mockRejectedValue({ status: 404 })
			mockPocketbase.create.mockResolvedValue({ userId: 'user1', id: 'waitlist1', eventId: 'event1' })

			const result = await addToWaitlist('event1', mockUser)

			expect(mockPocketbase.collection).toHaveBeenCalledWith('waitlists')
			expect(mockPocketbase.getFirstListItem).toHaveBeenCalledWith('userId = "user1" && eventId = "event1"')
			expect(mockPocketbase.create).toHaveBeenCalled()
			expect(result).toEqual({ userId: 'user1', id: 'waitlist1', eventId: 'event1' })
		})

		it('should return an error if the user is already on the waitlist', async () => {
			const existingEntry = { userId: 'user1', id: 'waitlist1', eventId: 'event1' }
			mockPocketbase.getFirstListItem.mockResolvedValue(existingEntry)

			const result = await addToWaitlist('event1', mockUser)

			expect(result).toEqual({ ...existingEntry, error: 'already_on_waitlist' })
		})

		it('should return null if the user is not found', async () => {
			const result = await addToWaitlist('event1', null)

			expect(result).toBeNull()
		})
	})

	describe('fetchUserWaitlists', () => {
		it('should fetch user waitlists', async () => {
			const waitlists = [{ id: 'waitlist1' }, { id: 'waitlist2' }]
			mockPocketbase.getFullList.mockResolvedValue(waitlists)

			const result = await fetchUserWaitlists('user1')

			expect(mockPocketbase.collection).toHaveBeenCalledWith('waitlists')
			expect(mockPocketbase.getFullList).toHaveBeenCalledWith({
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
