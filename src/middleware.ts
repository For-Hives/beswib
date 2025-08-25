import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

import { i18n } from '@/lib/i18n/config'

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

			const cookieLocale = cookies['NEXT_LOCALE']
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
const isProtectedRoute = createRouteMatcher([
	'/(.*)/dashboard(.*)',
	'/(.*)/profile(.*)',
	'/(.*)/purchase(.*)',
	'/(.*)/admin(.*)',
])

// Define public routes that should redirect authenticated users away
const isPublicAuthRoute = createRouteMatcher([
	'/(.*)/auth/sign-in(.*)',
	'/(.*)/auth/sign-up(.*)',
	'/(.*)/auth/forgot-password',
])

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
	const pathnameHasLocale = i18n.locales.some(locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

	if (!pathnameHasLocale) {
		// Redirect if there is no locale - use smart locale detection 🧠
		const locale = getLocaleFromRequest(request)
		request.nextUrl.pathname = `/${locale}${pathname}`
		return NextResponse.redirect(request.nextUrl)
	}

	// Extract locale from pathname for proper redirects
	const currentLocale =
		i18n.locales.find(locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) ?? i18n.defaultLocale

	// Protect routes that require authentication
	if (isProtectedRoute(request)) {
		await auth.protect()
	}

	// Redirect authenticated users away from auth pages
	const { userId } = await auth()
	if (isPublicAuthRoute(request) && typeof userId === 'string' && userId.length > 0) {
		return NextResponse.redirect(new URL(`/${currentLocale}/dashboard`, request.url))
	}

	return NextResponse.next()
})

export const config = {
	matcher: [
		// Skip Next.js internals and all static files
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',

		// Include only specific API routes that need auth context (not all API routes)
		// Most webhooks don't need auth, so we exclude them from middleware processing
		'/(api/maintenance|api/validate-private-token)(.*)',
		// Match all other routes except Next internals, files with extensions, and webhook APIs
		'/((?!api/webhooks|.+\\.[\\w]+$|_next).*)',
	],
}
