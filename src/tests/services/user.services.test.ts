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
			await expect(createUser(mockUser)).rejects.toThrow('Failed to create')
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

		it('should return null if fetching fails for other reasons', async () => {
			mockPocketbase.getFirstListItem.mockRejectedValue(new Error('Fetch failed'))
			const user = await fetchUserByClerkId('clerk123')
			expect(user).toBeNull()
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

		it('should return null if fetching fails for other reasons', async () => {
			mockPocketbase.getOne.mockRejectedValue(new Error('Fetch failed'))
			const user = await fetchUserById('user1')
			expect(user).toBeNull()
		})
	})

	describe('isAdmin', () => {
		it('should return true if the user is an admin', async () => {
			mockPocketbase.getOne.mockResolvedValue({ ...mockUser, role: 'admin' })
			const result = await (await import('@/services/user.services')).isUserAdmin('user1')
			expect(result).toBe(true)
		})

		it('should return false if the user is not an admin', async () => {
			mockPocketbase.getOne.mockResolvedValue({ ...mockUser, role: 'user' })
			const result = await (await import('@/services/user.services')).isUserAdmin('user1')
			expect(result).toBe(false)
		})

		it('should return false if the user is null', async () => {
			mockPocketbase.getOne.mockResolvedValue(null)
			const result = await (await import('@/services/user.services')).isUserAdmin('user1')
			expect(result).toBe(false)
		})
	})
})
