import type { Metadata } from 'next'
import ContactPageClient from '@/app/[locale]/contact/contact-page-client'
import globalTranslations from '@/components/global/locales.json'
import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { getTranslations } from '@/lib/i18n/dictionary'
import { generateSimplePageMetadata } from '@/lib/seo/metadata-generators'

export default async function ContactPage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params
	const globalT = getTranslations(locale, globalTranslations)

	const t = globalT.contact

	return <ContactPageClient t={t} />
}

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	const t = getTranslations(locale, globalTranslations)

	return generateSimplePageMetadata(locale, t.pages.contact.title, t.pages.contact.description, '/contact')
}

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}
