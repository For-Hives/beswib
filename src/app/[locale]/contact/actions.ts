'use server'

import { sendContactMessage } from '@/services/notification.service'

export async function submitContactMessage(input: {
	name: string
	email: string
	message: string
}): Promise<{ success: boolean; error?: string }> {
	const name = (input.name ?? '').trim()
	const email = (input.email ?? '').trim()
	const message = (input.message ?? '').trim()

	if (name.length === 0 || email.length === 0 || message.length === 0) {
		return { success: false, error: 'Missing required fields' }
	}
	// Minimal email format check
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return { success: false, error: 'Invalid email' }
	}

	const ok = await sendContactMessage({ name, message, email })
	if (!ok) return { success: false, error: 'Notification failed' }
	return { success: true }
}
