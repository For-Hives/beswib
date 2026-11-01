import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { type NextRequest, NextResponse } from 'next/server'

import { i18n } from '@/lib/i18n/config'
import { returnPathFrom, signInPath, signUpPath } from '@/lib/utils/redirect'
import { getPublicBaseUrl } from '@/lib/utils/url'

export function getLocaleFromRequest(request: NextRequest): string {
	try {
		// 1. Check for language preference in cookies first 🍪
		// Note: localStorage is not accessible server-side, so we rely on cookies
		// The client-side components will prioritize localStorage over cookies
		const cookieHeader = request.headers.get('cookie')
		if (cookieHeader != null && cookieHeader.length > 0) {
			const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
				const [key, value] = cookie.trim().split('=')
				if (key && value) {
					acc[key] = value
				}
				return acc
			}, {})

			const cookieLocale = cookies.NEXT_LOCALE
			if (cookieLocale && (i18n.locales as readonly string[]).includes(cookieLocale)) {
				return cookieLocale
			}
		}

		// 2. Fallback to Accept-Language header 🌐
		const acceptLanguage = request.headers.get('accept-language') ?? ''

		// Parse the accept-language header to find the preferred language 🗣️
		const languages =
			acceptLanguage.length > 0
				? acceptLanguage
						.split(',')
						.map(lang => {
							const [code, quality = '1'] = lang.trim().split(';q=')
							return {
								quality: parseFloat(quality),
								code: code.split('-')[0],
							}
						})
						.sort((a, b) => b.quality - a.quality)
				: []

		// Find the first supported language 🥇
		if (languages.length > 0) {
			for (const lang of languages) {
				if ((i18n.locales as readonly string[]).includes(lang.code)) {
					return lang.code
				}
			}
		}

		// 3. Return default locale as fallback 🤷
		return i18n.defaultLocale
	} catch {
		// During static generation or if any error occurs 🏗️
		// Return default locale 🤷‍♂️
		return i18n.defaultLocale
	}
}

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher(['/(.*)/dashboard(.*)', '/(.*)/profile(.*)', '/(.*)/admin(.*)'])

// Beswib is archived: this page only says that no bib can be listed any more, and says it to anyone
const isArchivedNoticeRoute = createRouteMatcher(['/(.*)/dashboard/seller/sell-bib(.*)'])

// Define public routes that should redirect authenticated users away
const isPublicAuthRoute = createRouteMatcher([
	'/(.*)/auth/sign-in(.*)',
	'/(.*)/auth/sign-up(.*)',
	'/(.*)/auth/forgot-password',
])

// The locale a pathname starts with, when it starts with one
function localeOfPathname(pathname: string) {
	return i18n.locales.find(locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)
}

// auth.protect() sends a signed-out visitor to the sign-in page, with the address they asked for in
// redirect_url. The page is named here, in the locale of the request: otherwise Clerk reads
// NEXT_PUBLIC_CLERK_SIGN_IN_URL, a single value that cannot name nine locales, or without it
// leaves the site for its own Account Portal.
function authPages(request: NextRequest) {
	const locale = localeOfPathname(request.nextUrl.pathname) ?? getLocaleFromRequest(request)
	return { signUpUrl: signUpPath(locale), signInUrl: signInPath(locale) }
}

// The address of the site as Clerk reads it from the request, which is the one it writes in
// redirect_url: what the proxy forwards first (its first value: each proxy on the way adds its
// own), the Host header otherwise. Null when the request says neither.
function requestOrigin(request: NextRequest): string | null {
	const firstValue = (name: string) => request.headers.get(name)?.split(',')[0]?.trim()
	const host = firstValue('x-forwarded-host') || request.headers.get('host')
	if (host == null || host === '') return null
	const protocol = firstValue('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '')
	return `${protocol}://${host}`
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
	const { pathname } = request.nextUrl

	// CRITICAL: Let SEO files pass through completely without any processing
	// This prevents any redirects or locale handling for SEO files
	if (pathname === '/robots.txt' || pathname === '/sitemap.xml') {
		return NextResponse.next()
	}

	// CRITICAL: Let API routes pass through completely without any processing
	// This prevents any redirects or locale handling for webhooks and API endpoints
	if (pathname.startsWith('/api')) {
		return NextResponse.next()
	}

	// Check if there is any supported locale in the pathname 🗺️
	const currentLocale = localeOfPathname(pathname)

	if (currentLocale === undefined) {
		// Redirect if there is no locale - use smart locale detection 🧠
		const locale = getLocaleFromRequest(request)
		request.nextUrl.pathname = `/${locale}${pathname}`
		return NextResponse.redirect(request.nextUrl)
	}

	// Protect routes that require authentication
	if (isProtectedRoute(request) && !isArchivedNoticeRoute(request)) {
		await auth.protect()
	}

	// Redirect authenticated users away from auth pages: to the page that sent them to the form when
	// it named itself, to their dashboard otherwise. The forms go to the same place once the session
	// is active, and Clerk refreshes the route at that moment: the two answers must agree.
	const { userId } = await auth()
	if (isPublicAuthRoute(request) && typeof userId === 'string' && userId.length > 0) {
		// Clerk writes the return address in full, with the address the visitor sees: the public one,
		// or the one of this request when the deployment is not on the address it was built for
		// (never request.url: behind the proxy that is the address the server listens on). Only the
		// path is kept, and the redirect stays on the address of the request whatever a header says.
		const { search } = request.nextUrl
		const origin = requestOrigin(request)
		const returnTo =
			returnPathFrom(search, getPublicBaseUrl()) ?? (origin === null ? null : returnPathFrom(search, origin))
		return NextResponse.redirect(new URL(returnTo ?? `/${currentLocale}/dashboard`, request.url))
	}

	return NextResponse.next()
}, authPages)

export const config = {
	matcher: [
		// Skip Next.js internals and all static files
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|riv|wasm)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',

		// Include only specific API routes that need auth context (not all API routes)
		// Most webhooks don't need auth, so we exclude them from middleware processing
		'/(api/maintenance|api/validate-private-token)(.*)',
		// Match all other routes except Next internals, files with extensions, and webhook APIs
		'/((?!api/webhooks|.+\\.[\\w]+$|_next).*)',
	],
}
