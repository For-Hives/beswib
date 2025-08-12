// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/#app-router

import * as Sentry from '@sentry/nextjs'

Sentry.init({
	// Use absolute tunnel to avoid any base path/locale issues in dev
	tunnel: (globalThis?.location?.origin ?? '') + '/monitoring',
	tracesSampleRate: 1,
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN,
	debug: false,
})
