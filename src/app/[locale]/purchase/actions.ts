'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { PLATFORM_FEE } from '@/constants/global.constant'
import { priceBucket } from '@/lib/analytics/buckets'
import type { PurchaseErrorKind } from '@/lib/analytics/catalog'
import { listingOf } from '@/lib/analytics/classify'
import { bibIdOf, eventIdOfBib } from '@/lib/analytics/ids'
import { trackServer } from '@/lib/analytics/server'
import { fetchPublicBibById, isLocked } from '@/services/bib.services'
import { capturePayment } from '@/services/paypal.services'
import { salesCreate } from '@/services/sales.services'
import { createTransaction, getTransactionByOrderId } from '@/services/transaction.services'
import { fetchUserByClerkId } from '@/services/user.services'

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
		return {
			success: false,
			errorKind: 'unauthenticated' as const satisfies PurchaseErrorKind,
			error: 'User is not authenticated.',
		}
	}
	if (!bibId || !sellerMerchantId) {
		return {
			success: false,
			errorKind: 'missing_params' as const satisfies PurchaseErrorKind,
			error: 'Missing parameters.',
		}
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
		return {
			success: false,
			errorKind: 'exception' as const satisfies PurchaseErrorKind,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

// Server-side wrapper to capture a PayPal order (prevents exposing client secret to the browser)
export async function captureOrder(
	orderId: string,
	lockKey: string | null = null
): Promise<{
	error?: string
	errorKind?: PurchaseErrorKind
	isInstrumentDeclined?: boolean
	needsPaymentRestart?: boolean
	errorCode?: string
	debugInfo?: unknown
	data?: unknown
}> {
	if (!orderId) return { errorKind: 'missing_params', error: 'Missing orderId' }
	try {
		// Verify the current user owns the order/transaction
		const { userId } = await auth()
		if (userId == null || userId === '') {
			return { errorKind: 'unauthenticated', error: 'User is not authenticated.' }
		}

		const tx = await getTransactionByOrderId(orderId)
		if (!tx) {
			return { errorKind: 'order_not_found', error: 'Order not found.' }
		}

		const pbBuyer = await fetchUserByClerkId(userId)
		if (!pbBuyer) {
			return { errorKind: 'buyer_not_found', error: 'User not found in database.' }
		}
		if (pbBuyer.id !== tx.buyer_user_id) {
			return { errorKind: 'not_owner', error: 'This order does not belong to the current user.' }
		}

		// Verify the bib is still available and locked by this user with the provided lock key
		const bib = await fetchPublicBibById(tx.bib_id)
		if (!bib) {
			return { errorKind: 'bib_not_found', error: 'Bib not found.' }
		}
		if (bib.status !== 'available') {
			return { errorKind: 'bib_unavailable', error: 'This bib is no longer available.' }
		}
		if (lockKey == null || lockKey === '') {
			return { errorKind: 'lock_expired', error: 'Lock has expired. Please try again.' }
		}

		const lockState = await isLocked(tx.bib_id, lockKey)
		if (lockState !== 'userlocked') {
			// Either locked by someone else or not locked anymore
			const msg =
				lockState === 'locked'
					? 'This bib is currently locked by another user.'
					: 'Your lock has expired. Please try again.'
			return { errorKind: lockState === 'locked' ? 'locked_by_other' : 'lock_expired', error: msg }
		}

		// All checks passed, proceed to capture
		const res = await capturePayment(orderId)

		// If instrument declined, add specific flag for frontend handling
		if (res.isInstrumentDeclined === true) {
			return {
				...res,
				needsPaymentRestart: true,
				isInstrumentDeclined: true,
				errorKind: 'instrument_declined',
				error: res.error ?? 'Your payment method was declined. Please select a different payment method.',
			}
		}

		if (res.data != null && (res.error == null || res.error === '')) {
			trackServer('payment_capture_success', {
				price_bucket: priceBucket(bib.price),
				listing: listingOf(bib.listed) ?? 'public',
				event_id: eventIdOfBib(bib),
				bib_id: bibIdOf(bib),
			})
		}

		return res
	} catch (error) {
		console.error('Error capturing order:', error)
		return { errorKind: 'exception', error: error instanceof Error ? error.message : 'Unknown error' }
	}
}
