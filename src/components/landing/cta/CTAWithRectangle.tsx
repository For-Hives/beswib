'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CTAProps {
	className?: string

	locale: Locale

	withGlow?: boolean
}
import Link from 'next/link'

import { getTranslations } from '@/lib/getDictionary'
import { Locale } from '@/lib/i18n-config'

import Translations from './locales.json'

export function CTASection({ withGlow = true, locale, className }: CTAProps) {
	const translations = getTranslations(locale, Translations)

	return (
		<div className="px-4 xl:px-0">
			<section
				className={cn(
					'via-primary/10 dark:from-background dark:via-primary/15 dark:to-background mx-auto my-12 max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-white to-white pt-0 md:pt-0',
					className
				)}
			>
				<div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-12 text-center sm:gap-8 md:py-24">
					{/* Title */}
					<h2 className="animate-fade-in-up dark:text-foreground text-3xl font-semibold text-neutral-900 opacity-0 delay-200 sm:text-4xl">
						{translations?.ctaSection.title}
					</h2>

					{/* Description */}
					<p
						className="animate-fade-in-up dark:text-muted-foreground max-w-4xl text-lg text-neutral-700 opacity-0 delay-300"
						dangerouslySetInnerHTML={{ __html: translations?.ctaSection.description ?? '' }}
					/>

					{/* Action Buttons */}
					<div className="animate-fade-in-up flex flex-col gap-4 opacity-0 delay-500 sm:flex-row">
						<Button asChild className="text-base" size="lg" variant={'outline'}>
							<Link href={'/dashboard/organizer'}>{translations.cta.organizerButton}</Link>
						</Button>

						<Button asChild className="text-base" size="lg" variant={'default'}>
							<Link href={'/marketplace'}>{translations.cta.webAppButton}</Link>
						</Button>
					</div>

					{/* Glow Effect */}
					{withGlow ? (
						<div className="fade-top-lg animate-scale-in shadow-glow pointer-events-none absolute inset-0 rounded-2xl opacity-0 delay-700" />
					) : null}
				</div>
			</section>
		</div>
	)
}
