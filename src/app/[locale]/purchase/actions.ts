'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

import { createTransaction } from '@/services/transaction.services'
import { fetchUserByClerkId } from '@/services/user.services'
import { capturePayment } from '@/services/paypal.services'
import { salesCreate } from '@/services/sales.services'
import { fetchBibById } from '@/services/bib.services'
import { PLATFORM_FEE } from '@/constants/global.constant'

export async function handlePaymentPageOpened(paymentIntentId: string, bibId: string) {
	const { userId } = await auth()

	if (userId == null) {
		throw new Error('User is not authenticated.')
	}

	try {
		const bib = await fetchBibById(bibId)
		if (!bib) {
			throw new Error('Bib not found.')
		}
		// Map Clerk userId to PocketBase user record ID
		const pbUser = await fetchUserByClerkId(userId)
		if (!pbUser) {
			throw new Error('User not found in database.')
		}

		const transaction = await createTransaction({
			status: 'pending',
			seller_user_id: bib.sellerUserId,
			raw_webhook_payload: '',
			platform_fee: bib.price * PLATFORM_FEE,
			paypal_order_id: paymentIntentId,
			paypal_capture_id: '',
			payment_status: 'pending',
			payer_id: '',
			payer_email: '',
			currency: 'EUR',
			capture_time: '',
			buyer_user_id: pbUser.id,
			bib_id: bib.id,
			amount: bib.price,
		})

		if (!transaction) {
			throw new Error('Failed to create transaction.')
		}

		return { transaction, success: true }
	} catch (error) {
		console.error('Error handling payment page open:', error)
		if (error instanceof Error) {
			return { success: false, error: error.message }
		}
		return { success: false, error: 'An unexpected error occurred.' }
	}
}

// New action to create sale: wraps salesCreate and returns orderId
export async function createSale(bibId: string, sellerMerchantId: string) {
	const { userId } = await auth()
	if (userId == null || userId === '') {
		return { success: false, error: 'User is not authenticated.' }
	}
	if (!bibId || !sellerMerchantId) {
		return { success: false, error: 'Missing parameters.' }
	}
	try {
		const { transaction, orderId } = await salesCreate({
			sellerMerchantId,
			buyerUserId: userId,
			bibId,
		})
		// Optional revalidation for marketplace pages post-initiation
		revalidatePath('/marketplace')
		return { transactionId: transaction.id, success: true, orderId }
	} catch (error) {
		console.error('Error creating sale:', error)
		return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
	}
}

// Server-side wrapper to capture a PayPal order (prevents exposing client secret to the browser)
export async function captureOrder(orderId: string) {
	if (!orderId) return { error: 'Missing orderId' }
	try {
		const res = await capturePayment(orderId)
		return res
	} catch (error) {
		console.error('Error capturing order:', error)
		return { error: error instanceof Error ? error.message : 'Unknown error' }
	}
}
