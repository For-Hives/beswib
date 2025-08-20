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

interface BeswibEmailVerificationProps {
	validationCode?: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

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
					<Section className="mb-8">
						<Img src={`/beswib.png`} width="100" height="100" alt="Beswib" className="mx-auto" />
					</Section>

					{/* Card principale */}
					<Section className="bg-card border-border rounded-lg border px-8 shadow-sm">
						<Heading className="text-foreground mb-6 text-start text-2xl font-bold">
							Confirmez votre adresse email
						</Heading>

						<Text className="text-muted-foreground mb-6 text-start text-base leading-relaxed">
							Votre code de confirmation est ci-dessous. Entrez-le dans votre navigateur ouvert et nous vous aiderons à
							vous connecter.
						</Text>

						{/* Code de vérification */}
						<Section className="bg-muted border-border text-foreground mb-6 rounded-lg border p-6 text-center font-mono text-3xl font-bold tracking-wider">
							<Text className="text-foreground text-center font-mono text-3xl font-bold tracking-wider">
								{validationCode}
							</Text>
						</Section>

						<Text className="text-muted-foreground mb-6 text-start text-sm">
							Si vous n'avez pas demandé cet email, vous pouvez l'ignorer en toute sécurité.
						</Text>
					</Section>

					<Section className="bg-card border-border rounded-lg border px-8 shadow-sm">
						<Section className="">
							<Link href={`${baseUrl}`} className="text-muted-foreground text-center text-xs underline">
								Our site
							</Link>
							&nbsp;&nbsp;|&nbsp;&nbsp;
							<Link href={`${baseUrl}/contact`} className="text-muted-foreground text-center text-xs underline">
								Contact
							</Link>
							&nbsp;&nbsp;|&nbsp;&nbsp;
							<Link href={`${baseUrl}/legals/privacy`} className="text-muted-foreground text-center text-xs underline">
								Confidentialité
							</Link>
							&nbsp;&nbsp;|&nbsp;&nbsp;
							<Link href={`${baseUrl}/legals/terms`} className="text-muted-foreground text-center text-xs underline">
								Conditions d'utilisation
							</Link>
						</Section>
						<Section className="bg-card border-border mt-4 rounded-lg border shadow-sm">
							<Column style={{ width: '66%' }}>
								<Text className="text-muted-foreground text-start text-xs">
									©{new Date().getFullYear()} Beswib. Tous droits réservés.
									<br />
									Plateforme de revente de dossards.
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

BeswibEmailVerification.PreviewProps = {
	validationCode: 'ABC-123',
} as BeswibEmailVerificationProps

export default BeswibEmailVerification
