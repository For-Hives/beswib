'use server'

import { auth } from '@clerk/nextjs/server'

import { fetchUserByClerkId } from '@/services/user.services'

/**
 * Server action to check if the current user has admin privileges 👑
 * Can be called from client components 📞
 */
export async function checkIsCurrentUserAdmin(): Promise<boolean> {
	try {
		const { userId: clerkId } = await auth()

		if (clerkId == null || clerkId === undefined) {
			return false
		}

		const user = await fetchUserByClerkId(clerkId)

		if (user == null || user.role !== 'admin') {
			return false
		}

		return true
	} catch (error) {
		console.error('Error in checkIsCurrentUserAdmin:', error)
		return false
	}
}
