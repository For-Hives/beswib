import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import OGImage from '@/components/OG/ogImage.component'
import { getAbsoluteUrl } from '@/lib/utils/url'

/**
 * Configuration options for generating an Open Graph image
 */
export type OGImageConfig = {
	/** The locale for the image (e.g., 'en', 'fr') */
	locale: string
	/** The main title text to display */
	title: string
	/** The secondary description text to display */
	description: string
	/** Alt text for the image (for accessibility and SEO) */
	alt?: string
	/** Image dimensions */
	size?: { width: number; height: number }
}

/**
 * Default image size for Open Graph images (1200x630 is the recommended size)
 */
export const DEFAULT_OG_SIZE = { width: 1200, height: 630 }

/**
 * Generate an Open Graph image with custom fonts and styling
 *
 * This utility function centralizes the OG image generation logic to avoid
 * code duplication across multiple route files. It loads custom fonts
 * (BowlbyOneSC and Geist) and renders the OGImage component with the
 * provided configuration.
 *
 * @param config - Configuration object for the OG image
 * @returns ImageResponse object containing the generated PNG image
 *
 * @example
 * ```tsx
 * export default async function Image({ params }: { params: Promise<LocaleParams> }) {
 *   const { locale } = await params
 *   const t = getTranslations(locale, pageTranslations)
 *
 *   return generateOGImage({
 *     locale,
 *     title: t.OG.title,
 *     description: t.OG.description,
 *     alt: 'My Page - Beswib',
 *   })
 * }
 * ```
 */
export async function generateOGImage(config: OGImageConfig): Promise<ImageResponse> {
	const { title, description, size = DEFAULT_OG_SIZE } = config

	// Get the absolute URL using environment variables
	const { protocol, host } = getAbsoluteUrl()

	// Load custom fonts for @vercel/og with error handling
	try {
		const bowlbyFont = readFileSync(join(process.cwd(), 'src/components/OG/typos/BowlbyOneSC-Regular.ttf'))
		const geistFont = readFileSync(join(process.cwd(), 'src/components/OG/typos/Geist-Regular.ttf'))

		// Return the Open Graph image with custom fonts
		return new ImageResponse(
			<OGImage title={title} secondary={description} host={host} protocol={protocol} size={size} />,
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
		console.error('Error loading fonts for OG image:', error)

		// Fallback: return the image without custom fonts
		return new ImageResponse(
			<OGImage title={title} secondary={description} host={host} protocol={protocol} size={size} />,
			size
		)
	}
}
