'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

import { createTransaction, updateTransaction } from '@/services/transaction.services'
import { fetchBibById, updateBib } from '@/services/bib.services'

export async function handleSuccessfulPurchase(paymentIntentId: string, bibId: string) {
	const { userId } = await auth()

	if (!userId) {
		throw new Error('User is not authenticated.')
	}

	try {
		// 1. Get bib details
		const bib = await fetchBibById(bibId)
		if (!bib) {
			throw new Error('Bib not found.')
		}

		// 2. Create transaction
		const transaction = await createTransaction({
			status: 'pending',
			sellerUserId: bib.sellerUserId,
			platformFee: bib.price * 0.1, // Assuming 10% platform fee
			paymentIntentId: paymentIntentId,
			buyerUserId: userId,
			bibId: bib.id,
			amount: bib.price,
		})

		if (!transaction) {
			throw new Error('Failed to create transaction.')
		}

		// 3. Update bib
		const updatedBib = await updateBib(bib.id, {
			status: 'sold',
			buyerUserId: userId,
		})

		// 4. Update transaction to complete
		await updateTransaction(transaction.id, {
			status: 'succeeded',
		})

		// 5. Revalidate paths
		revalidatePath('/')
		revalidatePath('/marketplace')
		revalidatePath(`/event/${bib.eventId}`)
		revalidatePath(`/bib/${bib.id}`)

		return { success: true, bib: updatedBib }
	} catch (error) {
		console.error('Error handling successful purchase:', error)
		if (error instanceof Error) {
			return { success: false, error: error.message }
		}
		return { success: false, error: 'An unexpected error occurred.' }
	}
}
