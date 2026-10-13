import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import OGImage from '@/components/OG/ogImage.component'
import OGImageEvent from '@/components/OG/ogImageEvent.component'
import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { getTranslations } from '@/lib/i18n/dictionary'
import { pocketBaseImageDataUrl } from '@/lib/og/pocketbase-image'
import { rendered } from '@/lib/og/render'
import { fetchExchangeRates } from '@/lib/utils/currency'
import { getOrganizerImageUrl } from '@/lib/utils/images'
import { fetchEventById } from '@/services/event.services'

import pageTranslations from './locales.json'

// Alt text for the Open Graph image
export const alt = 'Beswib Event Details'
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

type EventOpenGraphParams = LocaleParams & { id: string }

// Default export: async function to generate the Open Graph image
export default async function Image({ params }: { params: Promise<EventOpenGraphParams> }) {
	// Retrieve the dynamic locale and event ID from params
	const { locale, id } = await params

	// Get the translations for the current page and locale
	const t = getTranslations(locale, pageTranslations)

	// Fetch the event details and exchange rates in parallel
	const [event, exchangeRates] = await Promise.all([fetchEventById(id, true), fetchExchangeRates()])

	// Create dynamic title and description based on event data
	let title = t.event?.title ?? 'Event Details'
	let secondary = t.ctaOG ?? 'Discover this **amazing race** and join the adventure!'

	if (event) {
		// Use event name as main title
		title = event.name
		// Use the compelling CTA message from translations
		secondary = t.ctaOG ?? 'Join this **incredible race** and challenge yourself!'
	}

	// Get organizer info if available
	const organizer = event?.expand?.organizer

	// Its logo, fetched and converted here: the image only embeds data it was handed
	const logoSrc = organizer?.logo ? await pocketBaseImageDataUrl(getOrganizerImageUrl(organizer)) : null

	// Load custom fonts for @vercel/og with error handling
	try {
		const bowlbyFont = readFileSync(join(process.cwd(), 'src/components/OG/typos/BowlbyOneSC-Regular.ttf'))
		const geistFont = readFileSync(join(process.cwd(), 'src/components/OG/typos/Geist-Regular.ttf'))

		// Return the Open Graph image with custom fonts
		const image = new ImageResponse(
			<OGImageEvent
				title={title}
				secondary={secondary}
				logoSrc={logoSrc}
				size={size}
				event={event}
				organizer={organizer}
				locale={locale}
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
		// Drawn here, so that a failure reaches the catch below instead of cutting the response
		return await rendered(image)
	} catch (error) {
		// A font that cannot be read, or an image that cannot be drawn
		console.error('Error rendering the Open Graph image, falling back to the generic one:', error)
		// Fallback: return the image without custom fonts
		return new ImageResponse(<OGImage title={title} secondary={secondary} size={size} />, size)
	}
}
