'use client'

import { Alignment, Fit, Layout, RuntimeLoader, useRive } from '@rive-app/react-canvas'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'

import Link from 'next/link'

import type { Locale } from '@/lib/i18n/config'

const texts: Record<Locale, { title: string; description: string; search: string; goBack: string; home: string }> = {
	ro: {
		title: 'Pagină negăsită',
		search: 'Caută',
		home: 'Înapoi acasă',
		goBack: 'Înapoi',
		description: 'Ne-am rătăcit pe traseu… se întâmplă și campionilor. Înapoi la linia de start?',
	},
	pt: {
		title: 'Página não encontrada',
		search: 'Pesquisar',
		home: 'Leva‑me à página inicial',
		goBack: 'Voltar',
		description: 'Perdemo-nos na pista… acontece até aos campeões. Voltamos à linha de partida?',
	},
	nl: {
		title: 'Pagina niet gevonden',
		search: 'Zoeken',
		home: 'Naar start',
		goBack: 'Ga terug',
		description: 'Verdwaald op het parcours… zelfs de besten missen weleens een bocht. Terug naar de start?',
	},
	ko: {
		title: '페이지를 찾을 수 없습니다',
		search: '검색',
		home: '홈으로',
		goBack: '뒤로 가기',
		description: '코스에서 길을 잃었네요… 챔피언도 가끔은 코스를 놓칩니다. 출발선으로 돌아갈까요?',
	},
	it: {
		title: 'Pagina non trovata',
		search: 'Cerca',
		home: 'Portami alla home',
		goBack: 'Torna indietro',
		description: 'Ci siamo persi sul percorso… capita anche ai campioni. Torniamo alla linea di partenza?',
	},
	fr: {
		title: 'Page introuvable',
		search: 'Rechercher',
		home: 'Retour à l’accueil',
		goBack: 'Revenir',
		description:
			'On s’est perdus sur le parcours… même les champions ratent une bifurcation. On repart de la ligne de départ ?',
	},
	es: {
		title: 'Página no encontrada',
		search: 'Buscar',
		home: 'Ir al inicio',
		goBack: 'Volver',
		description: 'Nos perdimos en el circuito… hasta los campeones se desvían. ¿Volvemos a la línea de salida?',
	},
	en: {
		title: 'Page not found',
		search: 'Search',
		home: 'Take me home',
		goBack: 'Go back',
		description: 'We got lost on the course… even champions miss a turn. Back to the starting line?',
	},
	de: {
		title: 'Seite nicht gefunden',
		search: 'Suchen',
		home: 'Zur Startseite',
		goBack: 'Zurück',
		description: 'Auf der Strecke verlaufen… passiert selbst den Besten. Zurück zur Startlinie?',
	},
}

export default function NotFoundPage() {
	// Runtime locale
	const [t, locale] = ((): [(typeof texts)[Locale], Locale] => {
		const lang = typeof document !== 'undefined' ? (document.documentElement.lang as Locale) : ('en' as Locale)
		const safeLocale = (Object.keys(texts) as Locale[]).includes(lang) ? lang : ('en' as Locale)
		return [texts[safeLocale], safeLocale]
	})()

	// Ensure Rive WASM is loaded from a local URL
	RuntimeLoader.setWasmUrl('/rive/rive_fallback.wasm')

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
		<div className="bg-background relative flex min-h-svh w-full flex-col justify-center p-6 lg:p-10">
			{/* Background Rive animation, dimmed for readability */}
			<div className="pointer-events-none absolute z-10 flex h-full w-full justify-center lg:-top-24">
				<div className="h-[450px] w-[450px] opacity-100 lg:h-[512px] lg:w-[512px] xl:h-[750px] xl:w-[750px]">
					<RiveComponent />
				</div>
			</div>

			<div className="relative z-20 mx-auto mt-32 w-full max-w-5xl rounded-lg border border-black/20 bg-white/5 p-4 text-center backdrop-blur-xs">
				<h1 className="text-foreground mt-4 text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
					{t.title}
				</h1>
				<p className="text-muted-foreground mt-6 text-lg font-medium text-pretty sm:text-xl/8">{t.description}</p>

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
						{t.goBack}
					</Link>
					<Link
						href={`/${locale}`}
						className="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					>
						{t.home}
					</Link>
				</div>
			</div>
		</div>
	)
}
