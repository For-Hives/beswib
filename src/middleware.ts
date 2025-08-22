import { NextRequest, NextResponse } from 'next/server'

// Simple regex patterns for route matching
const isPublicRoute = (pathname: string): boolean => {
	return (
		/^\/(en|fr|de|es|it|pt|nl|ro|ko)$/.test(pathname) || // Home pages in all locales
		/^\/(en|fr|de|es|it|pt|nl|ro|ko)\/(events|marketplace|faq|contact|legals)/.test(pathname) || // Public content pages
		/^\/(en|fr|de|es|it|pt|nl|ro|ko)\/events\/[^\/]+$/.test(pathname) || // Event detail pages
		/^\/(en|fr|de|es|it|pt|nl|ro|ko)\/marketplace\/[^\/]+$/.test(pathname) || // Marketplace detail pages
		pathname === '/robots.txt' ||
		pathname === '/sitemap.xml' ||
		pathname.startsWith('/api') // All API routes
	)
}

const isProtectedRoute = (pathname: string): boolean => {
	return /^\/(en|fr|de|es|it|pt|nl|ro|ko)\/(admin|profile|dashboard|purchase)/.test(pathname)
}

const isAuthRoute = (pathname: string): boolean => {
	return /^\/(en|fr|de|es|it|pt|nl|ro|ko)\/auth\/(sign-in|sign-up|forgot-password)/.test(pathname)
}

// Handle root page redirection for language detection
function handleRootRedirect(request: NextRequest) {
	const { pathname } = request.nextUrl

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

		return NextResponse.redirect(redirectUrl)
	}

	return null
}

// Main middleware function - NOT using clerkMiddleware for public routes
export default function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Skip static files and internal Next.js routes
	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/favicon.ico') ||
		/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/.test(pathname)
	) {
		return NextResponse.next()
	}

	// Handle root page redirection first
	const rootRedirect = handleRootRedirect(request)
	if (rootRedirect) {
		return rootRedirect
	}

	// Check if this is a public route - allow access without ANY Clerk interference
	if (isPublicRoute(pathname)) {
		console.info('🌐 Public route accessed:', pathname)
		return NextResponse.next()
	}

	// Check if this is an auth route - allow access without authentication
	if (isAuthRoute(pathname)) {
		console.info('🔐 Auth route accessed:', pathname)
		return NextResponse.next()
	}

	// For protected routes ONLY, apply Clerk authentication
	if (isProtectedRoute(pathname)) {
		console.info('🔒 Protected route accessed:', pathname)
		// For now, redirect to sign-in for protected routes
		// This will be handled by Clerk at the page level
		const localeMatch = pathname.match(/^\/(en|fr|de|es|it|pt|nl|ro|ko)/)
		const currentLocale = localeMatch?.[1]
		if (currentLocale !== undefined && currentLocale.length > 0) {
			const signInUrl = new URL(`/${currentLocale}/auth/sign-in`, request.url)
			return NextResponse.redirect(signInUrl)
		}
		return NextResponse.next()
	}

	// For all other routes, let them pass through normally
	console.info('🔍 Other route processed normally:', pathname)
	return NextResponse.next()
}

// Configure middleware matcher
export const config = {
	matcher: [
		// Skip static files and API routes
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
	],
}
