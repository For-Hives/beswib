'use client'

import NumberFlow from '@number-flow/react'
import { useEffect, useRef, useState } from 'react'

import type { Locale } from '@/lib/i18n/config'

interface BibStatsClientProps {
	locale: Locale
}

import { getTranslations } from '@/lib/i18n/dictionary'

import translations from './locales.json'

interface StatItem {
	label: string
	suffix: string
	value: string
}

export default function BibStatsClient({ locale }: Readonly<BibStatsClientProps>) {
	const t = getTranslations(locale, translations)

	const stats: StatItem[] = [
		{
			value: '2500',
			suffix: '+',
			label: t.stats.bibsSold,
		},
		{
			value: '150',
			suffix: '+',
			label: t.stats.partnerRaces,
		},
		{
			value: '98',
			suffix: '%',
			label: t.stats.satisfactionRate,
		},
	]

	const [baseValue] = useState(0)
	const [isVisible, setIsVisible] = useState(false)
	const [hasAnimated, setHasAnimated] = useState(false)
	const sectionRef = useRef<HTMLElement>(null)

	useEffect(() => {
		const currentSection = sectionRef.current
		if (!currentSection) return

		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					// Trigger animation when component is fully visible (100% in viewport)
					if (entry.isIntersecting && entry.intersectionRatio >= 0.8 && !hasAnimated) {
						setIsVisible(true)
						setHasAnimated(true) // Prevent re-triggering
					}
				})
			},
			{
				threshold: 0.8, // Trigger when 80% of the component is visible
				rootMargin: '0px',
			}
		)

		observer.observe(currentSection)

		return () => {
			observer.disconnect()
		}
	}, [hasAnimated])

	return (
		<section className="dark:bg-card/50 bg-white/70 px-4 py-12 md:py-24 lg:pb-36 xl:px-0" ref={sectionRef}>
			<div className="mx-auto max-w-7xl">
				<div className="grid gap-8 md:grid-cols-3">
					{stats.map((stat, index) => (
						<div className="text-center" key={index}>
							<div className="text-primary mb-2 text-4xl font-bold md:text-5xl">
								<NumberFlow
									transformTiming={{
										easing: 'ease-in-out',
										duration: 1500,
									}}
									value={Number(isVisible ? stat.value : baseValue)}
								/>
								{stat.suffix}
							</div>
							<p className="dark:text-muted-foreground text-lg text-neutral-700">{stat.label}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
