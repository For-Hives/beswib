// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/#app-router

import * as Sentry from '@sentry/nextjs'

Sentry.init({
	// Use a relative tunnel; we import this config only on the client, so it will resolve to the correct origin
	tunnel: '/api/monitoring',
	tracesSampleRate: 1,
	enableLogs: true,
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN,
	debug: true,
})
