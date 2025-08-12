// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/#app-router

import * as Sentry from '@sentry/nextjs'

Sentry.init({
	// Route events via Next tunnel to avoid ad-blockers
	tunnel: '/monitoring',
	tracesSampleRate: 1,
	// Use NEXT_PUBLIC_ prefix for client-side env exposure; fallback to SENTRY_DSN if inlined at build
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN,
	debug: false,
})
