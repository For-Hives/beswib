import { Body, Container, Head, Heading, Html, Img, Preview, Section, Tailwind, Text } from '@react-email/components'
import constantsLocales from '@/constants/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'

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

// Define type for email translations structure
interface EmailTranslations {
	emails: {
		waitlistConfirmation: {
			subject: string
			title: string
			subtitle: string
			congratulations: string
			mainMessage: string
			eventDetails: string
			event: string
			category: string
			distance: string
			date: string
			location: string
			waitlistInfo: string
			createdAt: string
			status: string
			active: string
			nextSteps: string
			step1: string
			step2: string
			step3: string
			step4: string
			unsubscribeInfo: string
			helpText: string
			helpDescription: string
		}
	}
}

export const BeswibWaitlistConfirmation = ({
	locale = 'fr',
	eventName = 'Marathon de Paris 2024',
	eventLocation = 'Paris, France',
	eventDistance = '42.2 km',
	eventDate = '14 avril 2024',
	createdAt = new Date().toLocaleDateString('fr-FR'),
	bibCategory = 'Marathon',
}: BeswibWaitlistConfirmationProps) => {
	// Type-safe translation with fallback
	const getRawTranslations = () => {
		try {
			return getTranslations(locale, constantsLocales)
		} catch {
			// Fallback to default French translations if getTranslations fails
			return getTranslations('fr', constantsLocales)
		}
	}

	const rawTranslations = getRawTranslations()
	const t = rawTranslations as EmailTranslations

	// Fallback values if translation structure is incomplete
	const safeTranslations = {
		emails: {
			waitlistConfirmation: {
				waitlistInfo: t.emails?.waitlistConfirmation?.waitlistInfo || "Informations sur votre liste d'attente :",
				unsubscribeInfo:
					t.emails?.waitlistConfirmation?.unsubscribeInfo ||
					"Vous pouvez vous désinscrire de cette liste d'attente à tout moment.",
				title: t.emails?.waitlistConfirmation?.title || 'Inscription confirmée !',
				subtitle: t.emails?.waitlistConfirmation?.subtitle || "Vous êtes maintenant sur la liste d'attente",
				subject:
					t.emails?.waitlistConfirmation?.subject || "Confirmation d'inscription sur liste d'attente - {eventName}",
				step4: t.emails?.waitlistConfirmation?.step4 || '4. Préparez-vous pour la course !',
				step3:
					t.emails?.waitlistConfirmation?.step3 || '3. Une fois confirmé, vous recevrez vos informations de dossard',
				step2: t.emails?.waitlistConfirmation?.step2 || '2. Vous aurez 24h pour confirmer votre achat',
				step1: t.emails?.waitlistConfirmation?.step1 || "1. Nous vous contacterons dès qu'un dossard se libère",
				status: t.emails?.waitlistConfirmation?.status || 'Statut',
				nextSteps: t.emails?.waitlistConfirmation?.nextSteps || 'Prochaines étapes :',
				mainMessage:
					t.emails?.waitlistConfirmation?.mainMessage || "Nous vous préviendrons dès qu'un dossard se libère.",
				location: t.emails?.waitlistConfirmation?.location || 'Lieu',
				helpText: t.emails?.waitlistConfirmation?.helpText || "Besoin d'aide ?",
				helpDescription: t.emails?.waitlistConfirmation?.helpDescription || 'Contactez notre équipe support.',
				eventDetails: t.emails?.waitlistConfirmation?.eventDetails || "Détails de l'événement :",
				event: t.emails?.waitlistConfirmation?.event || 'Événement',
				distance: t.emails?.waitlistConfirmation?.distance || 'Distance',
				date: t.emails?.waitlistConfirmation?.date || 'Date',
				createdAt: t.emails?.waitlistConfirmation?.createdAt || 'Inscrit le',
				congratulations:
					t.emails?.waitlistConfirmation?.congratulations ||
					"Félicitations ! Vous avez été ajouté(e) à la liste d'attente pour {eventName}.",
				category: t.emails?.waitlistConfirmation?.category || 'Catégorie',
				active: t.emails?.waitlistConfirmation?.active || 'Actif',
			},
		},
	}

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
					<Preview>{safeTranslations.emails.waitlistConfirmation.subject.replace('{eventName}', eventName)}</Preview>
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
									{safeTranslations.emails.waitlistConfirmation.title}
								</Heading>
								<Text className="text-muted-foreground text-base">
									{safeTranslations.emails.waitlistConfirmation.subtitle}
								</Text>
							</Section>

							{/* Message de félicitations */}
							<Section className="text-start">
								<Text className="text-muted-foreground text-base leading-relaxed">
									{safeTranslations.emails.waitlistConfirmation.congratulations.replace('{eventName}', eventName || '')}
								</Text>
							</Section>

							{/* Message principal */}
							<Section className="text-start">
								<Text className="text-muted-foreground text-base leading-relaxed">
									{safeTranslations.emails.waitlistConfirmation.mainMessage}
								</Text>
							</Section>

							{/* Détails de l'événement */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									🏃‍♂️ {safeTranslations.emails.waitlistConfirmation.eventDetails}
								</Heading>

								<Section>
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{safeTranslations.emails.waitlistConfirmation.event}:
										</Text>
										<Text className="text-foreground text-sm font-semibold">{eventName}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{safeTranslations.emails.waitlistConfirmation.category}:
										</Text>
										<Text className="text-foreground text-sm">{bibCategory}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{safeTranslations.emails.waitlistConfirmation.distance}:
										</Text>
										<Text className="text-foreground text-sm">{eventDistance}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{safeTranslations.emails.waitlistConfirmation.date}:
										</Text>
										<Text className="text-foreground text-sm">{eventDate}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{safeTranslations.emails.waitlistConfirmation.location}:
										</Text>
										<Text className="text-foreground text-sm">{eventLocation}</Text>
									</Section>
								</Section>
							</Section>

							{/* Informations sur l'alerte */}
							<Section className="bg-success-foreground border-success/20 mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									🔔 {safeTranslations.emails.waitlistConfirmation.waitlistInfo}
								</Heading>

								<Section>
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{safeTranslations.emails.waitlistConfirmation.createdAt}:
										</Text>
										<Text className="text-foreground text-sm">{createdAt}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{safeTranslations.emails.waitlistConfirmation.status}:
										</Text>
										<Text className="text-success text-sm font-bold">
											{safeTranslations.emails.waitlistConfirmation.active}
										</Text>
									</Section>
								</Section>
							</Section>

							{/* Prochaines étapes */}
							<Section className="bg-card border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{safeTranslations.emails.waitlistConfirmation.nextSteps}
								</Heading>

								<Section>
									<Text className="text-muted-foreground text-sm">
										• {safeTranslations.emails.waitlistConfirmation.step1}
									</Text>
									<Text className="text-muted-foreground mt-3 text-sm">
										• {safeTranslations.emails.waitlistConfirmation.step2}
									</Text>
									<Text className="text-muted-foreground mt-3 text-sm">
										• {safeTranslations.emails.waitlistConfirmation.step3}
									</Text>
									<Text className="text-muted-foreground mt-3 text-sm">
										• {safeTranslations.emails.waitlistConfirmation.step4}
									</Text>
								</Section>
							</Section>

							{/* Information sur la désinscription */}
							<Section className="bg-muted border-border mt-6 rounded-lg border p-4">
								<Text className="text-muted-foreground text-center text-xs">
									{safeTranslations.emails.waitlistConfirmation.unsubscribeInfo}
								</Text>
							</Section>

							{/* Aide */}
							<Section className="mt-6 text-center">
								<Text className="text-foreground text-sm font-medium">
									{safeTranslations.emails.waitlistConfirmation.helpText}
								</Text>
								<Text className="text-muted-foreground text-sm">
									{safeTranslations.emails.waitlistConfirmation.helpDescription}
								</Text>
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
