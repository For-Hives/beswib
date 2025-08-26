'use client'

import { useEffect } from 'react'

// Ensure Sentry client config is executed on the browser even in dev/Turbopack
// We dynamic-import the root client config so it never runs during SSR
export default function SentryClientInit() {
	useEffect(() => {
		// relative from this file to project root
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		import('../../../instrumentation-client')
	}, [])
	return null
}
