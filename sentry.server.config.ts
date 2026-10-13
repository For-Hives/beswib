// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
	// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
	tracesSampleRate: 1,

	// Enable logs to be sent to Sentry

	dsn: process.env.SENTRY_DSN,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: false,

	// Never read the body of an incoming request. The arguments of the server actions travel there (the
	// token of a private listing at every purchase step, what a form posts), and the SDK attaches what it
	// read to every error and trace of the request, whether sendDefaultPii is set or not.
	// This replaces the Http integration that @sentry/nextjs sets up, hence disableIncomingRequestSpans:
	// it is the option it passes itself, because Next.js already traces incoming requests.
	integrations: [Sentry.httpIntegration({ maxIncomingRequestBodySize: 'none', disableIncomingRequestSpans: true })],
})
