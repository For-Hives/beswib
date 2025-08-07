'use client'

import { useEffect } from 'react'
import { useRive, Layout, Fit, Alignment, RuntimeLoader } from '@rive-app/react-canvas'
import Link from 'next/link'

import type { Locale } from '@/lib/i18n-config'
import { Button } from '@/components/ui/button'

interface Props {
	locale: Locale
}

const texts: Record<Locale, { title: string; subtitle: string; cta: string }> = {
	en: {
		title: 'No results match your search',
		subtitle:
			"Try tweaking your filters. If you think we're missing an event you're interested in, feel free to contact us.",
		cta: 'Contact us',
	},
	fr: {
		title: 'Aucun résultat ne correspond à votre recherche',
		subtitle:
			"Ajustez vos filtres. Si vous pensez que nous n'avons pas encore la course qui vous intéresse, contactez-nous.",
		cta: 'Nous contacter',
	},
	ko: {
		title: '검색과 일치하는 결과가 없습니다',
		subtitle: '필터를 조정해 보세요. 관심 있는 대회가 없다면 문의해 주세요.',
		cta: '문의하기',
	},
}

export default function EmptyResultsRive({ locale }: Readonly<Props>) {
	const t = texts[locale] ?? texts.en

	// Ensure Rive WASM is loaded from a local URL to avoid CDN failures
	if (typeof window !== 'undefined') {
		RuntimeLoader.setWasmUrl('/svgs/rive_fallback.wasm')
	}

	const { rive, RiveComponent } = useRive({
		src: '/svgs/impatient_placeholder.riv',
		autoplay: true,
		layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
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
