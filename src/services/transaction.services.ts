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

import type { Transaction, TransactionWithExpand } from '@/models/transaction.model'

import { pb } from '@/lib/pocketbaseClient'

// type moved to models/transaction.model

/**
 * Fetch all transactions for a buyer (PocketBase user id), newest first.
 * Expands bib and event for richer UI display.
 */
export async function fetchBuyerTransactions(buyerUserId: string): Promise<TransactionWithExpand[]> {
	if (buyerUserId === '') {
		console.error('Buyer User ID is required to fetch their transactions.')
		return []
	}
	try {
		const records = await pb.collection('transactions').getFullList<TransactionWithExpand>({
			sort: '-created',
			filter: `buyer_user_id = "${buyerUserId}"`,
			expand: 'bib_id,bib_id.eventId',
		})
		return records
	} catch (error: unknown) {
		throw new Error(
			`Error fetching transactions for buyer ID "${buyerUserId}": ` +
				(error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Fetch only completed (succeeded) transactions for a buyer for spend aggregation.
 */
export async function fetchBuyerCompletedTransactions(buyerUserId: string): Promise<TransactionWithExpand[]> {
	if (buyerUserId === '') {
		console.error('Buyer User ID is required to fetch their completed transactions.')
		return []
	}
	try {
		const records = await pb.collection('transactions').getFullList<TransactionWithExpand>({
			sort: '-created',
			filter: `buyer_user_id = "${buyerUserId}" && status = 'succeeded'`,
			expand: 'bib_id,bib_id.eventId',
		})
		return records
	} catch (error: unknown) {
		throw new Error(
			`Error fetching completed transactions for buyer ID "${buyerUserId}": ` +
				(error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Fetch all transactions for a seller (PocketBase user id), newest first.
 */
export async function fetchSellerTransactions(sellerUserId: string): Promise<TransactionWithExpand[]> {
	if (sellerUserId === '') {
		console.error('Seller User ID is required to fetch their transactions.')
		return []
	}
	try {
		const records = await pb.collection('transactions').getFullList<TransactionWithExpand>({
			sort: '-created',
			filter: `seller_user_id = "${sellerUserId}"`,
			expand: 'bib_id,bib_id.eventId',
		})
		return records
	} catch (error: unknown) {
		throw new Error(
			`Error fetching transactions for seller ID "${sellerUserId}": ` +
				(error instanceof Error ? error.message : String(error))
		)
	}
}

/**
 * Fetch only completed (succeeded) transactions for a seller.
 */
export async function fetchSellerCompletedTransactions(sellerUserId: string): Promise<TransactionWithExpand[]> {
	if (sellerUserId === '') {
		console.error('Seller User ID is required to fetch their completed transactions.')
		return []
	}
	try {
		const records = await pb.collection('transactions').getFullList<TransactionWithExpand>({
			sort: '-created',
			filter: `seller_user_id = "${sellerUserId}" && status = 'succeeded'`,
			expand: 'bib_id,bib_id.eventId',
		})
		return records
	} catch (error: unknown) {
		throw new Error(
			`Error fetching completed transactions for seller ID "${sellerUserId}": ` +
				(error instanceof Error ? error.message : String(error))
		)
	}
}

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
