import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { User } from '@/models/user.model'
import { fetchUserByClerkId } from '@/services/user.services'

/**
 * Check if current user has admin access without throwing 👑
 * Returns null if not authenticated or not admin 🤷
 */
export async function checkAdminAccess(): Promise<null | User> {
	try {
		const { userId: clerkId } = await auth()

		if (clerkId == null || clerkId === undefined) {
			return null
		}

		const user = await fetchUserByClerkId(clerkId)

		if (user == null || user.role !== 'admin') {
			return null
		}

		return user
	} catch (error) {
		console.error('Error in checkAdminAccess:', error)
		return null
	}
}

/**
 * Get current authenticated user regardless of role 👤
 */
export async function getCurrentUser(): Promise<null | User> {
	try {
		const { userId: clerkId } = await auth()

		if (clerkId == null || clerkId === undefined) {
			return null
		}

		const user = await fetchUserByClerkId(clerkId)
		return user
	} catch (error) {
		console.error('Error in getCurrentUser:', error)
		return null
	}
}

/**
 * Admin guard utility to verify user has admin access 🛡️
 * Redirects to unauthorized page if user is not authenticated or not an admin 🚫
 */
export async function requireAdminAccess(): Promise<User> {
	try {
		// Get current user from Clerk 👨‍💻
		const { userId: clerkId } = await auth()

		// Check if user is authenticated ✅
		if (clerkId == null || clerkId === undefined) {
			redirect(`/auth/sign-in?redirectUrl=${encodeURIComponent('/admin/event')}`)
		}

		// Fetch user data from PocketBase 💾
		const user = await fetchUserByClerkId(clerkId)

		// Check if user exists in our database 🤔
		if (!user) {
			redirect('/auth/unauthorized')
		}

		// Check if user has admin role 👑
		if (user.role !== 'admin') {
			redirect('/auth/unauthorized')
		}

		return user
	} catch (error) {
		console.error('Error in requireAdminAccess:', error)
		redirect('/unauthorized')
	}
}
