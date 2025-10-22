'use server'

import { auth } from '@clerk/nextjs/server'

import type { Bib } from '@/models/bib.model'

import { fetchBibByIdForSeller, generatePrivateListingToken, updateBibBySeller } from '@/services/bib.services'
import { fetchUserByClerkId } from '@/services/user.services'

export async function handleToggleListingStatus(bibId: string, newListed: 'private' | 'public'): Promise<Bib> {
	const { userId: clerkId } = await auth()

	if (clerkId == null || clerkId === '') {
		throw new Error('Authentication required.')
	}

	const sellerUser = await fetchUserByClerkId(clerkId)
	if (sellerUser == null) {
		throw new Error('User not found.')
	}

	const bibWithEvent = await fetchBibByIdForSeller(bibId, sellerUser.id)
	if (!bibWithEvent) {
		throw new Error('Bib not found.')
	}

	if (bibWithEvent.status === 'validation_failed' && newListed === 'public') {
		throw new Error('Cannot make public until event details are verified by admin.')
	}

	if (bibWithEvent.status === 'sold' || bibWithEvent.status === 'expired') {
		throw new Error(`Cannot change listing status from ${bibWithEvent.status}.`)
	}

	try {
		let privateListingToken: string | undefined

		if (newListed === 'private') {
			// Generate a new token automatically for private listings
			privateListingToken = await generatePrivateListingToken()
		}

		const newBibData: Bib = {
			...bibWithEvent,
			privateListingToken: privateListingToken,
			listed: newListed,
		}
		const partialUpdatedBib = await updateBibBySeller(bibId, newBibData, sellerUser.id)

		if (!partialUpdatedBib) {
			throw new Error('Failed to change bib status.')
		}
		const fullUpdatedBib = await fetchBibByIdForSeller(bibId, sellerUser.id)
		if (!fullUpdatedBib) {
			throw new Error('Failed to retrieve full bib details after status change.')
		}
		return fullUpdatedBib as Bib
	} catch (e: unknown) {
		const error = e instanceof Error ? e.message : String(e)
		throw new Error(`An error occurred while changing the bib status: ${error}`)
	}
}

export async function handleUpdateBibDetails(bibId: string, formData: FormData): Promise<Bib> {
	const { userId: clerkId } = await auth()

	if (clerkId == null || clerkId === '') {
		throw new Error('Authentication required.')
	}

	const sellerUser = await fetchUserByClerkId(clerkId)
	if (!sellerUser) {
		throw new Error('User not found.')
	}

	const priceValue = formData.get('price') as string

	const price = parseFloat(priceValue)
	if (Number.isNaN(price) || price <= 0) {
		throw new Error('Valid price is required.')
	}

	const currentBib = await fetchBibByIdForSeller(bibId, sellerUser.id)
	if (!currentBib) {
		throw new Error('Original bib not found.')
	}

	if (currentBib.status === 'sold' || currentBib.status === 'expired' || currentBib.status === 'withdrawn') {
		throw new Error(`Cannot modify bib with status: ${currentBib.status}.`)
	}

	// SECURITY: Only allow modifying the selling price
	// Ignore all other form data including originalPrice to prevent tampering
	const dataToUpdate: Partial<Bib> = {
		price: price,
	}

	try {
		const partialUpdatedBib = await updateBibBySeller(bibId, dataToUpdate, sellerUser.id)

		if (!partialUpdatedBib) {
			throw new Error('Failed to update bib details.')
		}
		const fullUpdatedBib = await fetchBibByIdForSeller(bibId, sellerUser.id)
		if (!fullUpdatedBib) {
			throw new Error('Failed to retrieve full bib details after update.')
		}
		return fullUpdatedBib as Bib
	} catch (e: unknown) {
		const error = e instanceof Error ? e.message : String(e)
		throw new Error(`An error occurred while updating the bib: ${error}`)
	}
}

export async function handleRegeneratePrivateToken(bibId: string): Promise<Bib> {
	const { userId: clerkId } = await auth()

	if (clerkId == null || clerkId === '') {
		throw new Error('Authentication required.')
	}

	const sellerUser = await fetchUserByClerkId(clerkId)
	if (sellerUser == null) {
		throw new Error('User not found.')
	}

	const currentBib = await fetchBibByIdForSeller(bibId, sellerUser.id)
	if (!currentBib) {
		throw new Error('Bib not found or not owned by user.')
	}

	if (currentBib.status === 'sold' || currentBib.status === 'expired' || currentBib.status === 'withdrawn') {
		throw new Error(`Cannot regenerate token for bib with status: ${currentBib.status}.`)
	}

	if (currentBib.listed !== 'private') {
		throw new Error('Can only regenerate token for private listings.')
	}

	try {
		const newToken = await generatePrivateListingToken()
		const updatedBibData: Bib = {
			...currentBib,
			privateListingToken: newToken,
		}

		const partialUpdatedBib = await updateBibBySeller(bibId, updatedBibData, sellerUser.id)

		if (!partialUpdatedBib) {
			throw new Error('Failed to regenerate private token.')
		}

		const fullUpdatedBib = await fetchBibByIdForSeller(bibId, sellerUser.id)
		if (!fullUpdatedBib) {
			throw new Error('Failed to retrieve full bib details after token regeneration.')
		}

		return fullUpdatedBib as Bib
	} catch (e: unknown) {
		const error = e instanceof Error ? e.message : String(e)
		throw new Error(`An error occurred while regenerating the private token: ${error}`)
	}
}

export async function handleWithdrawBib(bibId: string): Promise<void> {
	const { userId: clerkId } = await auth()

	if (clerkId == null || clerkId === '') {
		throw new Error('Authentication required.')
	}
	const sellerUser = await fetchUserByClerkId(clerkId)
	if (sellerUser == null) {
		throw new Error('User not found.')
	}

	const currentBib = await fetchBibByIdForSeller(bibId, sellerUser.id)
	if (!currentBib) {
		throw new Error('Bib not found or not owned by user.')
	}

	if (currentBib.status === 'sold' || currentBib.status === 'expired' || currentBib.status === 'withdrawn') {
		throw new Error(`Cannot withdraw bib with status: ${currentBib.status}.`)
	}

	try {
		const bibDataToUpdate: Partial<Bib> = {
			status: 'withdrawn',
			buyerUserId: undefined,
		}

		const updatedBib = await updateBibBySeller(bibId, { ...currentBib, ...bibDataToUpdate }, sellerUser.id)

		if (!updatedBib) {
			throw new Error('Failed to withdraw bib.')
		}
	} catch (e: unknown) {
		const error = e instanceof Error ? e.message : String(e)
		throw new Error(`An error occurred while withdrawing the bib: ${error}`)
	}
}
