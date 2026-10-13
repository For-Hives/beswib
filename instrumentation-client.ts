// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/#app-router

import * as Sentry from '@sentry/nextjs'

import { dataCollection } from './sentry.data-collection'

Sentry.init({
	// Use a relative tunnel; we import this config only on the client, so it will resolve to the correct origin
	tunnel: '/api/monitoring',
	tracesSampleRate: 1,
	// Whole transactions rather than streamed spans, as in sentry.server.config.ts
	traceLifecycle: 'static',
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN,
	// Required since Sentry 11: without it the SDK infers the visitor's IP address and sends cookies by default
	dataCollection,
	debug: false,
})

// Export the router transition start hook as required by Sentry
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
