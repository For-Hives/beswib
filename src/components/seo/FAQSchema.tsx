import type { Locale } from '@/lib/i18n/config'

interface FAQItem {
	question: string
	answer: string
}

interface FAQSchemaProps {
	locale: Locale
	faqItems: FAQItem[]
}

export default function FAQSchema({ locale, faqItems }: FAQSchemaProps) {
	const faqSchema = {
		publisher: {
			url: 'https://beswib.com',
			name: 'Beswib',
			'@type': 'Organization',
		},
		name: 'Beswib FAQ - Race Bib Transfer Questions',
		mainEntity: faqItems.map(item => ({
			name: item.question,
			acceptedAnswer: {
				text: item.answer,
				'@type': 'Answer',
			},
			'@type': 'Question',
		})),
		inLanguage: locale,
		description: 'Frequently asked questions about race bib transfers on Beswib marketplace',
		about: {
			name: 'Race Bib Transfer',
			description: 'Legal transfer of race bibs between athletes',
			'@type': 'Thing',
		},
		'@type': 'FAQPage',
		'@context': 'https://schema.org',
	}

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(faqSchema),
			}}
		/>
	)
}
