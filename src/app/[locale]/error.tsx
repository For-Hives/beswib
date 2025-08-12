'use client'

import { Alignment, Fit, Layout, RuntimeLoader, useRive } from '@rive-app/react-canvas'
import { useEffect } from 'react'

import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'

import type { Locale } from '@/lib/i18n-config'

import { Button } from '@/components/ui/button'

const texts: Record<Locale, { title: string; description: string; tryAgain: string; home: string; goBack: string }> = {
	ro: {
		tryAgain: 'Încearcă din nou',
		title: 'Ceva nu a mers bine',
		home: 'Înapoi acasă',
		goBack: 'Înapoi',
		description: 'A apărut o eroare neașteptată. Încearcă din nou sau întoarce-te acasă.',
	},
	pt: {
		tryAgain: 'Tentar novamente',
		title: 'Algo correu mal',
		home: 'Leva‑me à página inicial',
		goBack: 'Voltar',
		description: 'Ocorreu um erro inesperado. Tente novamente ou volte à página inicial.',
	},
	nl: {
		tryAgain: 'Opnieuw proberen',
		title: 'Er ging iets mis',
		home: 'Naar start',
		goBack: 'Ga terug',
		description: 'Er trad een onverwachte fout op. Probeer opnieuw of ga naar home.',
	},
	ko: {
		tryAgain: '다시 시도',
		title: '문제가 발생했습니다',
		home: '홈으로',
		goBack: '뒤로 가기',
		description: '예기치 못한 오류가 발생했습니다. 다시 시도하거나 홈으로 이동하세요.',
	},
	it: {
		tryAgain: 'Riprova',
		title: 'Qualcosa è andato storto',
		home: 'Portami alla home',
		goBack: 'Torna indietro',
		description: 'Si è verificato un errore imprevisto. Riprova o torna alla home.',
	},
	fr: {
		tryAgain: 'Réessayer',
		title: 'Une erreur est survenue',
		home: 'Retour à l’accueil',
		goBack: 'Revenir',
		description: 'Un problème inattendu est survenu. Vous pouvez réessayer ou revenir à l’accueil.',
	},
	es: {
		tryAgain: 'Intentar de nuevo',
		title: 'Algo salió mal',
		home: 'Ir al inicio',
		goBack: 'Volver',
		description: 'Ocurrió un error inesperado. Intenta de nuevo o vuelve al inicio.',
	},
	en: {
		tryAgain: 'Try again',
		title: 'Something went wrong',
		home: 'Take me home',
		goBack: 'Go back',
		description: 'An unexpected error occurred. You can try again or go back home.',
	},
	de: {
		tryAgain: 'Erneut versuchen',
		title: 'Es ist ein Fehler aufgetreten',
		home: 'Zur Startseite',
		goBack: 'Zurück',
		description: 'Ein unerwarteter Fehler ist aufgetreten. Versuche es erneut oder gehe zur Startseite.',
	},
}

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

	// Runtime locale
	const [t, locale] = ((): [(typeof texts)[Locale], Locale] => {
		const lang = typeof document !== 'undefined' ? (document.documentElement.lang as Locale) : ('en' as Locale)
		const safeLocale = (Object.keys(texts) as Locale[]).includes(lang) ? lang : ('en' as Locale)
		return [texts[safeLocale], safeLocale]
	})()

	// Ensure Rive WASM is loaded from a local URL
	RuntimeLoader.setWasmUrl('/svgs/rive_fallback.wasm')

	const { RiveComponent, rive } = useRive({
		src: '/error_page.riv',
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
				<h1 className="text-foreground mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{t.title}</h1>
				<p className="text-muted-foreground mt-6 text-lg font-medium text-pretty sm:text-xl/8">{t.description}</p>

				<div className="mt-10 flex flex-col gap-x-6 gap-y-3 sm:flex-row sm:items-center sm:justify-center">
					<Button onClick={reset}>{t.tryAgain}</Button>
					<Button variant="secondary" asChild className="group" type="button">
						<Link
							href={`/${locale}`}
							onClick={() => (typeof window !== 'undefined' ? window.history.back() : undefined)}
						>
							{t.goBack}
						</Link>
					</Button>
					<Button asChild type="button">
						<Link href={`/${locale}`}>{t.home}</Link>
					</Button>
				</div>

				{typeof error.digest === 'string' && error.digest.length > 0 ? (
					<p className="text-muted-foreground mt-6 text-xs">Error reference: {error.digest}</p>
				) : null}
			</div>
		</div>
	)
}
