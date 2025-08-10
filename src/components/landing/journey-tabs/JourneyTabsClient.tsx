'use client'

import { DollarSign, ShoppingCart } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeatureSteps } from '@/components/ui/FeatureSteps'
import { getTranslations } from '@/lib/getDictionary'
import { Locale } from '@/lib/i18n-config'

import translations from './locales.json'
interface JourneyTabsClientProps {
	locale: Locale
}

export default function JourneyTabsClient({ locale }: Readonly<JourneyTabsClientProps>) {
	const t = getTranslations(locale, translations)

	const sellerJourney = [
		{
			title: t.journey.seller.step1.title,
			step: `${t.steps.step} 1`,
			image: '/landing/how-it-works/inscription.jpg',
			content: t.journey.seller.step1.content,
		},
		{
			title: t.journey.seller.step2.title,
			step: `${t.steps.step} 2`,
			image: '/landing/how-it-works/saisie.jpg',
			content: t.journey.seller.step2.content,
		},
		{
			title: t.journey.seller.step3.title,
			step: `${t.steps.step} 3`,
			image: '/landing/how-it-works/validation.jpg',
			content: t.journey.seller.step3.content,
		},
		{
			title: t.journey.seller.step4.title,
			step: `${t.steps.step} 4`,
			image: '/landing/how-it-works/marketplace.jpg',
			content: t.journey.seller.step4.content,
		},
		{
			title: t.journey.seller.step5.title,
			step: `${t.steps.step} 5`,
			image: '/landing/how-it-works/run.jpg',
			content: t.journey.seller.step5.content,
		},
	]

	const buyerJourney = [
		{
			title: t.journey.buyer.step1.title,
			step: `${t.steps.step} 1`,
			image: '/landing/how-it-works/inscription.jpg',
			content: t.journey.buyer.step1.content,
		},
		{
			title: t.journey.buyer.step2.title,
			step: `${t.steps.step} 2`,
			image: '/landing/how-it-works/search-buy.jpg',
			content: t.journey.buyer.step2.content,
		},
		{
			title: t.journey.buyer.step3.title,
			step: `${t.steps.step} 3`,
			image: '/landing/how-it-works/marketplace.jpg',
			content: t.journey.buyer.step3.content,
		},
		{
			title: t.journey.buyer.step4.title,
			step: `${t.steps.step} 4`,
			image: '/landing/how-it-works/confirmation.jpg',
			content: t.journey.buyer.step4.content,
		},
		{
			title: t.journey.buyer.step5.title,
			step: `${t.steps.step} 5`,
			image: '/landing/how-it-works/run.jpg',
			content: t.journey.buyer.step5.content,
		},
	]

	return (
		<section className="dark:bg-muted/30 bg-neutral-50 px-4 py-16 md:py-24 xl:px-0">
			<div className="mx-auto max-w-7xl">
				<div className="mb-12 text-center">
					<h2 className="dark:text-foreground mb-6 text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl lg:text-5xl">
						{t.journey.title}
					</h2>
					<p className="dark:text-muted-foreground mx-auto max-w-3xl text-lg text-neutral-700 md:text-xl">
						{t.journey.subtitle}
					</p>
				</div>

				<Tabs className="w-full" defaultValue="buyer">
					<TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-2">
						<TabsTrigger className="flex cursor-pointer items-center gap-2" value="buyer">
							<ShoppingCart className="h-4 w-4" />
							{t.journey.buyerTab}
						</TabsTrigger>
						<TabsTrigger className="flex cursor-pointer items-center gap-2" value="seller">
							<DollarSign className="h-4 w-4" />
							{t.journey.sellerTab}
						</TabsTrigger>
					</TabsList>

					<TabsContent className="mt-0" value="buyer">
						<FeatureSteps autoPlayInterval={3000} features={buyerJourney} />
					</TabsContent>
					<TabsContent className="mt-0" value="seller">
						<FeatureSteps autoPlayInterval={3000} features={sellerJourney} />
					</TabsContent>
				</Tabs>
			</div>
		</section>
	)
}
