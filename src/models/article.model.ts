import type { ImageWithAlt } from './imageWithAlt.model'
import type { SEO } from './seo.model'

export interface Article {
	id: string
	title: string
	description: string
	slug: string
	image: ImageWithAlt['id'] // RELATION_RECORD_ID 🔗
	extract: string
	content: string // Rich text HTML content from editor
	seo?: SEO['id'] // RELATION_RECORD_ID 🔗 (optional)
	created: Date
	updated: Date
}
