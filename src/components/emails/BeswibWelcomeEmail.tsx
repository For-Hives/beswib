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
import type * as React from 'react'
import constantsLocales from '@/constants/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'

import { Footer } from './Footer'

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

export const BeswibWelcomeEmail = ({ steps, locale = 'fr', firstName = 'Coureur' }: BeswibWelcomeEmailProps) => {
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
							},
						},
					},
				}}
			>
				<Body className="bg-background font-sans">
					<Preview>{t.emails.welcome.preheader.replace('{firstName}', firstName)}</Preview>
					<Container className="mx-auto max-w-[600px] px-4 py-8">
						{/* Header avec logo */}
						<Section className="mb-8">
							<Img src={`${baseUrl}/beswib.png`} width="100" height="100" alt="Beswib" className="mx-auto" />
						</Section>

						{/* Card principale */}
						<Section className="bg-card border-border rounded-lg border px-8 shadow-sm">
							<Heading className="text-foreground mb-6 text-center text-3xl font-bold">
								🎉&nbsp;&nbsp;{t.emails.welcome.title.replace('{firstName}', firstName)}&nbsp;&nbsp;🎉
							</Heading>
							<Text className="text-muted-foreground mb-6 text-start text-lg opacity-90">
								{t.emails.welcome.heroSubtitle}
							</Text>

							<Text className="text-muted-foreground mb-6 text-start text-base leading-relaxed">
								{t.emails.welcome.body1}
							</Text>

							<Text className="text-muted-foreground mb-6 text-start text-base leading-relaxed">
								{t.emails.welcome.nextStepsTitle} :
							</Text>

							<Section className="bg-muted border-border text-foreground mb-6 rounded-lg border p-3 font-mono">
								{(steps ?? defaultSteps).map(step => (
									<Section key={step.id} className="bg-card border-border mb-4 rounded-lg border p-2">
										<Heading className="text-foreground mb-2 text-lg font-semibold">
											{step.id}. {step.title}
										</Heading>
										<Text className="text-muted-foreground mb-3 text-sm leading-relaxed">{step.description}</Text>
										{step.link != null && step.link !== undefined && step.link !== '' && (
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

							<Text className="text-muted-foreground mb-6 text-start text-sm">{t.verifiedEmail.ignore}</Text>
						</Section>

						{/* Footer */}
						<Footer locale={locale} baseUrl={baseUrl} />
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
