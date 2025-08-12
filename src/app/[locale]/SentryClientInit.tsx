'use client'

// Ensure Sentry client config is executed on the browser even in dev/Turbopack
// We import the root client config module here so it runs once on the client
// The relative path goes from this file up to repo root
import '../../../sentry.client.config'

export default function SentryClientInit() {
	return null
}
