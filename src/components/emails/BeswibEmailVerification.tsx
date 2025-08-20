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

import { getTranslations } from '@/lib/i18n/dictionary'
import constantsLocales from '@/constants/locales.json'

interface BeswibEmailVerificationProps {
	validationCode?: string
	locale?: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

export const BeswibEmailVerification = ({ validationCode = 'DJZ-TLX', locale = 'fr' }: BeswibEmailVerificationProps) => {
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
						<Img src={`/beswib.png`} width="100" height="100" alt="Beswib" className="mx-auto" />
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

						<Text className="text-muted-foreground mb-6 text-start text-sm">
							{t.verifiedEmail.ignore}
						</Text>
					</Section>

					<Section className="bg-card border-border rounded-lg border px-8 shadow-sm">
						<Section className="">
							<Link href={`${baseUrl}`} className="text-muted-foreground text-center text-xs underline">
								{locale === 'fr' ? 'Notre site' : locale === 'en' ? 'Our site' : locale === 'es' ? 'Nuestro sitio' : locale === 'it' ? 'Il nostro sito' : locale === 'de' ? 'Unsere Seite' : locale === 'pt' ? 'O nosso site' : locale === 'nl' ? 'Onze site' : locale === 'ko' ? '우리 사이트' : locale === 'ro' ? 'Situl nostru' : 'Our site'}
							</Link>
							&nbsp;&nbsp;|&nbsp;&nbsp;
							<Link href={`${baseUrl}/contact`} className="text-muted-foreground text-center text-xs underline">
								{locale === 'fr' ? 'Contact' : locale === 'en' ? 'Contact' : locale === 'es' ? 'Contacto' : locale === 'it' ? 'Contatto' : locale === 'de' ? 'Kontakt' : locale === 'pt' ? 'Contacto' : locale === 'nl' ? 'Contact' : locale === 'ko' ? '연락처' : locale === 'ro' ? 'Contact' : 'Contact'}
							</Link>
							&nbsp;&nbsp;|&nbsp;&nbsp;
							<Link href={`${baseUrl}/legals/privacy`} className="text-muted-foreground text-center text-xs underline">
								{locale === 'fr' ? 'Confidentialité' : locale === 'en' ? 'Privacy' : locale === 'es' ? 'Privacidad' : locale === 'it' ? 'Privacy' : locale === 'de' ? 'Datenschutz' : locale === 'pt' ? 'Privacidade' : locale === 'nl' ? 'Privacy' : locale === 'ko' ? '개인정보보호' : locale === 'ro' ? 'Confidențialitate' : 'Privacy'}
							</Link>
							&nbsp;&nbsp;|&nbsp;&nbsp;
							<Link href={`${baseUrl}/legals/terms`} className="text-muted-foreground text-center text-xs underline">
								{locale === 'fr' ? 'Conditions d\'utilisation' : locale === 'en' ? 'Terms of Service' : locale === 'es' ? 'Términos de Servicio' : locale === 'it' ? 'Termini di Servizio' : locale === 'de' ? 'Nutzungsbedingungen' : locale === 'pt' ? 'Termos de Serviço' : locale === 'nl' ? 'Servicevoorwaarden' : locale === 'ko' ? '서비스 약관' : locale === 'ro' ? 'Termeni de Utilizare' : 'Terms of Service'}
							</Link>
						</Section>
						<Section className="bg-card border-border mt-4 rounded-lg border shadow-sm">
							<Column style={{ width: '66%' }}>
								<Text className="text-muted-foreground text-start text-xs">
									{t.emails.layout.copyright.replace('{year}', new Date().getFullYear().toString())}
									<br />
									{locale === 'fr' ? 'Plateforme de revente de dossards.' : locale === 'en' ? 'Race bib marketplace platform.' : locale === 'es' ? 'Plataforma de mercado de dorsales.' : locale === 'it' ? 'Piattaforma marketplace pettorali.' : locale === 'de' ? 'Startnummern-Marktplatz.' : locale === 'pt' ? 'Plataforma de marketplace de dorsais.' : locale === 'nl' ? 'Startnummer marktplaats platform.' : locale === 'ko' ? '레이스 비브 마켓플레이스 플랫폼.' : locale === 'ro' ? 'Platforma marketplace numere de concurs.' : 'Race bib marketplace platform.'}
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

BeswibEmailVerification.PreviewProps = {
	validationCode: 'ABC-123',
} as BeswibEmailVerificationProps

export default BeswibEmailVerification
