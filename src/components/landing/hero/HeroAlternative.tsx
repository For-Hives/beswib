import Image from 'next/image'

import landingTranslations from '@/app/[locale]/locales.json'
import { LocaleParams } from '@/lib/generateStaticParams'
import { getTranslations } from '@/lib/getDictionary'

import heroTranslations from './locales.json'
import { HeroAnimation } from './HeroAnimation'
import Link from 'next/link'

export default async function HeroAlternative({ localeParams }: { localeParams: Promise<LocaleParams> }) {
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
		<div className="relative">
			<div className="pointer-events-none absolute top-48 left-0 z-30 h-[calc(100vh-10rem)] w-[100vw]">
				<Image
					alt="template-run"
					className="z-30 -scale-x-100 overflow-visible object-cover object-bottom dark:grayscale"
					fill
					sizes="100vw"
					src={'/landing/background3.webp'}
				/>
			</div>
			<div className="absolute top-24 left-0 z-20 w-full text-center text-[2rem] font-bold tracking-tight text-neutral-800 dark:text-neutral-50">
				<h1
					dangerouslySetInnerHTML={{ __html: landingT.home.hero.title }}
					className="font-geist [&_span]:font-bowlby-one-sc [&_span]:mx-2 [&_span]:text-[8rem]"
				/>
			</div>

			<section className="pointer-events-none relative">
				<div className="absolute top-0 left-0 z-0 flex h-screen w-screen">
					<div className="flex h-full items-end">
						<Image
							alt="template-youpi"
							className="z-0 mb-[40vh] h-[40vh] w-[50vw] max-w-[50vw] min-w-[50vw] object-cover object-center grayscale lg:mb-[42vh] xl:mb-[30vh]"
							height={500}
							width={500}
							src={'/landing/youpi.jpg'}
						/>
					</div>
					<div className="z-0 h-[50vh] max-h-[50vh] w-[50vw] max-w-[50vw] -translate-y-14 overflow-hidden bg-[url('/svgs/topography.svg')] bg-center bg-repeat"></div>
				</div>
			</section>
			<div className="z-20 mx-auto flex max-w-full justify-end">
				<div className="grid min-h-screen w-1/2 grid-cols-12 gap-4">
					<div className="col-span-12 flex flex-col justify-start gap-6 px-20 pt-[50vh]">
						<p className="text-lg text-neutral-800 dark:text-neutral-300">{landingT.home.hero.description}</p>
						<div className="flex flex-row gap-4">
							<div>
								<Link
									className="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-11 items-center justify-center rounded-md border px-3 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:px-8 dark:shadow-none"
									href="/marketplace"
								>
									{landingT.home.hero.organizerButton}
								</Link>
							</div>
							<div>
								<Link
									className="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 items-center justify-center rounded-md px-3 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:px-8 dark:shadow-none"
									href="/events"
								>
									{landingT.home.hero.consultRacesButton}
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
