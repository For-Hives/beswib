import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import OGImage from '@/components/OG/ogImage.component'
import OGImageBib from '@/components/OG/ogImageBib.component'
import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { getTranslations } from '@/lib/i18n/dictionary'
import { fetchExchangeRates } from '@/lib/utils/currency'
import { getAbsoluteUrl } from '@/lib/utils/url'
import { checkBibListingStatus, fetchPublicBibById } from '@/services/bib.services'

import marketplaceTranslations from '../locales.json'

// Alt text for the Open Graph image
export const alt = 'Beswib Race Bib Purchase'
// Image size for Open Graph
export const size = { width: 1200, height: 630 }
// Content type for the image
export const contentType = 'image/png'
// Force dynamic rendering to use headers for host detection
export const dynamic = 'force-dynamic'

// Generate static params for all locales 🌍
export function generateStaticParams() {
	return generateLocaleParams()
}

type MarketplaceOpenGraphParams = LocaleParams & { id: string; tkn?: string }

// Default export: async function to generate the Open Graph image
export default async function Image({ params }: { params: Promise<MarketplaceOpenGraphParams> }) {
	// Retrieve the dynamic locale and bib ID from params
	const { locale, id } = await params

	// Get the translations for the current page and locale
	const t = getTranslations(locale, marketplaceTranslations)

	// Try to fetch the bib details and exchange rates
	let bib = null
	let organizer = null
	let exchangeRates = null
	let title = t.title ?? 'Marketplace'
	let secondary = t.descriptionOG ?? '**Browse** and **buy** race **bibs** from our marketplace'

	try {
		// Fetch exchange rates and check bib status in parallel
		const [bibStatus, rates] = await Promise.all([checkBibListingStatus(id), fetchExchangeRates()])

		exchangeRates = rates

		if (bibStatus?.exists && bibStatus.available) {
			// Try to fetch bib data with full expansion (event + organizer)
			bib = await fetchPublicBibById(id)

			// If we successfully got bib data, customize the title and description
			if (bib?.expand?.eventId) {
				const event = bib.expand.eventId
				organizer = event.expand?.organizer
				const price = bib.price

				// Use event name as the main title
				title = event.name

				// Create descriptive secondary text
				const details = []
				if (event.location) details.push(event.location)
				if (event.distanceKm != null) details.push(`${event.distanceKm}km`)
				if (price) details.push(`€${price}`)

				// Use the compelling CTA message from translations
				secondary = t.ctaOG ?? 'Secure **race bib transfer** with verified seller'
			}
		}
	} catch (error) {
		console.warn('Error fetching bib data for OpenGraph:', error)
		// Fallback to generic marketplace content
	}

	// Get the absolute URL using environment variables
	const { protocol, host } = getAbsoluteUrl()

	// Load custom fonts for @vercel/og with error handling
	try {
		const bowlbyFont = readFileSync(join(process.cwd(), 'src/components/OG/typos/BowlbyOneSC-Regular.ttf'))
		const geistFont = readFileSync(join(process.cwd(), 'src/components/OG/typos/Geist-Regular.ttf'))

		// Return the Open Graph image with custom fonts
		return new ImageResponse(
			<OGImageBib
				title={title}
				secondary={secondary}
				host={host}
				protocol={protocol}
				size={size}
				bib={bib}
				locale={locale}
				organizer={organizer ?? undefined}
				exchangeRates={exchangeRates}
			/>,
			{
				...size,
				fonts: [
					{
						weight: 400,
						style: 'normal',
						name: 'BowlbyOneSC',
						data: bowlbyFont,
					},
					{
						weight: 400,
						style: 'normal',
						name: 'Geist',
						data: geistFont,
					},
				],
			}
		)
	} catch (error) {
		// Log error if font loading fails
		console.error('Error loading fonts:', error)
		// Fallback: return the image without custom fonts
		return new ImageResponse(
			<OGImage title={title} secondary={secondary} host={host} protocol={protocol} size={size} />,
			size
		)
	}
}
