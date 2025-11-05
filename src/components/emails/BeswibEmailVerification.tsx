import { Body, Container, Head, Heading, Html, Img, Preview, Section, Tailwind, Text } from '@react-email/components'
import constantsLocales from '@/constants/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'

import { Footer } from './Footer'

interface BeswibEmailVerificationProps {
	validationCode?: string
	locale?: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

export const BeswibEmailVerification = ({
	validationCode = 'DJZ-TLX',
	locale = 'fr',
}: BeswibEmailVerificationProps) => {
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
					<Preview>{t.verifiedEmail.subject.replace('🔐 ', '')}</Preview>
					<Container className="mx-auto max-w-[600px] px-4 py-8">
						{/* Header avec logo */}
						<Section className="mb-8">
							<Img src={`${baseUrl}/beswib.png`} width="100" height="100" alt="Beswib" className="mx-auto" />
						</Section>

						{/* Card principale */}
						<Section className="bg-card border-border rounded-lg border px-8 shadow-sm">
							<Heading className="text-foreground mb-6 text-start text-2xl font-bold">
								{t.verifiedEmail.title.replace('🔐 ', '')}
							</Heading>

							<Text className="text-muted-foreground mb-6 text-start text-base leading-relaxed">
								{t.verifiedEmail.greeting}
							</Text>

							<Text className="text-muted-foreground mb-6 text-start text-base leading-relaxed">
								{t.verifiedEmail.codeIntro}
							</Text>

							{/* Code de vérification */}
							<Section className="bg-muted border-border text-foreground mb-6 rounded-lg border p-6 text-center font-mono text-3xl font-bold tracking-wider">
								<Text className="text-foreground text-center font-mono text-3xl font-bold tracking-wider">
									{validationCode}
								</Text>
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

BeswibEmailVerification.PreviewProps = {
	validationCode: 'ABC-123',
} as BeswibEmailVerificationProps

export default BeswibEmailVerification
