import { updateBib } from '@/services/bib.services'
import { getTransactionByOrderId, updateTransaction } from '@/services/transaction.services'

/**
 * PayPal webhook handler for order completion
 * @param paypalOrderId The PayPal order ID from the webhook
 * @param buyerUserId The buyer's user ID (if available)
 */
export async function handlePayPalOrderCompleted(paypalOrderId: string, buyerUserId?: string) {
	// 1. Find transaction by PayPal order ID
	const transaction = await getTransactionByOrderId(paypalOrderId)
	if (!transaction) {
		throw new Error(`Transaction not found for PayPal order ID: ${paypalOrderId}`)
	}

	// 2. Update transaction status to 'succeeded'
	await updateTransaction(transaction.id, {
		status: 'succeeded',
		paypal_order_id: paypalOrderId,
		payment_status: 'COMPLETED',
	})

	// 3. Update bib record to mark as sold and set buyer
	if (typeof buyerUserId === 'string' && buyerUserId.length > 0) {
		await updateBib(transaction.bib_id, {
			status: 'sold',
			buyerUserId,
		})
	}

	return { success: true }
}
