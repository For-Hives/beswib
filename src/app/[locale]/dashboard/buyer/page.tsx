import { auth, currentUser } from '@clerk/nextjs/server'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import type { LocaleParams } from '@/lib/generation/staticParams'
import { generateAlternateLanguages } from '@/lib/seo/utils/seo-generators'
import { fetchBuyerCompletedTransactions, fetchBuyerTransactions } from '@/services/transaction.services'
import { fetchUserByClerkId } from '@/services/user.services'
import { fetchUserWaitlists } from '@/services/waitlist.services'

import BuyerDashboardClient from './BuyerDashboardClient'

// Force dynamic rendering for dashboard routes
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	return {
		title: 'Buyer Dashboard | Beswib',
		alternates: {
			languages: generateAlternateLanguages('/dashboard/buyer'),
			canonical: `https://beswib.com/${locale}/dashboard/buyer`,
		},
	}
}

export default async function BuyerDashboardPage({
	searchParams,
	params,
}: {
	params: Promise<LocaleParams>
	searchParams: Promise<{ purchase_success?: string }>
}) {
	const { locale } = await params
	const { purchase_success } = await searchParams

	const { userId } = await auth()
	const clerkUser = await currentUser()

	if (userId == null || userId === undefined || clerkUser == null) {
		redirect('/auth/sign-in')
	}

	// Resolve PocketBase user from Clerk ID
	const pbUser = await fetchUserByClerkId(userId)
	if (pbUser == null) {
		redirect('/dashboard')
	}

	// Fetch all required data for dashboard
	const [buyerTransactions, completedTransactions, userWaitlists] = await Promise.all([
		fetchBuyerTransactions(pbUser.id),
		fetchBuyerCompletedTransactions(pbUser.id),
		fetchUserWaitlists(pbUser.id),
	])

	// Extract only serializable properties from clerkUser
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

	// Handle purchase success
	const purchaseSuccess = purchase_success === 'true'

	// Determine event name from most recent succeeded transaction if available
	const latestSucceeded = completedTransactions[0]
	const successEventName =
		purchaseSuccess && latestSucceeded != null ? (latestSucceeded.expand?.bib_id?.expand?.eventId?.name ?? 'Event') : ''

	// Compute total spent from succeeded transactions
	const totalSpent = completedTransactions.reduce((sum, tx) => sum + (tx?.amount ?? 0), 0)

	return (
		<BuyerDashboardClient
			clerkUser={serializedClerkUser}
			locale={locale}
			buyerTransactions={buyerTransactions}
			totalSpent={totalSpent}
			purchaseSuccess={purchaseSuccess}
			successEventName={successEventName}
			userWaitlists={userWaitlists}
		/>
	)
}
