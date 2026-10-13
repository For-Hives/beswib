// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Url = typeof import('@/lib/utils/url')

const VARIABLES = ['NEXT_PUBLIC_BASE_URL', 'SERVER_URL', 'NEXT_URL_SERVER_URL'] as const

let url: Url
let warn: ReturnType<typeof vi.spyOn>

// A fresh module for each test: what it has already reported is kept in the module
async function loadUrl(): Promise<void> {
	vi.resetModules()
	url = await import('@/lib/utils/url')
}

function environment(nodeEnv: string, values: Partial<Record<(typeof VARIABLES)[number], string>> = {}): void {
	vi.stubEnv('NODE_ENV', nodeEnv)
	for (const name of VARIABLES) vi.stubEnv(name, values[name])
}

beforeEach(async () => {
	warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
	await loadUrl()
})

afterEach(() => {
	vi.unstubAllEnvs()
	vi.restoreAllMocks()
})

describe('getPublicBaseUrl, the variable is set', () => {
	it.each([
		['https://beswib.com', 'https://beswib.com'],
		['https://staging.beswib.com', 'https://staging.beswib.com'],
		['https://staging.beswib.com/', 'https://staging.beswib.com'],
		['https://staging.beswib.com///', 'https://staging.beswib.com'],
		['  https://staging.beswib.com/\n', 'https://staging.beswib.com'],
		['https://beswib.com/fr', 'https://beswib.com'],
		['https://beswib.com/?utm_source=x#top', 'https://beswib.com'],
		['http://preview.beswib.com:8080/', 'http://preview.beswib.com:8080'],
	])('NEXT_PUBLIC_BASE_URL=%j gives %s', (value, expected) => {
		environment('production', { NEXT_PUBLIC_BASE_URL: value })

		expect(url.getPublicBaseUrl()).toBe(expected)
		expect(warn).not.toHaveBeenCalled()
	})

	it('never ends with a slash, so that paths can be appended as they are', () => {
		environment('production', { NEXT_PUBLIC_BASE_URL: 'https://staging.beswib.com/' })

		expect(`${url.getPublicBaseUrl()}/fr/events`).toBe('https://staging.beswib.com/fr/events')
	})

	it('prefers NEXT_PUBLIC_BASE_URL to the older names', () => {
		environment('production', {
			NEXT_PUBLIC_BASE_URL: 'https://public.example.org',
			SERVER_URL: 'https://server.example.org',
			NEXT_URL_SERVER_URL: 'https://legacy.example.org',
		})

		expect(url.getPublicBaseUrl()).toBe('https://public.example.org')
	})

	it.each([undefined, '', '   '])('keeps SERVER_URL working when NEXT_PUBLIC_BASE_URL is %j', missing => {
		environment('production', {
			NEXT_PUBLIC_BASE_URL: missing,
			SERVER_URL: 'https://staging.beswib.com/',
			NEXT_URL_SERVER_URL: 'https://legacy.example.org',
		})

		expect(url.getPublicBaseUrl()).toBe('https://staging.beswib.com')
	})

	it('reads NEXT_URL_SERVER_URL last', () => {
		environment('production', { NEXT_URL_SERVER_URL: 'https://legacy.example.org/' })

		expect(url.getPublicBaseUrl()).toBe('https://legacy.example.org')
	})
})

describe('getPublicBaseUrl, no variable is set', () => {
	it('is the production site in a production build, never localhost', () => {
		environment('production')

		expect(url.getPublicBaseUrl()).toBe('https://beswib.com')
	})

	it.each(['development', 'test'])('is the local dev server when NODE_ENV is %j', nodeEnv => {
		environment(nodeEnv)

		expect(url.getPublicBaseUrl()).toBe('http://localhost:3000')
	})
})

describe('getPublicBaseUrl, a local address', () => {
	const LOCAL = [
		'http://localhost:3000',
		'http://localhost',
		'https://localhost:3000/',
		'http://127.0.0.1:3000',
		'http://127.0.0.1',
		'http://0.0.0.0:3000',
		'http://[::1]:3000',
		'http://app.localhost:3000',
	]

	it.each(LOCAL)('%s is not announced by a production build', value => {
		environment('production', { NEXT_PUBLIC_BASE_URL: value })

		expect(url.getPublicBaseUrl()).toBe('https://beswib.com')
	})

	it.each(LOCAL)('%s gives way to the next variable in a production build', value => {
		environment('production', { NEXT_PUBLIC_BASE_URL: value, SERVER_URL: 'https://staging.beswib.com' })

		expect(url.getPublicBaseUrl()).toBe('https://staging.beswib.com')
	})

	it('is refused under every name', () => {
		environment('production', {
			NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
			SERVER_URL: 'http://127.0.0.1:3000',
			NEXT_URL_SERVER_URL: 'http://[::1]:3000',
		})

		expect(url.getPublicBaseUrl()).toBe('https://beswib.com')
	})

	it.each(LOCAL)('%s is kept outside a production build', value => {
		environment('development', { NEXT_PUBLIC_BASE_URL: value })

		expect(url.getPublicBaseUrl()).toBe(new URL(value).origin)
		expect(warn).not.toHaveBeenCalled()
	})

	it.each([
		'https://localhost.example.org',
		'https://notlocalhost.org',
		'https://127.example.org',
		'https://10.0.0.5:3000',
	])('%s only looks like one, and is kept', value => {
		environment('production', { NEXT_PUBLIC_BASE_URL: value })

		expect(url.getPublicBaseUrl()).toBe(value)
	})

	it('says once which variable it ignored, without its value', () => {
		environment('production', { NEXT_PUBLIC_BASE_URL: 'http://user:secret@localhost:3000' })

		url.getPublicBaseUrl()
		url.getPublicBaseUrl()
		url.getPublicBaseUrl()

		expect(warn).toHaveBeenCalledTimes(1)
		const message = String(warn.mock.calls[0][0])
		expect(message).toContain('NEXT_PUBLIC_BASE_URL')
		expect(message).toContain('local address')
		expect(message).not.toContain('secret')
		expect(message).not.toContain('localhost')
	})
})

describe('getPublicBaseUrl, a value that is not a web address', () => {
	it.each([
		'beswib.com',
		'www.beswib.com/fr',
		'not a url',
		'/fr',
		'ftp://beswib.com',
		'localhost:3000',
		'javascript:alert(1)',
	])('%j is ignored: the next variable answers', value => {
		environment('production', { NEXT_PUBLIC_BASE_URL: value, SERVER_URL: 'https://staging.beswib.com' })

		expect(url.getPublicBaseUrl()).toBe('https://staging.beswib.com')
		expect(warn).toHaveBeenCalledTimes(1)
		expect(String(warn.mock.calls[0][0])).toContain('NEXT_PUBLIC_BASE_URL')
	})

	it('falls back like a missing variable when nothing else is set', () => {
		environment('production', { NEXT_PUBLIC_BASE_URL: 'beswib.com' })
		expect(url.getPublicBaseUrl()).toBe('https://beswib.com')

		environment('development', { NEXT_PUBLIC_BASE_URL: 'beswib.com' })
		expect(url.getPublicBaseUrl()).toBe('http://localhost:3000')
	})

	it('drops the credentials an address may carry', () => {
		environment('production', { NEXT_PUBLIC_BASE_URL: 'https://user:secret@staging.beswib.com/' })

		expect(url.getPublicBaseUrl()).toBe('https://staging.beswib.com')
	})
})
