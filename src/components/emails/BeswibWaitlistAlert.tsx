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
	Button,
} from '@react-email/components'

import { getTranslations } from '@/lib/i18n/dictionary'
import constantsLocales from '@/constants/locales.json'

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
								'warning-foreground': 'oklch(0.12 0.0453 83.87)',
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
						<Section className="mb-8">
							<Img src={`/beswib.png`} width="100" height="100" alt="Beswib" className="mx-auto" />
						</Section>

						{/* Card principale */}
						<Section className="bg-card border-border rounded-lg border px-8 py-6 shadow-sm">
							{/* Icon et titre */}
							<Section className="mb-6 text-center">
								<Text className="text-success mb-4 text-4xl">🎯</Text>
								<Heading className="text-foreground mb-2 text-2xl font-bold">{t.emails.waitlistAlert.title}</Heading>
								<Text className="text-muted-foreground text-base">
									{t.emails.waitlistAlert.subtitle.replace('{eventName}', eventName || '')}
								</Text>
							</Section>

							{/* Alerte urgence */}
							<Section className="bg-warning-foreground border-warning mb-6 rounded-lg border-2 p-6">
								<Section className="flex items-center justify-center">
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

								<Section className="space-y-3">
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{t.emails.waitlistAlert.event}:</Text>
										<Text className="text-foreground text-sm font-semibold">{eventName}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.waitlistAlert.category}:
										</Text>
										<Text className="text-foreground text-sm">
											{bibCategory} • {eventDistance}
										</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{t.emails.waitlistAlert.date}:</Text>
										<Text className="text-foreground text-sm">{eventDate}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.waitlistAlert.location}:
										</Text>
										<Text className="text-foreground text-sm">{eventLocation}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{t.emails.waitlistAlert.price}:</Text>
										<Text className="text-success text-sm font-bold">{formatPrice(bibPrice)}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{t.emails.waitlistAlert.seller}:</Text>
										<Text className="text-foreground text-sm">{sellerName}</Text>
									</Section>
								</Section>
							</Section>

							{/* Message personnel */}
							<Section className="mb-6 text-center">
								<Text className="text-muted-foreground text-base leading-relaxed">
									{t.emails.waitlistAlert.personalMessage}
								</Text>
							</Section>

							{/* Button principal */}
							<Section className="mb-6 text-center">
								<Button
									href={`${baseUrl}/events/${eventId}`}
									className="bg-primary text-primary-foreground inline-block rounded-lg px-8 py-4 text-lg font-semibold no-underline"
								>
									{t.emails.waitlistAlert.ctaButton}
								</Button>
							</Section>

							{/* Actions secondaires */}
							<Section className="border-border border-t pt-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{t.emails.waitlistAlert.quickActions}
								</Heading>

								<Section className="flex flex-col space-y-2">
									<Link href={`${baseUrl}/events`} className="text-primary text-sm underline">
										→ {t.emails.waitlistAlert.browseOtherEvents}
									</Link>
									<Link href={`${baseUrl}/dashboard/buyer`} className="text-primary text-sm underline">
										→ {t.emails.waitlistAlert.manageDashboard}
									</Link>
									<Link
										href={`${baseUrl}/waitlist/unsubscribe?event=${eventId}`}
										className="text-muted-foreground text-xs underline"
									>
										{t.emails.waitlistAlert.unsubscribe}
									</Link>
								</Section>
							</Section>
						</Section>

						{/* Footer */}
						<Section className="bg-card border-border rounded-lg border px-8 py-6 shadow-sm">
							<Section className="text-center">
								<Link href={`${baseUrl}`} className="text-muted-foreground text-xs underline">
									{t.emails.waitlistAlert.ourSite}
								</Link>
								&nbsp;&nbsp;|&nbsp;&nbsp;
								<Link href={`${baseUrl}/contact`} className="text-muted-foreground text-xs underline">
									{t.emails.waitlistAlert.contact}
								</Link>
								&nbsp;&nbsp;|&nbsp;&nbsp;
								<Link href={`${baseUrl}/dashboard/buyer`} className="text-muted-foreground text-xs underline">
									{t.emails.waitlistAlert.dashboard}
								</Link>
								&nbsp;&nbsp;|&nbsp;&nbsp;
								<Link href={`${baseUrl}/legals/privacy`} className="text-muted-foreground text-xs underline">
									{t.emails.waitlistAlert.privacy}
								</Link>
							</Section>

							<Section className="bg-card border-border mt-4 rounded-lg border shadow-sm">
								<Column style={{ width: '66%' }}>
									<Text className="text-muted-foreground text-xs">
										{t.emails.layout.copyright.replace('{year}', new Date().getFullYear().toString())}
										<br />
										{t.emails.waitlistAlert.tagline}
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

BeswibWaitlistAlert.PreviewProps = {
	timeRemaining: '2 jours',
	sellerName: 'Marie Dupont',
	locale: 'fr',
	eventName: 'Marathon de Paris 2024',
	eventLocation: 'Paris, France',
	eventId: 'event123',
	eventDistance: '42.2 km',
	eventDate: '14 avril 2024',
	bibPrice: 150,
	bibCategory: 'Marathon',
} as BeswibWaitlistAlertProps

export default BeswibWaitlistAlert
