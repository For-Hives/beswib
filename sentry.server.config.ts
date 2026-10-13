// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

import { dataCollection } from './sentry.data-collection'

Sentry.init({
	// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
	tracesSampleRate: 1,

	// Sentry 11 streams spans as they end by default. This keeps sending whole transactions, as 10.x did: the same
	// kind of item and about as many of them, so the quota and the Performance views of the Sentry project keep
	// working. To remove once streaming has been checked on the project: Sentry plans to drop the option in a
	// later major.
	//
	// It does not keep every name. With 11, the outer transaction of a request is named by its method alone
	// (`GET`, `POST`, `RSC GET` where 10.x said `GET /en/faq`) and the middleware op is `middleware` (was
	// `http.server.middleware`). The routed transaction, `GET /[locale]/faq`, is unchanged. A saved search, a
	// dashboard or an alert written against the old names stops matching.
	traceLifecycle: 'static',

	dsn: process.env.SENTRY_DSN,

	// Required since Sentry 11: without it the SDK sends cookies, request bodies and IP addresses by default
	dataCollection,

	// Prints the SDK's own logs to the console while setting Sentry up. Since Sentry 11 it only does so once
	// `bundleSizeOptimizations.excludeDebugStatements` is turned off in next.config.ts: that option now applies
	// to Turbopack builds too and removes the logging code from the bundles.
	debug: false,
})
