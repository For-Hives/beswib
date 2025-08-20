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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'https://beswib.com'

export const BeswibWelcomeEmail = ({
	firstName = 'Coureur',
	locale = 'fr',
	steps,
	quickLinks,
}: BeswibWelcomeEmailProps) => {
	const t = getTranslations(locale, constantsLocales)
	
	// Default steps with translations
	const defaultSteps = [
		{
			id: 1,
			title: locale === 'fr' ? 'Explorez le marketplace' : locale === 'en' ? 'Explore the marketplace' : locale === 'es' ? 'Explora el marketplace' : locale === 'it' ? 'Esplora il marketplace' : locale === 'de' ? 'Entdecke den Marketplace' : locale === 'pt' ? 'Explora o marketplace' : locale === 'nl' ? 'Verken de marketplace' : locale === 'ko' ? '마켓플레이스 둘러보기' : locale === 'ro' ? 'Explorează marketplace-ul' : 'Explore the marketplace',
			link: `${baseUrl}/marketplace`,
			description: locale === 'fr' ? 'Découvrez les dossards disponibles pour vos prochaines courses. Filtrez par distance, lieu et date.' : locale === 'en' ? 'Discover available bibs for your next races. Filter by distance, location, and date.' : locale === 'es' ? 'Descubre dorsales disponibles para tus próximas carreras. Filtra por distancia, ubicación y fecha.' : locale === 'it' ? 'Scopri i pettorali disponibili per le tue prossime gare. Filtra per distanza, località e data.' : locale === 'de' ? 'Entdecke verfügbare Startnummern für deine nächsten Läufe. Filtere nach Distanz, Ort und Datum.' : locale === 'pt' ? 'Descobre dorsais disponíveis para as tuas próximas corridas. Filtra por distância, localização e data.' : locale === 'nl' ? 'Ontdek beschikbare startnummers voor je volgende races. Filter op afstand, locatie en datum.' : locale === 'ko' ? '다음 레이스를 위한 사용 가능한 비브를 찾아보세요. 거리, 위치, 날짜로 필터링하세요.' : locale === 'ro' ? 'Descoperă numerele disponibile pentru următoarele curse. Filtrează după distanță, locație și dată.' : 'Discover available bibs for your next races. Filter by distance, location, and date.',
		},
		{
			id: 2,
			title: locale === 'fr' ? 'Complétez votre profil' : locale === 'en' ? 'Complete your profile' : locale === 'es' ? 'Completa tu perfil' : locale === 'it' ? 'Completa il profilo' : locale === 'de' ? 'Vervollständige dein Profil' : locale === 'pt' ? 'Completa o teu perfil' : locale === 'nl' ? 'Voltooi je profiel' : locale === 'ko' ? '프로필 완성하기' : locale === 'ro' ? 'Completează profilul' : 'Complete your profile',
			link: `${baseUrl}/profile`,
			description: locale === 'fr' ? 'Ajoutez vos informations pour faciliter vos achats et ventes de dossards.' : locale === 'en' ? 'Add your information to facilitate your bib purchases and sales.' : locale === 'es' ? 'Añade tu información para facilitar tus compras y ventas de dorsales.' : locale === 'it' ? 'Aggiungi le tue informazioni per facilitare acquisti e vendite di pettorali.' : locale === 'de' ? 'Füge deine Informationen hinzu, um Kauf und Verkauf von Startnummern zu erleichtern.' : locale === 'pt' ? 'Adiciona as tuas informações para facilitar as compras e vendas de dorsais.' : locale === 'nl' ? 'Voeg je informatie toe om aankoop en verkoop van startnummers te vergemakkelijken.' : locale === 'ko' ? '비브 구매 및 판매를 용이하게 하기 위해 정보를 추가하세요.' : locale === 'ro' ? 'Adaugă informațiile pentru a facilita cumpărăturile și vânzările de numere.' : 'Add your information to facilitate your bib purchases and sales.',
		},
		{
			id: 3,
			title: locale === 'fr' ? 'Vendez vos dossards' : locale === 'en' ? 'Sell your bibs' : locale === 'es' ? 'Vende tus dorsales' : locale === 'it' ? 'Vendi i tuoi pettorali' : locale === 'de' ? 'Verkaufe deine Startnummern' : locale === 'pt' ? 'Vende os teus dorsais' : locale === 'nl' ? 'Verkoop je startnummers' : locale === 'ko' ? '비브 판매하기' : locale === 'ro' ? 'Vinde numerele' : 'Sell your bibs',
			link: `${baseUrl}/dashboard/seller`,
			description: locale === 'fr' ? 'Vous ne pouvez plus participer à une course ? Revendez votre dossard en quelques clics.' : locale === 'en' ? 'Can\'t participate in a race anymore? Resell your bib in just a few clicks.' : locale === 'es' ? '¿Ya no puedes participar en una carrera? Revende tu dorsal en pocos clics.' : locale === 'it' ? 'Non puoi più partecipare a una gara? Rivendi il tuo pettorale in pochi clic.' : locale === 'de' ? 'Kannst nicht mehr an einem Lauf teilnehmen? Verkaufe deine Startnummer mit wenigen Klicks.' : locale === 'pt' ? 'Já não podes participar numa corrida? Revende o teu dorsal em poucos cliques.' : locale === 'nl' ? 'Kun je niet meer deelnemen aan een race? Verkoop je startnummer met een paar klikken.' : locale === 'ko' ? '더 이상 레이스에 참가할 수 없나요? 몇 번의 클릭으로 비브를 재판매하세요.' : locale === 'ro' ? 'Nu mai poți participa la o cursă? Revinde numărul în câteva clicuri.' : 'Can\'t participate in a race anymore? Resell your bib in just a few clicks.',
		},
		{
			id: 4,
			title: locale === 'fr' ? 'Rejoignez la communauté' : locale === 'en' ? 'Join the community' : locale === 'es' ? 'Únete a la comunidad' : locale === 'it' ? 'Unisciti alla comunità' : locale === 'de' ? 'Tritt der Community bei' : locale === 'pt' ? 'Junta-te à comunidade' : locale === 'nl' ? 'Word lid van de gemeenschap' : locale === 'ko' ? '커뮤니티 가입하기' : locale === 'ro' ? 'Alătură-te comunității' : 'Join the community',
			link: `${baseUrl}/events`,
			description: locale === 'fr' ? 'Découvrez les événements et connectez-vous avec d\'autres coureurs passionnés.' : locale === 'en' ? 'Discover events and connect with other passionate runners.' : locale === 'es' ? 'Descubre eventos y conéctate con otros corredores apasionados.' : locale === 'it' ? 'Scopri eventi e connettiti con altri corridori appassionati.' : locale === 'de' ? 'Entdecke Events und verbinde dich mit anderen leidenschaftlichen Läufern.' : locale === 'pt' ? 'Descobre eventos e conecta-te com outros corredores apaixonados.' : locale === 'nl' ? 'Ontdek evenementen en maak contact met andere gepassioneerde lopers.' : locale === 'ko' ? '이벤트를 발견하고 다른 열정적인 러너들과 연결하세요.' : locale === 'ro' ? 'Descoperă evenimente și conectează-te cu alți alergători pasionați.' : 'Discover events and connect with other passionate runners.',
		},
	]
	
	const defaultQuickLinks = [
		{
			title: locale === 'fr' ? 'Support' : locale === 'en' ? 'Support' : locale === 'es' ? 'Soporte' : locale === 'it' ? 'Supporto' : locale === 'de' ? 'Support' : locale === 'pt' ? 'Suporte' : locale === 'nl' ? 'Ondersteuning' : locale === 'ko' ? '지원' : locale === 'ro' ? 'Suport' : 'Support',
			href: `${baseUrl}/contact`,
			description: locale === 'fr' ? 'Besoin d\'aide ?' : locale === 'en' ? 'Need help?' : locale === 'es' ? '¿Necesitas ayuda?' : locale === 'it' ? 'Hai bisogno di aiuto?' : locale === 'de' ? 'Brauchst du Hilfe?' : locale === 'pt' ? 'Precisas de ajuda?' : locale === 'nl' ? 'Hulp nodig?' : locale === 'ko' ? '도움이 필요하신가요?' : locale === 'ro' ? 'Ai nevoie de ajutor?' : 'Need help?',
		},
		{
			title: locale === 'fr' ? 'Guide' : locale === 'en' ? 'Guide' : locale === 'es' ? 'Guía' : locale === 'it' ? 'Guida' : locale === 'de' ? 'Leitfaden' : locale === 'pt' ? 'Guia' : locale === 'nl' ? 'Gids' : locale === 'ko' ? '가이드' : locale === 'ro' ? 'Ghid' : 'Guide',
			href: `${baseUrl}/guide`,
			description: locale === 'fr' ? 'Comment ça marche' : locale === 'en' ? 'How it works' : locale === 'es' ? 'Cómo funciona' : locale === 'it' ? 'Come funziona' : locale === 'de' ? 'Wie es funktioniert' : locale === 'pt' ? 'Como funciona' : locale === 'nl' ? 'Hoe het werkt' : locale === 'ko' ? '작동 방식' : locale === 'ro' ? 'Cum funcționează' : 'How it works',
		},
		{
			title: locale === 'fr' ? 'Événements' : locale === 'en' ? 'Events' : locale === 'es' ? 'Eventos' : locale === 'it' ? 'Eventi' : locale === 'de' ? 'Events' : locale === 'pt' ? 'Eventos' : locale === 'nl' ? 'Evenementen' : locale === 'ko' ? '이벤트' : locale === 'ro' ? 'Evenimente' : 'Events',
			href: `${baseUrl}/events`,
			description: locale === 'fr' ? 'Courses à venir' : locale === 'en' ? 'Upcoming races' : locale === 'es' ? 'Carreras próximas' : locale === 'it' ? 'Gare imminenti' : locale === 'de' ? 'Bevorstehende Läufe' : locale === 'pt' ? 'Corridas próximas' : locale === 'nl' ? 'Aankomende races' : locale === 'ko' ? '다가오는 레이스' : locale === 'ro' ? 'Curse viitoare' : 'Upcoming races',
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
							<Img
								src={`${baseUrl}/beswib.svg`}
								width="140"
								height="40"
								alt="Beswib"
								className="mx-auto mb-4 brightness-0 invert"
							/>
							<Heading className="text-primary-foreground mb-2 text-center text-3xl font-bold">
								{t.emails.welcome.title.replace('{firstName}', firstName)} 🏃‍♂️
							</Heading>
							<Text className="text-primary-foreground text-center text-lg opacity-90">
								{t.emails.welcome.heroSubtitle}
							</Text>
						</Container>
					</Section>

					<Container className="mx-auto max-w-[600px] px-4 py-8">
						{/* Message de bienvenue */}
						<Section className="mb-8">
							<Text className="text-foreground mb-4 text-base leading-relaxed">
								{t.emails.welcome.body1}
							</Text>
							<Text className="text-foreground mb-6 text-base leading-relaxed">{t.emails.welcome.nextStepsTitle} :</Text>
						</Section>

						{/* Étapes */}
						<Section className="mb-8">
							{(steps || defaultSteps).map(step => (
								<Section key={step.id} className="bg-card border-border mb-4 rounded-lg border p-6">
									<Heading className="text-foreground mb-2 text-lg font-semibold">
										{step.id}. {step.title}
									</Heading>
									<Text className="text-muted-foreground mb-3 text-sm leading-relaxed">{step.description}</Text>
									{step.link && (
										<Link href={step.link} className="text-primary text-sm font-medium no-underline hover:underline">
											{locale === 'fr' ? 'En savoir plus →' : locale === 'en' ? 'Learn more →' : locale === 'es' ? 'Saber más →' : locale === 'it' ? 'Scopri di più →' : locale === 'de' ? 'Mehr erfahren →' : locale === 'pt' ? 'Saber mais →' : locale === 'nl' ? 'Meer weten →' : locale === 'ko' ? '더 알아보기 →' : locale === 'ro' ? 'Află mai multe →' : 'Learn more →'}
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

						{/* Liens rapides */}
						<Section className="bg-muted rounded-lg p-6">
							<Heading className="text-foreground mb-4 text-center text-lg font-semibold">{locale === 'fr' ? 'Liens utiles' : locale === 'en' ? 'Useful links' : locale === 'es' ? 'Enlaces útiles' : locale === 'it' ? 'Link utili' : locale === 'de' ? 'Nützliche Links' : locale === 'pt' ? 'Links úteis' : locale === 'nl' ? 'Nuttige links' : locale === 'ko' ? '유용한 링크' : locale === 'ro' ? 'Link-uri utile' : 'Useful links'}</Heading>
							<Section className="flex justify-center gap-8">
								{(quickLinks || defaultQuickLinks).map(link => (
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
								{locale === 'fr' ? 'Bonnes courses !' : locale === 'en' ? 'Happy running!' : locale === 'es' ? '¡Felices carreras!' : locale === 'it' ? 'Buone corse!' : locale === 'de' ? 'Viel Spaß beim Laufen!' : locale === 'pt' ? 'Boas corridas!' : locale === 'nl' ? 'Veel loopplezier!' : locale === 'ko' ? '즐거운 런닝!' : locale === 'ro' ? 'Alergări plăcute!' : 'Happy running!'}<br />
								<strong>{locale === 'fr' ? 'L\'équipe Beswib' : locale === 'en' ? 'The Beswib Team' : locale === 'es' ? 'El equipo de Beswib' : locale === 'it' ? 'Il team Beswib' : locale === 'de' ? 'Das Beswib-Team' : locale === 'pt' ? 'A equipa Beswib' : locale === 'nl' ? 'Het Beswib-team' : locale === 'ko' ? 'Beswib 팀' : locale === 'ro' ? 'Echipa Beswib' : 'The Beswib Team'}</strong>
							</Text>

							<Section className="mb-4 text-center">
								<Link href={`${baseUrl}/profile`} className="text-muted-foreground mr-4 text-xs no-underline">
									{locale === 'fr' ? 'Gérer les préférences' : locale === 'en' ? 'Manage preferences' : locale === 'es' ? 'Gestionar preferencias' : locale === 'it' ? 'Gestisci preferenze' : locale === 'de' ? 'Einstellungen verwalten' : locale === 'pt' ? 'Gerir preferências' : locale === 'nl' ? 'Voorkeuren beheren' : locale === 'ko' ? '환경설정 관리' : locale === 'ro' ? 'Gestionează preferințele' : 'Manage preferences'}
								</Link>
								<Link href={`${baseUrl}/contact`} className="text-muted-foreground text-xs no-underline">
									{locale === 'fr' ? 'Se désabonner' : locale === 'en' ? 'Unsubscribe' : locale === 'es' ? 'Darse de baja' : locale === 'it' ? 'Disiscriversi' : locale === 'de' ? 'Abmelden' : locale === 'pt' ? 'Cancelar subscrição' : locale === 'nl' ? 'Uitschrijven' : locale === 'ko' ? '구독 취소' : locale === 'ro' ? 'Dezabonează-te' : 'Unsubscribe'}
								</Link>
							</Section>

							<Text className="text-muted-foreground text-center text-xs">
								{t.emails.layout.copyright.replace('{year}', new Date().getFullYear().toString())}
								<br />
								{locale === 'fr' ? 'Plateforme de revente de dossards de course à pied.' : locale === 'en' ? 'Race bib marketplace platform.' : locale === 'es' ? 'Plataforma de mercado de dorsales de carrera.' : locale === 'it' ? 'Piattaforma marketplace pettorali da corsa.' : locale === 'de' ? 'Lauf-Startnummern-Marktplatz.' : locale === 'pt' ? 'Plataforma de marketplace de dorsais de corrida.' : locale === 'nl' ? 'Race startnummer marktplaats platform.' : locale === 'ko' ? '런닝 비브 마켓플레이스 플랫폼.' : locale === 'ro' ? 'Platforma marketplace numere de cursă.' : 'Race bib marketplace platform.'}
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
