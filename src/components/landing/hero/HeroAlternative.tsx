import Image from 'next/image'

// import landingTranslations from '@/app/[locale]/locales.json'
// import { LocaleParams } from '@/lib/generateStaticParams'
// import { getTranslations } from '@/lib/getDictionary'

// import heroTranslations from './locales.json'

// export default async function HeroAlternative({ localeParams }: { localeParams: Promise<LocaleParams> }) {
export default function HeroAlternative() {
	// const { locale } = await localeParams

	// const t = getTranslations(locale, heroTranslations)
	// const landingT = getTranslations(locale, landingTranslations)

	return (
		<section className="relative px-4 pt-20 xl:px-0 xl:pt-40">
			<Image
				alt="template-run"
				className="absolute top-0 left-0 z-10 h-full w-full -scale-x-100 overflow-hidden object-cover object-bottom"
				height={1920}
				width={1080}
				src={'/landing/background.webp'}
			/>
			<div className="absolute top-0 left-0 z-0 flex h-screen w-screen">
				<Image
					alt="template-youpi"
					className="z-0 h-[50vh] max-h-[50vh] w-[50vw] max-w-[50vw] translate-y-14 object-cover"
					height={500}
					width={500}
					src={'/landing/youpi.jpg'}
				/>
				<div className="z-0 h-[50vh] max-h-[50vh] w-[50vw] max-w-[50vw] -translate-y-14 overflow-hidden bg-[url('/svgs/topography.svg')] bg-center bg-repeat"></div>
			</div>

			<div className="z-20 mx-auto max-w-7xl">
				<div className="grid min-h-[calc(100vh-10rem)] grid-cols-12 gap-4">
					{/* <div className="col-span-12 flex flex-col justify-center gap-6 pb-32 md:col-span-5">
						<h1
							className="text-5xl font-bold tracking-tight text-neutral-50 dark:text-neutral-100"
							dangerouslySetInnerHTML={{ __html: landingT.home.hero.title }}
						></h1>
						<p className="text-lg text-neutral-50 dark:text-neutral-300">{landingT.home.hero.description}</p>
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
					<div className="col-span-12 md:col-span-7">
						<HeroAnimation locale={locale} runs={runs} />
					</div> */}
				</div>
			</div>
		</section>
	)
}
