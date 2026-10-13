// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET as robots } from '@/app/robots.txt/route'
import { GET as sitemap } from '@/app/sitemap.xml/route'
import { getAllEvents } from '@/services/event.services'
import { mockEvent } from '@/tests/mocks/data'

vi.mock('@/services/event.services', () => ({ getAllEvents: vi.fn() }))

const BASE = 'https://staging.beswib.com'

function addresses(text: string): string[] {
	return [...text.matchAll(/https?:\/\/[^\s<"]+/g)].map(match => match[0])
}

beforeEach(() => {
	// A production build that knows its public address, as on the hosting platform
	vi.stubEnv('NODE_ENV', 'production')
	vi.stubEnv('NEXT_PUBLIC_BASE_URL', `${BASE}/`)
	vi.stubEnv('SERVER_URL', undefined)
	vi.stubEnv('NEXT_URL_SERVER_URL', undefined)
	vi.mocked(getAllEvents).mockResolvedValue([mockEvent])
})

afterEach(() => {
	vi.unstubAllEnvs()
	vi.clearAllMocks()
	vi.restoreAllMocks()
})

describe('robots.txt', () => {
	it('points at the sitemap of the deployment it is served by', async () => {
		const text = await robots().text()

		expect(text).toContain(`Sitemap: ${BASE}/sitemap.xml\n`)
		expect(addresses(text).every(address => address.startsWith(`${BASE}/`) || address === BASE)).toBe(true)
	})

	it('points at the production site when the build was given no address', async () => {
		// The helper says so in the log, once
		vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		vi.stubEnv('NEXT_PUBLIC_BASE_URL', undefined)

		expect(await robots().text()).toContain('Sitemap: https://beswib.com/sitemap.xml\n')
	})
})

describe('sitemap.xml', () => {
	it('lists the pages and their translations under the public address', async () => {
		const xml = await (await sitemap()).text()
		const listed = addresses(xml).filter(address => !address.includes('sitemaps.org') && !address.includes('w3.org'))

		expect(xml).toContain(`<loc>${BASE}/fr/events/${mockEvent.id}</loc>`)
		expect(xml).toContain(`hreflang="ko" href="${BASE}/ko/marketplace"`)
		expect(listed.length).toBeGreaterThan(100)
		expect(listed.every(address => address.startsWith(`${BASE}/`))).toBe(true)
	})

	it('still lists the static pages, under the same address, when the events cannot be read', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
		vi.mocked(getAllEvents).mockRejectedValue(new Error('PocketBase is away'))

		const xml = await (await sitemap()).text()

		expect(xml).toContain(`<loc>${BASE}/en</loc>`)
		expect(xml).not.toContain('localhost')
	})
})
