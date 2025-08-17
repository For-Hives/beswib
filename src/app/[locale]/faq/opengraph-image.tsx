import { ImageResponse } from 'next/og'
import { headers } from 'next/headers'
import OGImage from '@/components/OG/ogImage.component'
import pageTranslations from './locales.json'
import { getTranslations } from '@/lib/getDictionary'

export const alt = 'Beswib Open Graph Image'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type LocaleParams = { locale: string }

export default async function Image({ params }: { params: Promise<LocaleParams> }) {
	// Récupération de la locale dynamique
	const { locale } = await params

	// Récupération des traductions de la page
	const pageLocales = pageTranslations as unknown as Record<string, Record<string, any>>
	const t = getTranslations(locale, pageLocales)
	const tEn = getTranslations('en', pageLocales)

	// Texte OG avec fallback anglais
	const ogTitle = t.faq?.titleOG ?? tEn.faq?.titleOG ?? 'Beswib'
	const ogSecondary = t.faq?.descriptionOG ?? tEn.faq?.descriptionOG ?? 'Achetez et vendez vos dossards'

	// Construction de l’URL absolue (utile pour Satori)
	const requestHeaders = await headers()
	const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000'
	const xfProto = requestHeaders.get('x-forwarded-proto')
	const isLocal = host?.startsWith('localhost') || host?.startsWith('127.0.0.1')
	const protocol = xfProto ?? (isLocal ? 'http' : 'https')

	return new ImageResponse(
		<OGImage title={ogTitle} secondary={ogSecondary} host={host} protocol={protocol} size={size} />,
		size
	)
}
