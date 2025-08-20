import {
	Body,
	Button,
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
import type * as React from 'react'

import { getTranslations } from '@/lib/i18n/dictionary'
import constantsLocales from '@/constants/locales.json'

interface BeswibWelcomeEmailProps {
	firstName?: string
	locale?: string
	steps?: {
		id: number
		title: string
		description: React.ReactNode
		link?: string
	}[]
	quickLinks?: {
		title: string
		href: string
		description?: string
	}[]
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

export const BeswibWelcomeEmail = ({
	steps,
	quickLinks,
	locale = 'fr',
	firstName = 'Coureur',
}: BeswibWelcomeEmailProps) => {
	const t = getTranslations(locale, constantsLocales)

	// Default steps with translations from locales.json - SIMPLE AND DIRECT! ✨
	const defaultSteps = [
		{
			title: t.emails.welcome.steps.marketplace.title,
			link: `${baseUrl}/marketplace`,
			id: 1,
			description: t.emails.welcome.steps.marketplace.description,
		},
		{
			title: t.emails.welcome.steps.profile.title,
			link: `${baseUrl}/profile`,
			id: 2,
			description: t.emails.welcome.steps.profile.description,
		},
		{
			title: t.emails.welcome.steps.sell.title,
			link: `${baseUrl}/dashboard/seller`,
			id: 3,
			description: t.emails.welcome.steps.sell.description,
		},
		{
			title: t.emails.welcome.steps.community.title,
			link: `${baseUrl}/events`,
			id: 4,
			description: t.emails.welcome.steps.community.description,
		},
	]

	const defaultQuickLinks = [
		{
			title: t.emails.welcome.quickLinks.support.title,
			href: `${baseUrl}/contact`,
			description: t.emails.welcome.quickLinks.support.description,
		},
		{
			title: t.emails.welcome.quickLinks.guide.title,
			href: `${baseUrl}/guide`,
			description: t.emails.welcome.quickLinks.guide.description,
		},
		{
			title: t.emails.welcome.quickLinks.events.title,
			href: `${baseUrl}/events`,
			description: t.emails.welcome.quickLinks.events.description,
		},
	]
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
								'primary-foreground': 'oklch(1 0 0)',
								primary: 'oklch(0.6231 0.188 259.8145)',
								'muted-foreground': 'oklch(0.46 0.02 264.36)',
								muted: 'oklch(0.985 0.0015 247.8)',
								foreground: 'oklch(0.24 0 0)',
								card: 'oklch(1 0 0)',
								border: 'oklch(0.89 0.004 264.53)',
								background: 'oklch(1 0 0)',
								'accent-foreground': 'oklch(0.28 0.12 265.52)',
								accent: 'oklch(0.96 0.02 236.82)',
							},
						},
					},
				}}
			>
				<Preview>{t.emails.welcome.preheader.replace('{firstName}', firstName)}</Preview>
				<Body className="bg-background font-sans">
					{/* Header avec gradient */}
					<Section className="from-primary to-accent mb-0 bg-gradient-to-r py-8">
						<Container className="mx-auto max-w-[600px] px-4">
							<Img src={`/beswib.png`} width="100" height="100" alt="Beswib" className="mx-auto" />

							<Heading className="text-primary mb-2 text-center text-3xl font-bold">
								🎉&nbsp;{t.emails.welcome.title.replace('{firstName}', firstName)}&nbsp;🎉
							</Heading>
							<Text className="text-primary text-center text-lg opacity-90">{t.emails.welcome.heroSubtitle}</Text>
						</Container>
					</Section>

					<Container className="mx-auto max-w-[600px] px-4 py-8">
						{/* Message de bienvenue */}
						<Section>
							<Text className="text-foreground mb-4 text-base leading-relaxed">{t.emails.welcome.body1}</Text>
							<Text className="text-foreground mb-6 text-base leading-relaxed">
								{t.emails.welcome.nextStepsTitle} :
							</Text>
						</Section>

						{/* Étapes */}
						<Section>
							{(steps ?? defaultSteps).map(step => (
								<Section key={step.id} className="bg-card border-border mb-4 rounded-lg border p-0">
									<Heading className="text-foreground mb-2 text-lg font-semibold">
										{step.id}. {step.title}
									</Heading>
									<Text className="text-muted-foreground mb-3 text-sm leading-relaxed">{step.description}</Text>
									{step.link !== null && step.link !== undefined && step.link !== '' && (
										<Link
											href={step.link}
											style={{
												textDecoration: 'none',
												fontWeight: '500',
												fontSize: '14px',
												color: 'oklch(0.6231 0.188 259.8145)',
											}}
										>
											{t.emails.welcome.footer.learnMore}
										</Link>
									)}
								</Section>
							))}
						</Section>

						{/* CTA principal */}
						<Section className="mb-8 text-center">
							<Button
								href={`${baseUrl}/marketplace`}
								className="bg-primary text-primary-foreground rounded-lg px-8 py-4 text-lg font-semibold no-underline"
							>
								{t.emails.welcome.cta}
							</Button>
						</Section>

						{/* Liens rapides - same structure as EmailVerification */}
						<Section className="bg-muted rounded-lg p-6">
							<Heading className="text-foreground mb-4 text-center text-lg font-semibold">
								{t.emails.welcome.footer.usefulLinks}
							</Heading>
							<Section className="flex justify-center gap-8">
								{(quickLinks ?? defaultQuickLinks).map(link => (
									<Section key={link.title} className="text-center">
										<Link
											href={link.href}
											style={{
												textDecoration: 'none',
												marginBottom: '4px',
												fontWeight: '600',
												display: 'block',
												color: 'oklch(0.6231 0.188 259.8145)',
											}}
										>
											{link.title}
										</Link>
										{link.description !== null && link.description !== undefined && link.description !== '' && (
											<Text className="text-muted-foreground text-xs">{link.description}</Text>
										)}
									</Section>
								))}
							</Section>
						</Section>
					</Container>

					{/* Footer - same structure as EmailVerification */}
					<Container className="mx-auto max-w-[600px] px-4 pb-8">
						<Section className="bg-card border-border rounded-lg border px-8 shadow-sm">
							<Section className="">
								<Link href={`${baseUrl}`} className="text-muted-foreground text-center text-xs underline">
									{locale === 'fr'
										? 'Notre site'
										: locale === 'en'
											? 'Our site'
											: locale === 'es'
												? 'Nuestro sitio'
												: locale === 'it'
													? 'Il nostro sito'
													: locale === 'de'
														? 'Unsere Seite'
														: locale === 'pt'
															? 'O nosso site'
															: locale === 'nl'
																? 'Onze site'
																: locale === 'ko'
																	? '우리 사이트'
																	: locale === 'ro'
																		? 'Situl nostru'
																		: 'Our site'}
								</Link>
								&nbsp;&nbsp;|&nbsp;&nbsp;
								<Link href={`${baseUrl}/contact`} className="text-muted-foreground text-center text-xs underline">
									{locale === 'fr'
										? 'Contact'
										: locale === 'en'
											? 'Contact'
											: locale === 'es'
												? 'Contacto'
												: locale === 'it'
													? 'Contatto'
													: locale === 'de'
														? 'Kontakt'
														: locale === 'pt'
															? 'Contacto'
															: locale === 'nl'
																? 'Contact'
																: locale === 'ko'
																	? '연락처'
																	: locale === 'ro'
																		? 'Contact'
																		: 'Contact'}
								</Link>
								&nbsp;&nbsp;|&nbsp;&nbsp;
								<Link
									href={`${baseUrl}/legals/privacy`}
									className="text-muted-foreground text-center text-xs underline"
								>
									{locale === 'fr'
										? 'Confidentialité'
										: locale === 'en'
											? 'Privacy'
											: locale === 'es'
												? 'Privacidad'
												: locale === 'it'
													? 'Privacy'
													: locale === 'de'
														? 'Datenschutz'
														: locale === 'pt'
															? 'Privacidade'
															: locale === 'nl'
																? 'Privacy'
																: locale === 'ko'
																	? '개인정보보호'
																	: locale === 'ro'
																		? 'Confidențialitate'
																		: 'Privacy'}
								</Link>
								&nbsp;&nbsp;|&nbsp;&nbsp;
								<Link href={`${baseUrl}/legals/terms`} className="text-muted-foreground text-center text-xs underline">
									{locale === 'fr'
										? "Conditions d'utilisation"
										: locale === 'en'
											? 'Terms of Service'
											: locale === 'es'
												? 'Términos de Servicio'
												: locale === 'it'
													? 'Termini di Servizio'
													: locale === 'de'
														? 'Nutzungsbedingungen'
														: locale === 'pt'
															? 'Termos de Serviço'
															: locale === 'nl'
																? 'Servicevoorwaarden'
																: locale === 'ko'
																	? '서비스 약관'
																	: locale === 'ro'
																		? 'Termeni de Utilizare'
																		: 'Terms of Service'}
								</Link>
							</Section>
							<Section className="bg-card border-border mt-4 rounded-lg border shadow-sm">
								<Column style={{ width: '66%' }}>
									<Text className="text-muted-foreground text-start text-xs">
										© {new Date().getFullYear()} Beswib. Tous droits réservés.
										<br />
										{t.emails.welcome.footer.platformDescription}
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

BeswibWelcomeEmail.PreviewProps = {
	firstName: 'Marie',
} as BeswibWelcomeEmailProps

export default BeswibWelcomeEmail
