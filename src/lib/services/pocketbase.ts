// src/lib/pocketbaseClient.ts 🧱
import PocketBase from 'pocketbase'

const { POCKETBASE_TOKEN, NEXT_PUBLIC_POCKETBASE_URL } = process.env

// Use the provided URL or fallback to api.beswib.com for server-side operations 🌐
const pocketbaseUrl = NEXT_PUBLIC_POCKETBASE_URL ?? 'https://api.beswib.com'

if (!pocketbaseUrl) {
	throw new Error('PocketBase URL is required')
}

// Initialize PocketBase client ✨
export const pb = new PocketBase(pocketbaseUrl)

pb.autoCancellation(false)

// For server-side operations, authenticate with admin token 👑
if (POCKETBASE_TOKEN != null && POCKETBASE_TOKEN !== '') {
	pb.authStore.save(POCKETBASE_TOKEN, null)
	console.info('PocketBase authenticated with admin token')
} else {
	console.warn('POCKETBASE_TOKEN not found - some operations may not work')
}

/**
 * Helper function to handle PocketBase errors consistently
 */
export function handlePocketBaseError(error: unknown, operation: string): void {
	console.error(`Error ${operation}:`, error)
	const errorObj = error as { response?: unknown }
	console.error(errorObj.response ?? error)

	// Provide helpful error message for missing collection
	if (error instanceof Error && error.message.includes('404')) {
		console.error('❌ The "verifiedEmails" collection does not exist in PocketBase.')
		console.error('📋 Please run: node scripts/setup-verified-emails-collection.js')
		console.error('📖 Or see: docs/pocketbase-verifiedemails-setup.md for manual setup')
	}
}
