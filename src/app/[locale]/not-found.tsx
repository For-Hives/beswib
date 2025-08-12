'use client'

import { Alignment, Fit, Layout, RuntimeLoader, useRive } from '@rive-app/react-canvas'
import { ArrowLeft, Search } from 'lucide-react'
import { useEffect } from 'react'

import Link from 'next/link'

import type { LocaleParams } from '@/lib/generateStaticParams'
import type { Locale } from '@/lib/i18n-config'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const texts: Record<Locale, { title: string; description: string; search: string; goBack: string; home: string }> = {
	ro: {
		title: 'Pagină negăsită',
		search: 'Caută',
		home: 'Înapoi acasă',
		goBack: 'Înapoi',
		description: 'Pierdută e această pagină. Poate într‑un alt sistem.',
	},
	pt: {
		title: 'Página não encontrada',
		search: 'Pesquisar',
		home: 'Leva‑me à página inicial',
		goBack: 'Voltar',
		description: 'Perdida está esta página. Talvez noutro sistema.',
	},
	nl: {
		title: 'Pagina niet gevonden',
		search: 'Zoeken',
		home: 'Naar start',
		goBack: 'Ga terug',
		description: 'Verdwaald is deze pagina. Misschien in een ander systeem.',
	},
	ko: {
		title: '페이지를 찾을 수 없습니다',
		search: '검색',
		home: '홈으로',
		goBack: '뒤로 가기',
		description: '이 페이지는 길을 잃었어요. 아마 다른 시스템에 있을지도.',
	},
	it: {
		title: 'Pagina non trovata',
		search: 'Cerca',
		home: 'Portami alla home',
		goBack: 'Torna indietro',
		description: 'Smarrita è questa pagina. In un altro sistema, forse.',
	},
	fr: {
		title: 'Page introuvable',
		search: 'Rechercher',
		home: 'Retour à l’accueil',
		goBack: 'Revenir',
		description: 'Perdue, cette page l’est. Dans un autre système, peut‑être.',
	},
	es: {
		title: 'Página no encontrada',
		search: 'Buscar',
		home: 'Ir al inicio',
		goBack: 'Volver',
		description: 'Perdida está esta página. En otro sistema, quizá.',
	},
	en: {
		title: 'Page not found',
		search: 'Search',
		home: 'Take me home',
		goBack: 'Go back',
		description: 'Lost, this page is. In another system, it may be.',
	},
	de: {
		title: 'Seite nicht gefunden',
		search: 'Suchen',
		home: 'Zur Startseite',
		goBack: 'Zurück',
		description: 'Verloren ist diese Seite. In einem anderen System vielleicht.',
	},
}

export default function NotFoundPage({ params }: { params: Promise<LocaleParams> }) {
	// Runtime locale
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const [t, locale] = ((): [(typeof texts)[Locale], Locale] => {
		// This component is a Client Component, but `params` is a Promise.
		// We cannot `await` it here; Next.js will render this page under locale segment.
		// Derive locale from <html lang> at runtime for safety.
		const lang = typeof document !== 'undefined' ? (document.documentElement.lang as Locale) : ('en' as Locale)
		const safeLocale = (Object.keys(texts) as Locale[]).includes(lang) ? lang : ('en' as Locale)
		return [texts[safeLocale], safeLocale]
	})()

	// Ensure Rive WASM is loaded from a local URL
	RuntimeLoader.setWasmUrl('/svgs/rive_fallback.wasm')

	const { RiveComponent, rive } = useRive({
		src: '/olympic_sports_boy_cycling.riv',
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
			<div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] dark:opacity-[0.05]">
				<RiveComponent className="h-full w-full" />
			</div>

			<div className="relative mx-auto w-full max-w-5xl text-center">
				<h1 className="text-primary mt-4 text-5xl font-semibold tracking-tight text-balance sm:text-7xl">{t.title}</h1>
				<p className="text-muted-foreground mt-6 text-lg font-medium text-pretty sm:text-xl/8">{t.description}</p>

				<div className="mx-auto mt-10 flex flex-col gap-y-3 sm:max-w-sm sm:flex-row sm:space-x-2">
					<div className="relative w-full">
						<Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
						<Input placeholder={t.search} className="pl-8" />
					</div>
					<Button variant="outline">{t.search}</Button>
				</div>

				<div className="mt-10 flex flex-col gap-x-6 gap-y-3 sm:flex-row sm:items-center sm:justify-center">
					<Button variant="secondary" asChild className="group" type="button">
						<Link
							href={`/${locale}`}
							onClick={() => (typeof window !== 'undefined' ? window.history.back() : undefined)}
						>
							<ArrowLeft
								className="ms-0 me-2 opacity-60 transition-transform group-hover:-translate-x-0.5"
								size={16}
								strokeWidth={2}
								aria-hidden="true"
							/>
							{t.goBack}
						</Link>
					</Button>
					<Button asChild type="button">
						<Link href={`/${locale}`}>{t.home}</Link>
					</Button>
				</div>
			</div>
		</div>
	)
}
