'use client'

import { PhoneCall } from 'lucide-react'

import Link from 'next/link'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Locale } from '@/lib/i18n/config'

interface FAQClientProps {
	locale: Locale
}

import { getTranslations } from '@/lib/i18n/dictionary'

import Translations from './locales.json'
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
								<h4 className="font-regular max-w-xl text-left text-3xl tracking-tighter md:text-5xl">{t.faq.title}</h4>
								<p className="text-muted-foreground max-w-xl text-left leading-relaxed tracking-tight lg:max-w-lg lg:text-lg">
									{t.faq.description}
								</p>
							</div>
							<div className="">
								<Button asChild className="gap-4" variant="outline">
									<Link href={t.faq.support.buttonUrl}>
										{t.faq.contactButton} <PhoneCall className="h-4 w-4" />
									</Link>
								</Button>
							</div>
						</div>
					</div>

					{/* Right Column - Accordion */}
					<Accordion className="w-full" collapsible type="single">
						{t.faq.items.map(item => (
							<AccordionItem key={item.id} value={item.id}>
								<AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
								<AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</div>
		</div>
	)
}
