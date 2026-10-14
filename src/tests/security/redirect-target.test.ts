// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { i18n } from '@/lib/i18n/config'
import {
	afterAuthPath,
	isOAuthCallbackPath,
	oauthCallbackPath,
	returnPathFrom,
	safeRedirectPath,
	signInPath,
	signUpPath,
} from '@/lib/utils/redirect'

// redirect_url is read from the address of the sign-in page: anybody can put any value in a link
// to it. After sign-in the visitor must be on a page of this site, whatever the value was.

const ORIGIN = 'https://beswib.com'

// What a browser does with the accepted path: resolved from the sign-in page, it stays on the site
function landsOn(path: string): string {
	return new URL(path, `${ORIGIN}/fr/auth/sign-in`).origin
}

describe('safeRedirectPath, pages of the app', () => {
	it.each([
		['/fr/marketplace/abcdefghij12345', '/fr/marketplace/abcdefghij12345'],
		['/fr/events/abcdefghij12345', '/fr/events/abcdefghij12345'],
		['/fr/dashboard/seller/edit-bib/abcdefghij12345', '/fr/dashboard/seller/edit-bib/abcdefghij12345'],
		['/fr/profile', '/fr/profile'],
		['/fr', '/fr'],
		['/fr/', '/fr/'],
	])('accepts %s', (value, expected) => {
		expect(safeRedirectPath(value, ORIGIN)).toBe(expected)
	})

	it('keeps the token of a private listing: the buyer comes back to the same link', () => {
		expect(safeRedirectPath('/fr/marketplace/abcdefghij12345?tkn=s3cr3t-Token_1', ORIGIN)).toBe(
			'/fr/marketplace/abcdefghij12345?tkn=s3cr3t-Token_1'
		)
	})

	it('keeps the query string and the hash', () => {
		expect(safeRedirectPath('/en/marketplace?sport=trail&price=10-50#results', ORIGIN)).toBe(
			'/en/marketplace?sport=trail&price=10-50#results'
		)
	})

	it.each(i18n.locales)('accepts a page of the %s locale, whatever the locale of the form', locale => {
		expect(safeRedirectPath(`/${locale}/dashboard/buyer`, ORIGIN)).toBe(`/${locale}/dashboard/buyer`)
	})

	it('accepts the address in full when it is on the site, and answers with its path alone', () => {
		// What Clerk writes when its middleware sends a signed-out visitor to sign-in
		expect(safeRedirectPath('https://beswib.com/fr/dashboard/seller/sell-bib?step=2', ORIGIN)).toBe(
			'/fr/dashboard/seller/sell-bib?step=2'
		)
	})

	it('compares origins, not strings: a trailing slash or a path on the origin given changes nothing', () => {
		expect(safeRedirectPath('https://beswib.com/fr/profile', 'https://beswib.com/')).toBe('/fr/profile')
		expect(safeRedirectPath('http://localhost:3000/en/dashboard', 'http://localhost:3000')).toBe('/en/dashboard')
	})

	it('resolves dot segments before it judges the path', () => {
		expect(safeRedirectPath('/fr/../en/dashboard', ORIGIN)).toBe('/en/dashboard')
		expect(safeRedirectPath('/fr/../../api/waitlist/remove', ORIGIN)).toBeNull()
	})
})

describe('safeRedirectPath, open redirect attempts', () => {
	it.each([
		['protocol-relative', '//evil.tld'],
		['protocol-relative with a page path', '//evil.tld/fr/dashboard'],
		['absolute, another host', 'https://evil.tld'],
		['absolute, another host with a page path', 'https://evil.tld/fr/dashboard'],
		['absolute, plain http on the same host', 'http://beswib.com/fr/dashboard'],
		['absolute, another port', 'https://beswib.com:8443/fr/dashboard'],
		['absolute, the site as a subdomain of another', 'https://beswib.com.evil.tld/fr/dashboard'],
		['absolute, the site as user name', 'https://beswib.com@evil.tld/fr/dashboard'],
		['slash then backslash', '/\\evil.tld'],
		['backslash then slash', '\\/evil.tld'],
		['two backslashes', '\\\\evil.tld'],
		['a backslash after the locale', '/fr\\..\\..\\evil.tld'],
		['a backslash in the authority', 'https://evil.tld\\@beswib.com/fr/dashboard'],
		['an encoded slash', '/%2Fevil.tld'],
		['an encoded slash, lower case', '/%2fevil.tld/fr'],
		['an encoded backslash', '/%5Cevil.tld'],
		['a doubly encoded slash', '/%252Fevil.tld'],
		['a tab inside', '/\t/evil.tld'],
		['a tab inside a page path', '/fr/\tdashboard'],
		['a tab inside the scheme', 'ht\ttps://evil.tld/fr'],
		['a line feed inside', '/\n/evil.tld'],
		['a carriage return inside', '/\r/evil.tld'],
		['a line feed at the end', '/fr/dashboard\n'],
		['a space in front', ' //evil.tld'],
		['a NUL in front', '\u0000//evil.tld'],
		['a script', 'javascript:alert(1)'],
		['a script, mixed case', 'JaVaScRiPt:alert(1)'],
		['a script with a page path', 'javascript://beswib.com/fr/%0Aalert(1)'],
		['a data address', 'data:text/html,<script>alert(1)</script>'],
		['dot segments that leave the locale for a second slash', '/fr/..//evil.tld'],
		['encoded dot segments that do the same', '/fr/%2e%2e//evil.tld'],
		['two slashes after the origin of the site', 'https://beswib.com//evil.tld'],
	])('refuses %s', (_name, value) => {
		expect(safeRedirectPath(value, ORIGIN)).toBeNull()
	})

	it.each([
		['empty', ''],
		['null', null],
		['undefined', undefined],
		['a space', ' '],
		['a slash alone', '/'],
		['a query string alone', '?redirect_url=/fr'],
	])('refuses a value that names no page: %s', (_name, value) => {
		expect(safeRedirectPath(value, ORIGIN)).toBeNull()
	})

	it.each([
		['an API route', '/api/waitlist/remove?token=abc'],
		['a file', '/beswib.svg'],
		['a path without its locale', '/dashboard/seller'],
		['a locale that does not exist', '/xx/dashboard'],
		['a locale in capitals', '/FR/dashboard'],
		['a word that starts like a locale', '/france/dashboard'],
		['an encoded locale', '/%66r/dashboard'],
	])('refuses a path of the site that is not a page: %s', (_name, value) => {
		expect(safeRedirectPath(value, ORIGIN)).toBeNull()
	})

	it('refuses a very long value, even one that names a page', () => {
		expect(safeRedirectPath(`/fr/marketplace/${'a'.repeat(100_000)}`, ORIGIN)).toBeNull()
		expect(safeRedirectPath(`/fr/marketplace?tkn=${'a'.repeat(2048)}`, ORIGIN)).toBeNull()
		expect(safeRedirectPath(`https://beswib.com/fr/${'a/'.repeat(5000)}`, ORIGIN)).toBeNull()
	})

	it('accepts a value as long as an address can reasonably be', () => {
		const path = `/fr/marketplace/abcdefghij12345?tkn=${'a'.repeat(1900)}`

		expect(safeRedirectPath(path, ORIGIN)).toBe(path)
	})

	it('answers null, and does not throw, when the origin it is given is not one', () => {
		expect(safeRedirectPath('/fr/dashboard', '')).toBeNull()
		expect(safeRedirectPath('/fr/dashboard', 'not an origin')).toBeNull()
	})

	it('only ever answers with a path that a browser keeps on the site', () => {
		const accepted = [
			'/fr/marketplace/abc?tkn=x',
			'https://beswib.com/en/dashboard',
			'/fr//evil.tld',
			'/fr/%2F%2Fevil.tld',
			'/fr/@evil.tld',
			'/fr/https://evil.tld',
			'fr/dashboard',
		].map(value => safeRedirectPath(value, ORIGIN))

		for (const path of accepted) {
			expect(path).toMatch(/^\/(en|fr)(\/|$)/)
			expect(landsOn(path ?? '//evil.tld')).toBe(ORIGIN)
		}
	})
})

describe('returnPathFrom and afterAuthPath', () => {
	it('reads redirect_url from the query string of the form', () => {
		expect(returnPathFrom('?redirect_url=%2Ffr%2Fmarketplace%2Fabc%3Ftkn%3Dx', ORIGIN)).toBe(
			'/fr/marketplace/abc?tkn=x'
		)
		expect(returnPathFrom('redirect_url=/fr/events/abc', ORIGIN)).toBe('/fr/events/abc')
	})

	it('answers null without the parameter, or with one that names no page of the site', () => {
		expect(returnPathFrom('', ORIGIN)).toBeNull()
		expect(returnPathFrom('?utm_source=newsletter', ORIGIN)).toBeNull()
		expect(returnPathFrom('?redirect_url=', ORIGIN)).toBeNull()
		expect(returnPathFrom('?redirect_url=https%3A%2F%2Fevil.tld%2Ffr', ORIGIN)).toBeNull()
		expect(returnPathFrom('?redirect_url=%2F%2Fevil.tld', ORIGIN)).toBeNull()
	})

	it('judges the value once decoded: an escaped tab or backslash is still one', () => {
		expect(returnPathFrom('?redirect_url=%2F%09%2Fevil.tld', ORIGIN)).toBeNull()
		expect(returnPathFrom('?redirect_url=%2F%5Cevil.tld', ORIGIN)).toBeNull()
	})

	it('sends the visitor back to the page that asked for the sign-in', () => {
		expect(afterAuthPath('?redirect_url=%2Fen%2Fmarketplace%2Fabc', ORIGIN, 'fr')).toBe('/en/marketplace/abc')
	})

	it.each([
		'',
		'?redirect_url=',
		'?redirect_url=%2F%2Fevil.tld',
		'?redirect_url=https%3A%2F%2Fevil.tld',
		'?redirect_url=javascript%3Aalert(1)',
		'?redirectUrl=%2Ffr%2Fprofile',
	])('falls back to the dashboard of the locale for %j', search => {
		expect(afterAuthPath(search, ORIGIN, 'fr')).toBe('/fr/dashboard')
	})
})

describe('signInPath and signUpPath', () => {
	it('name the pages that exist, under /auth', () => {
		expect(signInPath('fr')).toBe('/fr/auth/sign-in')
		expect(signUpPath('fr')).toBe('/fr/auth/sign-up')
		expect(signInPath('ko', null)).toBe('/ko/auth/sign-in')
		expect(signUpPath('ko', '')).toBe('/ko/auth/sign-up')
	})

	it('carry the page to come back to, and the form reads it back unchanged', () => {
		const page = '/fr/marketplace/abcdefghij12345?tkn=s3cr3t&lockedAt=2026-10-13T10:00:00.000Z#buy'

		for (const path of [signInPath('fr', page), signUpPath('fr', page)]) {
			const url = new URL(path, ORIGIN)
			expect(url.searchParams.get('redirect_url')).toBe(page)
			expect(afterAuthPath(url.search, ORIGIN, 'fr')).toBe(page)
		}
	})

	it('keep one parameter, whatever the page to come back to contains', () => {
		const url = new URL(signInPath('fr', '/fr/events/abc?waitlist_success=true&email=a%40b.c'), ORIGIN)

		expect([...url.searchParams.keys()]).toEqual(['redirect_url'])
		expect(url.pathname).toBe('/fr/auth/sign-in')
	})
})

// Where Google or Facebook hands the visitor back: the page to come back to goes there with them
describe('oauthCallbackPath', () => {
	it('names the page that exists, under /auth', () => {
		expect(oauthCallbackPath('fr')).toBe('/fr/auth/sso-callback')
		expect(oauthCallbackPath('ko', null)).toBe('/ko/auth/sso-callback')
		expect(oauthCallbackPath('ko', '')).toBe('/ko/auth/sso-callback')
	})

	it('carries the page to come back to, and the callback page reads it back unchanged', () => {
		const page = '/fr/marketplace/abcdefghij12345?tkn=s3cr3t&lockedAt=2026-10-13T10:00:00.000Z#buy'
		const url = new URL(oauthCallbackPath('fr', page), ORIGIN)

		expect([...url.searchParams.keys()]).toEqual(['redirect_url'])
		expect(afterAuthPath(url.search, ORIGIN, 'fr')).toBe(page)
	})
})

describe('isOAuthCallbackPath', () => {
	it.each(i18n.locales)('knows the callback page of the %s locale', locale => {
		expect(isOAuthCallbackPath(new URL(oauthCallbackPath(locale, '/fr/profile'), ORIGIN).pathname)).toBe(true)
	})

	it('knows it with a trailing slash too', () => {
		expect(isOAuthCallbackPath('/fr/auth/sso-callback/')).toBe(true)
	})

	it.each([
		'/fr/auth/sign-in',
		'/fr/auth/sso-callback/more',
		'/fr/auth/sso-callback//',
		'/xx/auth/sso-callback',
		'/auth/sso-callback',
		'/fr/sso-callback',
		'/fr/marketplace/abcdefghij12345',
		'',
		null,
		undefined,
	])('answers no for %j', pathname => {
		expect(isOAuthCallbackPath(pathname)).toBe(false)
	})
})
