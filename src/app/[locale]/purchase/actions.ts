'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { priceBucket } from '@/lib/analytics/buckets'
import type { PurchaseErrorKind } from '@/lib/analytics/catalog'
import { listingOf } from '@/lib/analytics/classify'
import { bibIdOf, eventIdOfBib } from '@/lib/analytics/ids'
import { trackServer } from '@/lib/analytics/server'
import { isValidPayPalOrderId } from '@/lib/validation/paypal'
import type { Bib } from '@/models/bib.model'
import { fetchPurchasableBibById, isLocked, lockBib } from '@/services/bib.services'
import { capturePayment } from '@/services/paypal.services'
import { salesCreate } from '@/services/sales.services'
import { getTransactionByOrderId } from '@/services/transaction.services'
import { fetchUserByClerkId } from '@/services/user.services'

// Lock steps of the purchase. The browser calls these, never the bib services themselves: lockBib and
// isLocked take any bib id from anyone, signed in or not, with or without the token of a private listing.

/**
 * Locks a bib for the signed-in buyer who is about to pay for it.
 * @param bibId The ID of the bib to lock.
 * @param privateToken The token of the private link the buyer came through, if any.
 * @returns The lock time (the key of the lock), or null when the bib could not be locked.
 */
export async function lockBibForPurchase(
	bibId: string,
	privateToken: string | null = null
): Promise<{ lockedAt: Bib['lockedAt'] } | null> {
	const { userId } = await auth()
	if (userId == null || userId === '' || !bibId) return null

	const bib = await fetchPurchasableBibById(bibId, privateToken)
	if (!bib) return null

	const lock = await lockBib(bib.id, userId)
	if (!lock) return null
	return { lockedAt: lock.lockedAt ?? null }
}

/**
 * Tells the signed-in buyer whether a bib is free, locked by them (lockKey) or locked by someone else.
 * A refusal is not answered as a lock, which tells the buyer to try again later: 'unauthenticated' when
 * the server has no session for the caller, 'unavailable' when this is not a bib they may buy (a private
 * listing without its token, a bib that is not listed).
 * @param bibId The ID of the bib to check.
 * @param lockKey The lock time the buyer got from lockBibForPurchase, if any.
 * @param privateToken The token of the private link the buyer came through, if any.
 */
export async function checkPurchaseLock(
	bibId: string,
	lockKey: string = '',
	privateToken: string | null = null
): Promise<'locked' | 'unlocked' | 'userlocked' | 'unauthenticated' | 'unavailable'> {
	const { userId } = await auth()
	if (userId == null || userId === '') return 'unauthenticated'
	if (!bibId) return 'unavailable'

	// Not a bib this visitor may buy: nothing about its lock to tell them, and no expired lock to clear for them
	const bib = await fetchPurchasableBibById(bibId, privateToken)
	if (!bib) return 'unavailable'

	return isLocked(bib.id, lockKey)
}

// New action to create sale: wraps salesCreate and returns orderId
// privateToken: the token of the private link the buyer came through, checked by salesCreate
export async function createSale(
	bibId: string,
	sellerMerchantId: string,
	locale?: string,
	privateToken: string | null = null
) {
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
		// Not a bib this visitor may buy: refused here with the words of salesCreate
		const bib = await fetchPurchasableBibById(bibId, privateToken)
		if (!bib) throw new Error('Bib not found')

		// The payee of the order is the PayPal account on the record of the seller. The id the browser
		// sends only has to match it: paid to any other merchant, the order would still mark the bib
		// as sold, to a buyer who paid themselves
		const payeeMerchantId = bib.expand?.sellerUserId?.paypalMerchantId ?? ''
		if (payeeMerchantId === '' || payeeMerchantId !== sellerMerchantId) {
			return {
				success: false,
				errorKind: 'seller_not_configured' as const satisfies PurchaseErrorKind,
				error: 'Seller PayPal account is not configured.',
			}
		}

		const { transaction, orderId } = await salesCreate({
			sellerMerchantId: payeeMerchantId,
			privateToken,
			locale,
			buyerUserId: userId,
			bibId,
		})
		// Optional revalidation for marketplace pages post-initiation
		revalidatePath('/marketplace')
		return { transactionId: transaction.id, success: true, orderId }
	} catch (error) {
		console.error('Error creating sale:', error)
		const message = error instanceof Error ? error.message : 'Unknown error'
		// salesCreate answers this for a bib the visitor may not buy (a private listing without its token,
		// a bib that is not listed). It is a refusal, counted like the one of the lock and of the capture,
		// not a failure of the order creation
		const errorKind: PurchaseErrorKind = message === 'Bib not found' ? 'bib_not_found' : 'exception'
		return { success: false, errorKind, error: message }
	}
}

// Server-side wrapper to capture a PayPal order (prevents exposing client secret to the browser)
export async function captureOrder(
	orderId: string,
	lockKey: string | null = null,
	privateToken: string | null = null
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

		// The order id is sent by the browser and is looked up through a PocketBase filter. One that is
		// not shaped like a PayPal order id is no order of ours: answered as such before any lookup,
		// whatever a filter widened by it would have matched
		if (!isValidPayPalOrderId(orderId)) {
			return { errorKind: 'order_not_found', error: 'Order not found.' }
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

		// Verify the bib is still available and locked by this user with the provided lock key.
		// A private listing is only found with its token: the order alone does not prove the buyer
		// holds it, and the seller may have regenerated it since
		const bib = await fetchPurchasableBibById(tx.bib_id, privateToken)
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
