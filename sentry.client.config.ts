// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/#app-router

import * as Sentry from '@sentry/nextjs'

Sentry.init({
	tracesSampleRate: 1,
	dsn: process.env.SENTRY_DSN,
	debug: false,
})
