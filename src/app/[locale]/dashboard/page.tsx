import type { Metadata } from 'next'

import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { generateAlternateLanguages } from '@/lib/seo/utils/seo-generators'
import { fetchUserByClerkId } from '@/services/user.services'
import { LocaleParams } from '@/lib/generation/staticParams'

import DashboardClient from './DashboardClient'

// Force dynamic rendering for dashboard routes
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	return {
		title: 'Dashboard | Beswib',
		alternates: {
			languages: generateAlternateLanguages('/dashboard'),
			canonical: `https://beswib.com/${locale}/dashboard`,
		},
	}
}

export default async function DashboardPage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params

	const { userId } = await auth()
	const clerkUser = await currentUser()

	if (userId === null || userId === undefined || clerkUser === null) {
		redirect('/auth/sign-in')
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

	return <DashboardClient clerkUser={serializedClerkUser} locale={locale} user={beswibUser} />
}
