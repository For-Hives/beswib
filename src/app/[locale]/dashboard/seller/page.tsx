import type { Metadata } from 'next'

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { fetchUserByClerkId } from '@/services/user.services'
import { fetchBibsBySeller } from '@/services/bib.services'
import { fetchSellerCompletedTransactions, fetchSellerTransactions } from '@/services/transaction.services'
import { LocaleParams } from '@/lib/generateStaticParams'

import SellerDashboardClient from './SellerDashboardClient'

// Force dynamic rendering for dashboard routes
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
	title: 'Seller Dashboard | Beswib',
}

export default async function SellerDashboardPage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params

	const clerkUser = await currentUser()
	const pbUser = await fetchUserByClerkId(clerkUser?.id)

	if (clerkUser?.id === null || clerkUser?.id === undefined || pbUser === null) {
		redirect('/sign-in')
	}

	// Fetch seller data
	const [sellerBibs, sellerTransactions, sellerCompletedTransactions] = await Promise.all([
		fetchBibsBySeller(pbUser.id),
		fetchSellerTransactions(pbUser.id),
		fetchSellerCompletedTransactions(pbUser.id),
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

	// Compute revenue and pass transactions
	const totalRevenue = sellerCompletedTransactions.reduce((sum, tx) => sum + (tx?.amount ?? 0), 0)

	return (
		<SellerDashboardClient
			clerkUser={serializedClerkUser}
			locale={locale}
			sellerBibs={sellerBibs}
			user={pbUser}
			sellerTransactions={sellerTransactions}
			totalRevenue={totalRevenue}
		/>
	)
}
