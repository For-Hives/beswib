import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
	Tailwind,
	Column,
} from '@react-email/components'

import { getTranslations } from '@/lib/i18n/dictionary'
import constantsLocales from '@/constants/locales.json'

interface BeswibPurchaseConfirmationProps {
	buyerName?: string
	sellerName?: string
	eventName?: string
	bibPrice?: number
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
	orderId = 'BW123456789',
	locale = 'fr',
	eventName = 'Marathon de Paris 2024',
	eventLocation = 'Paris, France',
	eventDistance = '42.2 km',
	eventDate = '14 avril 2024',
	buyerName = 'Jean',
	bibPrice = 150,
	bibCategory = 'Marathon',
}: BeswibPurchaseConfirmationProps) => {
	const t = getTranslations(locale, constantsLocales)

	const formatPrice = (price: number) => `${price.toFixed(2)}€`

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
						<Section className="mb-8">
							<Img src={`/beswib.png`} width="100" height="100" alt="Beswib" className="mx-auto" />
						</Section>

						{/* Card principale */}
						<Section className="bg-card border-border rounded-lg border px-8 py-6 shadow-sm">
							{/* Icon et titre */}
							<Section className="mb-6 text-center">
								<Text className="text-success mb-4 text-4xl">🏃‍♂️</Text>
								<Heading className="text-foreground mb-2 text-2xl font-bold">
									{t.emails.purchaseConfirmation.title}
								</Heading>
								<Text className="text-muted-foreground text-base">{t.emails.purchaseConfirmation.subtitle}</Text>
							</Section>

							{/* Informations de l'achat */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{t.emails.purchaseConfirmation.purchaseDetails}
								</Heading>

								<Section className="space-y-3">
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseConfirmation.event}:
										</Text>
										<Text className="text-foreground text-sm font-semibold">{eventName}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseConfirmation.category}:
										</Text>
										<Text className="text-foreground text-sm">{bibCategory}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseConfirmation.distance}:
										</Text>
										<Text className="text-foreground text-sm">{eventDistance}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseConfirmation.date}:
										</Text>
										<Text className="text-foreground text-sm">{eventDate}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseConfirmation.location}:
										</Text>
										<Text className="text-foreground text-sm">{eventLocation}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseConfirmation.seller}:
										</Text>
										<Text className="text-foreground text-sm">{sellerName}</Text>
									</Section>

									<Section className="flex justify-between">
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

								<Section className="space-y-3">
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm">{t.emails.purchaseConfirmation.bibPrice}:</Text>
										<Text className="text-foreground text-sm">{formatPrice(bibPrice)}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm">
											{t.emails.purchaseConfirmation.processingFee}:
										</Text>
										<Text className="text-foreground text-sm">{t.emails.purchaseConfirmation.included}</Text>
									</Section>

									<Section className="border-border border-t pt-3">
										<Section className="flex justify-between">
											<Text className="text-foreground text-base font-bold">
												{t.emails.purchaseConfirmation.totalPaid}:
											</Text>
											<Text className="text-success text-base font-bold">{formatPrice(bibPrice)}</Text>
										</Section>
									</Section>
								</Section>
							</Section>

							{/* Message de félicitations */}
							<Section className="mb-6 text-center">
								<Text className="text-muted-foreground text-base leading-relaxed">
									{t.emails.purchaseConfirmation.congratulations.replace('{buyerName}', buyerName || '')}
								</Text>
							</Section>

							{/* Prochaines étapes */}
							<Section className="bg-card border-border rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{t.emails.purchaseConfirmation.nextSteps}
								</Heading>

								<Section className="space-y-3">
									<Text className="text-muted-foreground text-sm">• {t.emails.purchaseConfirmation.step1}</Text>
									<Text className="text-muted-foreground text-sm">• {t.emails.purchaseConfirmation.step2}</Text>
									<Text className="text-muted-foreground text-sm">• {t.emails.purchaseConfirmation.step3}</Text>
									<Text className="text-muted-foreground text-sm">• {t.emails.purchaseConfirmation.step4}</Text>
								</Section>
							</Section>
						</Section>

						{/* Footer */}
						<Section className="bg-card border-border rounded-lg border px-8 py-6 shadow-sm">
							<Section className="text-center">
								<Link href={`${baseUrl}`} className="text-muted-foreground text-xs underline">
									{t.emails.purchaseConfirmation.ourSite}
								</Link>
								&nbsp;&nbsp;|&nbsp;&nbsp;
								<Link href={`${baseUrl}/contact`} className="text-muted-foreground text-xs underline">
									{t.emails.purchaseConfirmation.contact}
								</Link>
								&nbsp;&nbsp;|&nbsp;&nbsp;
								<Link href={`${baseUrl}/dashboard/buyer`} className="text-muted-foreground text-xs underline">
									{t.emails.purchaseConfirmation.dashboard}
								</Link>
								&nbsp;&nbsp;|&nbsp;&nbsp;
								<Link href={`${baseUrl}/legals/privacy`} className="text-muted-foreground text-xs underline">
									{t.emails.purchaseConfirmation.privacy}
								</Link>
							</Section>

							<Section className="bg-card border-border mt-4 rounded-lg border shadow-sm">
								<Column style={{ width: '66%' }}>
									<Text className="text-muted-foreground text-xs">
										{t.emails.layout.copyright.replace('{year}', new Date().getFullYear().toString())}
										<br />
										{t.emails.purchaseConfirmation.tagline}
									</Text>
								</Column>
								<Column align="right" className="mt-4 flex flex-row items-center justify-end gap-2">
									<Link href="/">
										<Img src={`/mails/instagram.png`} width="24" height="24" alt="Instagram" className="opacity-80" />
									</Link>
									<Link href="/">
										<Img src={`/mails/strava.png`} width="24" height="24" alt="Strava" className="opacity-80" />
									</Link>
									<Link href="/">
										<Img src={`/mails/linkedin.png`} width="24" height="24" alt="LinkedIn" className="opacity-80" />
									</Link>
								</Column>
							</Section>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

BeswibPurchaseConfirmation.PreviewProps = {
	sellerName: 'Marie Dupont',
	orderId: 'BW123456789',
	locale: 'fr',
	eventName: 'Marathon de Paris 2024',
	eventLocation: 'Paris, France',
	eventDistance: '42.2 km',
	eventDate: '14 avril 2024',
	buyerName: 'Jean Martin',
	bibPrice: 150,
	bibCategory: 'Marathon',
} as BeswibPurchaseConfirmationProps

export default BeswibPurchaseConfirmation
