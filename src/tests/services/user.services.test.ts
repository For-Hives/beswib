import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockPocketbase } from '@/tests/mocks/pocketbase'

vi.mock('@/lib/pocketbaseClient', () => ({
	pb: mockPocketbase,
}))

import { mockUser } from '@/tests/mocks/data'

import { createUser, fetchUserByClerkId, fetchUserById } from '@/services/user.services'

describe('user.services', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('createUser', () => {
		it('should create a user', async () => {
			mockPocketbase.create.mockResolvedValue(mockUser)
			const user = await createUser(mockUser)
			expect(user).toEqual(mockUser)
			expect(mockPocketbase.collection).toHaveBeenCalledWith('users')
			expect(mockPocketbase.create).toHaveBeenCalledWith(mockUser)
		})

		it('should throw an error if user creation fails', async () => {
			mockPocketbase.create.mockRejectedValue(new Error('Failed to create'))
			await expect(createUser(mockUser)).rejects.toThrow('Error creating user in PocketBase: Failed to create')
		})
	})

	describe('fetchUserByClerkId', () => {
		it('should fetch a user by Clerk ID', async () => {
			mockPocketbase.getFirstListItem.mockResolvedValue(mockUser)
			const user = await fetchUserByClerkId('clerk123')
			expect(user).toEqual(mockUser)
			expect(mockPocketbase.collection).toHaveBeenCalledWith('users')
			expect(mockPocketbase.getFirstListItem).toHaveBeenCalledWith('clerkId = "clerk123"')
		})

		it('should return null if Clerk ID is not provided', async () => {
			const user = await fetchUserByClerkId(undefined)
			expect(user).toBeNull()
		})

		it('should return null if user is not found', async () => {
			mockPocketbase.getFirstListItem.mockRejectedValue({ status: 404 })
			const user = await fetchUserByClerkId('nonexistent')
			expect(user).toBeNull()
		})

		it('should throw an error if fetching fails for other reasons', async () => {
			mockPocketbase.getFirstListItem.mockRejectedValue(new Error('Fetch failed'))
			await expect(fetchUserByClerkId('clerk123')).rejects.toThrow(
				'Error fetching user by Clerk ID "clerk123": Fetch failed'
			)
		})
	})

	describe('fetchUserById', () => {
		it('should fetch a user by ID', async () => {
			mockPocketbase.getOne.mockResolvedValue(mockUser)
			const user = await fetchUserById('user1')
			expect(user).toEqual(mockUser)
			expect(mockPocketbase.collection).toHaveBeenCalledWith('users')
			expect(mockPocketbase.getOne).toHaveBeenCalledWith('user1')
		})

		it('should return null if user ID is not provided', async () => {
			const user = await fetchUserById('')
			expect(user).toBeNull()
		})

		it('should return null if user is not found', async () => {
			mockPocketbase.getOne.mockRejectedValue({ status: 404 })
			const user = await fetchUserById('nonexistent')
			expect(user).toBeNull()
		})

		it('should throw an error if fetching fails for other reasons', async () => {
			mockPocketbase.getOne.mockRejectedValue(new Error('Fetch failed'))
			await expect(fetchUserById('user1')).rejects.toThrow('Error fetching user by PocketBase ID "user1": Fetch failed')
		})
	})

	describe('isAdmin', () => {
		it('should return true if the user is an admin', () => {
			const adminUser = { ...mockUser, role: 'admin' as const }
			expect(adminUser.isAdmin).toBe(true)
		})

		it('should return false if the user is not an admin', () => {
			const regularUser = { ...mockUser, role: 'user' as const }
			expect(regularUser.isAdmin).toBe(false)
		})

		it('should return false if the user is null', () => {
			expect(null).toBe(false)
		})
	})
})
