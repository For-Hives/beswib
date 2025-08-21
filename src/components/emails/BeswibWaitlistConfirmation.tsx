import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text, Tailwind } from '@react-email/components'

import { getTranslations } from '@/lib/i18n/dictionary'
import constantsLocales from '@/constants/locales.json'

import { Footer } from './Footer'

interface BeswibWaitlistConfirmationProps {
	userName?: string
	eventName?: string
	eventId?: string
	eventDate?: string
	eventLocation?: string
	eventDistance?: string
	bibCategory?: string
	createdAt?: string
	locale?: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

export const BeswibWaitlistConfirmation = ({
	locale = 'fr',
	eventName = 'Marathon de Paris 2024',
	eventLocation = 'Paris, France',
	eventDistance = '42.2 km',
	eventDate = '14 avril 2024',
	createdAt = new Date().toLocaleDateString('fr-FR'),
	bibCategory = 'Marathon',
}: BeswibWaitlistConfirmationProps) => {
	const t = getTranslations(locale, constantsLocales)

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
					<Preview>{t.emails.waitlistConfirmation.subject.replace('{eventName}', eventName)}</Preview>
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
									{t.emails.waitlistConfirmation.title}
								</Heading>
								<Text className="text-muted-foreground text-base">{t.emails.waitlistConfirmation.subtitle}</Text>
							</Section>

							{/* Message de félicitations */}
							<Section className="text-start">
								<Text className="text-muted-foreground text-base leading-relaxed">
									{t.emails.waitlistConfirmation.congratulations.replace('{eventName}', eventName || '')}
								</Text>
							</Section>

							{/* Message principal */}
							<Section className="text-start">
								<Text className="text-muted-foreground text-base leading-relaxed">
									{t.emails.waitlistConfirmation.mainMessage}
								</Text>
							</Section>

							{/* Détails de l'événement */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									🏃‍♂️ {t.emails.waitlistConfirmation.eventDetails}
								</Heading>

								<Section>
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.waitlistConfirmation.event}:
										</Text>
										<Text className="text-foreground text-sm font-semibold">{eventName}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.waitlistConfirmation.category}:
										</Text>
										<Text className="text-foreground text-sm">{bibCategory}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.waitlistConfirmation.distance}:
										</Text>
										<Text className="text-foreground text-sm">{eventDistance}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.waitlistConfirmation.date}:
										</Text>
										<Text className="text-foreground text-sm">{eventDate}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.waitlistConfirmation.location}:
										</Text>
										<Text className="text-foreground text-sm">{eventLocation}</Text>
									</Section>
								</Section>
							</Section>

							{/* Informations sur l'alerte */}
							<Section className="bg-success-foreground border-success/20 mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									🔔 {t.emails.waitlistConfirmation.waitlistInfo}
								</Heading>

								<Section>
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.waitlistConfirmation.createdAt}:
										</Text>
										<Text className="text-foreground text-sm">{createdAt}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.waitlistConfirmation.status}:
										</Text>
										<Text className="text-success text-sm font-bold">{t.emails.waitlistConfirmation.active}</Text>
									</Section>
								</Section>
							</Section>

							{/* Prochaines étapes */}
							<Section className="bg-card border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{t.emails.waitlistConfirmation.nextSteps}
								</Heading>

								<Section>
									<Text className="text-muted-foreground text-sm">• {t.emails.waitlistConfirmation.step1}</Text>
									<Text className="text-muted-foreground mt-3 text-sm">• {t.emails.waitlistConfirmation.step2}</Text>
									<Text className="text-muted-foreground mt-3 text-sm">• {t.emails.waitlistConfirmation.step3}</Text>
									<Text className="text-muted-foreground mt-3 text-sm">• {t.emails.waitlistConfirmation.step4}</Text>
								</Section>
							</Section>

							{/* Information sur la désinscription */}
							<Section className="bg-muted border-border mt-6 rounded-lg border p-4">
								<Text className="text-muted-foreground text-center text-xs">
									{t.emails.waitlistConfirmation.unsubscribeInfo}
								</Text>
							</Section>

							{/* Aide */}
							<Section className="mt-6 text-center">
								<Text className="text-foreground text-sm font-medium">{t.emails.waitlistConfirmation.helpText}</Text>
								<Text className="text-muted-foreground text-sm">{t.emails.waitlistConfirmation.helpDescription}</Text>
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

BeswibWaitlistConfirmation.PreviewProps = {
	userName: 'Jean Martin',
	locale: 'fr',
	eventName: 'Marathon de Paris 2024',
	eventLocation: 'Paris, France',
	eventId: 'event123',
	eventDistance: '42.2 km',
	eventDate: '14 avril 2024',
	createdAt: new Date().toLocaleDateString('fr-FR'),
	bibCategory: 'Marathon',
} as BeswibWaitlistConfirmationProps

export default BeswibWaitlistConfirmation
