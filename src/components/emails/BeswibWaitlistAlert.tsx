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
	Tailwind,
	Text,
} from '@react-email/components'
import constantsLocales from '@/constants/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'

import { Footer } from './Footer'

interface BeswibWaitlistAlertProps {
	eventName?: string
	eventId?: string
	bibPrice?: number
	eventDate?: string
	eventLocation?: string
	eventDistance?: string
	bibCategory?: string
	sellerName?: string
	timeRemaining?: string
	listingId?: string
	locale?: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

export const BeswibWaitlistAlert = ({
	timeRemaining = '2 jours',
	sellerName = 'Marie',
	locale = 'fr',
	eventName = 'Marathon de Paris 2024',
	eventLocation = 'Paris, France',
	eventId = 'event123',
	eventDistance = '42.2 km',
	eventDate = '14 avril 2024',
	bibPrice = 150,
	bibCategory = 'Marathon',
}: BeswibWaitlistAlertProps) => {
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
								warning: 'oklch(0.838 0.199 83.87)',
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
					<Preview>{t.emails.waitlistAlert.subject.replace('{eventName}', eventName || '')}</Preview>
					<Container className="mx-auto max-w-[600px] px-4 py-8">
						{/* Header avec logo */}
						<Section>
							<Img src={`${baseUrl}/beswib.png`} width="100" height="100" alt="Beswib" className="mx-auto" />
						</Section>

						{/* Card principale */}
						<Section className="bg-card border-border rounded-lg border px-8 py-6 shadow-sm">
							{/* Icon et titre */}
							<Section className="text-center">
								<Heading className="text-foreground mb-2 text-2xl font-bold">{t.emails.waitlistAlert.title}</Heading>
								<Text className="text-muted-foreground text-base">
									{t.emails.waitlistAlert.subtitle.replace('{eventName}', eventName || '')}
								</Text>
							</Section>

							{/* Message personnel */}
							<Section className="text-start">
								<Text className="text-muted-foreground text-base leading-relaxed">
									{t.emails.waitlistAlert.personalMessage}
								</Text>
							</Section>

							{/* Alerte urgence */}
							<Section className="bg-warning/10 border-warning/30 mb-6 rounded-lg border-2 p-6">
								<Section className="text-center">
									<Text className="text-warning mr-2 text-2xl">⏰</Text>
									<Text className="text-warning text-lg font-bold">
										{t.emails.waitlistAlert.urgencyMessage.replace('{timeRemaining}', timeRemaining || '')}
									</Text>
								</Section>
							</Section>

							{/* Détails de l'événement */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									🏃‍♂️ {t.emails.waitlistAlert.eventDetails}
								</Heading>

								<Section>
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{t.emails.waitlistAlert.event}:</Text>
										<Text className="text-foreground text-sm font-semibold">{eventName}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.waitlistAlert.category}:
										</Text>
										<Text className="text-foreground text-sm">{bibCategory}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.waitlistAlert.distance}:
										</Text>
										<Text className="text-foreground text-sm">{eventDistance}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{t.emails.waitlistAlert.date}:</Text>
										<Text className="text-foreground text-sm">{eventDate}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.waitlistAlert.location}:
										</Text>
										<Text className="text-foreground text-sm">{eventLocation}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{t.emails.waitlistAlert.price}:</Text>
										<Text className="text-success text-sm font-bold">{formatPrice(bibPrice || 0)}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{t.emails.waitlistAlert.seller}:</Text>
										<Text className="text-foreground text-sm">{sellerName}</Text>
									</Section>
								</Section>
							</Section>

							{/* Bouton principal */}
							<Section className="mb-6 text-center">
								<Link
									href={`${baseUrl}/events/${eventId}`}
									style={{
										textDecoration: 'none',
										padding: '16px 32px',
										fontWeight: '600',
										fontSize: '18px',
										display: 'inline-block',
										color: 'oklch(1 0 0)',
										borderRadius: '8px',
										backgroundColor: 'oklch(0.6231 0.188 259.8145)',
									}}
								>
									{t.emails.waitlistAlert.ctaButton}
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

BeswibWaitlistAlert.PreviewProps = {
	timeRemaining: '2 jours',
	sellerName: 'Marie Dupont',
	locale: 'fr',
	listingId: 'listing123',
	eventName: 'Marathon de Paris 2024',
	eventLocation: 'Paris, France',
	eventId: 'event123',
	eventDistance: '42.2 km',
	eventDate: '14 avril 2024',
	bibPrice: 150,
	bibCategory: 'Marathon',
} as BeswibWaitlistAlertProps

export default BeswibWaitlistAlert
