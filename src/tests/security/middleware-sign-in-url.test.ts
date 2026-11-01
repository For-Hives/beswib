// @vitest-environment node
import type { NextFetchEvent } from 'next/server'
import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/lib/i18n/config'

// The real Clerk middleware, with the key of a production instance on a domain that does not
// exist: a request without any Clerk cookie is judged signed out without a call to Clerk.
// What is checked is where auth.protect() sends that visitor.

const SITE = 'https://beswib.com'
const PUBLISHABLE_KEY = `pk_live_${Buffer.from('clerk.beswib.test$').toString('base64')}`

type Middleware = (request: NextRequest, event: NextFetchEvent) => Promise<Response | undefined>

async function loadMiddleware(environment: Record<string, string> = {}): Promise<Middleware> {
	vi.resetModules()
	vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', PUBLISHABLE_KEY)
	vi.stubEnv('CLERK_SECRET_KEY', 'sk_live_not-a-real-key')
	vi.stubEnv('NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED', '1')
	vi.stubEnv('NEXT_PUBLIC_CLERK_SIGN_IN_URL', undefined)
	vi.stubEnv('NEXT_PUBLIC_CLERK_SIGN_UP_URL', undefined)
	for (const [name, value] of Object.entries(environment)) vi.stubEnv(name, value)

	const { default: middleware } = await import('@/middleware')
	return middleware as unknown as Middleware
}

// A page opened in a browser tab, by a visitor who has never signed in
function visit(path: string, headers: Record<string, string> = {}): NextRequest {
	return new NextRequest(`${SITE}${path}`, {
		headers: { 'sec-fetch-dest': 'document', accept: 'text/html', ...headers },
	})
}

async function locationOf(middleware: Middleware, request: NextRequest): Promise<URL | null> {
	const response = await middleware(request, {} as NextFetchEvent)
	const location = response?.headers.get('location')
	return location == null ? null : new URL(location, SITE)
}

afterEach(() => {
	vi.unstubAllEnvs()
	vi.restoreAllMocks()
})

describe('a signed-out visitor on a protected page', () => {
	it.each(i18n.locales)('is sent to the sign-in page of the site, in the %s locale', async locale => {
		const middleware = await loadMiddleware()

		const location = await locationOf(middleware, visit(`/${locale}/dashboard/seller`))

		expect(location?.origin).toBe(SITE)
		expect(location?.pathname).toBe(`/${locale}/auth/sign-in`)
	})

	it.each([
		'/fr/dashboard',
		'/fr/dashboard/buyer',
		'/fr/dashboard/seller/edit-bib/abcdefghij12345',
		'/fr/profile',
		'/fr/admin/event',
	])('comes back to %s after sign-in', async path => {
		const middleware = await loadMiddleware()

		const location = await locationOf(middleware, visit(path))

		expect(location?.pathname).toBe('/fr/auth/sign-in')
		expect(location?.searchParams.get('redirect_url')).toBe(`${SITE}${path}`)
	})

	it('lets anyone read that no bib can be listed any more', async () => {
		const middleware = await loadMiddleware()

		expect(await locationOf(middleware, visit('/fr/dashboard/seller/sell-bib'))).toBeNull()
	})

	it('keeps the query string of the page in the return address', async () => {
		const middleware = await loadMiddleware()

		const location = await locationOf(middleware, visit('/fr/dashboard/buyer?purchase_success=true'))

		expect(location?.searchParams.get('redirect_url')).toBe(`${SITE}/fr/dashboard/buyer?purchase_success=true`)
	})

	it('does not need NEXT_PUBLIC_CLERK_SIGN_IN_URL, and is not led elsewhere by it', async () => {
		const middleware = await loadMiddleware({
			NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up',
			NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
		})

		const location = await locationOf(middleware, visit('/de/profile'))

		expect(location?.pathname).toBe('/de/auth/sign-in')
	})

	it('never leaves the site for the Account Portal of Clerk', async () => {
		const middleware = await loadMiddleware()

		const location = await locationOf(middleware, visit('/en/dashboard'))

		expect(location?.hostname).toBe('beswib.com')
	})
})

// Once signed in, the middleware reads that return address back (middleware-auth-pages.test.ts).
// Behind a proxy Clerk does not write it with the address of the request the server received, but
// with the one the proxy forwards: what is pinned here is which one, with the same headers there.
describe('the return address Clerk writes behind a proxy', () => {
	it.each([
		[
			'the address the proxy forwards',
			{ 'x-forwarded-proto': 'https', 'x-forwarded-host': 'staging.beswib.com' },
			'https://staging.beswib.com',
		],
		[
			'the first one when several proxies forwarded theirs',
			{ 'x-forwarded-proto': 'https, http', 'x-forwarded-host': 'staging.beswib.com, 10.0.0.5:3000' },
			'https://staging.beswib.com',
		],
		['the Host header when nothing is forwarded', { host: 'localhost:3334' }, 'http://localhost:3334'],
	])('names %s', async (_name, headers, origin) => {
		const middleware = await loadMiddleware()
		// The address the server listens on
		const request = new NextRequest('http://localhost:3000/fr/profile', {
			headers: { 'sec-fetch-dest': 'document', accept: 'text/html', ...headers },
		})

		const response = await middleware(request, {} as NextFetchEvent)
		const location = new URL(response?.headers.get('location') ?? '')

		expect(location.pathname).toBe('/fr/auth/sign-in')
		expect(location.searchParams.get('redirect_url')).toBe(`${origin}/fr/profile`)
	})
})

describe('a signed-out visitor elsewhere', () => {
	it.each([
		'/fr',
		'/fr/marketplace/abcdefghij12345?tkn=secret',
		'/fr/events/abcdefghij12345',
		'/fr/auth/sign-in',
		// Where Google or Facebook hands the visitor back: the session does not exist yet
		'/fr/auth/sso-callback?redirect_url=%2Ffr%2Fprofile',
	])('is not redirected from %s', async path => {
		const middleware = await loadMiddleware()

		expect(await locationOf(middleware, visit(path))).toBeNull()
	})

	it('keeps the query string when the locale is added: the page to come back to, the token of a private listing', async () => {
		const middleware = await loadMiddleware()
		const query = '?redirect_url=%2Ffr%2Fmarketplace%2Fabcdefghij12345%3Ftkn%3Ds3cr3t'

		// What the language switch asks for when the visitor chooses English (see use-locale.test.tsx)
		const form = await locationOf(middleware, visit(`/auth/sign-in${query}`, { cookie: 'NEXT_LOCALE=en' }))
		expect(`${form?.pathname}${form?.search}`).toBe(`/en/auth/sign-in${query}`)

		const bib = await locationOf(
			middleware,
			visit('/marketplace/abcdefghij12345?tkn=s3cr3t', { cookie: 'NEXT_LOCALE=en' })
		)
		expect(`${bib?.pathname}${bib?.search}`).toBe('/en/marketplace/abcdefghij12345?tkn=s3cr3t')
	})

	it('gets the locale first on a protected page asked without one, then the sign-in page of that locale', async () => {
		const middleware = await loadMiddleware()

		const first = await locationOf(middleware, visit('/dashboard', { cookie: 'NEXT_LOCALE=it' }))
		expect(first?.pathname).toBe('/it/dashboard')

		const second = await locationOf(middleware, visit('/it/dashboard', { cookie: 'NEXT_LOCALE=it' }))
		expect(second?.pathname).toBe('/it/auth/sign-in')
	})
})
