import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

// Define route patterns
const PUBLIC_FILE = /\.(.*)$/
const PUBLIC_ROUTES = ['/robots.txt', '/sitemap.xml', '/api']

// Create route matchers for better performance
const isPublicRoute = createRouteMatcher([
	'/:locale(?:en|fr|de|es|it|pt|nl|ro|ko)',
	'/:locale(?:en|fr|de|es|it|pt|nl|ro|ko)/(events|marketplace|faq|contact|legals)',
	'/:locale(?:en|fr|de|es|it|pt|nl|ro|ko)/events/:id*',
	'/:locale(?:en|fr|de|es|it|pt|nl|ro|ko)/marketplace/:id*',
	'/:locale(?:en|fr|de|es|it|pt|nl|ro|ko)/auth/(sign-in|sign-up|forgot-password)',
	'/:locale(?:en|fr|de|es|it|pt|nl|ro|ko)/unauthorized',
	'/api/:path*',
	'/robots.txt',
	'/sitemap.xml',
])

const isProtectedRoute = createRouteMatcher([
	'/:locale(?:en|fr|de|es|it|pt|nl|ro|ko)/(admin|profile|dashboard|purchase)',
])

const isAuthRoute = createRouteMatcher([
	'/:locale(?:en|fr|de|es|it|pt|nl|ro|ko)/auth/(sign-in|sign-up|forgot-password)',
])

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

// Main middleware function
export default async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Skip static files and internal Next.js routes
	if (pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico') || PUBLIC_FILE.test(pathname)) {
		return NextResponse.next()
	}

	// Handle root page redirection first
	const rootRedirect = handleRootRedirect(request)
	if (rootRedirect) {
		return rootRedirect
	}

	// Check if this is a public route - allow access without authentication
	if (isPublicRoute(pathname)) {
		console.info('🌐 Public route accessed:', pathname)
		return NextResponse.next()
	}

	// Check if this is an auth route - allow access without authentication
	if (isAuthRoute(pathname)) {
		console.info('🔐 Auth route accessed:', pathname)
		return NextResponse.next()
	}

	// For protected routes, apply Clerk authentication
	if (isProtectedRoute(pathname)) {
		console.info('🔒 Protected route accessed:', pathname)
		return clerkMiddleware(request)
	}

	// For all other routes, let Clerk handle them normally
	console.info('🔍 Other route processed by Clerk:', pathname)
	return clerkMiddleware(request)
}

// Configure middleware matcher
export const config = {
	matcher: [
		// Skip static files and API routes
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}
