'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

import { getTransactionByOrderId, createTransaction } from '@/services/transaction.services'
import { fetchPublicBibById, isLocked } from '@/services/bib.services'
import { fetchUserByClerkId } from '@/services/user.services'
import { capturePayment } from '@/services/paypal.services'
import { PLATFORM_FEE } from '@/constants/global.constant'
import { salesCreate } from '@/services/sales.services'

export async function handlePaymentPageOpened(paymentIntentId: string, bibId: string) {
	const { userId } = await auth()

	if (userId == null) {
		throw new Error('User is not authenticated.')
	}

	try {
		const bib = await fetchPublicBibById(bibId)
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
export async function createSale(bibId: string, sellerMerchantId: string, locale?: string) {
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
			locale,
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
export async function captureOrder(
	orderId: string,
	lockKey: string | null = null
): Promise<{
	error?: string
	isInstrumentDeclined?: boolean
	needsPaymentRestart?: boolean
	errorCode?: string
	debugInfo?: unknown
	data?: unknown
}> {
	if (!orderId) return { error: 'Missing orderId' }
	try {
		// Verify the current user owns the order/transaction
		const { userId } = await auth()
		if (userId == null || userId === '') {
			return { error: 'User is not authenticated.' }
		}

		const tx = await getTransactionByOrderId(orderId)
		if (!tx) {
			return { error: 'Order not found.' }
		}

		const pbBuyer = await fetchUserByClerkId(userId)
		if (!pbBuyer) {
			return { error: 'User not found in database.' }
		}
		if (pbBuyer.id !== tx.buyer_user_id) {
			return { error: 'This order does not belong to the current user.' }
		}

		// Verify the bib is still available and locked by this user with the provided lock key
		const bib = await fetchPublicBibById(tx.bib_id)
		if (!bib) {
			return { error: 'Bib not found.' }
		}
		if (bib.status !== 'available') {
			return { error: 'This bib is no longer available.' }
		}
		if (lockKey == null || lockKey === '') {
			return { error: 'Lock has expired. Please try again.' }
		}

		const lockState = await isLocked(tx.bib_id, lockKey)
		if (lockState !== 'userlocked') {
			// Either locked by someone else or not locked anymore
			const msg =
				lockState === 'locked'
					? 'This bib is currently locked by another user.'
					: 'Your lock has expired. Please try again.'
			return { error: msg }
		}

		// All checks passed, proceed to capture
		const res = await capturePayment(orderId)

		// If instrument declined, add specific flag for frontend handling
		if (res.isInstrumentDeclined === true) {
			return {
				...res,
				needsPaymentRestart: true,
				isInstrumentDeclined: true,
				error: res.error ?? 'Your payment method was declined. Please select a different payment method.',
			}
		}

		return res
	} catch (error) {
		console.error('Error capturing order:', error)
		return { error: error instanceof Error ? error.message : 'Unknown error' }
	}
}
