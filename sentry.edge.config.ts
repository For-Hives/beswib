// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

import { dataCollection } from './sentry.data-collection'

Sentry.init({
	// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
	tracesSampleRate: 1,
	// Whole transactions rather than streamed spans, as in sentry.server.config.ts (which also says what 11 renames)
	traceLifecycle: 'static',
	dsn: process.env.SENTRY_DSN,
	// Required since Sentry 11: without it the SDK sends cookies, request bodies and IP addresses by default
	dataCollection,
	// Only prints once `bundleSizeOptimizations.excludeDebugStatements` is off, as in sentry.server.config.ts
	debug: false,
})
