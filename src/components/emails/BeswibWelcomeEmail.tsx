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
} from '@react-email/components'
import type * as React from 'react'

interface BeswibWelcomeEmailProps {
	firstName?: string
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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'https://beswib.com'

export const BeswibWelcomeEmail = ({
	steps = [
		{
			title: 'Explorez le marketplace',
			link: `${baseUrl}/marketplace`,
			id: 1,
			description:
				'Découvrez les dossards disponibles pour vos prochaines courses. Filtrez par distance, lieu et date.',
		},
		{
			title: 'Complétez votre profil',
			link: `${baseUrl}/profile`,
			id: 2,
			description: 'Ajoutez vos informations pour faciliter vos achats et ventes de dossards.',
		},
		{
			title: 'Vendez vos dossards',
			link: `${baseUrl}/dashboard/seller`,
			id: 3,
			description: 'Vous ne pouvez plus participer à une course ? Revendez votre dossard en quelques clics.',
		},
		{
			title: 'Rejoignez la communauté',
			link: `${baseUrl}/events`,
			id: 4,
			description: "Découvrez les événements et connectez-vous avec d'autres coureurs passionnés.",
		},
	],
	quickLinks = [
		{
			title: 'Support',
			href: `${baseUrl}/contact`,
			description: "Besoin d'aide ?",
		},
		{
			title: 'Guide',
			href: `${baseUrl}/guide`,
			description: 'Comment ça marche',
		},
		{
			title: 'Événements',
			href: `${baseUrl}/events`,
			description: 'Courses à venir',
		},
	],
	firstName = 'Coureur',
}: BeswibWelcomeEmailProps) => {
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
				<Preview>Bienvenue sur Beswib - Votre marketplace de dossards</Preview>
				<Body className="bg-background font-sans">
					{/* Header avec gradient */}
					<Section className="from-primary to-accent mb-0 bg-gradient-to-r py-8">
						<Container className="mx-auto max-w-[600px] px-4">
							<Img
								src={`${baseUrl}/beswib.svg`}
								width="140"
								height="40"
								alt="Beswib"
								className="mx-auto mb-4 brightness-0 invert"
							/>
							<Heading className="text-primary-foreground mb-2 text-center text-3xl font-bold">
								Bienvenue sur Beswib, {firstName} ! 🏃‍♂️
							</Heading>
							<Text className="text-primary-foreground text-center text-lg opacity-90">
								Votre marketplace de dossards de course à pied
							</Text>
						</Container>
					</Section>

					<Container className="mx-auto max-w-[600px] px-4 py-8">
						{/* Message de bienvenue */}
						<Section className="mb-8">
							<Text className="text-foreground mb-4 text-base leading-relaxed">
								Félicitations ! Vous rejoignez une communauté de coureurs passionnés qui utilisent Beswib pour acheter
								et vendre des dossards de course.
							</Text>
							<Text className="text-foreground mb-6 text-base leading-relaxed">Voici comment commencer :</Text>
						</Section>

						{/* Étapes */}
						<Section className="mb-8">
							{steps?.map(step => (
								<Section key={step.id} className="bg-card border-border mb-4 rounded-lg border p-6">
									<Heading className="text-foreground mb-2 text-lg font-semibold">
										{step.id}. {step.title}
									</Heading>
									<Text className="text-muted-foreground mb-3 text-sm leading-relaxed">{step.description}</Text>
									{step.link && (
										<Link href={step.link} className="text-primary text-sm font-medium no-underline hover:underline">
											En savoir plus →
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
								Explorer le marketplace
							</Button>
						</Section>

						{/* Liens rapides */}
						<Section className="bg-muted rounded-lg p-6">
							<Heading className="text-foreground mb-4 text-center text-lg font-semibold">Liens utiles</Heading>
							<Section className="flex justify-center gap-8">
								{quickLinks?.map(link => (
									<Section key={link.title} className="text-center">
										<Link href={link.href} className="text-primary mb-1 block font-semibold no-underline">
											{link.title}
										</Link>
										{link.description && <Text className="text-muted-foreground text-xs">{link.description}</Text>}
									</Section>
								))}
							</Section>
						</Section>
					</Container>

					{/* Footer */}
					<Container className="mx-auto max-w-[600px] px-4 pb-8">
						<Section className="border-border border-t pt-6">
							<Text className="text-muted-foreground mb-4 text-center text-sm">
								Bonnes courses !<br />
								<strong>L'équipe Beswib</strong>
							</Text>

							<Section className="mb-4 text-center">
								<Link href={`${baseUrl}/profile`} className="text-muted-foreground mr-4 text-xs no-underline">
									Gérer les préférences
								</Link>
								<Link href={`${baseUrl}/contact`} className="text-muted-foreground text-xs no-underline">
									Se désabonner
								</Link>
							</Section>

							<Text className="text-muted-foreground text-center text-xs">
								©{new Date().getFullYear()} Beswib. Tous droits réservés.
								<br />
								Plateforme de revente de dossards de course à pied.
							</Text>
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
