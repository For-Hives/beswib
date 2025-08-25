import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text, Tailwind } from '@react-email/components'

import { getTranslations } from '@/lib/i18n/dictionary'
import constantsLocales from '@/constants/locales.json'
import { getFeeBreakdown } from '@/lib/utils/feeCalculations'

import { Footer } from './Footer'

interface BeswibSaleConfirmationProps {
	sellerName?: string
	buyerName?: string
	eventName?: string
	bibPrice?: number
	orderId?: string
	eventDate?: string
	eventLocation?: string
	locale?: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

export const BeswibSaleConfirmation = ({
	sellerName = 'Marie',
	orderId = 'BW123456789',
	locale = 'fr',
	eventName = 'Marathon de Paris 2024',
	eventLocation = 'Paris, France',
	eventDate = '14 avril 2024',
	buyerName = 'Jean',
	bibPrice = 150,
}: BeswibSaleConfirmationProps) => {
	const t = getTranslations(locale, constantsLocales)

	const formatPrice = (price: number) => `${price.toFixed(2)}€`

	// Calculate fees dynamically using the utility functions
	const feeBreakdown = getFeeBreakdown(bibPrice)
	const { platformFee, paypalFee, netAmount } = feeBreakdown

	return (
		<Html>
			<Head />
			<Tailwind
				config={{
					theme: {
						extend: {
							fontFamily: {
								sans: ['Geist', 'Arial', 'sans-serif'],
							},
							colors: {
								'success-foreground': 'oklch(0.972 0.027 138.27)',
								success: 'oklch(0.626 0.124 142.5)',
								'primary-foreground': 'oklch(1 0 0)',
								primary: 'oklch(0.6231 0.188 259.8145)',
								'muted-foreground': 'oklch(0.46 0.02 264.36)',
								muted: 'oklch(0.985 0.0015 247.8)',
								foreground: 'oklch(0.24 0 0)',
								card: 'oklch(1 0 0)',
								border: 'oklch(0.89 0.004 264.53)',
								background: 'oklch(1 0 0)',
							},
						},
					},
				}}
			>
				<Body className="bg-background font-sans">
					<Preview>{t.emails.saleConfirmation.subject}</Preview>
					<Container className="mx-auto max-w-[600px] px-4 py-8">
						{/* Header avec logo */}
						<Section className="">
							<Img src={`${baseUrl}/beswib.png`} width="100" height="100" alt="Beswib" className="mx-auto" />
						</Section>

						{/* Card principale */}
						<Section className="bg-card border-border rounded-lg border px-8 py-6 shadow-sm">
							{/* Icon et titre */}
							<Section className="text-center">
								<Heading className="text-foreground text-2xl font-bold">{t.emails.saleConfirmation.title}</Heading>
								<Text className="text-muted-foreground text-base">{t.emails.saleConfirmation.subtitle}</Text>
							</Section>

							{/* Message de félicitations */}
							<Section className="text-start">
								<Text className="text-muted-foreground text-sm leading-relaxed">
									{t.emails.saleConfirmation.congratulations.replace('{sellerName}', sellerName || '')}
								</Text>
							</Section>

							{/* Informations de la vente */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-1 text-lg font-semibold">
									{t.emails.saleConfirmation.saleDetails}
								</Heading>

								<Section>
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.saleConfirmation.event}:
										</Text>
										<Text className="text-foreground text-sm font-semibold">{eventName}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{t.emails.saleConfirmation.date}:</Text>
										<Text className="text-foreground text-sm">{eventDate}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.saleConfirmation.location}:
										</Text>
										<Text className="text-foreground text-sm">{eventLocation}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.saleConfirmation.buyer}:
										</Text>
										<Text className="text-foreground text-sm">{buyerName}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.saleConfirmation.orderId}:
										</Text>
										<Text className="text-foreground font-mono text-sm">{orderId}</Text>
									</Section>
								</Section>
							</Section>

							{/* Détails financiers */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{t.emails.saleConfirmation.financialBreakdown}
								</Heading>

								<Section>
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm">{t.emails.saleConfirmation.salePrice}:</Text>
										<Text className="text-foreground text-sm">{formatPrice(bibPrice)}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm">{t.emails.saleConfirmation.platformFee}:</Text>
										<Text className="text-foreground text-sm">-{formatPrice(platformFee)}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm">{t.emails.saleConfirmation.paypalFee}:</Text>
										<Text className="text-foreground text-sm">-{formatPrice(paypalFee)}</Text>
									</Section>

									<Section className="border-border mt-3 border-t pt-3">
										<Section className="flex justify-between">
											<Text className="text-foreground text-base font-bold">
												{t.emails.saleConfirmation.totalReceived}:
											</Text>
											<Text className="text-success text-base font-bold">{formatPrice(netAmount)}</Text>
										</Section>
									</Section>
								</Section>
							</Section>

							{/* Prochaines étapes */}
							<Section className="bg-card border-border rounded-lg border">
								<Heading className="text-foreground text-lg font-semibold">
									{t.emails.saleConfirmation.nextSteps}
								</Heading>

								<Section>
									<Text className="text-muted-foreground text-sm">• {t.emails.saleConfirmation.step1}</Text>
									<Text className="text-muted-foreground text-sm">• {t.emails.saleConfirmation.step2}</Text>
									<Text className="text-muted-foreground text-sm">• {t.emails.saleConfirmation.step3}</Text>
								</Section>
							</Section>
						</Section>

						{/* Footer */}
						<Footer locale={locale} baseUrl={baseUrl} />
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

BeswibSaleConfirmation.PreviewProps = {
	sellerName: 'Marie Dupont',
	orderId: 'BW123456789',
	locale: 'fr',
	eventName: 'Marathon de Paris 2024',
	eventLocation: 'Paris, France',
	eventDate: '14 avril 2024',
	buyerName: 'Jean Martin',
	bibPrice: 150,
} as BeswibSaleConfirmationProps

export default BeswibSaleConfirmation
