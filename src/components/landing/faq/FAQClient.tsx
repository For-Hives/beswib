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
	const paypalLinks = {
		ro: 'https://www.paypal.com/ro/webapps/mpp/merchant-fees',
		pt: 'https://www.paypal.com/pt/webapps/mpp/merchant-fees',
		nl: 'https://www.paypal.com/nl/webapps/mpp/merchant-fees',
		ko: 'https://www.paypal.com/kr/webapps/mpp/merchant-fees',
		it: 'https://www.paypal.com/it/webapps/mpp/merchant-fees',
		fr: 'https://www.paypal.com/fr/webapps/mpp/merchant-fees',
		es: 'https://www.paypal.com/es/webapps/mpp/merchant-fees',
		en: 'https://www.paypal.com/us/webapps/mpp/merchant-fees',
		de: 'https://www.paypal.com/de/webapps/mpp/merchant-fees',
	}

	// Localized promotional messages
	const promotionalMessages = {
		ro: '🎉 Ofertă specială: Comisioanele platformei sunt în prezent scutite în timpul perioadei noastre promoționale!',
		pt: '🎉 Oferta especial: As taxas da plataforma estão atualmente isentas durante o nosso período promocional!',
		nl: '🎉 Speciale aanbieding: Platform kosten zijn momenteel vrijgesteld tijdens onze promotieperiode!',
		ko: '🎉 특별 혜택: 현재 프로모션 기간 동안 플랫폼 수수료가 면제됩니다!',
		it: '🎉 Offerta speciale: Le commissioni della piattaforma sono attualmente esenti durante il nostro periodo promozionale!',
		fr: '🎉 Offre spéciale : Les frais de plateforme sont actuellement offerts pendant notre période promotionnelle !',
		es: '🎉 ¡Oferta especial: Las comisiones de plataforma están exentas durante nuestro período promocional!',
		en: '🎉 Special Offer: Platform fees are currently waived during our promotional period!',
		de: '🎉 Sonderangebot: Plattformgebühren sind derzeit während unserer Werbeperiode erlassen!',
	}

	// Localized PayPal link text
	const paypalLinkTexts = {
		ro: 'Vezi comisioanele PayPal detaliate',
		pt: 'Ver taxas PayPal detalhadas',
		nl: 'Bekijk gedetailleerde PayPal kosten',
		ko: 'PayPal 수수료 상세 보기',
		it: 'Vedi commissioni PayPal dettagliate',
		fr: 'Voir les frais PayPal détaillés',
		es: 'Ver comisiones PayPal detalladas',
		en: 'View detailed PayPal fees',
		de: 'Detaillierte PayPal-Gebühren anzeigen',
	}

	// Localized fee calculation example texts
	const feeCalculationTexts = {
		ro: {
			title: 'Exemplu de calcul al comisioanelor',
			sellerReceives: 'Vânzătorul primește:',
			platformFees: 'Comisioane platformă:',
			paypalFees: 'Comisioane PayPal:',
			note: 'Notă: Toate sumele sunt afișate clar înainte de cumpărare',
			examplePrice: 'Exemplu cu un număr de 50€:',
			buyerPays: 'Cumpărătorul plătește:',
		},
		pt: {
			title: 'Exemplo de cálculo de taxas',
			sellerReceives: 'O vendedor recebe:',
			platformFees: 'Taxas da plataforma:',
			paypalFees: 'Taxas PayPal:',
			note: 'Nota: Todos os montantes são claramente exibidos antes da compra',
			examplePrice: 'Exemplo com um dorsal de 50€:',
			buyerPays: 'O comprador paga:',
		},
		nl: {
			title: 'Kostenberekening voorbeeld',
			sellerReceives: 'Verkoper ontvangt:',
			platformFees: 'Platform kosten:',
			paypalFees: 'PayPal kosten:',
			note: 'Opmerking: Alle bedragen worden duidelijk getoond vóór aankoop',
			examplePrice: 'Voorbeeld met een startnummer van 50€:',
			buyerPays: 'Koper betaalt:',
		},
		ko: {
			title: '수수료 계산 예시',
			sellerReceives: '판매자 수령:',
			platformFees: '플랫폼 수수료:',
			paypalFees: 'PayPal 수수료:',
			note: '참고: 모든 금액은 구매 전에 명확하게 표시됩니다',
			examplePrice: '50€ 빕 예시:',
			buyerPays: '구매자 지불:',
		},
		it: {
			title: 'Esempio di calcolo delle commissioni',
			sellerReceives: 'Il venditore riceve:',
			platformFees: 'Commissioni piattaforma:',
			paypalFees: 'Commissioni PayPal:',
			note: "Nota: Tutti gli importi sono chiaramente mostrati prima dell'acquisto",
			examplePrice: 'Esempio con un pettorale da 50€:',
			buyerPays: "L'acquirente paga:",
		},
		fr: {
			title: 'Exemple de calcul des frais',
			sellerReceives: 'Le vendeur reçoit :',
			platformFees: 'Frais de plateforme :',
			paypalFees: 'Frais PayPal :',
			note: "Note : Tous les montants sont clairement affichés avant l'achat",
			examplePrice: 'Exemple avec un dossard à 50€ :',
			buyerPays: "L'acheteur paie :",
		},
		es: {
			title: 'Ejemplo de cálculo de comisiones',
			sellerReceives: 'El vendedor recibe:',
			platformFees: 'Comisiones de plataforma:',
			paypalFees: 'Comisiones PayPal:',
			note: 'Nota: Todos los montos se muestran claramente antes de la compra',
			examplePrice: 'Ejemplo con un dorsal de 50€:',
			buyerPays: 'El comprador paga:',
		},
		en: {
			title: 'Fee Calculation Example',
			sellerReceives: 'Seller receives:',
			platformFees: 'Platform fees:',
			paypalFees: 'PayPal fees:',
			note: 'Note: All amounts are clearly displayed before purchase',
			examplePrice: 'Example with a €50 bib:',
			buyerPays: 'Buyer pays:',
		},
		de: {
			title: 'Gebührenberechnungsbeispiel',
			sellerReceives: 'Der Verkäufer erhält:',
			platformFees: 'Plattformgebühren:',
			paypalFees: 'PayPal-Gebühren:',
			note: 'Hinweis: Alle Beträge werden vor dem Kauf klar angezeigt',
			examplePrice: 'Beispiel mit einer Startnummer für 50€:',
			buyerPays: 'Der Käufer zahlt:',
		},
	}

	// Helper function to format fees dynamically
	const formatFeesAnswer = (answer: string) => {
		const isPromotional = PLATFORM_FEE_PERCENTAGE === 0
		const platformFeeText = isPromotional
			? 'Platform fees are currently waived during our promotional period'
			: `Platform fees are ${(PLATFORM_FEE_PERCENTAGE * 100).toFixed(1)}% of the transaction amount`

		const paypalFeeText = `PayPal fees (${(PAYPAL_PERCENTAGE_FEE * 100).toFixed(2)}% + €${PAYPAL_FIXED_FEE.toFixed(2)})`

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

	const currentTexts = feeCalculationTexts[locale] || feeCalculationTexts.en

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
														<h4 className="text-sm font-medium">{currentTexts.title}</h4>
													</div>
													<p className="text-sm font-medium">{currentTexts.examplePrice}</p>

													<div className="space-y-2 text-sm">
														<div className="flex justify-between">
															<span>{currentTexts.buyerPays}</span>
															<span className="font-medium">€{examplePrice.toFixed(2)}</span>
														</div>
														<div className="text-muted-foreground flex justify-between">
															<span>{currentTexts.paypalFees}</span>
															<span>-€{paypalTotalFee.toFixed(2)}</span>
														</div>
														{PLATFORM_FEE_PERCENTAGE > 0 && (
															<div className="text-muted-foreground flex justify-between">
																<span>{currentTexts.platformFees}</span>
																<span>-€{platformFee.toFixed(2)}</span>
															</div>
														)}
														<div className="flex justify-between border-t pt-2 font-medium">
															<span>{currentTexts.sellerReceives}</span>
															<span className="text-green-600 dark:text-green-400">€{sellerReceives.toFixed(2)}</span>
														</div>
													</div>

													<p className="text-muted-foreground text-xs">{currentTexts.note}</p>
												</div>

												{/* PayPal fees link */}
												<div className="pt-2">
													<Link
														href={paypalLinks[locale] || paypalLinks.en}
														target="_blank"
														rel="noopener noreferrer"
														className="text-primary inline-flex items-center gap-2 text-sm hover:underline"
													>
														{paypalLinkTexts[locale] || paypalLinkTexts.en}
														<ExternalLink className="h-3 w-3" />
													</Link>
												</div>

												{/* Promotional message if platform fees are waived */}
												{PLATFORM_FEE_PERCENTAGE === 0 && (
													<div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
														<p className="text-sm font-medium text-green-800 dark:text-green-200">
															{promotionalMessages[locale] || promotionalMessages.en}
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
