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
} from '@react-email/components'

import { getTranslations } from '@/lib/i18n/dictionary'
import constantsLocales from '@/constants/locales.json'

import { Footer } from './Footer'

interface BeswibPurchaseApprovalProps {
	buyerName?: string
	eventName?: string
	eventDate?: string
	eventLocation?: string
	bibPrice?: number
	eventDistance?: string
	bibCategory?: string
	organizerName?: string
	orderId?: string
	locale?: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

export const BeswibPurchaseApproval = ({
	organizerName = 'Organisateur marathon',
	orderId = 'BW123456789',
	locale = 'fr',
	eventName = 'Marathon de Paris 2024',
	eventLocation = 'Paris, France',
	eventDistance = '42.2 km',
	eventDate = '14 avril 2024',
	buyerName = 'Jean Martin',
	bibPrice = 150,
	bibCategory = 'Marathon',
}: BeswibPurchaseApprovalProps) => {
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
								info: 'oklch(0.701 0.11 221.2)',
								'info-foreground': 'oklch(0.97 0.013 221.2)',
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
					<Preview>{t.emails.purchaseApproval.subject}</Preview>
					<Container className="mx-auto max-w-[600px] px-4 py-8">
						{/* Header avec logo */}
						<Section>
							<Img src={`${baseUrl}/beswib.png`} width="100" height="100" alt="Beswib" className="mx-auto" />
						</Section>

						{/* Card principale */}
						<Section className="bg-card border-border rounded-lg border px-8 py-6 shadow-sm">
							{/* Icon et titre */}
							<Section className="text-center">
								<Text className="text-success mb-2 text-4xl">🎉</Text>
								<Heading className="text-foreground mb-2 text-2xl font-bold">
									{t.emails.purchaseApproval.subject.replace(' 🎉', '')}
								</Heading>
								<Text className="text-muted-foreground text-base">
									{locale === 'fr'
										? 'Bonjour'
										: locale === 'en'
											? 'Hello'
											: locale === 'es'
												? 'Hola'
												: locale === 'it'
													? 'Ciao'
													: locale === 'de'
														? 'Hallo'
														: locale === 'ko'
															? '안녕하세요'
															: 'Bonjour'}
									{buyerName ? ` ${buyerName}` : ''} 👋
								</Text>
							</Section>

							{/* Message principal */}
							<Section className="text-start">
								<Text className="text-muted-foreground text-base leading-relaxed">
									{t.emails.purchaseApproval.mainMessage} <strong>{t.emails.purchaseApproval.readyToRun}</strong>
								</Text>
							</Section>

							{/* Statut de validation */}
							<Section className="bg-success-foreground border-success/20 mb-6 rounded-lg border-2 p-6">
								<Heading className="text-success mb-4 text-lg font-semibold">
									✅ {t.emails.purchaseApproval.validationDetails}
								</Heading>
								<Text className="text-success text-sm">
									<strong>{t.emails.purchaseApproval.validatedBy}:</strong> {organizerName}
								</Text>
							</Section>

							{/* Détails de l'achat */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									🎫 {t.emails.purchaseApproval.purchaseDetails}
								</Heading>

								<Section>
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseApproval.event}:
										</Text>
										<Text className="text-foreground text-sm font-semibold">{eventName}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseApproval.category}:
										</Text>
										<Text className="text-foreground text-sm">{bibCategory}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseApproval.distance}:
										</Text>
										<Text className="text-foreground text-sm">{eventDistance}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{t.emails.purchaseApproval.date}:</Text>
										<Text className="text-foreground text-sm">{eventDate}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.purchaseApproval.location}:
										</Text>
										<Text className="text-foreground text-sm">{eventLocation}</Text>
									</Section>

									{bibPrice > 0 && (
										<Section className="mt-3 flex justify-between">
											<Text className="text-muted-foreground text-sm font-medium">
												{t.emails.purchaseApproval.pricePaid}:
											</Text>
											<Text className="text-success text-sm font-bold">{formatPrice(bibPrice)}</Text>
										</Section>
									)}

									{orderId && (
										<Section className="mt-3 flex justify-between">
											<Text className="text-muted-foreground text-sm font-medium">
												{t.emails.purchaseApproval.orderId}:
											</Text>
											<Text className="text-foreground font-mono text-sm">{orderId}</Text>
										</Section>
									)}
								</Section>
							</Section>

							{/* Bouton principal */}
							<Section className="mb-6 text-center">
								<Link
									href={`${baseUrl}/events/${eventName?.toLowerCase().replace(/\s+/g, '-') || 'event'}`}
									style={{
										backgroundColor: 'oklch(0.6231 0.188 259.8145)',
										color: 'oklch(1 0 0)',
										textDecoration: 'none',
										padding: '16px 32px',
										borderRadius: '8px',
										fontSize: '18px',
										fontWeight: '600',
										display: 'inline-block',
									}}
								>
									{t.emails.purchaseApproval.viewEventButton}
								</Link>
							</Section>

							{/* Étapes finales */}
							<Section className="bg-card border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									🏁 {t.emails.purchaseApproval.finalSteps}
								</Heading>

								<Section>
									<Text className="text-muted-foreground text-sm">• {t.emails.purchaseApproval.step1}</Text>
									<Text className="text-muted-foreground mt-3 text-sm">• {t.emails.purchaseApproval.step2}</Text>
									<Text className="text-muted-foreground mt-3 text-sm">• {t.emails.purchaseApproval.step3}</Text>
									<Text className="text-muted-foreground mt-3 text-sm">• {t.emails.purchaseApproval.step4}</Text>
								</Section>
							</Section>

							{/* Conseils de préparation */}
							<Section className="bg-info-foreground border-info/20 mb-6 rounded-lg border p-6">
								<Heading className="text-info mb-4 text-lg font-semibold">
									🏃‍♂️ {t.emails.purchaseApproval.preparationTips}
								</Heading>

								<Section>
									<Text className="text-info text-sm">• {t.emails.purchaseApproval.tip1}</Text>
									<Text className="text-info mt-3 text-sm">• {t.emails.purchaseApproval.tip2}</Text>
									<Text className="text-info mt-3 text-sm">• {t.emails.purchaseApproval.tip3}</Text>
								</Section>
							</Section>

							{/* Message de félicitations */}
							<Section className="bg-primary/10 border-primary/30 mb-6 rounded-lg border p-4 text-center">
								<Text className="text-primary text-sm font-medium">🌟 {t.emails.purchaseApproval.congratulations}</Text>
							</Section>

							{/* Aide */}
							<Section className="mt-6 text-center">
								<Text className="text-foreground text-sm font-medium">{t.emails.purchaseApproval.helpText}</Text>
								<Text className="text-muted-foreground text-sm">{t.emails.purchaseApproval.helpDescription}</Text>
								<Link
									href={`${baseUrl}/contact`}
									style={{
										color: 'oklch(0.6231 0.188 259.8145)',
										fontSize: '14px',
										textDecoration: 'underline',
									}}
								>
									{t.emails.purchaseApproval.contactSupport}
								</Link>
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

BeswibPurchaseApproval.PreviewProps = {
	organizerName: 'Organisateur Marathon',
	orderId: 'BW123456789',
	locale: 'fr',
	eventName: 'Marathon de Paris 2024',
	eventLocation: 'Paris, France',
	eventDistance: '42.2 km',
	eventDate: '14 avril 2024',
	buyerName: 'Jean Martin',
	bibPrice: 150,
	bibCategory: 'Marathon',
} as BeswibPurchaseApprovalProps

export default BeswibPurchaseApproval
