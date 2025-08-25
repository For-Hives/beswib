import { ImageResponse } from 'next/og'
import { headers } from 'next/headers'
import { readFileSync } from 'fs'
import { join } from 'path'

import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import OGImageEvent from '@/components/OG/ogImageEvent.component'
import { fetchEventById } from '@/services/event.services'
import { fetchExchangeRates } from '@/lib/utils/currency'
import OGImage from '@/components/OG/ogImage.component'
import { getTranslations } from '@/lib/i18n/dictionary'

import pageTranslations from './locales.json'

// Alt text for the Open Graph image
export const alt = 'Beswib Event Details'
// Image size for Open Graph
export const size = { width: 1200, height: 630 }
// Content type for the image
export const contentType = 'image/png'

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

	// Build the absolute URL (useful for Satori)
	const requestHeaders = await headers()
	const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000'
	const xfProto = requestHeaders.get('x-forwarded-proto')
	const isLocal = host?.startsWith('localhost') || host?.startsWith('127.0.0.1')
	const protocol = xfProto ?? (isLocal ? 'http' : 'https')

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

	// Load custom fonts for @vercel/og with error handling
	try {
		const bowlbyFont = readFileSync(join(process.cwd(), 'src/components/OG/typos/BowlbyOneSC-Regular.ttf'))
		const geistFont = readFileSync(join(process.cwd(), 'src/components/OG/typos/Geist-Regular.ttf'))

		// Return the Open Graph image with custom fonts
		return new ImageResponse(
			(
				<OGImageEvent
					title={title}
					secondary={secondary}
					host={host}
					protocol={protocol}
					size={size}
					event={event}
					organizer={organizer}
					locale={locale}
					exchangeRates={exchangeRates}
				/>
			),
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
