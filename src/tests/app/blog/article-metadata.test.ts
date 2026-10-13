// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { generateMetadata } from '@/app/[locale]/blog/[slug]/page'
import type { Locale } from '@/lib/i18n/config'
import { generateRootMetadata } from '@/lib/seo/metadata-generators'
import type { Article } from '@/models/article.model'
import { fetchArticleBySlug } from '@/services/article.services'

vi.mock('@/services/article.services', () => ({
	getAllArticles: vi.fn(),
	fetchArticleBySlug: vi.fn(),
}))

const BASE = 'https://staging.beswib.com'
const SLUG = 'how-to-run-your-first-10k'

const article: Article = {
	updated: new Date('2026-09-02T10:00:00.000Z'),
	title: 'How to run your first 10K',
	slug: SLUG,
	locale: 'en',
	isDraft: false,
	image: 'img_123456789012',
	id: 'art_12345678901',
	extract: 'Twelve weeks, three runs a week.',
	description: 'A plan for a first 10K road race.',
	created: new Date('2026-09-01T10:00:00.000Z'),
	content: '<p>Start slow.</p>',
}

function metadataOf(locale: Locale, slug = SLUG) {
	return generateMetadata({ params: Promise.resolve({ locale, slug }) })
}

beforeEach(() => {
	// A production build that knows its public address, as on the hosting platform
	vi.stubEnv('NODE_ENV', 'production')
	vi.stubEnv('NEXT_PUBLIC_BASE_URL', `${BASE}/`)
	vi.stubEnv('SERVER_URL', undefined)
	vi.stubEnv('NEXT_URL_SERVER_URL', undefined)
	vi.mocked(fetchArticleBySlug).mockResolvedValue(article)
})

afterEach(() => {
	vi.unstubAllEnvs()
	vi.clearAllMocks()
	vi.restoreAllMocks()
})

describe('metadata of a blog article', () => {
	it('gives the article a canonical URL and an Open Graph URL on the public address', async () => {
		const metadata = await metadataOf('en')

		expect(metadata.alternates?.canonical).toBe(`${BASE}/en/blog/${SLUG}/`)
		expect(metadata.openGraph?.url).toBe(`${BASE}/en/blog/${SLUG}/`)
	})

	it('follows the locale of the page, without doubling it', async () => {
		vi.mocked(fetchArticleBySlug).mockResolvedValue({ ...article, slug: 'premier-10-km', locale: 'fr' })

		const metadata = await metadataOf('fr', 'premier-10-km')

		expect(metadata.alternates?.canonical).toBe(`${BASE}/fr/blog/premier-10-km/`)
		expect(metadata.openGraph?.url).toBe(`${BASE}/fr/blog/premier-10-km/`)
	})

	it('announces no translation: another locale has another slug', async () => {
		const metadata = await metadataOf('en')

		expect(metadata.alternates?.languages).toBeUndefined()
	})

	it('leaves the share image to its opengraph-image file, resolved against the root base', async () => {
		const metadata = await metadataOf('en')

		// An image set here would replace the card drawn by opengraph-image.tsx, and a base set here
		// would be a second place to keep right
		expect(metadata.openGraph).not.toHaveProperty('images')
		expect(metadata.twitter).not.toHaveProperty('images')
		expect(metadata).not.toHaveProperty('metadataBase')

		// What Next.js does with the path of that file: it joins it to the metadataBase of the root layout
		const { metadataBase } = generateRootMetadata()
		const image = new URL(`/en/blog/${SLUG}/opengraph-image`, metadataBase ?? undefined)
		expect(image.href).toBe(`${BASE}/en/blog/${SLUG}/opengraph-image`)
	})

	it('never announces localhost from a production build, whatever its environment holds', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => undefined)

		for (const value of [undefined, '', 'http://localhost:3000', 'http://127.0.0.1:3000']) {
			vi.stubEnv('NEXT_PUBLIC_BASE_URL', value)

			const metadata = await metadataOf('en')
			const { metadataBase } = generateRootMetadata()

			expect(metadata.alternates?.canonical).toBe(`https://beswib.com/en/blog/${SLUG}/`)
			expect(metadata.openGraph?.url).toBe(`https://beswib.com/en/blog/${SLUG}/`)
			expect(String(metadataBase)).toBe('https://beswib.com/')
		}
	})

	it.each([
		['is unknown', null],
		['is written for another locale', { ...article, locale: 'fr' as const }],
		['is a draft', { ...article, isDraft: true }],
	])('announces no address for an article that %s', async (_case, found) => {
		vi.mocked(fetchArticleBySlug).mockResolvedValue(found)

		const metadata = await metadataOf('en')

		expect(metadata).toEqual({ title: 'Article Not Found' })
	})
})
