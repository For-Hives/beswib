'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

import { createTransaction } from '@/services/transaction.services'
import { salesCreate } from '@/services/sales.services'
import { fetchBibById } from '@/services/bib.services'

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

		const transaction = await createTransaction({
			status: 'pending',
			sellerUserId: bib.sellerUserId,
			platformFee: bib.price * 0.1,
			paymentIntentId: paymentIntentId,
			paypal_order_id: paymentIntentId,
			paypal_capture_id: '',
			payer_email: '',
			currency: 'EUR',
			payment_status: 'pending',
			capture_time: '',
			raw_webhook_payload: '',
			buyerUserId: userId,
			bibId: bib.id,
			amount: bib.price,
		})

		if (!transaction) {
			throw new Error('Failed to create transaction.')
		}

		return { success: true, transaction }
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
		console.log('BEZJIGEZJOG')
		const { orderId, transaction } = await salesCreate({
			buyerUserId: userId,
			sellerMerchantId,
			bibId,
		})
		// Optional revalidation for marketplace pages post-initiation
		revalidatePath('/marketplace')
		return { success: true, orderId, transactionId: transaction.id }
	} catch (error) {
		console.error('Error creating sale:', error)
		return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
	}
}
