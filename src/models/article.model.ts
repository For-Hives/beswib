import type { Locale } from '@/lib/i18n/config'

import type { ImageWithAlt } from './imageWithAlt.model'
import type { SEO } from './seo.model'

export interface Article {
	id: string
	title: string
	description: string
	slug: string
	locale: Locale // Language of the article
	image: ImageWithAlt['id'] // RELATION_RECORD_ID 🔗
	extract: string
	content: string // Rich text HTML content from editor
	seo?: SEO['id'] // RELATION_RECORD_ID 🔗 (optional)
	translationGroup?: string // UUID linking all translations of the same article
	isDraft: boolean // Draft status - true means unpublished
	created: Date
	updated: Date
}
