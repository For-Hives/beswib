'use client'

import { PhoneCall } from 'lucide-react'

import Link from 'next/link'
import { TrackClick } from '@/components/analytics/TrackClick'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { EventProps } from '@/lib/analytics/catalog'
import { track } from '@/lib/analytics/client'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'

import Translations from './locales.json'

interface FAQClientProps {
	locale: Locale
}

const FAQ_QUESTIONS: Record<string, EventProps<'faq_item_open'>['question']> = {
	'what-is-beswib': 'what_is_beswib',
	'payment-security': 'payment_security',
	'organizer-benefits': 'organizer_benefits',
	'is-it-legal': 'is_it_legal',
	'how-to-sell': 'how_to_sell',
	'how-to-buy': 'how_to_buy',
	fees: 'fees',
	cancellation: 'cancellation',
}

export default function FAQClient({ locale }: Readonly<FAQClientProps>) {
	const t = getTranslations(locale, Translations)

	return (
		<div className="w-full px-4 py-12 md:py-24 xl:px-0">
			<div className="container mx-auto max-w-7xl">
				<div className="grid gap-10 lg:grid-cols-2">
					{/* Left Column - Intro */}
					<div className="flex flex-col gap-10">
						<div className="flex flex-col gap-4">
							<div>
								<Badge variant="outline">{t.faq.badge}</Badge>
							</div>
							<div className="flex flex-col gap-2">
								<h1 className="font-regular max-w-xl text-left text-3xl tracking-tighter md:text-5xl">{t.faq.title}</h1>
								<p className="text-muted-foreground max-w-xl text-left leading-relaxed tracking-tight lg:max-w-lg lg:text-lg">
									{t.faq.description}
								</p>
							</div>
							<div>
								<TrackClick name="cta_click" props={{ cta: 'contact', where: 'faq_intro' }}>
									<Button asChild className="gap-4" variant="outline">
										<Link href={`/${locale}/contact`}>
											{t.faq.contactButton} <PhoneCall className="h-4 w-4" />
										</Link>
									</Button>
								</TrackClick>
							</div>
						</div>
					</div>

					{/* Right Column - Accordion */}
					<Accordion
						className="w-full"
						collapsible
						onValueChange={value => {
							const question = Object.hasOwn(FAQ_QUESTIONS, value) ? FAQ_QUESTIONS[value] : undefined
							if (question !== undefined) track('faq_item_open', { question })
						}}
						type="single"
					>
						{t.faq.items.map(item => {
							return (
								<AccordionItem key={item.id} value={item.id}>
									<AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
									<AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
								</AccordionItem>
							)
						})}
					</Accordion>
				</div>
			</div>
		</div>
	)
}
