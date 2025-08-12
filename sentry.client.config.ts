// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/#app-router

import * as Sentry from '@sentry/nextjs'

Sentry.init({
	// Force the SDK to use the local tunnel (with trailing slash to avoid 308)
	tunnel: `${location.origin}/monitoring/`,
	tracesSampleRate: 1,
	enableLogs: true,
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN,
	debug: true,
})
