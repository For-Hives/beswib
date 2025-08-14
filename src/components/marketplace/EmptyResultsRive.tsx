'use client'

import { useRive, Layout, Fit, Alignment, RuntimeLoader } from '@rive-app/react-canvas'
import { useEffect } from 'react'

import type { Locale } from '@/lib/i18n/config'

interface Props {
	locale: Locale
}

const texts: Record<Locale, { title: string; subtitle: string; cta: string }> = {
	ro: {
		title: 'Niciun rezultat nu corespunde căutării tale',
		subtitle: 'Încearcă să ajustezi filtrele. Dacă lipsește un eveniment care te interesează, contactează-ne.',
		cta: 'Contactează-ne',
	},
	pt: {
		title: 'Nenhum resultado corresponde à tua pesquisa',
		subtitle: 'Tenta ajustar os filtros. Se achas que falta um evento do teu interesse, contacta-nos.',
		cta: 'Contacta-nos',
	},
	nl: {
		title: 'Geen resultaten voor je zoekopdracht',
		subtitle:
			'Probeer je filters aan te passen. Als er een event ontbreekt dat je interesseert, neem contact met ons op.',
		cta: 'Neem contact op',
	},
	ko: {
		title: '검색과 일치하는 결과가 없습니다',
		subtitle: '필터를 조정해 보세요. 관심 있는 대회가 없다면 문의해 주세요.',
		cta: '문의하기',
	},
	it: {
		title: 'Nessun risultato corrisponde alla tua ricerca',
		subtitle: 'Prova a modificare i filtri. Se pensi che manchi un evento di tuo interesse, contattaci.',
		cta: 'Contattaci',
	},
	fr: {
		title: 'Aucun résultat ne correspond à votre recherche',
		subtitle:
			"Ajustez vos filtres. Si vous pensez que nous n'avons pas encore la course qui vous intéresse, contactez-nous.",
		cta: 'Nous contacter',
	},
	es: {
		title: 'Ningún resultado coincide con tu búsqueda',
		subtitle: 'Prueba a ajustar los filtros. Si crees que falta un evento que te interesa, contáctanos.',
		cta: 'Contáctanos',
	},
	en: {
		title: 'No results match your search',
		subtitle:
			"Try tweaking your filters. If you think we're missing an event you're interested in, feel free to contact us.",
		cta: 'Contact us',
	},
	de: {
		title: 'Keine Ergebnisse für deine Suche',
		subtitle: 'Versuche deine Filter anzupassen. Wenn ein interessantes Event fehlt, kontaktiere uns gerne.',
		cta: 'Kontakt aufnehmen',
	},
}

export default function EmptyResultsRive({ locale }: Readonly<Props>) {
	const t = texts[locale] ?? texts.en

	// Ensure Rive WASM is loaded from a local URL to avoid CDN failures
	if (typeof window !== 'undefined') {
		RuntimeLoader.setWasmUrl('/svgs/rive_fallback.wasm')
	}

	const { RiveComponent, rive } = useRive({
		src: '/svgs/impatient_placeholder.riv',
		layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
		autoplay: true,
	})

	useEffect(() => {
		if (!rive) return
		const sm = rive.stateMachineNames?.[0]
		if (sm) {
			rive.play(sm)
		} else {
			rive.play()
		}
	}, [rive])

	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="relative mb-6 aspect-video w-full max-w-[420px] overflow-hidden rounded-xl p-2">
				<div className="h-full w-full">
					<RiveComponent className="h-[260px] w-full" />
				</div>
			</div>

			<h3 className="text-foreground mb-2 text-xl font-semibold">{t.title}</h3>
			<p className="text-muted-foreground mx-auto mb-6 max-w-xl text-sm sm:text-base">{t.subtitle}</p>
		</div>
	)
}
