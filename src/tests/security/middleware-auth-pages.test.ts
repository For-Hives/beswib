// @vitest-environment node
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The middleware sends a visitor who already has a session away from the sign-in and sign-up
// pages. Clerk refreshes the route as soon as a session becomes active, so this is also where a
// visitor who has just signed in can be sent: redirect_url is read here under the same rules as in
// the forms, and a link written by somebody else must not take the visitor off the site.

// Clerk is reduced to what the handler is given: the session, and protect()
vi.mock('@clerk/nextjs/server', async importOriginal => ({
	...(await importOriginal<typeof import('@clerk/nextjs/server')>()),
	clerkMiddleware: (handler: unknown) => handler,
}))

import middleware from '@/middleware'

const SITE = 'https://beswib.com'

type Handler = (auth: unknown, request: NextRequest) => Promise<Response>

function session(userId: string | null) {
	return Object.assign(() => Promise.resolve({ userId }), { protect: vi.fn() })
}

// The address the server listens on, as the middleware sees it behind the proxy
const LISTENING = 'http://localhost:3000'

async function locationOf(
	path: string,
	userId: string | null = 'user_2abc',
	headers: Record<string, string> = {}
): Promise<string | null> {
	const request = new NextRequest(`${LISTENING}${path}`, { headers })
	const response = await (middleware as unknown as Handler)(session(userId), request)
	const location = response.headers.get('location')
	// Next.js answers the browser with the path alone when the redirect is on the address of the request
	return location == null ? null : location.replace(LISTENING, '')
}

beforeEach(() => {
	vi.stubEnv('NEXT_PUBLIC_BASE_URL', SITE)
})

afterEach(() => {
	vi.unstubAllEnvs()
})

describe('a signed-in visitor on a sign-in or sign-up page', () => {
	it.each([
		['/fr/auth/sign-in', '/fr/dashboard'],
		['/ko/auth/sign-up', '/ko/dashboard'],
		['/de/auth/forgot-password', '/de/dashboard'],
	])('goes from %s to the dashboard of the locale', async (path, expected) => {
		expect(await locationOf(path)).toBe(expected)
	})

	it('goes back to the bib that asked for the sign-in, private listing token included', async () => {
		const bib = '/fr/marketplace/abcdefghij12345?tkn=s3cr3t'

		expect(await locationOf(`/fr/auth/sign-in?redirect_url=${encodeURIComponent(bib)}`)).toBe(bib)
		expect(await locationOf(`/fr/auth/sign-up?redirect_url=${encodeURIComponent(bib)}`)).toBe(bib)
	})

	it('goes back to a page of another locale than the form', async () => {
		expect(await locationOf('/fr/auth/sign-in?redirect_url=%2Fen%2Fevents%2Fabcdefghij12345')).toBe(
			'/en/events/abcdefghij12345'
		)
	})

	it('reads the return address Clerk writes in full, with the public address of the site', async () => {
		const written = encodeURIComponent(`${SITE}/fr/dashboard/seller/sell-bib`)

		expect(await locationOf(`/fr/auth/sign-in?redirect_url=${written}`)).toBe('/fr/dashboard/seller/sell-bib')
	})

	it.each([
		['another site', 'https://evil.tld/fr/dashboard'],
		['a protocol-relative address', '//evil.tld'],
		['a backslash', '/\\evil.tld'],
		['an encoded slash', '/%2Fevil.tld'],
		['a tab', '/\t/evil.tld'],
		['a script', 'javascript:alert(1)'],
		['the address the server listens on', 'http://localhost:3000/fr/profile'],
		['an API route', '/api/waitlist/remove?token=abc'],
		['nothing', ''],
	])('stays on the site, on the dashboard, when redirect_url is %s', async (_name, value) => {
		expect(await locationOf(`/fr/auth/sign-in?redirect_url=${encodeURIComponent(value)}`)).toBe('/fr/dashboard')
	})
})

// Clerk writes redirect_url with the address of the request as the proxy forwards it (see
// middleware-sign-in-url.test.ts). The public address is fixed when the app is built: on a
// deployment that is not on it (a staging built with the address of production, a production build
// started on a developer's machine) the visitor was sent to the dashboard where the forms, which
// read the address bar, sent them to the page.
describe('the return address Clerk wrote, on a deployment that is not on the address it was built for', () => {
	const STAGING = { 'x-forwarded-proto': 'https', 'x-forwarded-host': 'staging.beswib.com' }
	const written = (address: string) => `/fr/auth/sign-in?redirect_url=${encodeURIComponent(address)}`

	it('is read with the address the proxy forwards', async () => {
		expect(await locationOf(written('https://staging.beswib.com/fr/profile'), 'user_2abc', STAGING)).toBe('/fr/profile')
		expect(
			await locationOf(written('https://staging.beswib.com/fr/marketplace/abc?tkn=s3cr3t'), 'user_2abc', STAGING)
		).toBe('/fr/marketplace/abc?tkn=s3cr3t')
	})

	it('is read with the first address when several proxies forwarded theirs, as Clerk does', async () => {
		const headers = { 'x-forwarded-proto': 'https, http', 'x-forwarded-host': 'staging.beswib.com, 10.0.0.5:3000' }

		expect(await locationOf(written('https://staging.beswib.com/fr/profile'), 'user_2abc', headers)).toBe('/fr/profile')
		expect(await locationOf(written('http://10.0.0.5:3000/fr/profile'), 'user_2abc', headers)).toBe('/fr/dashboard')
	})

	it('is read with the Host header when nothing is forwarded: a build started without a proxy', async () => {
		const headers = { host: 'localhost:3334' }

		expect(await locationOf(written('http://localhost:3334/fr/profile'), 'user_2abc', headers)).toBe('/fr/profile')
	})

	it('is still read with the public address', async () => {
		expect(await locationOf(written(`${SITE}/fr/profile`), 'user_2abc', STAGING)).toBe('/fr/profile')
	})

	it.each([
		['another host', 'https://evil.tld/fr/profile'],
		['another scheme', 'http://staging.beswib.com/fr/profile'],
		['another port', 'https://staging.beswib.com:8443/fr/profile'],
		['a subdomain of it', 'https://app.staging.beswib.com/fr/profile'],
		['the address the server listens on', `${LISTENING}/fr/profile`],
	])('goes to the dashboard when the address is on %s than the request', async (_name, address) => {
		expect(await locationOf(written(address), 'user_2abc', STAGING)).toBe('/fr/dashboard')
	})

	it('still refuses what is no page of the site, whatever the address in front', async () => {
		expect(await locationOf(written('https://staging.beswib.com/api/waitlist/remove'), 'user_2abc', STAGING)).toBe(
			'/fr/dashboard'
		)
		expect(await locationOf(written('https://staging.beswib.com//evil.tld'), 'user_2abc', STAGING)).toBe(
			'/fr/dashboard'
		)
	})

	// A header a client can write must never choose where the visitor goes: it only decides whether
	// the path of redirect_url is believed, and the redirect is on the address of the request
	it.each([
		['with the path of the value', 'https://evil.tld/fr/profile', '/fr/profile'],
		['on the dashboard when the value names another host again', 'https://other.tld/fr/profile', '/fr/dashboard'],
	])(
		'never follows a forged X-Forwarded-Host off the site: the visitor stays, %s',
		async (_name, address, expected) => {
			const forged = { 'x-forwarded-proto': 'https', 'x-forwarded-host': 'evil.tld' }
			const request = new NextRequest(`${LISTENING}${written(address)}`, { headers: forged })
			const response = await (middleware as unknown as Handler)(session('user_2abc'), request)

			expect(response.headers.get('location')).toBe(`${LISTENING}${expected}`)
		}
	)

	it.each(['evil.tld/fr/profile?', 'user:pass@evil.tld', 'not a host', ''])(
		'falls back to the public address when the forwarded host is %j',
		async host => {
			const headers = { 'x-forwarded-proto': 'https', 'x-forwarded-host': host }

			expect(await locationOf(written(`${SITE}/fr/profile`), 'user_2abc', headers)).toBe('/fr/profile')
			expect(await locationOf(written('https://evil.tld/fr/events'), 'user_2abc', headers)).not.toMatch(/evil/)
		}
	)
})

describe('a visitor without a session', () => {
	it('stays on the sign-in page, whatever redirect_url says', async () => {
		expect(await locationOf('/fr/auth/sign-in?redirect_url=%2Ffr%2Fmarketplace%2Fabc', null)).toBeNull()
		expect(await locationOf('/fr/auth/sign-in?redirect_url=https%3A%2F%2Fevil.tld', null)).toBeNull()
	})
})

describe('a signed-in visitor elsewhere', () => {
	it('is not moved by a redirect_url on a page that is not a form', async () => {
		expect(await locationOf('/fr/marketplace?redirect_url=%2Ffr%2Fprofile')).toBeNull()
		expect(await locationOf('/fr/dashboard?redirect_url=%2Ffr%2Fprofile')).toBeNull()
	})
})

// Where Google or Facebook hands the visitor back. Clerk finishes the attempt in the browser, on
// that page: the middleware must let it be shown, with or without a session
describe('the callback page of a sign-in with Google or Facebook', () => {
	it.each([
		['a visitor whose session Clerk has not created yet', null],
		['a visitor who already has a session', 'user_2abc'],
	])('is left to %s', async (_name, userId) => {
		expect(await locationOf('/fr/auth/sso-callback?redirect_url=%2Ffr%2Fmarketplace%2Fabc', userId)).toBeNull()
		expect(await locationOf('/ko/auth/sso-callback', userId)).toBeNull()
	})
})
