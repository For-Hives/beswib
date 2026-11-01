// @vitest-environment node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET as robots } from '@/app/robots.txt/route'
import { GET as sitemap } from '@/app/sitemap.xml/route'
import { i18n } from '@/lib/i18n/config'
import { forgotPasswordPath, oauthCallbackPath, signInPath, signUpPath } from '@/lib/utils/redirect'
import { getAllEvents } from '@/services/event.services'
import { mockEvent } from '@/tests/mocks/data'

vi.mock('@/services/event.services', () => ({ getAllEvents: vi.fn() }))

// Every address the app sends a visitor to must be a route of the app. Nothing else checks it: a
// link is a string, and a string that names no page compiles, builds and shows the not-found page
// in production (/{locale}/sign-in, /dashboard/seller/list-bib and /en/paypal/callback all did).
//
// The routes are read from src/app, the targets from the source of the whole app: href, router.push,
// router.replace, redirect, and the addresses built on the public address of the site (e-mails,
// PayPal return addresses).

const ROOT = resolve(process.cwd(), 'src')
const APP = join(ROOT, 'app')
const PUBLIC = resolve(process.cwd(), 'public')

function listFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
		entry.isDirectory() ? listFiles(join(directory, entry.name)) : [join(directory, entry.name)]
	)
}

const posix = (path: string) => path.split(sep).join('/')

interface Route {
	/** Under [locale]: asked without a locale, the middleware adds one */
	localized: boolean
	segments: string[]
}

const routes: Route[] = listFiles(APP)
	.map(file => posix(relative(APP, file)))
	.filter(file => /(^|\/)(page\.tsx|route\.ts|opengraph-image\.tsx)$/.test(file))
	// The catch-all page only answers notFound(): it is what a dead link lands on
	.filter(file => !file.includes('[...slug]'))
	.map(file => {
		// A page or a handler answers at its directory, a share image one segment below
		const segments = file.replace(/\/?(page\.tsx|route\.ts|\.tsx)$/, '').split('/')
		const localized = segments[0] === '[locale]'
		return { segments: (localized ? segments.slice(1) : segments).filter(segment => segment !== ''), localized }
	})

function matches(route: Route, target: string[]): boolean {
	const optionalCatchAll = /^\[\[\.\.\..+\]\]$/.test(route.segments.at(-1) ?? '')
	const fixed = optionalCatchAll ? route.segments.slice(0, -1) : route.segments
	if (optionalCatchAll ? target.length < fixed.length : target.length !== fixed.length) return false
	// A dynamic segment of the route takes any value, and so does a placeholder of the target
	return fixed.every(
		(segment, index) => /^\[.+\]$/.test(segment) || target[index] === '{}' || segment === target[index]
	)
}

function isLocale(segment: string | undefined): boolean {
	return (i18n.locales as readonly string[]).includes(segment ?? '')
}

function isPublicFile(pathname: string): boolean {
	const file = join(PUBLIC, pathname)
	return existsSync(file) && statSync(file).isFile()
}

/** True when a path (query string and hash allowed) is answered by a page, a route handler or a public file. */
function isRoute(path: string): boolean {
	const pathname = path.split(/[?#]/)[0] ?? ''
	if (isPublicFile(pathname)) return true

	const segments = pathname.split('/').filter(segment => segment !== '')
	if (isLocale(segments[0]) || segments[0] === '{locale}') {
		return routes.some(route => route.localized && matches(route, segments.slice(1)))
	}
	return routes.some(route => matches(route, segments))
}

// Where a target is written. The address follows as a string or a template literal.
const CONTEXTS = [
	/\bhref=\{?\s*(['"`])(\/[^'"`]*)\1/g,
	/\bhref:\s*(['"`])(\/[^'"`]*)\1/g,
	/\brouter\.(?:push|replace)\(\s*(['"`])(\/[^'"`]*)\1/g,
	/\b(?:redirect|permanentRedirect)\(\s*(['"`])(\/[^'"`]*)\1/g,
	// On the public address of the site: `${baseUrl}/fr/profile`
	/(\$\{(?:baseUrl|siteUrl|getPublicBaseUrl\(\))\})(\/[^`]*)/g,
]

// Files where one of these names something else than a page of the site
const EXEMPT = new Map([
	['tests/', 'the tests'],
	['lib/utils/imageUrl.ts', 'baseUrl is the address of PocketBase there'],
])

// Targets that are no route and are meant to be none. Each one says why.
const NOT_A_ROUTE = new Map([
	['/not-found', 'the admin pages send a visitor who is not an admin to the not-found page this way'],
])

interface Target {
	file: string
	line: number
	/** As written, placeholders included */
	written: string
	/** What is judged: ${locale} is {locale}, any other placeholder is {} */
	path: string
}

function readTarget(written: string): string | null {
	const path = written
		.replace(/\$\{([^{}]*)\}/g, (_match, expression: string) => (/^\w*loc\w*$/i.test(expression) ? '{locale}' : '{}'))
		// A placeholder the pattern cut in two (it contained a quote), then whatever follows the address
		.replace(/\$\{.*$/, '{}')
		.split(/["'\s<>),\\]/)[0]
		?.split(/[?#]/)[0]
	if (path === undefined || path === '') return null
	// Nothing written to judge: `/${locale}/${page}`
	const literal = path.split('/').filter(segment => segment !== '' && segment !== '{locale}' && segment !== '{}')
	return literal.length === 0 && path.includes('{}') ? null : path
}

function listTargets(): Target[] {
	const targets: Target[] = []
	for (const full of listFiles(ROOT)) {
		const file = posix(relative(ROOT, full))
		if (!/\.(ts|tsx)$/.test(file) || [...EXEMPT.keys()].some(prefix => file.startsWith(prefix))) continue

		readFileSync(full, 'utf8')
			.split('\n')
			.forEach((text, index) => {
				// A comment may show a link as an example
				if (/^\s*(\/\/|\/?\*)/.test(text)) return
				for (const context of CONTEXTS) {
					for (const match of text.matchAll(context)) {
						const path = readTarget(match[2] ?? '')
						if (path !== null) targets.push({ written: match[2] ?? '', path, line: index + 1, file })
					}
				}
			})
	}
	return targets
}

const targets = listTargets()

beforeEach(() => {
	vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://beswib.com')
	vi.mocked(getAllEvents).mockResolvedValue([mockEvent])
})

afterEach(() => {
	vi.unstubAllEnvs()
	vi.clearAllMocks()
})

describe('the routes of the app, as this test reads them', () => {
	it('finds the pages and the route handlers', () => {
		expect(routes.length).toBeGreaterThan(40)
	})

	it.each([
		'/fr',
		'/fr/',
		'/fr/auth/sign-in',
		'/fr/auth/sign-up',
		'/fr/auth/forgot-password',
		'/fr/auth/sso-callback?redirect_url=%2Ffr%2Fprofile',
		'/fr/dashboard/seller',
		'/fr/dashboard/seller#my-listings',
		'/fr/dashboard/seller/edit-bib/abcdefghij12345',
		'/ko/marketplace/abcdefghij12345?tkn=secret',
		'/fr/legals/privacy-policy',
		'/fr/profile',
		'/marketplace',
		'/api/webhooks/clerk',
		'/sitemap.xml',
		'/beswib.svg',
	])('knows %s', path => {
		expect(isRoute(path)).toBe(true)
	})

	it.each([
		// The three that were in the code
		'/fr/sign-in',
		'/fr/dashboard/seller/list-bib',
		'/en/paypal/callback?trackingId=abcdefghij12345',
		// And their kind
		'/fr/sign-up',
		'/sign-in',
		'/unauthorized',
		'/fr/legals',
		'/fr/legals/privacy',
		'/fr/legals/cookies',
		'/fr/sitemap.xml',
		'/fr/api/webhooks/clerk',
		'/xx/marketplace',
		'/fr/not-found',
		// A directory of public/ is not a file of it
		'/landing',
	])('does not know %s', path => {
		expect(isRoute(path)).toBe(false)
	})
})

describe('the addresses the app sends a visitor to', () => {
	it('are found in the source: links, navigations, redirects and addresses built on the public one', () => {
		const found = targets.map(target => `${target.file} ${target.path}`)

		expect(targets.length).toBeGreaterThan(150)
		expect(found).toContain('components/global/HeaderClient.tsx /{locale}/marketplace')
		expect(found).toContain('app/[locale]/dashboard/seller/SellerDashboardClient.tsx /{locale}/dashboard/seller')
		expect(found).toContain('app/[locale]/admin/event/page.tsx /not-found')
		expect(found).toContain('app/[locale]/events/EventListClient.tsx /{locale}/events/{}')
		expect(found).toContain('components/emails/Footer.tsx /legals/privacy-policy')
	})

	it('all name a route of the app', () => {
		const dead = targets
			.filter(target => !isRoute(target.path) && !NOT_A_ROUTE.has(target.path))
			.map(target => `${target.file}:${target.line} ${target.written}`)

		expect(dead).toEqual([])
	})

	it('has no exception that is no longer one', () => {
		for (const path of NOT_A_ROUTE.keys()) {
			expect(isRoute(path)).toBe(false)
			expect(targets.some(target => target.path === path)).toBe(true)
		}
	})

	it.each(i18n.locales)('has a sign-in and a sign-up page in the %s locale', locale => {
		expect(isRoute(signInPath(locale))).toBe(true)
		expect(isRoute(signUpPath(locale, `/${locale}/marketplace/abcdefghij12345`))).toBe(true)
	})

	// The other addresses a sign-in goes through are built by helpers too: no pattern above reads them
	it.each(i18n.locales)('has a page for Google and Facebook to come back to in the %s locale', locale => {
		expect(isRoute(oauthCallbackPath(locale, `/${locale}/marketplace/abcdefghij12345`))).toBe(true)
	})

	it.each(i18n.locales)('has a forgotten-password page in the %s locale', locale => {
		expect(isRoute(forgotPasswordPath(locale, `/${locale}/marketplace/abcdefghij12345`))).toBe(true)
	})
})

describe('the addresses the site announces to search engines', () => {
	const pathOf = (address: string) => address.replace('https://beswib.com', '') || '/'

	it('are all pages of the site, in the sitemap', async () => {
		const xml = await (await sitemap()).text()
		const announced = [...xml.matchAll(/(?:<loc>|href=")(https:\/\/beswib\.com[^<"]*)/g)].map(match => match[1] ?? '')

		expect(announced.length).toBeGreaterThan(100)
		expect([...new Set(announced.filter(address => !isRoute(pathOf(address))))]).toEqual([])
	})

	it('are all answered, for the sitemaps robots.txt names', async () => {
		const text = await robots().text()
		const sitemaps = [...text.matchAll(/^Sitemap: (\S+)$/gm)].map(match => match[1] ?? '')

		expect(sitemaps).toEqual(['https://beswib.com/sitemap.xml'])
		expect(sitemaps.every(address => isRoute(pathOf(address)))).toBe(true)
	})
})
