import { generateCanonicalUrl } from '@/lib/seo/utils/seo-generators'
import { Locale } from '@/lib/i18n/config'

interface CanonicalLinkProps {
	locale: Locale
	path: string
}

export default function CanonicalLink({ path, locale }: CanonicalLinkProps) {
	const canonicalUrl = generateCanonicalUrl(locale, path)

	return <link rel="canonical" href={canonicalUrl} />
}
