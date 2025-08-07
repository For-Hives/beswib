'use client'

import Link from 'next/link'

import { Locale } from '@/lib/i18n-config'
import { Button } from '@/components/ui/button'

interface EmptyResultsProps {
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
			"Essayez d'ajuster vos filtres. Si vous pensez que nous n'avons pas la course qui vous intéresse, contactez-nous.",
		cta: 'Nous contacter',
	},
	ko: {
		title: '검색과 일치하는 결과가 없습니다',
		subtitle: '필터를 조정해 보세요. 관심 있는 대회가 없다면 문의해 주세요.',
		cta: '문의하기',
	},
}

export default function EmptyResults({ locale }: Readonly<EmptyResultsProps>) {
	const t = texts[locale] ?? texts.en

	// Single source of truth for the mountain path so the dashed trail matches exactly
	const mountainD = 'M10 110 L70 40 L120 90 L170 20 L230 95 L290 110'

	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="relative mb-8 h-40 w-56">
				{/* Mountain silhouette with animated trail */}
				<svg
					className="text-muted-foreground absolute inset-x-0 top-0 mx-auto h-24 w-full"
					viewBox="0 0 300 120"
					fill="none"
				>
					<path d={mountainD} stroke="currentColor" strokeWidth="2" fill="none" />
					<path
						d={mountainD}
						stroke="currentColor"
						strokeWidth="2"
						strokeDasharray="6 10"
						className="animate-dash"
						fill="none"
						transform="translate(0,8)"
					/>
				</svg>
				{/* Magnifying glass sweeping over */}
				<div className="absolute top-1/2 left-1/2 -mt-2 -translate-x-1/2">
					<svg className="animate-sweep text-primary/80 h-6 w-6" viewBox="0 0 24 24" fill="none">
						<path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="1.5" />
						<path d="M21 21l-3.8-3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
					</svg>
				</div>
			</div>

			<h3 className="text-foreground mb-2 text-xl font-semibold">{t.title}</h3>
			<p className="text-muted-foreground mx-auto mb-6 max-w-xl text-sm sm:text-base">{t.subtitle}</p>

			<div className="flex items-center gap-3">
				<Link href="/" className="text-sm underline-offset-4 hover:underline">
					Explore latest bibs
				</Link>
				<Button asChild>
					<Link href={`/contact`}>{t.cta}</Link>
				</Button>
			</div>
		</div>
	)
}

// Tailwind helper: slow spin
// If your Tailwind config doesn't have it, the utility below can be added via globals.css:
// .animate-spin-slow { animation: spin 4s linear infinite; }
