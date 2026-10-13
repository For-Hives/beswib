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

async function locationOf(path: string, userId: string | null = 'user_2abc'): Promise<string | null> {
	// The address the server listens on, as the middleware sees it behind the proxy
	const request = new NextRequest(`http://localhost:3000${path}`)
	const response = await (middleware as unknown as Handler)(session(userId), request)
	const location = response.headers.get('location')
	return location == null ? null : location.replace('http://localhost:3000', '')
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
