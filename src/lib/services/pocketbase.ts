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
