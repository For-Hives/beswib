import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { generateLocaleParams } from '@/lib/generation/staticParams'
import type { Locale } from '@/lib/i18n/config'

import RequestEventClient from './RequestEventClient'

type RequestEventPageProps = {
	params: Promise<{
		locale: Locale
	}>
}

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

export default async function RequestEventPage({ params }: RequestEventPageProps) {
	const { userId } = await auth()
	const { locale } = await params

	if (userId == null || userId === undefined) {
		redirect(`/${locale}/auth/sign-in?redirect_url=/${locale}/dashboard/seller/request-event`)
	}

	return <RequestEventClient locale={locale} />
}
