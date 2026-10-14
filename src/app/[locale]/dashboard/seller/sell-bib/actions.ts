'use server'

import { auth } from '@clerk/nextjs/server'

import type { Bib } from '@/models/bib.model'

import { createBib } from '@/services/bib.services'
import { fetchUserByClerkId } from '@/services/user.services'
import { fetchVerifiedEmailById } from '@/services/verifiedEmail.services'

/**
 * Lists a bib for the signed-in seller. The browser calls this, never createBib itself, which lists
 * a bib for whichever seller id it is given.
 * @param bibData The listing of the sell wizard, without a seller: the seller is the session's user.
 * @returns The created bib, or null when the listing is refused.
 */
export async function handleCreateBib(bibData: Omit<Bib, 'id' | 'sellerUserId'>): Promise<Bib | null> {
	const { userId: clerkId } = await auth()
	if (clerkId == null || clerkId === '') {
		console.error('Authentication is required to create a bib listing.')
		return null
	}

	const sellerUser = await fetchUserByClerkId(clerkId)
	if (sellerUser == null) {
		console.error('Seller user not found.')
		return null
	}

	// The registration e-mail the wizard links is one the seller verified, never the record of someone else
	if (bibData.linkedEmailId != null && bibData.linkedEmailId !== '') {
		const linkedEmail = await fetchVerifiedEmailById(bibData.linkedEmailId)
		if (linkedEmail?.userId !== sellerUser.id || !linkedEmail.isVerified) {
			console.error('Linked email is not a verified email of the seller. Cannot create bib listing.')
			return null
		}
	}

	return createBib({ ...bibData, sellerUserId: sellerUser.id })
}
