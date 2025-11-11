import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { getTranslations } from '@/lib/i18n/dictionary'
import { generateOGImage } from '@/lib/og/generateOGImage'

import pageTranslations from './locales.json'

// Alt text for the Open Graph image
export const alt = 'Beswib - Buy and Sell Race Bibs Securely'
// Image size for Open Graph
export const size = { width: 1200, height: 630 }
// Content type for the image
export const contentType = 'image/png'

// Generate static params for all locales 🌍
export function generateStaticParams() {
	return generateLocaleParams()
}

// Default export: async function to generate the Open Graph image
export default async function Image({ params }: { params: Promise<LocaleParams> }) {
	// Retrieve the dynamic locale from params
	const { locale } = await params

	// Get the translations for the current page and locale
	const t = getTranslations(locale, pageTranslations)

	// Generate and return the OG image using the centralized utility
	return generateOGImage({
		locale,
		title: t.OG.title,
		description: t.OG.description,
		alt,
		size,
	})
}
