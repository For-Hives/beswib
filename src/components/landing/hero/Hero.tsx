import Image from 'next/image'
import Link from 'next/link'

import landingTranslations from '@/app/[locale]/locales.json'
import { LocaleParams } from '@/lib/generateStaticParams'
import { getTranslations } from '@/lib/getDictionary'

import { HeroAnimation } from './HeroAnimation'
import heroTranslations from './locales.json'

export default async function Hero({ localeParams }: { localeParams: Promise<LocaleParams> }) {
	const { locale } = await localeParams

	const t = getTranslations(locale, heroTranslations)
	const landingT = getTranslations(locale, landingTranslations)

	// Static data that doesn't need translation
	const runStaticData = [
		{
			price: 79.99,
			participantCount: 10000,
			originalPrice: 100,
			image: '/bib-red.png',
			id: '1',
			distanceUnit: 'km',
			distance: 42,
			date: new Date(),
		},
		{
			price: 440,
			participantCount: 64000,
			originalPrice: 500,
			image: '/bib-green.png',
			id: '2',
			distanceUnit: 'km',
			distance: 226,
			date: new Date(),
		},
		{
			price: 9.99,
			participantCount: 2630,
			originalPrice: 15,
			image: '/bib-pink.png',
			id: '3',
			distanceUnit: 'km',
			distance: 21,
			date: new Date(),
		},
		{
			price: 79.99,
			participantCount: 10000,
			originalPrice: 100,
			image: '/bib-blue.png',
			id: '4',
			distanceUnit: 'km',
			distance: 42,
			date: new Date(),
		},
		{
			price: 900,
			participantCount: 9000,
			originalPrice: 600,
			image: '/bib-orange.png',
			id: '5',
			distanceUnit: 'km',
			distance: 170,
			date: new Date(),
		},
	]

	// Merge translated data with static data
	const runs = runStaticData.map((run, index) => {
		const translatedRuns = t.runs as Array<{ location: string; name: string }> | undefined
		const translatedRun = translatedRuns?.[index]
		return {
			...run,
			event: {
				...run,
				name: translatedRun?.name ?? `Event ${index + 1}`,
				location: translatedRun?.location ?? 'Unknown',
			},
		}
	})

	return (
		<section className="relative px-4 pt-20 xl:px-0 xl:pt-40">
			<Image
				alt="template-run"
				className="-z-10 -scale-x-100 overflow-hidden object-cover object-center opacity-50 dark:opacity-75"
				fill
				sizes="100vw"
				src={'/landing/background.jpg'}
			/>
			<div className="from-background/100 to-background/100 absolute inset-0 -z-10 bg-gradient-to-b via-zinc-900/20 dark:bg-gradient-to-r dark:via-zinc-900/60"></div>
			<div className="z-20 mx-auto max-w-7xl">
				<div className="grid grid-cols-12 gap-4">
					<div className="col-span-12 flex flex-col justify-center gap-6 pb-32 md:col-span-5">
						<h1
							className="text-foreground text-5xl font-bold tracking-tight"
							dangerouslySetInnerHTML={{ __html: landingT.home.hero.title }}
						></h1>
						<p className="text-muted-foreground text-lg">{landingT.home.hero.description}</p>
						<div className="flex flex-row gap-4">
							<div>
								<Link
									className="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-11 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:px-8"
									href="/marketplace"
								>
									{landingT.home.hero.organizerButton}
								</Link>
							</div>
							<div>
								<Link
									className="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:px-8"
									href="/events"
								>
									{landingT.home.hero.consultRacesButton}
								</Link>
							</div>
						</div>
					</div>
					<div className="col-span-12 md:col-span-7">
						<HeroAnimation locale={locale} runs={runs} />
					</div>
				</div>
			</div>
		</section>
	)
}
