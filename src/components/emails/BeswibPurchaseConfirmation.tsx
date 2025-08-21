import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text, Tailwind } from '@react-email/components'

import { getTranslations } from '@/lib/i18n/dictionary'
import constantsLocales from '@/constants/locales.json'

import { Footer } from './Footer'

interface BeswibPurchaseConfirmationProps {
	buyerName?: string
	sellerName?: string
	eventName?: string
	listingPrice?: number
	platformFee?: number
	paypalFee?: number
	orderId?: string
	eventDate?: string
	eventLocation?: string
	eventDistance?: string
	bibCategory?: string
	locale?: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

export const BeswibPurchaseConfirmation = ({
	sellerName = 'Marie',
	platformFee = 15, // 10% de 150€
	paypalFee = 5.5,
	orderId = 'BW123456789',
	locale = 'fr',
	listingPrice = 150,
	eventName = 'Marathon de Paris 2024',
	eventLocation = 'Paris, France',
	eventDistance = '42.2 km',
	eventDate = '14 avril 2024',
	buyerName = 'Jean',
	bibCategory = 'Marathon',
}: BeswibPurchaseConfirmationProps) => {
	const t = getTranslations(locale, constantsLocales)

	const formatPrice = (price: number) => `${price.toFixed(2)}€`
	// L'acheteur paie seulement le prix affiché
	const totalAmount = listingPrice
	const netAmount = listingPrice - platformFee - paypalFee

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
					<Preview>{t.emails.purchaseConfirmation.subject}</Preview>
					<Container className="mx-auto max-w-[600px] px-4 py-8">
						{/* Header avec logo */}
						<Section>
							<Img src={`${baseUrl}/beswib.png`} width="100" height="100" alt="Beswib" className="mx-auto" />
						</Section>

						{/* Card principale */}
						<Section className="bg-card border-border rounded-lg border px-8 py-6 shadow-sm">
							{/* Icon et titre */}
							<Section className="text-center">
								<Heading className="text-foreground mb-2 text-2xl font-bold">
									{t.emails.purchaseConfirmation.title}
								</Heading>
								<Text className="text-muted-foreground text-base">{t.emails.purchaseConfirmation.subtitle}</Text>
							</Section>
							{/* Message de félicitations */}
							<Section className="text-start">
								<Text className="text-muted-foreground text-base leading-relaxed">
									{t.emails.purchaseConfirmation.congratulations.replace('{buyerName}', buyerName || '')}
								</Text>
							</Section>

							{/* Informations de l'achat */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{t.emails.purchaseConfirmation.purchaseDetails}
								</Heading>

								<Section>
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseConfirmation.event}:
										</Text>
										<Text className="text-foreground text-sm font-semibold">{eventName}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseConfirmation.category}:
										</Text>
										<Text className="text-foreground text-sm">{bibCategory}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseConfirmation.distance}:
										</Text>
										<Text className="text-foreground text-sm">{eventDistance}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseConfirmation.date}:
										</Text>
										<Text className="text-foreground text-sm">{eventDate}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseConfirmation.location}:
										</Text>
										<Text className="text-foreground text-sm">{eventLocation}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseConfirmation.seller}:
										</Text>
										<Text className="text-foreground text-sm">{sellerName}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseConfirmation.orderId}:
										</Text>
										<Text className="text-foreground font-mono text-sm">{orderId}</Text>
									</Section>
								</Section>
							</Section>

							{/* Détails du paiement */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{t.emails.purchaseConfirmation.paymentSummary}
								</Heading>

								<Section>
									<Section className="flex justify-between">
										<Text className="text-foreground text-base font-bold">
											{t.emails.purchaseConfirmation.totalPaid}:
										</Text>
										<Text className="text-success text-base font-bold">{formatPrice(totalAmount)}</Text>
									</Section>
								</Section>
							</Section>

							{/* Information sur le calcul des frais */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{t.emails.purchaseConfirmation.feeBreakdown}
								</Heading>
								<Text className="text-muted-foreground text-sm leading-relaxed">
									{t.emails.purchaseConfirmation.feeExplanation}
								</Text>
								<Section className="bg-card mt-3 rounded border p-3">
									<Text className="text-foreground text-sm font-medium">
										{t.emails.purchaseConfirmation.netAmount}: {formatPrice(netAmount)}
									</Text>
									<Text className="text-muted-foreground text-xs">
										{listingPrice}€ - {platformFee}€ - {paypalFee}€ = {netAmount}€
									</Text>
								</Section>
							</Section>

							{/* Prochaines étapes */}
							<Section className="bg-card border-border rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{t.emails.purchaseConfirmation.nextSteps}
								</Heading>

								<Section>
									<Text className="text-muted-foreground text-sm">• {t.emails.purchaseConfirmation.step1}</Text>
									<Text className="text-muted-foreground mt-3 text-sm">• {t.emails.purchaseConfirmation.step2}</Text>
									<Text className="text-muted-foreground mt-3 text-sm">• {t.emails.purchaseConfirmation.step3}</Text>
									<Text className="text-muted-foreground mt-3 text-sm">• {t.emails.purchaseConfirmation.step4}</Text>
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

BeswibPurchaseConfirmation.PreviewProps = {
	sellerName: 'Marie Dupont',
	platformFee: 15, // 10% de 150€
	paypalFee: 5.5,
	orderId: 'BW123456789',
	locale: 'fr',
	listingPrice: 150,
	eventName: 'Marathon de Paris 2024',
	eventLocation: 'Paris, France',
	eventDistance: '42.2 km',
	eventDate: '14 avril 2024',
	buyerName: 'Jean Martin',
	bibCategory: 'Marathon',
} as BeswibPurchaseConfirmationProps

export default BeswibPurchaseConfirmation
