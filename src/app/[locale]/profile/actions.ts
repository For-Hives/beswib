'use server'

import type { User } from '@/models/user.model'

import { updateUser } from '@/services/user.services'

export async function updateUserProfile(userId: string, data: Partial<User>) {
	try {
		return await updateUser(userId, data)
	} catch (error) {
		console.error('Error updating user profile:', error)
		throw error
	}
}
