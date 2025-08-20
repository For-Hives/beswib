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

interface BeswibEmailVerificationProps {
	validationCode?: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'https://beswib.com'

export const BeswibEmailVerification = ({ validationCode = 'DJZ-TLX' }: BeswibEmailVerificationProps) => (
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
				<Preview>Confirmez votre adresse email - Beswib</Preview>
				<Container className="mx-auto max-w-[600px] px-4 py-8">
					{/* Header avec logo */}
					<Section className="mb-8 text-center">
						<Img src={`${baseUrl}/beswib.svg`} width="140" height="40" alt="Beswib" className="mx-auto" />
					</Section>

					{/* Card principale */}
					<Section className="bg-card border-border rounded-lg border p-8 shadow-sm">
						<Heading className="text-foreground mb-6 text-center text-2xl font-bold">
							Confirmez votre adresse email
						</Heading>

						<Text className="text-muted-foreground mb-6 text-center text-base leading-relaxed">
							Votre code de confirmation est ci-dessous. Entrez-le dans votre navigateur ouvert et nous vous aiderons à
							vous connecter.
						</Text>

						{/* Code de vérification */}
						<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
							<Text className="text-foreground text-center font-mono text-3xl font-bold tracking-wider">
								{validationCode}
							</Text>
						</Section>

						<Text className="text-muted-foreground mb-6 text-center text-sm">
							Si vous n'avez pas demandé cet email, vous pouvez l'ignorer en toute sécurité.
						</Text>

						{/* CTA Button */}
						<Section className="mb-6 text-center">
							<Link
								href={`${baseUrl}/dashboard`}
								className="bg-primary text-primary-foreground inline-block rounded-lg px-8 py-3 font-semibold no-underline"
							>
								Accéder à votre tableau de bord
							</Link>
						</Section>
					</Section>

					{/* Footer */}
					<Section className="mt-8">
						<Text className="text-muted-foreground text-center text-xs">
							©{new Date().getFullYear()} Beswib. Tous droits réservés.
							<br />
							Plateforme de revente de dossards de course à pied.
						</Text>

						<Section className="mt-4 text-center">
							<Link href={`${baseUrl}/contact`} className="text-muted-foreground mr-4 text-xs no-underline">
								Contact
							</Link>
							<Link href={`${baseUrl}/legals/privacy`} className="text-muted-foreground mr-4 text-xs no-underline">
								Confidentialité
							</Link>
							<Link href={`${baseUrl}/legals/terms`} className="text-muted-foreground text-xs no-underline">
								Conditions d'utilisation
							</Link>
						</Section>
					</Section>
				</Container>
			</Body>
		</Tailwind>
	</Html>
)

BeswibEmailVerification.PreviewProps = {
	validationCode: 'ABC-123',
} as BeswibEmailVerificationProps

export default BeswibEmailVerification
