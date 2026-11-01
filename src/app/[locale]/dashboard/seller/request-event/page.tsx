import { ArchivedClosedCard } from '@/components/archive/ArchivedClosedCard'
import { generateLocaleParams } from '@/lib/generation/staticParams'
import type { Locale } from '@/lib/i18n/config'

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
	const { locale } = await params

	return (
		<div className="mx-auto max-w-xl px-4 py-24">
			<ArchivedClosedCard locale={locale} flow="eventRequest" />
		</div>
	)
}
