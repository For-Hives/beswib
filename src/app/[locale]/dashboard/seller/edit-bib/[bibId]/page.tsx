import type { Metadata } from 'next'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import type { Event } from '@/models/event.model'
import type { Bib } from '@/models/bib.model'

import { fetchBibByIdForSeller } from '@/services/bib.services'
import { fetchUserByClerkId } from '@/services/user.services'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Locale } from '@/lib/i18n/config'

import editBibTranslations from './locales.json'
import EditBibClient from './EditBibClient'

// Force dynamic rendering for dashboard routes
export const dynamic = 'force-dynamic'

export type EditBibPageProps = {
	params: Promise<{ bibId: string; locale: Locale }>
}

export default async function EditBibPage({ params }: EditBibPageProps) {
	const { userId: clerkId } = await auth()
	const { locale, bibId } = await params
	let initialBibWithEvent: (Bib & { expand?: { eventId?: Event } }) | null = null
	let errorMessage: null | string = null

	const t = getTranslations(locale, editBibTranslations)

	if (clerkId == null || clerkId === '') {
		redirect(`/auth/sign-in?redirect_url=/dashboard/seller/edit-bib/${bibId}`)
	}

	try {
		const sellerUser = await fetchUserByClerkId(clerkId)
		if (!sellerUser) {
			errorMessage = t.userNotFound ?? 'User not found.'
		} else {
			initialBibWithEvent = await fetchBibByIdForSeller(bibId, sellerUser.id)
			if (!initialBibWithEvent) {
				errorMessage = t.bibNotFoundOrNoPermission
			}
		}
	} catch (error: unknown) {
		errorMessage = error instanceof Error ? error.message : t.errorFetchingBib
		initialBibWithEvent = null
	}

	return (
		<EditBibClient
			bibId={bibId}
			initialBibWithEvent={initialBibWithEvent}
			initialError={errorMessage}
			locale={locale}
		/>
	)
}

export async function generateMetadata({ params }: EditBibPageProps): Promise<Metadata> {
	const { bibId } = await params
	return {
		title: `Edit Bib ${bibId} | Seller Dashboard | Beswib`,
	}
}
