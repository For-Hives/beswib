// @vitest-environment node
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Metadata } from 'next'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n, type Locale } from '@/lib/i18n/config'
import {
	generateAdminMetadata,
	generateDashboardMetadata,
	generateEventMetadata,
	generateEventsMetadata,
	generateFAQMetadata,
	generateHomeMetadata,
	generateMarketplaceMetadata,
	generateProfileMetadata,
	generateRootMetadata,
	generateSimplePageMetadata,
} from '@/lib/seo/metadata-generators'
import { generateAlternateLanguages, generateCanonicalUrl } from '@/lib/seo/utils/seo-generators'
import { mockEvent } from '@/tests/mocks/data'

const BASE = 'https://staging.beswib.com'

// Every page built on the shared generators, with the path its URLs must carry after the locale
const PAGES: [name: string, metadata: (locale: Locale) => Metadata, path: string][] = [
	['the home page', generateHomeMetadata, '/'],
	['the events list', generateEventsMetadata, '/events/'],
	['an event', locale => generateEventMetadata(locale, mockEvent), `/events/${mockEvent.id}/`],
	['the marketplace', generateMarketplaceMetadata, '/marketplace/'],
	['the FAQ', generateFAQMetadata, '/faq/'],
	['the blog', locale => generateSimplePageMetadata(locale, 'Blog', 'Articles', '/blog'), '/blog/'],
	['a legal page', locale => generateSimplePageMetadata(locale, 'Terms', 'Terms', '/legals/terms'), '/legals/terms/'],
	['the dashboard', generateDashboardMetadata, '/dashboard/'],
	['the profile', generateProfileMetadata, '/profile/'],
	['the admin', generateAdminMetadata, '/admin/'],
]

// The pages a visitor can share, as directories of src/app/[locale]
const SHARED_PAGES = [
	'',
	'blog',
	'blog/[slug]',
	'contact',
	'events',
	'events/[id]',
	'faq',
	'legals/aup',
	'legals/data-deletion',
	'legals/legal-notice',
	'legals/privacy-policy',
	'legals/terms',
	'marketplace',
	'marketplace/[id]',
]

beforeEach(() => {
	// A production build that knows its public address, as on the hosting platform
	vi.stubEnv('NODE_ENV', 'production')
	vi.stubEnv('NEXT_PUBLIC_BASE_URL', `${BASE}/`)
	vi.stubEnv('SERVER_URL', undefined)
	vi.stubEnv('NEXT_URL_SERVER_URL', undefined)
})

afterEach(() => {
	vi.unstubAllEnvs()
	vi.restoreAllMocks()
})

describe('metadataBase', () => {
	it('is set by the root metadata, on the public address', () => {
		expect(String(generateRootMetadata().metadataBase)).toBe(`${BASE}/`)
	})

	it.each([undefined, 'http://localhost:3000'])('is the production site when NEXT_PUBLIC_BASE_URL is %j', value => {
		vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		vi.stubEnv('NEXT_PUBLIC_BASE_URL', value)

		expect(String(generateRootMetadata().metadataBase)).toBe('https://beswib.com/')
	})

	it('still follows SERVER_URL on a deployment that only has that one', () => {
		vi.stubEnv('NEXT_PUBLIC_BASE_URL', undefined)
		vi.stubEnv('SERVER_URL', 'https://beswib.com')

		expect(String(generateRootMetadata().metadataBase)).toBe('https://beswib.com/')
	})

	it.each(PAGES)('is not set a second time by %s', (_name, metadata) => {
		expect(metadata('en')).not.toHaveProperty('metadataBase')
	})

	it('resolves the relative URLs the pages keep (icons, manifest) on the public address', () => {
		const { metadataBase } = generateRootMetadata()
		const { manifest } = generateHomeMetadata('fr')

		expect(new URL(String(manifest), metadataBase ?? undefined).href).toBe(`${BASE}/site.webmanifest`)
	})
})

describe('canonical and hreflang links', () => {
	it.each(i18n.locales)('the canonical URL of a %s page is under the public address and its own locale', locale => {
		expect(generateCanonicalUrl(locale, '/events/abc')).toBe(`${BASE}/${locale}/events/abc/`)
		expect(generateCanonicalUrl(locale, '/')).toBe(`${BASE}/${locale}/`)
	})

	it('gives one alternate per locale, each under the public address', () => {
		const alternates = generateAlternateLanguages('/events/abc')

		expect(Object.values(alternates).sort()).toEqual(
			[...i18n.locales.map(locale => `${BASE}/${locale}/events/abc/`), `${BASE}/en/events/abc/`].sort()
		)
		expect(alternates['fr-FR']).toBe(`${BASE}/fr/events/abc/`)
		expect(alternates['x-default']).toBe(`${BASE}/en/events/abc/`)
	})

	describe.each(PAGES)('%s', (_name, metadata, path) => {
		it.each(i18n.locales)('announces its own address in %s', locale => {
			const page = metadata(locale)

			expect(page.alternates?.canonical).toBe(`${BASE}/${locale}${path}`)
			expect(page.openGraph?.url).toBe(`${BASE}/${locale}${path}`)
		})

		it('announces every translation under the public address, with one locale each', () => {
			const languages = Object.values(metadata('fr').alternates?.languages ?? {}).map(String)

			expect(languages).toHaveLength(i18n.locales.length + 1)
			for (const url of languages) {
				expect(url.startsWith(`${BASE}/`)).toBe(true)
				expect(url.slice(BASE.length)).toMatch(new RegExp(`^/(${i18n.locales.join('|')})${path}$`))
			}
		})
	})

	it('announces no local address from a production build that was given none', () => {
		vi.stubEnv('NEXT_PUBLIC_BASE_URL', undefined)

		for (const [, metadata] of PAGES) {
			expect(JSON.stringify(metadata('fr'))).not.toMatch(/localhost|127\.0\.0\.1/)
			expect(String(metadata('fr').alternates?.canonical).startsWith('https://beswib.com/fr/')).toBe(true)
		}
	})
})

describe('share images', () => {
	// A page that names an image hides the opengraph-image file next to it: the generators used to
	// name /opengraph-image, the picture of the home page, which is redirected to the English one
	it.each(PAGES)('%s names no image and leaves it to its opengraph-image file', (_name, metadata) => {
		for (const locale of i18n.locales) {
			const page = metadata(locale)

			expect(page.openGraph).not.toHaveProperty('images')
			expect(page.twitter).not.toHaveProperty('images')
		}
	})

	it.each(SHARED_PAGES)('the page /%s has an opengraph-image file of its own', directory => {
		const folder = join(process.cwd(), 'src/app/[locale]', directory)

		expect(existsSync(join(folder, 'page.tsx'))).toBe(true)
		expect(existsSync(join(folder, 'opengraph-image.tsx'))).toBe(true)
	})
})
