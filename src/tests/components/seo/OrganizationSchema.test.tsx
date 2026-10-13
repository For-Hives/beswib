// @vitest-environment node
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import OrganizationSchema from '@/components/seo/OrganizationSchema'

const BASE = 'https://staging.beswib.com'

type Schema = Record<string, unknown> & { '@type': string }

function schemas(locale: 'en' | 'fr'): Schema[] {
	const html = renderToStaticMarkup(<OrganizationSchema locale={locale} />)
	return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(match => JSON.parse(match[1]))
}

beforeEach(() => {
	// A production build that knows its public address, as on the hosting platform
	vi.stubEnv('NODE_ENV', 'production')
	vi.stubEnv('NEXT_PUBLIC_BASE_URL', `${BASE}/`)
	vi.stubEnv('SERVER_URL', undefined)
	vi.stubEnv('NEXT_URL_SERVER_URL', undefined)
})

afterEach(() => {
	vi.unstubAllEnvs()
})

describe('OrganizationSchema', () => {
	it('describes the organization and the site on the public address', () => {
		const [organization, website] = schemas('fr')

		expect(organization).toMatchObject({
			'@type': 'Organization',
			url: BASE,
			logo: { url: `${BASE}/beswib.svg` },
			// The share image of the site in the locale of the page: a route that exists
			image: { url: `${BASE}/fr/opengraph-image` },
		})
		expect(website).toMatchObject({
			'@type': 'WebSite',
			url: BASE,
			publisher: { '@id': `${BASE}#organization` },
			potentialAction: { target: { urlTemplate: `${BASE}/fr/marketplace?search={search_term_string}` } },
		})
	})

	it('is the production site, word for word, when the build was given no address', () => {
		vi.stubEnv('NEXT_PUBLIC_BASE_URL', undefined)

		const [organization, website] = schemas('en')

		expect(organization.url).toBe('https://beswib.com')
		expect(website.url).toBe('https://beswib.com')
		expect(JSON.stringify([organization, website])).not.toContain('localhost')
	})
})
