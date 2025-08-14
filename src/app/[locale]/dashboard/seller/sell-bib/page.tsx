import type { Metadata } from 'next'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { fetchPartneredApprovedEvents } from '@/services/event.services'
import { fetchUserByClerkId } from '@/services/user.services'
import { LocaleParams } from '@/lib/generation/staticParams'

import SellBibClient from './SellBibClient'

// Force dynamic rendering for dashboard routes
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
	title: 'Sell Bib | Beswib',
}

export default async function SellBibPage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params

	const { userId: clerkUserId } = await auth()

	if (clerkUserId === null || clerkUserId === undefined) {
		redirect('/auth/sign-in')
	}

	const beswibUser = await fetchUserByClerkId(clerkUserId)
	if (beswibUser === null || beswibUser === undefined) {
		redirect('/dashboard')
	}

	// Fetch available events for the seller to choose from
	const availableEvents = await fetchPartneredApprovedEvents(true)

	return <SellBibClient availableEvents={availableEvents} locale={locale} user={beswibUser} />
}
