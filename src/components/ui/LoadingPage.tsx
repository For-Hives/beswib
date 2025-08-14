'use client'

import { usePathname } from 'next/navigation'

import { getTranslations } from '@/lib/i18n/dictionary'
import globalLocales from '@/lib/i18n/globalLocales.json'

import Loader from './Loader'

export default function LoadingPage() {
	const pathname = usePathname()

	// Extract locale from pathname (e.g., /fr/dashboard -> fr)
	const localeMatch = pathname.match(/^\/([a-z]{2})\//)
	const locale = localeMatch?.[1] ?? 'en'

	const t = getTranslations(locale, globalLocales)

	return (
		<div className="flex min-h-screen items-center justify-center">
			<Loader size="lg" text={t.GLOBAL?.loading ?? 'Loading...'} showText={true} />
		</div>
	)
}
