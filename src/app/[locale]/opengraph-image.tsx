import { ImageResponse } from 'next/og'
import { headers } from 'next/headers'
import { readFileSync } from 'fs'
import { join } from 'path'

import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import OGImage from '@/components/OG/ogImage.component'
import { getTranslations } from '@/lib/i18n/dictionary'

import pageTranslations from './locales.json'

export const alt = 'Beswib Open Graph Image'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Generate static params for all locales 🌍
export function generateStaticParams() {
	return generateLocaleParams()
}

export default async function Image({ params }: { params: Promise<LocaleParams> }) {
	// Récupération de la locale dynamique
	const { locale } = await params

	// Récupération des traductions de la page
	const t = getTranslations(locale, pageTranslations)

	// Construction de l’URL absolue (utile pour Satori)
	const requestHeaders = await headers()
	const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000'
	const xfProto = requestHeaders.get('x-forwarded-proto')
	const isLocal = host?.startsWith('localhost') || host?.startsWith('127.0.0.1')
	const protocol = xfProto ?? (isLocal ? 'http' : 'https')

	// Charger les polices pour @vercel/og avec gestion d'erreur
	try {
		const bowlbyFont = readFileSync(join(process.cwd(), 'src/components/OG/BowlbyOneSC-Regular.ttf'))
		const geistFont = readFileSync(join(process.cwd(), 'src/components/OG/Geist-Regular.ttf'))

		return new ImageResponse(
			<OGImage title={t.OG.Main} secondary={t.OG.Secondary} host={host} protocol={protocol} size={size} />,
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
		console.error('Erreur lors du chargement des polices:', error)
		// Fallback sans polices personnalisées
		return new ImageResponse(
			<OGImage title={t.OG.Main} secondary={t.OG.Secondary} host={host} protocol={protocol} size={size} />,
			size
		)
	}
}
