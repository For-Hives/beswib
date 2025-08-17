'use client'

import { Alignment, Fit, Layout, RuntimeLoader, useRive } from '@rive-app/react-canvas'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'

import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'

import { getTranslations } from '@/lib/i18n/dictionary'
import { Locale, i18n } from '@/lib/i18n/config'

import errorTranslations from './error/locales.json'

type ErrorTranslations = {
	error: {
		title: string
		description: string
		tryAgain: string
		home: string
		goBack: string
	}
}

export default function LocaleSegmentError({
	// Keep error for Sentry capture; UI mirrors 404 page
	error,
}: Readonly<{
	error: Error & { digest?: string }
}>) {
	useEffect(() => {
		Sentry.captureException(error)
	}, [error])

	// Runtime locale detection for client component
	const [t, locale] = ((): [ErrorTranslations, Locale] => {
		const lang = typeof document !== 'undefined' ? (document.documentElement.lang as Locale) : ('en' as Locale)
		const safeLocale = i18n.locales.includes(lang) ? lang : i18n.defaultLocale
		const translations = getTranslations(safeLocale, errorTranslations) as ErrorTranslations
		return [translations, safeLocale]
	})()

	// Ensure Rive WASM is loaded from a local URL
	RuntimeLoader.setWasmUrl('/svgs/rive_fallback.wasm')

	const { RiveComponent, rive } = useRive({
		src: '/rive/vroum.riv',
		layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
		autoplay: true,
	})

	useEffect(() => {
		if (!rive) return
		const sm = rive.stateMachineNames?.[0]
		if (sm) rive.play(sm)
		else rive.play()
	}, [rive])

	return (
		<div className="bg-background relative flex min-h-svh w-full flex-col justify-center p-6 md:p-10">
			{/* Background Rive animation, dimmed for readability */}
			<div className="pointer-events-none absolute z-10 flex h-full w-full justify-center lg:-top-24">
				<div className="h-[450px] w-[450px] opacity-100 lg:h-[512px] lg:w-[512px] xl:h-[750px] xl:w-[750px]">
					<RiveComponent />
				</div>
			</div>

			<div className="relative z-20 mx-auto mt-32 w-full max-w-5xl rounded-lg border border-black/20 bg-white/5 p-4 text-center backdrop-blur-xs">
				<h1 className="text-foreground mt-4 text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
					{t.error.title}
				</h1>
				<p className="text-muted-foreground mt-6 text-lg font-medium text-pretty sm:text-xl/8">{t.error.description}</p>

				<div className="mt-10 flex flex-col gap-x-6 gap-y-3 sm:flex-row sm:items-center sm:justify-center">
					<Link
						href={`/${locale}`}
						onClick={() => (typeof window !== 'undefined' ? window.history.back() : undefined)}
						className="group bg-secondary text-secondary-foreground ring-offset-background hover:bg-secondary/80 focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					>
						<ArrowLeft
							className="ms-0 me-2 opacity-60 transition-transform group-hover:-translate-x-0.5"
							size={16}
							strokeWidth={2}
							aria-hidden="true"
						/>
						{t.error.goBack}
					</Link>
					<Link
						href={`/${locale}`}
						className="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					>
						{t.error.home}
					</Link>
				</div>

				{/* No extra error metadata displayed to mirror 404 UI */}
			</div>
		</div>
	)
}
