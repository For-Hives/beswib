import { updateTransaction, getTransactionByOrderId } from '@/services/transaction.services'
import { updateBib } from '@/services/bib.services'

/**
 * PayPal webhook handler for order completion
 * @param paypalOrderId The PayPal order ID from the webhook
 * @param buyerUserId The buyer's user ID (if available)
 */
export async function handlePayPalOrderCompleted(paypalOrderId: string, buyerUserId?: string) {
	// 1. Find transaction by PayPal order ID
	const transaction = await getTransactionByOrderId(paypalOrderId)
	if (!transaction) {
		throw new Error('Transaction not found for PayPal order ID: ' + paypalOrderId)
	}

	// 2. Update transaction status to 'succeeded'
	await updateTransaction(transaction.id, {
		status: 'succeeded',
		payment_status: 'COMPLETED',
		paypal_order_id: paypalOrderId,
	})

	// 3. Update bib record to mark as sold and set buyer
	if (typeof buyerUserId === 'string' && buyerUserId.length > 0) {
		await updateBib(transaction.bibId, {
			status: 'sold',
			buyerUserId,
		})
	}

	return { success: true }
}
