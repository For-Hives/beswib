import { ImageResponse } from 'next/og'
import { headers } from 'next/headers'
import { readFileSync } from 'fs'
import { join } from 'path'

import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { fetchPublicBibById, checkBibListingStatus } from '@/services/bib.services'
import OGImageBib from '@/components/OG/ogImageBib.component'
import OGImage from '@/components/OG/ogImage.component'
import { getTranslations } from '@/lib/i18n/dictionary'

import marketplaceTranslations from '../locales.json'

// Alt text for the Open Graph image
export const alt = 'Beswib Race Bib Purchase'
// Image size for Open Graph
export const size = { width: 1200, height: 630 }
// Content type for the image
export const contentType = 'image/png'

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

	// Try to fetch the bib details
	let bib = null
	let title = t.title ?? 'Marketplace'
	let secondary = t.descriptionOG ?? '**Browse** and **buy** race **bibs** from our marketplace'

	try {
		// Check bib status first
		const bibStatus = await checkBibListingStatus(id)

		if (bibStatus?.exists && bibStatus.available) {
			// Try to fetch bib data
			bib = await fetchPublicBibById(id)

			// If we successfully got bib data, customize the title and description
			if (bib?.expand?.eventId) {
				const eventName = bib.expand.eventId.name
				const location = bib.expand.eventId.location
				const price = bib.price
				const distance = bib.expand.eventId.distanceKm

				// Use event name as the main title
				title = eventName

				// Create descriptive secondary text
				const details = []
				if (location) details.push(location)
				if (distance) details.push(`${distance}km`)
				if (price) details.push(`€${price}`)

				secondary =
					details.length > 0
						? `**${details.join(' • ')}** - Secure race bib transfer`
						: 'Secure **race bib transfer** with verified seller'
			}
		}
	} catch (error) {
		console.warn('Error fetching bib data for OpenGraph:', error)
		// Fallback to generic marketplace content
	}

	// Build the absolute URL (useful for Satori)
	const requestHeaders = await headers()
	const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000'
	const xfProto = requestHeaders.get('x-forwarded-proto')
	const isLocal = host?.startsWith('localhost') || host?.startsWith('127.0.0.1')
	const protocol = xfProto ?? (isLocal ? 'http' : 'https')

	// Load custom fonts for @vercel/og with error handling
	try {
		const bowlbyFont = readFileSync(join(process.cwd(), 'src/components/OG/typos/BowlbyOneSC-Regular.ttf'))
		const geistFont = readFileSync(join(process.cwd(), 'src/components/OG/typos/Geist-Regular.ttf'))

		// Return the Open Graph image with custom fonts
		return new ImageResponse(
			<OGImageBib title={title} secondary={secondary} host={host} protocol={protocol} size={size} />,
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
