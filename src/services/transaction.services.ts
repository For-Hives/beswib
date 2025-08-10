'use server'
// Helper: Find transaction by PayPal orderId
export async function getTransactionByOrderId(
	orderId: string
): Promise<{ id: string; bib_id: string; buyer_user_id: string } | null> {
	if (!orderId) return null
	try {
		const record = await pb
			.collection('transactions')
			.getFirstListItem<{ id: string; bib_id: string; buyer_user_id: string }>(`paypal_order_id = "${orderId}"`)
		return record ?? null
	} catch {
		// Not found or query error
		return null
	}
}

import type { Transaction } from '@/models/transaction.model'

import { pb } from '@/lib/pocketbaseClient'

/**
 * Creates a new transaction record.
 * @param transactionData Data for the new transaction.
 *   Expects: bibId, buyerUserId (PocketBase User ID), sellerUserId (PocketBase User ID),
 *   amount (selling price of bib), platformFee, status.
 */
export async function createTransaction(
	transactionData: Omit<Transaction, 'id' | 'transactionDate'>
): Promise<null | Transaction> {
	if (
		transactionData.bib_id === '' ||
		transactionData.buyer_user_id === '' ||
		transactionData.seller_user_id === '' ||
		transactionData.amount === undefined ||
		transactionData.platform_fee === undefined ||
		!transactionData.status
	) {
		console.error('Missing required fields for transaction creation:', transactionData)
		return null
	}

	try {
		const dataToCreate: Omit<Transaction, 'id'> = {
			...transactionData,
			transactionDate: new Date(),
		}

		const record = await pb.collection('transactions').create<Transaction>(dataToCreate)
		return record
	} catch (error: unknown) {
		if (error != null && typeof error === 'object') {
			if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
				console.error('PocketBase error details:', (error as { message: string }).message)
			}
			if ('response' in error) {
				const response = (error as { response: unknown }).response
				if (response != null && typeof response === 'object' && 'data' in response) {
					console.error('PocketBase response data:', (response as { data: unknown }).data)
				}
			}
		}
		throw new Error('Error creating transaction: ' + (error instanceof Error ? error.message : String(error)))
	}
}

/**
 * Updates an existing transaction record.
 * @param transactionId The ID of the transaction to update.
 * @param transactionData The data to update.
 */
export async function updateTransaction(
	transactionId: string,
	transactionData: Partial<Omit<Transaction, 'id' | 'transactionDate'>>
): Promise<null | Transaction> {
	console.info('Updating transaction with ID:', transactionId)
	if (transactionId === '') {
		console.error('Transaction ID is required to update a transaction.')
		return null
	}

	try {
		const record = await pb.collection('transactions').update<Transaction>(transactionId, transactionData)

		console.info('Updated transaction record:', record)
		return record
	} catch (error: unknown) {
		throw new Error('Error updating transaction: ' + (error instanceof Error ? error.message : String(error)))
	}
}
