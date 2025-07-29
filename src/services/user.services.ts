'use server'
import { pb } from '@/lib/pocketbaseClient'
import { User } from '@/models/user.model'

export async function createUser(user: Partial<User>): Promise<User> {
	try {
		return await pb.collection('users').create<User>(user)
	} catch (error) {
		console.error('Error creating user:', error)
		throw error
	}
}

export async function fetchUserByClerkId(clerkId: string | undefined): Promise<null | User> {
	if (clerkId == null || clerkId === undefined || clerkId === '') {
		console.error('Clerk ID is required to fetch user by clerk ID')
		return null
	}
	try {
		const user = await pb.collection('users').getFirstListItem<User>(`clerkId = "${clerkId}"`)
		return user
	} catch (error) {
		console.error('Error fetching user by clerk ID:', error)
		return null
	}
}

export async function fetchUserById(id: string): Promise<null | User> {
	if (id === '') {
		console.error('User ID (PocketBase record ID) is required to fetch user data.')
		return null
	}
	try {
		const user = await pb.collection('users').getOne<User>(id)
		return user
	} catch (error) {
		console.error('Error fetching user by ID:', error)
		return null
	}
}

export async function getUserData(userId: string): Promise<null | User> {
	try {
		console.info('Fetching user data for ID:', userId)
		const user = await pb.collection('users').getOne<User>(userId)
		return user
	} catch (error) {
		console.error('Error fetching user data:', error)
		return null
	}
}

export async function isUserAdmin(id: string): Promise<boolean> {
	const user = await fetchUserById(id)
	return user?.isAdmin ?? false
}

export async function updateUser(id: string, user: Partial<User>): Promise<User> {
	try {
		return await pb.collection('users').update<User>(id, user)
	} catch (error) {
		console.error('Error updating user:', error)
		throw error
	}
}
