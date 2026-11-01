import Link from 'next/link'

import { ArchivedClosedCard } from '@/components/archive/ArchivedClosedCard'
import translations from '@/components/global/locales.json'
import AuthSplitScreen from '@/components/ui/AuthSplitScreen'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { signInPath } from '@/lib/utils/redirect'

// Beswib is archived: nobody new comes in. An existing account can still sign in.
export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	const t = getTranslations(locale, translations)

	return (
		<AuthSplitScreen>
			<ArchivedClosedCard locale={locale} flow="signup">
				<Link
					href={signInPath(locale)}
					className="text-primary hover:text-primary/80 inline-flex items-center text-sm font-medium underline"
				>
					{t.navbar.signIn}
				</Link>
			</ArchivedClosedCard>
		</AuthSplitScreen>
	)
}
