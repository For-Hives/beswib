import { Locale } from '@/lib/i18n/config'

interface BreadcrumbItem {
	label: string
	href: string
	position: number
}

interface BreadcrumbSchemaProps {
	items: BreadcrumbItem[]
	locale: Locale
}

export default function BreadcrumbSchema({ locale, items }: BreadcrumbSchemaProps) {
	if (items.length === 0) return null

	const baseUrl = 'https://beswib.com'
	const localePrefix = locale === 'en' ? '' : `/${locale}`

	// Always include home as first item
	const allItems = [
		{
			position: 1,
			label: 'Home',
			href: `${baseUrl}${localePrefix}`,
		},
		...items.map((item, index) => ({
			...item,
			position: index + 2,
			href: item.href.startsWith('http') ? item.href : `${baseUrl}${item.href}`,
		})),
	]

	const breadcrumbSchema = {
		itemListElement: allItems.map(item => ({
			position: item.position,
			name: item.label,
			item: {
				name: item.label,
				'@type': 'WebPage',
				'@id': item.href,
			},
			'@type': 'ListItem',
		})),
		'@type': 'BreadcrumbList',
		'@context': 'https://schema.org',
	}

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(breadcrumbSchema),
			}}
		/>
	)
}
