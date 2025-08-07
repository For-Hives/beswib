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
						transform="translate(0,2)"
					/>
				</svg>
				{/* Snow particles above the peaks */}
				<svg className="absolute top-0 left-1/2 h-10 w-28 -translate-x-1/2 scale-175" viewBox="0 0 120 80" fill="none">
					{[5, 20, 35, 55, 75, 95, 110, 125, 150, 175, 190, 205, 220, 235, 250, 265, 280, 295].map((x, i) => (
						<circle
							key={x}
							cx={x}
							cy={6 + (i % 2) * 4}
							r={1.5}
							className="animate-snow"
							fill="currentColor"
							style={{ animationDelay: `${i * 250}ms` }}
						/>
					))}
				</svg>

				{/* Water stream descending from a mountain gap (aligned to valley at x=120,y=90) */}
				<svg className="text-primary/60 absolute inset-x-0 top-1 mx-auto h-36 w-full" viewBox="0 0 300 200" fill="none">
					<path
						d="M120 90 C 118 100, 130 108, 128 118 S 140 136, 136 152 S 144 168, 140 188"
						stroke="currentColor"
						strokeWidth="2.2"
						strokeLinecap="round"
						strokeDasharray="28 36"
						className="animate-water"
					/>
				</svg>

				{/* Birds at the top (more realistic shapes and motion) */}
				<svg className="text-foreground/80 absolute top-3 right-6 h-8 w-24 scale-150" viewBox="0 0 96 64" fill="none">
					<g className="animate-birds">
						<g className="animate-bird-flap">
							<path d="M6 18 q6 -8 12 0 q-6 -4 -12 0Z" fill="currentColor" />
							<path d="M12 18 q5 -6 10 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
						</g>
						<g className="animate-bird-flap" style={{ animationDelay: '120ms' }}>
							<path d="M34 14 q6 -8 12 0 q-6 -4 -12 0Z" fill="currentColor" />
							<path d="M40 14 q5 -6 10 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
						</g>
						<g className="animate-bird-flap" style={{ animationDelay: '240ms' }}>
							<path d="M62 18 q6 -8 12 0 q-6 -4 -12 0Z" fill="currentColor" />
							<path d="M68 18 q5 -6 10 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
						</g>
					</g>
				</svg>
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
