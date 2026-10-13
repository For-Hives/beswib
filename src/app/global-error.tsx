'use client'

import * as Sentry from '@sentry/nextjs'
import NextError from 'next/error'
import { useEffect } from 'react'

import { sectionOf } from '@/lib/analytics/classify'
import { trackView } from '@/lib/analytics/client'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
	useEffect(() => {
		Sentry.captureException(error)
		trackView('error_view', {
			scope: 'global',
			origin: error.digest ? 'server' : 'client',
			section: sectionOf(window.location.pathname),
		})
	}, [error])

	return (
		<html lang="en">
			<body>
				{/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
				<NextError statusCode={0} />
			</body>
		</html>
	)
}
