'use client'

import { PhoneCall, ExternalLink, Calculator } from 'lucide-react'

import Link from 'next/link'

import { PLATFORM_FEE_PERCENTAGE, PAYPAL_PERCENTAGE_FEE, PAYPAL_FIXED_FEE } from '@/constants/fees.constant'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Locale } from '@/lib/i18n/config'

import Translations from './locales.json'

interface FAQClientProps {
	locale: Locale
}

export default function FAQClient({ locale }: Readonly<FAQClientProps>) {
	const t = getTranslations(locale, Translations)

	// PayPal links by locale
	const paypalLinks = 'https://www.paypal.com/ro/webapps/mpp/merchant-fees'

	// Helper function to format fees dynamically
	const formatFeesAnswer = (answer: string) => {
		const isPromotional = PLATFORM_FEE_PERCENTAGE === 0
		const platformFeeText = isPromotional
			? 'Platform fees are currently waived during our promotional period'
			: `Platform fees are ${(PLATFORM_FEE_PERCENTAGE * 100).toFixed(1)}% of the transaction amount`

		return answer
			.replace('3.49% + 0.39€', `${(PAYPAL_PERCENTAGE_FEE * 100).toFixed(2)}% + €${PAYPAL_FIXED_FEE.toFixed(2)}`)
			.replace('Platform fees are currently waived during our promotional period', platformFeeText)
			.replace('3) Platform fees are currently waived during our promotional period', `3) ${platformFeeText}`)
	}

	// Calculate fees for example
	const examplePrice = 50
	const paypalPercentageFee = examplePrice * PAYPAL_PERCENTAGE_FEE
	const paypalTotalFee = paypalPercentageFee + PAYPAL_FIXED_FEE
	const platformFee = examplePrice * PLATFORM_FEE_PERCENTAGE
	const sellerReceives = examplePrice - paypalTotalFee - platformFee

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
								<Button asChild className="gap-4" variant="outline">
									<Link href={`/${locale}/contact`}>
										{t.faq.contactButton} <PhoneCall className="h-4 w-4" />
									</Link>
								</Button>
							</div>
						</div>
					</div>

					{/* Right Column - Accordion */}
					<Accordion className="w-full" collapsible type="single">
						{t.faq.items.map(item => {
							// Special handling for fees item to include dynamic content and PayPal link
							if (item.id === 'fees') {
								const formattedAnswer = formatFeesAnswer(item.answer)
								return (
									<AccordionItem key={item.id} value={item.id}>
										<AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
										<AccordionContent className="text-muted-foreground">
											<div className="space-y-4">
												<p>{formattedAnswer}</p>

												{/* Fee Calculation Example */}
												<div className="bg-muted/50 space-y-3 rounded-lg p-4">
													<div className="flex items-center gap-2">
														<Calculator className="text-primary h-4 w-4" />
														<h4 className="text-sm font-medium">{t.faq.fees.calculation.title}</h4>
													</div>
													<p className="text-sm font-medium">{t.faq.fees.calculation.examplePrice}</p>

													<div className="space-y-2 text-sm">
														<div className="flex justify-between">
															<span>{t.faq.fees.calculation.buyerPays}</span>
															<span className="font-medium">€{examplePrice.toFixed(2)}</span>
														</div>
														<div className="text-muted-foreground flex justify-between">
															<span>{t.faq.fees.calculation.paypalFees}</span>
															<span>-€{paypalTotalFee.toFixed(2)}</span>
														</div>
														{PLATFORM_FEE_PERCENTAGE > 0 && (
															<div className="text-muted-foreground flex justify-between">
																<span>{t.faq.fees.calculation.platformFees}</span>
																<span>-€{platformFee.toFixed(2)}</span>
															</div>
														)}
														<div className="flex justify-between border-t pt-2 font-medium">
															<span>{t.faq.fees.calculation.sellerReceives}</span>
															<span className="text-green-600 dark:text-green-400">€{sellerReceives.toFixed(2)}</span>
														</div>
													</div>

													<p className="text-muted-foreground text-xs">{t.faq.fees.calculation.note}</p>
												</div>

												{/* PayPal fees link */}
												<div className="pt-2">
													<Link
														href={paypalLinks}
														target="_blank"
														rel="noopener noreferrer"
														className="text-primary inline-flex items-center gap-2 text-sm hover:underline"
													>
														{t.faq.fees.paypalLinkText}
														<ExternalLink className="h-3 w-3" />
													</Link>
												</div>

												{/* Promotional message if platform fees are waived */}
												{PLATFORM_FEE_PERCENTAGE === 0 && (
													<div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
														<p className="text-sm font-medium text-green-800 dark:text-green-200">
															{t.faq.fees.promotionalMessage}
														</p>
													</div>
												)}
											</div>
										</AccordionContent>
									</AccordionItem>
								)
							}

							// Default rendering for other items
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
