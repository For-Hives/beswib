import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

import { i18n } from '@/lib/i18n/config'

export function getLocaleFromRequest(request: NextRequest): string {
	try {
		// 1. Check for language preference in cookies first 🍪
		const cookieHeader = request.headers.get('cookie')
		if (cookieHeader !== null && cookieHeader.length > 0) {
			const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
				const [key, value] = cookie.trim().split('=')
				if (key && value) {
					acc[key] = value
				}
				return acc
			}, {})

			const cookieLocale = cookies['NEXT_LOCALE']
			if (cookieLocale && (i18n?.locales as readonly string[])?.includes(cookieLocale)) {
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
				if ((i18n?.locales as readonly string[])?.includes(lang.code)) {
					return lang.code
				}
			}
		}

		// 3. Return default locale as fallback 🤷
		return i18n?.defaultLocale ?? 'en'
	} catch {
		// During static generation or if any error occurs 🏗️
		// Return default locale 🤷‍♂️
		return i18n?.defaultLocale ?? 'en'
	}
}

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
	'/(.*)/dashboard(.*)',
	'/(.*)/profile(.*)',
	'/(.*)/purchase(.*)',
	'/(.*)/admin(.*)',
])

// Define public routes that should never redirect to auth
const isPublicRoute = createRouteMatcher([
	'/(en|fr|de|es|it|pt|nl|ro|ko)$', // Home pages in all locales exactly
	'/(en|fr|de|es|it|pt|nl|ro|ko)/(events|marketplace|faq|contact|legals)(.*)', // Public content pages
])

// Define public routes that should redirect authenticated users away
const isPublicAuthRoute = createRouteMatcher([
	'/(.*)/auth/sign-in(.*)',
	'/(.*)/auth/sign-up(.*)',
	'/(.*)/auth/forgot-password',
])

export default async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// CRITICAL: Let API routes pass through completely without any processing
	// This prevents any redirects or locale handling for webhooks and API endpoints
	if (pathname.startsWith('/api')) {
		return NextResponse.next()
	}

	// Handle root page redirection BEFORE Clerk middleware
	// This ensures bots get redirected to /en before Clerk can interfere
	if (pathname === '/') {
		const acceptLanguage = request.headers.get('accept-language') ?? 'en'
		const preferredLanguage = acceptLanguage.split(',')[0]?.split('-')[0] ?? 'en'

		const languageMap: Record<string, string> = {
			ro: 'ro',
			pt: 'pt',
			nl: 'nl',
			ko: 'ko',
			it: 'it',
			fr: 'fr',
			es: 'es',
			en: 'en',
			de: 'de',
		}

		const targetLocale = languageMap[preferredLanguage] ?? 'en'
		const redirectUrl = new URL(`/${targetLocale}`, request.url)

		console.info('🌐 Redirecting / to:', redirectUrl.pathname)
		return NextResponse.redirect(redirectUrl)
	}

	// Handle other public pages (robots.txt, sitemap.xml, etc.)
	if (pathname === '/robots.txt' || pathname === '/sitemap.xml') {
		return NextResponse.next()
	}

	// Check if this is a public page that should bypass Clerk completely
	// This includes all locale home pages and public content pages
	const isPublicPage =
		pathname.match(/^\/(en|fr|de|es|it|pt|nl|ro|ko)$/) !== null || // Home pages in all locales
		pathname.match(/^\/(en|fr|de|es|it|pt|nl|ro|ko)\/(events|marketplace|faq|contact|legals)(.*)$/) !== null // Public content pages

	if (isPublicPage) {
		console.info('🚫 Bypassing Clerk for public page:', pathname)
		return NextResponse.next()
	}

	// For all other routes, apply Clerk middleware
	return clerkMiddleware(async (auth, req: NextRequest) => {
		const { pathname: reqPathname } = req.nextUrl

		// Check if there is any supported locale in the pathname 🗺️
		const pathnameHasLocale =
			(i18n?.locales as readonly string[])?.some(
				locale => reqPathname.startsWith(`/${locale}/`) || reqPathname === `/${locale}`
			) ?? false

		if (!pathnameHasLocale) {
			// Redirect if there is no locale - use smart locale detection 🧠
			const locale = getLocaleFromRequest(req)
			req.nextUrl.pathname = `/${locale}${reqPathname}`
			return NextResponse.redirect(req.nextUrl)
		}

		// Extract locale from pathname for proper redirects
		const currentLocale =
			(i18n?.locales as readonly string[])?.find(
				locale => reqPathname.startsWith(`/${locale}/`) || reqPathname === `/${locale}`
			) ??
			i18n?.defaultLocale ??
			'en'

		// For public routes, don't force authentication but still get auth context
		if (isPublicRoute(req) && !isProtectedRoute(req)) {
			// Let public pages access auth state without forcing authentication
			// This allows bots to crawl and users to see content
			return NextResponse.next()
		}

		// Skip auth for robots.txt and other static files
		if (reqPathname.startsWith('/robot') || reqPathname.includes('.')) {
			return NextResponse.next()
		}

		// Protect routes that require authentication
		if (isProtectedRoute(req)) {
			await auth.protect()
		}

		// Redirect authenticated users away from auth pages
		const { userId } = await auth()
		if (isPublicAuthRoute(req) && typeof userId === 'string' && userId.length > 0) {
			return NextResponse.redirect(new URL(`/${currentLocale}/dashboard`, req.url))
		}

		return NextResponse.next()
	})(request)
}

export const config = {
	matcher: [
		// Include only specific API routes that need auth context (not all API routes)
		// Most webhooks don't need auth, so we exclude them from middleware processing
		'/(api/maintenance|api/validate-private-token)(.*)',
		// Match all other routes except Next internals, files with extensions, webhook APIs
		// Exclude public pages that don't need auth protection but still need locale handling
		'/((?!api/webhooks|.+\\.[\\w]+$|_next).*)',
	],
}
