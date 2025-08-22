import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

// Create route matchers for better performance and cleaner code
const isPublicRoute = createRouteMatcher([
	'/(en|fr|de|es|it|pt|nl|ro|ko)',
	'/(en|fr|de|es|it|pt|nl|ro|ko)/(events|marketplace|faq|contact|legals)',
	'/(en|fr|de|es|it|pt|nl|ro|ko)/events/(.*)',
	'/(en|fr|de|es|it|pt|nl|ro|ko)/marketplace/(.*)',
	'/robots.txt',
	'/sitemap.xml',
	'/api/(.*)',
])

const isProtectedRoute = createRouteMatcher(['/(en|fr|de|es|it|pt|nl|ro|ko)/(admin|profile|dashboard|purchase)'])

const isAuthRoute = createRouteMatcher(['/(en|fr|de|es|it|pt|nl|ro|ko)/auth/(sign-in|sign-up|forgot-password)'])

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

// Export the Clerk middleware with proper route protection
export default clerkMiddleware(async (auth, request: NextRequest) => {
	const { pathname } = request.nextUrl

	// Handle root page redirection first
	const rootRedirect = handleRootRedirect(request)
	if (rootRedirect) {
		return rootRedirect
	}

	// Check if this is a public route - allow access without authentication
	if (isPublicRoute(request)) {
		console.info('🌐 Public route accessed:', pathname)
		return NextResponse.next()
	}

	// Check if this is an auth route - allow access without authentication
	if (isAuthRoute(request)) {
		console.info('🔐 Auth route accessed:', pathname)
		return NextResponse.next()
	}

	// For protected routes, require authentication
	if (isProtectedRoute(request)) {
		console.info('🔒 Protected route accessed:', pathname)
		// Get auth info and redirect if not authenticated
		const { userId, redirectToSignIn } = await auth()

		if (userId === null || userId === undefined) {
			// Extract locale from pathname for proper redirect
			const localeMatch = pathname.match(/^\/(en|fr|de|es|it|pt|nl|ro|ko)/)
			const currentLocale = localeMatch?.[1]
			if (currentLocale !== undefined && currentLocale.length > 0) {
				// Redirect to sign-in page in the correct locale
				return redirectToSignIn()
			}
		}

		return NextResponse.next()
	}

	// For all other routes, let them pass through normally
	console.info('🔍 Other route processed normally:', pathname)
	return NextResponse.next()
})

// Configure Clerk to use our public routes
export const config = {
	matcher: [
		// Skip Next.js internals and all static files
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',
	],
}
