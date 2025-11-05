import type { Metadata } from 'next'
import globalTranslations from '@/components/global/locales.json'
import Privacy from '@/components/legals/privacy/Privacy'
import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { getTranslations } from '@/lib/i18n/dictionary'
import { generateSimplePageMetadata } from '@/lib/seo/metadata-generators'

export default function PrivacyPolicyPage({ params }: { params: Promise<LocaleParams> }) {
	return (
		<div className="relative">
			<Privacy localeParams={params} />
		</div>
	)
}

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	const t = getTranslations(locale, globalTranslations)

	return generateSimplePageMetadata(
		locale,
		t.pages.privacy.title,
		t.pages.privacy.description,
		'/legals/privacy-policy'
	)
}

export function generateStaticParams() {
	return generateLocaleParams()
}
