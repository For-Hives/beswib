import type { Metadata } from 'next'

import { generateLocaleParams, type LocaleParams } from '@/lib/generateStaticParams'
import ContactPageClient from '@/app/[locale]/contact/contact-page-client'
import globalTranslations from '@/components/global/locales.json'
import { getTranslations } from '@/lib/getDictionary'

export default async function ContactPage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params
	const globalT = getTranslations(locale, globalTranslations)

	const t = globalT.contact

	return <ContactPageClient t={t} />
}

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	const t = getTranslations(locale, globalTranslations)

	return {
		title: t.pages.contact.title,
		description: t.pages.contact.description,
	}
}

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}
