import { mockPocketbase, mockPocketbaseCollection } from '@/tests/mocks/pocketbase'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/services/pocketbase', () => ({
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
			mockPocketbaseCollection.create.mockResolvedValue(mockUser)
			const user = await createUser(mockUser)
			expect(user).toEqual(mockUser)
			expect(mockPocketbase.collection).toHaveBeenCalledWith('users')
			expect(mockPocketbaseCollection.create).toHaveBeenCalledWith(mockUser)
		})

		it('should throw an error if user creation fails', async () => {
			mockPocketbaseCollection.create.mockRejectedValue(new Error('Failed to create'))
			await expect(createUser(mockUser)).rejects.toThrow('Failed to create')
		})
	})

	describe('fetchUserByClerkId', () => {
		it('should fetch a user by Clerk ID', async () => {
			mockPocketbaseCollection.getFirstListItem.mockResolvedValue(mockUser)
			const user = await fetchUserByClerkId('clerk123')
			expect(user).toEqual(mockUser)
			expect(mockPocketbase.collection).toHaveBeenCalledWith('users')
			expect(mockPocketbaseCollection.getFirstListItem).toHaveBeenCalledWith('clerkId = "clerk123"')
		})

		it('should return null if Clerk ID is not provided', async () => {
			const user = await fetchUserByClerkId(undefined)
			expect(user).toBeNull()
		})

		it('should return null if user is not found', async () => {
			mockPocketbaseCollection.getFirstListItem.mockRejectedValue({ status: 404 })
			const user = await fetchUserByClerkId('nonexistent')
			expect(user).toBeNull()
		})

		it('should return null if fetching fails for other reasons', async () => {
			mockPocketbaseCollection.getFirstListItem.mockRejectedValue(new Error('Fetch failed'))
			const user = await fetchUserByClerkId('clerk123')
			expect(user).toBeNull()
		})
	})

	describe('fetchUserByEmail', () => {
		it('should fetch a user by email', async () => {
			mockPocketbase.getFirstListItem.mockResolvedValue(mockUser)
			const user = await (await import('@/services/user.services')).fetchUserByEmail('test@example.com')
			expect(user).toEqual(mockUser)
			expect(mockPocketbase.collection).toHaveBeenCalledWith('users')
			expect(mockPocketbase.getFirstListItem).toHaveBeenCalledWith('email = "test@example.com"')
		})

		it('should return null if email is not provided', async () => {
			const user = await (await import('@/services/user.services')).fetchUserByEmail('')
			expect(user).toBeNull()
		})

		it('should return null if user is not found', async () => {
			mockPocketbase.getFirstListItem.mockRejectedValue({ status: 404 })
			const user = await (await import('@/services/user.services')).fetchUserByEmail('nonexistent@example.com')
			expect(user).toBeNull()
		})

		it('should return null if fetching fails for other reasons', async () => {
			mockPocketbase.getFirstListItem.mockRejectedValue(new Error('Fetch failed'))
			const user = await (await import('@/services/user.services')).fetchUserByEmail('test@example.com')
			expect(user).toBeNull()
		})
	})

	describe('fetchUserById', () => {
		it('should fetch a user by ID', async () => {
			mockPocketbaseCollection.getOne.mockResolvedValue(mockUser)
			const user = await fetchUserById('user1')
			expect(user).toEqual(mockUser)
			expect(mockPocketbase.collection).toHaveBeenCalledWith('users')
			expect(mockPocketbaseCollection.getOne).toHaveBeenCalledWith('user1')
		})

		it('should return null if user ID is not provided', async () => {
			const user = await fetchUserById('')
			expect(user).toBeNull()
		})

		it('should return null if user is not found', async () => {
			mockPocketbaseCollection.getOne.mockRejectedValue({ status: 404 })
			const user = await fetchUserById('nonexistent')
			expect(user).toBeNull()
		})

		it('should return null if fetching fails for other reasons', async () => {
			mockPocketbaseCollection.getOne.mockRejectedValue(new Error('Fetch failed'))
			const user = await fetchUserById('user1')
			expect(user).toBeNull()
		})
	})

	describe('isAdmin', () => {
		it('should return true if the user is an admin', async () => {
			mockPocketbaseCollection.getOne.mockResolvedValue({ ...mockUser, role: 'admin' })
			const result = await (await import('@/services/user.services')).isUserAdmin('user1')
			expect(result).toBe(true)
		})

		it('should return false if the user is not an admin', async () => {
			mockPocketbaseCollection.getOne.mockResolvedValue({ ...mockUser, role: 'user' })
			const result = await (await import('@/services/user.services')).isUserAdmin('user1')
			expect(result).toBe(false)
		})

		it('should return false if the user is null', async () => {
			mockPocketbaseCollection.getOne.mockResolvedValue(null)
			const result = await (await import('@/services/user.services')).isUserAdmin('user1')
			expect(result).toBe(false)
		})
	})
})
