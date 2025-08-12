'use client'

import { useEffect } from 'react'

import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'

import type { Locale } from '@/lib/i18n-config'

import { Button } from '@/components/ui/button'

export default function LocaleSegmentError({
	reset,
	error,
}: Readonly<{
	error: Error & { digest?: string }
	reset: () => void
}>) {
	useEffect(() => {
		Sentry.captureException(error)
	}, [error])

	const locale = typeof document !== 'undefined' ? (document.documentElement.lang as Locale) : 'en'

	return (
		<div className="relative mx-auto w-full max-w-3xl py-24 text-center">
			<h1 className="text-primary mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">Something went wrong</h1>
			<p className="text-muted-foreground mb-8">An unexpected error occurred. You can try again or go back home.</p>
			<div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
				<Button onClick={reset}>Try again</Button>
				<Button asChild variant="outline">
					<Link href={`/${locale}`}>Back home</Link>
				</Button>
			</div>
			{error?.digest ? <p className="text-muted-foreground mt-6 text-xs">Error reference: {error.digest}</p> : null}
		</div>
	)
}
