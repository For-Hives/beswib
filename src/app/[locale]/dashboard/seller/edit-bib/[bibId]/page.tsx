import { auth } from '@clerk/nextjs/server'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { getBaseUrl } from '@/lib/seo/utils/seo-generators'
import type { Bib } from '@/models/bib.model'
import type { Event } from '@/models/event.model'
import { fetchBibByIdForSeller } from '@/services/bib.services'
import { fetchUserByClerkId } from '@/services/user.services'
import EditBibClient from './EditBibClient'
import editBibTranslations from './locales.json'

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
		metadataBase: new URL(getBaseUrl()),
		title: `Edit Bib ${bibId} | Seller Dashboard | Beswib`,
	}
}
