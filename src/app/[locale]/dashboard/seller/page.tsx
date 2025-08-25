import type { Metadata } from 'next'

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { fetchBibsBySeller, updateExpiredBibsToWithdrawn } from '@/services/bib.services'
import { generateAlternateLanguages } from '@/lib/seo/utils/seo-generators'
import { fetchSellerTransactions } from '@/services/transaction.services'
import { fetchUserByClerkId } from '@/services/user.services'
import { LocaleParams } from '@/lib/generation/staticParams'

import SellerDashboardClient from './SellerDashboardClient'

// Force dynamic rendering for dashboard routes
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	return {
		title: 'Seller Dashboard | Beswib',
		alternates: {
			languages: generateAlternateLanguages('/dashboard/seller'),
			canonical: `https://beswib.com/${locale}/dashboard/seller`,
		},
	}
}

export default async function SellerDashboardPage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params

	const clerkUser = await currentUser()
	const pbUser = await fetchUserByClerkId(clerkUser?.id)

	if (clerkUser?.id == null || clerkUser?.id === undefined || pbUser == null) {
		redirect('/auth/sign-in')
	}

	// Check and update any expired bibs for this seller before fetching data
	try {
		const expiredCount = await updateExpiredBibsToWithdrawn(pbUser.id)
		if (expiredCount > 0) {
			console.info(`Updated ${expiredCount} expired bibs to withdrawn status for seller ${pbUser.id}`)
		}
	} catch (error) {
		console.error('Failed to update expired bibs:', error)
		// Don't block the page load if this fails
	}

	// Fetch seller data
	const [sellerBibs, sellerTransactions] = await Promise.all([
		fetchBibsBySeller(pbUser.id),
		fetchSellerTransactions(pbUser.id),
	])

	// Extract only serializable properties from currentUser

	const serializedClerkUser = {
		username: clerkUser.username,
		lastName: clerkUser.lastName,
		imageUrl: clerkUser.imageUrl,
		id: clerkUser.id,
		firstName: clerkUser.firstName,
		emailAddresses: clerkUser.emailAddresses.map(email => ({
			id: email.id,
			emailAddress: email.emailAddress,
		})),
	}

	return (
		<SellerDashboardClient
			clerkUser={serializedClerkUser}
			locale={locale}
			sellerBibs={sellerBibs}
			user={pbUser}
			sellerTransactions={sellerTransactions}
		/>
	)
}
