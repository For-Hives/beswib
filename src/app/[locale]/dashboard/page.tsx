import type { Metadata } from 'next'

import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { fetchUserByClerkId } from '@/services/user.services'
import { LocaleParams } from '@/lib/generateStaticParams'
import { getTranslations } from '@/lib/getDictionary'

import dashboardTranslations from './locales.json'
import DashboardClient from './DashboardClient'

// Force dynamic rendering for dashboard routes
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
	title: 'Dashboard | Beswib',
}

export default async function DashboardPage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params
	const t = getTranslations(locale, dashboardTranslations) as any

	const { userId } = await auth()
	const clerkUser = await currentUser()

	if (!userId || !clerkUser) {
		redirect('/sign-in')
	}

	// Fetch user data from our database
	const beswibUser = await fetchUserByClerkId(userId)

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

	return <DashboardClient clerkUser={serializedClerkUser} translations={t} user={beswibUser} />
}
