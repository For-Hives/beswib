// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

import { dataCollection } from './sentry.data-collection'

Sentry.init({
	// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
	tracesSampleRate: 1,

	// Sentry 11 streams spans as they end by default. This keeps sending whole transactions, as 10.x did, so that
	// the quotas, dashboards and alerts of the Sentry project do not change with the upgrade. To remove once
	// streaming has been checked on the project: Sentry plans to drop the option in a later major.
	traceLifecycle: 'static',

	dsn: process.env.SENTRY_DSN,

	// Required since Sentry 11: without it the SDK sends cookies, request bodies and IP addresses by default
	dataCollection,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: false,
})
