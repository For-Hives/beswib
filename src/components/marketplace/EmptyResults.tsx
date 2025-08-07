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

	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="relative mb-6 h-28 w-28">
				{/* Outer rotating dashed ring */}
				<svg className="animate-spin-slow text-muted-foreground absolute inset-0 h-full w-full" viewBox="0 0 120 120">
					<circle
						cx="60"
						cy="60"
						r="52"
						fill="none"
						stroke="currentColor"
						strokeWidth="4"
						strokeDasharray="8 12"
						strokeLinecap="round"
					/>
				</svg>
				{/* Inner pulsing circle */}
				<div className="absolute inset-0 flex items-center justify-center">
					<span className="relative inline-flex h-8 w-8">
						<span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-20" />
						<span className="bg-primary/80 relative inline-flex h-8 w-8 rounded-full" />
					</span>
				</div>
				{/* Magnifying glass */}
				<svg className="text-primary absolute inset-0 m-auto h-10 w-10" viewBox="0 0 24 24" fill="none">
					<path
						d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M21 21l-3.8-3.8"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>

			<h3 className="text-foreground mb-2 text-xl font-semibold">{t.title}</h3>
			<p className="text-muted-foreground mx-auto mb-6 max-w-xl text-sm sm:text-base">{t.subtitle}</p>

			<div className="flex items-center gap-3">
				<Link href="/" className="text-sm underline-offset-4 hover:underline">
					Explore latest bibs
				</Link>
				<Button asChild>
					<Link href={`/${locale}/contact`}>{t.cta}</Link>
				</Button>
			</div>
		</div>
	)
}

// Tailwind helper: slow spin
// If your Tailwind config doesn't have it, the utility below can be added via globals.css:
// .animate-spin-slow { animation: spin 4s linear infinite; }
