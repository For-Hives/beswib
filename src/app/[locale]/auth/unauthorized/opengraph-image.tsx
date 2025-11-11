import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
// import globalLocales from '@/lib/i18n/globalLocales.json'
import OGImage from '@/components/OG/ogImage.component'
import { generateLocaleParams } from '@/lib/generation/staticParams'
import { getAbsoluteUrl } from '@/lib/utils/url'
// import { getTranslations } from '@/lib/i18n/dictionary'

// Alt text for the Open Graph image
export const alt = 'Beswib Unauthorized Access Open Graph Image'
// Image size for Open Graph
export const size = { width: 1200, height: 630 }
// Content type for the image
export const contentType = 'image/png'

// Generate static params for all locales 🌍
export function generateStaticParams() {
	return generateLocaleParams()
}

// Default export: async function to generate the Open Graph image
export default async function Image() {
	// console.info('🔍 :', _)
	// Retrieve the dynamic locale from params
	// const { locale } = await params

	// Get the translations for the current page and locale
	// const t = getTranslations(locale, globalLocales) // TODO: Use when needed

	// Get the absolute URL using environment variables
	const { protocol, host } = getAbsoluteUrl()

	// Load custom fonts for @vercel/og with error handling
	try {
		const bowlbyFont = readFileSync(join(process.cwd(), 'src/components/OG/typos/BowlbyOneSC-Regular.ttf'))
		const geistFont = readFileSync(join(process.cwd(), 'src/components/OG/typos/Geist-Regular.ttf'))

		// Return the Open Graph image with custom fonts
		return new ImageResponse(
			<OGImage
				title="Access Denied"
				secondary="You don't have permission to access this page"
				host={host}
				protocol={protocol}
				size={size}
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
			<OGImage
				title="Access Denied"
				secondary="You don't have permission to access this page"
				host={host}
				protocol={protocol}
				size={size}
			/>,
			size
		)
	}
}
