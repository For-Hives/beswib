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
	Button,
} from '@react-email/components'

import { getTranslations } from '@/lib/i18n/dictionary'
import constantsLocales from '@/constants/locales.json'

interface BeswibWaitlistAlertProps {
	eventName?: string
	eventId?: string
	bibPrice?: number
	eventDate?: string
	eventLocation?: string
	eventDistance?: string
	bibCategory?: string
	sellerName?: string
	timeRemaining?: string
	locale?: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

export const BeswibWaitlistAlert = ({
	timeRemaining = '2 jours',
	sellerName = 'Marie',
	locale = 'fr',
	eventName = 'Marathon de Paris 2024',
	eventLocation = 'Paris, France',
	eventId = 'event123',
	eventDistance = '42.2 km',
	eventDate = '14 avril 2024',
	bibPrice = 150,
	bibCategory = 'Marathon',
}: BeswibWaitlistAlertProps) => {
	const t = getTranslations(locale, constantsLocales)

	const formatPrice = (price: number) => `${price.toFixed(2)}€`

	const getLocalizedText = (key: keyof typeof localizedTexts) => {
		return localizedTexts[key][locale as keyof (typeof localizedTexts)[typeof key]] || localizedTexts[key]['fr']
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
								'warning-foreground': 'oklch(0.12 0.0453 83.87)',
								warning: 'oklch(0.838 0.199 83.87)',
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
					<Preview>{getLocalizedText('subject').replace('{eventName}', eventName || '')}</Preview>
					<Container className="mx-auto max-w-[600px] px-4 py-8">
						{/* Header avec logo */}
						<Section className="mb-8">
							<Img src={`/beswib.png`} width="100" height="100" alt="Beswib" className="mx-auto" />
						</Section>

						{/* Card principale */}
						<Section className="bg-card border-border rounded-lg border px-8 py-6 shadow-sm">
							{/* Icon et titre */}
							<Section className="mb-6 text-center">
								<Text className="text-success mb-4 text-4xl">🎯</Text>
								<Heading className="text-foreground mb-2 text-2xl font-bold">{getLocalizedText('title')}</Heading>
								<Text className="text-muted-foreground text-base">
									{getLocalizedText('subtitle').replace('{eventName}', eventName || '')}
								</Text>
							</Section>

							{/* Alerte urgence */}
							<Section className="bg-warning-foreground border-warning mb-6 rounded-lg border-2 p-6">
								<Section className="flex items-center justify-center">
									<Text className="text-warning mr-2 text-2xl">⏰</Text>
									<Text className="text-warning text-lg font-bold">
										{getLocalizedText('urgencyMessage').replace('{timeRemaining}', timeRemaining || '')}
									</Text>
								</Section>
							</Section>

							{/* Détails de l'événement */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									🏃‍♂️ {getLocalizedText('eventDetails')}
								</Heading>

								<Section className="space-y-3">
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{getLocalizedText('event')}:</Text>
										<Text className="text-foreground text-sm font-semibold">{eventName}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{getLocalizedText('category')}:</Text>
										<Text className="text-foreground text-sm">
											{bibCategory} • {eventDistance}
										</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{getLocalizedText('date')}:</Text>
										<Text className="text-foreground text-sm">{eventDate}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{getLocalizedText('location')}:</Text>
										<Text className="text-foreground text-sm">{eventLocation}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{getLocalizedText('price')}:</Text>
										<Text className="text-success text-sm font-bold">{formatPrice(bibPrice)}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{getLocalizedText('seller')}:</Text>
										<Text className="text-foreground text-sm">{sellerName}</Text>
									</Section>
								</Section>
							</Section>

							{/* Message personnel */}
							<Section className="mb-6 text-center">
								<Text className="text-muted-foreground text-base leading-relaxed">
									{getLocalizedText('personalMessage')}
								</Text>
							</Section>

							{/* Button principal */}
							<Section className="mb-6 text-center">
								<Button
									href={`${baseUrl}/events/${eventId}`}
									className="bg-primary text-primary-foreground inline-block rounded-lg px-8 py-4 text-lg font-semibold no-underline"
								>
									{getLocalizedText('ctaButton')}
								</Button>
							</Section>

							{/* Actions secondaires */}
							<Section className="border-border border-t pt-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{getLocalizedText('quickActions')}
								</Heading>

								<Section className="flex flex-col space-y-2">
									<Link href={`${baseUrl}/events`} className="text-primary text-sm underline">
										→ {getLocalizedText('browseOtherEvents')}
									</Link>
									<Link href={`${baseUrl}/dashboard/buyer`} className="text-primary text-sm underline">
										→ {getLocalizedText('manageDashboard')}
									</Link>
									<Link
										href={`${baseUrl}/waitlist/unsubscribe?event=${eventId}`}
										className="text-muted-foreground text-xs underline"
									>
										{getLocalizedText('unsubscribe')}
									</Link>
								</Section>
							</Section>
						</Section>

						{/* Footer */}
						<Section className="bg-card border-border rounded-lg border px-8 py-6 shadow-sm">
							<Section className="text-center">
								<Link href={`${baseUrl}`} className="text-muted-foreground text-xs underline">
									{getLocalizedText('ourSite')}
								</Link>
								&nbsp;&nbsp;|&nbsp;&nbsp;
								<Link href={`${baseUrl}/contact`} className="text-muted-foreground text-xs underline">
									{getLocalizedText('contact')}
								</Link>
								&nbsp;&nbsp;|&nbsp;&nbsp;
								<Link href={`${baseUrl}/dashboard/buyer`} className="text-muted-foreground text-xs underline">
									{getLocalizedText('dashboard')}
								</Link>
								&nbsp;&nbsp;|&nbsp;&nbsp;
								<Link href={`${baseUrl}/legals/privacy`} className="text-muted-foreground text-xs underline">
									{getLocalizedText('privacy')}
								</Link>
							</Section>

							<Section className="bg-card border-border mt-4 rounded-lg border shadow-sm">
								<Column style={{ width: '66%' }}>
									<Text className="text-muted-foreground text-xs">
										{t.emails.layout.copyright.replace('{year}', new Date().getFullYear().toString())}
										<br />
										{getLocalizedText('tagline')}
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

// Traductions pour l'email de waitlist
const localizedTexts = {
	urgencyMessage: {
		ro: 'Nu aștepta! Mai sunt doar {timeRemaining} până la eveniment',
		pt: 'Não espere! Restam apenas {timeRemaining} antes do evento',
		nl: 'Wacht niet! Nog maar {timeRemaining} tot het evenement',
		ko: '기다리지 마세요! 이벤트까지 {timeRemaining} 남았습니다',
		it: "Non aspettare! Mancano solo {timeRemaining} all'evento",
		fr: "Ne tardez pas ! Plus que {timeRemaining} avant l'événement",
		es: '¡No esperes! Solo quedan {timeRemaining} antes del evento',
		en: "Don't wait! Only {timeRemaining} left before the event",
		de: 'Warten Sie nicht! Nur noch {timeRemaining} bis zur Veranstaltung',
	},
	unsubscribe: {
		ro: 'Dezabonează-te de la această listă',
		pt: 'Cancelar subscrição desta lista',
		nl: 'Uitschrijven van deze lijst',
		ko: '이 목록에서 구독 취소',
		it: 'Disiscriversi da questa lista',
		fr: 'Se désinscrire de cette liste',
		es: 'Darse de baja de esta lista',
		en: 'Unsubscribe from this list',
		de: 'Von dieser Liste abmelden',
	},
	title: {
		ro: 'Vești bune!',
		pt: 'Ótimas notícias!',
		nl: 'Geweldig nieuws!',
		ko: '좋은 소식!',
		it: 'Ottime notizie!',
		fr: 'Bonne nouvelle !',
		es: '¡Buenas noticias!',
		en: 'Great News!',
		de: 'Tolle Neuigkeiten!',
	},
	tagline: {
		ro: 'Platforma marketplace numere de concurs.',
		pt: 'Plataforma de marketplace de dorsais.',
		nl: 'Startnummer marktplaats platform.',
		ko: '레이스 비브 마켓플레이스 플랫폼.',
		it: 'Piattaforma marketplace pettorali.',
		fr: 'Plateforme de revente de dossards.',
		es: 'Plataforma de mercado de dorsales.',
		en: 'Race bib marketplace platform.',
		de: 'Startnummern-Marktplatz.',
	},
	subtitle: {
		ro: 'Un număr de concurs este acum disponibil pentru {eventName}',
		pt: 'Um dorsal está agora disponível para {eventName}',
		nl: 'Een startnummer is nu beschikbaar voor {eventName}',
		ko: '{eventName}에 대한 레이스 번호가 이제 이용 가능합니다',
		it: 'Un pettorale è ora disponibile per {eventName}',
		fr: 'Un dossard est maintenant disponible pour {eventName}',
		es: 'Un dorsal está ahora disponible para {eventName}',
		en: 'A bib is now available for {eventName}',
		de: 'Eine Startnummer ist jetzt für {eventName} verfügbar',
	},
	subject: {
		ro: '🎯 Număr de concurs disponibil pentru {eventName}!',
		pt: '🎯 Dorsal disponível para {eventName}!',
		nl: '🎯 Startnummer beschikbaar voor {eventName}!',
		ko: '🎯 {eventName} 레이스 번호 이용 가능!',
		it: '🎯 Pettorale disponibile per {eventName}!',
		fr: '🎯 Dossard disponible pour {eventName} !',
		es: '🎯 ¡Dorsal disponible para {eventName}!',
		en: '🎯 Bib available for {eventName}!',
		de: '🎯 Startnummer verfügbar für {eventName}!',
	},
	seller: {
		ro: 'Vânzător',
		pt: 'Vendedor',
		nl: 'Verkoper',
		ko: '판매자',
		it: 'Venditore',
		fr: 'Vendeur',
		es: 'Vendedor',
		en: 'Seller',
		de: 'Verkäufer',
	},
	quickActions: {
		ro: 'Acțiuni rapide',
		pt: 'Ações rápidas',
		nl: 'Snelle acties',
		ko: '빠른 작업',
		it: 'Azioni rapide',
		fr: 'Actions rapides',
		es: 'Acciones rápidas',
		en: 'Quick Actions',
		de: 'Schnelle Aktionen',
	},
	privacy: {
		ro: 'Confidențialitate',
		pt: 'Privacidade',
		nl: 'Privacy',
		ko: '개인정보보호',
		it: 'Privacy',
		fr: 'Confidentialité',
		es: 'Privacidad',
		en: 'Privacy',
		de: 'Datenschutz',
	},
	price: {
		ro: 'Preț',
		pt: 'Preço',
		nl: 'Prijs',
		ko: '가격',
		it: 'Prezzo',
		fr: 'Prix',
		es: 'Precio',
		en: 'Price',
		de: 'Preis',
	},
	personalMessage: {
		ro: 'Erai pe lista noastră de așteptare pentru acest eveniment. Acest număr de concurs este exact ceea ce căutai!',
		pt: 'Estava na nossa lista de espera para este evento. Este dorsal é exactamente o que procurava!',
		nl: 'U stond op onze wachtlijst voor dit evenement. Dit startnummer is precies wat u zocht!',
		ko: '이 이벤트의 대기 목록에 있었습니다. 이 레이스 번호는 정확히 찾고 있던 것입니다!',
		it: "Eri nella nostra lista d'attesa per questo evento. Questo pettorale è esattamente quello che stavi cercando!",
		fr: "Vous étiez sur notre liste d'attente pour cet événement. Ce dossard correspond exactement à ce que vous recherchiez !",
		es: 'Estabas en nuestra lista de espera para este evento. ¡Este dorsal es exactamente lo que buscabas!',
		en: 'You were on our waitlist for this event. This bib is exactly what you were looking for!',
		de: 'Sie standen auf unserer Warteliste für diese Veranstaltung. Diese Startnummer ist genau das, wonach Sie gesucht haben!',
	},
	ourSite: {
		ro: 'Situl nostru',
		pt: 'O nosso site',
		nl: 'Onze site',
		ko: '우리 사이트',
		it: 'Il nostro sito',
		fr: 'Notre site',
		es: 'Nuestro sitio',
		en: 'Our site',
		de: 'Unsere Seite',
	},
	manageDashboard: {
		ro: 'Gestionează alertele mele',
		pt: 'Gerir os meus alertas',
		nl: 'Mijn waarschuwingen beheren',
		ko: '내 알림 관리',
		it: 'Gestisci i miei avvisi',
		fr: 'Gérer mes alertes',
		es: 'Gestionar mis alertas',
		en: 'Manage my alerts',
		de: 'Meine Warnungen verwalten',
	},
	location: {
		ro: 'Locația',
		pt: 'Local',
		nl: 'Locatie',
		ko: '위치',
		it: 'Luogo',
		fr: 'Lieu',
		es: 'Ubicación',
		en: 'Location',
		de: 'Ort',
	},
	eventDetails: {
		ro: 'Detalii eveniment',
		pt: 'Detalhes do evento',
		nl: 'Evenementdetails',
		ko: '이벤트 세부 정보',
		it: "Dettagli dell'evento",
		fr: "Détails de l'événement",
		es: 'Detalles del evento',
		en: 'Event Details',
		de: 'Veranstaltungsdetails',
	},
	event: {
		ro: 'Eveniment',
		pt: 'Evento',
		nl: 'Evenement',
		ko: '이벤트',
		it: 'Evento',
		fr: 'Événement',
		es: 'Evento',
		en: 'Event',
		de: 'Veranstaltung',
	},
	date: {
		ro: 'Data',
		pt: 'Data',
		nl: 'Datum',
		ko: '날짜',
		it: 'Data',
		fr: 'Date',
		es: 'Fecha',
		en: 'Date',
		de: 'Datum',
	},
	dashboard: {
		ro: 'Panou de control',
		pt: 'Painel',
		nl: 'Dashboard',
		ko: '대시보드',
		it: 'Dashboard',
		fr: 'Tableau de bord',
		es: 'Panel de control',
		en: 'Dashboard',
		de: 'Dashboard',
	},
	ctaButton: {
		ro: 'Vezi numărul acum',
		pt: 'Ver dorsal agora',
		nl: 'Startnummer nu bekijken',
		ko: '지금 레이스 번호 보기',
		it: 'Vedi pettorale ora',
		fr: 'Voir le dossard maintenant',
		es: 'Ver dorsal ahora',
		en: 'View Bib Now',
		de: 'Startnummer jetzt ansehen',
	},
	contact: {
		ro: 'Contact',
		pt: 'Contacto',
		nl: 'Contact',
		ko: '연락처',
		it: 'Contatto',
		fr: 'Contact',
		es: 'Contacto',
		en: 'Contact',
		de: 'Kontakt',
	},
	category: {
		ro: 'Categorie',
		pt: 'Categoria',
		nl: 'Categorie',
		ko: '카테고리',
		it: 'Categoria',
		fr: 'Catégorie',
		es: 'Categoría',
		en: 'Category',
		de: 'Kategorie',
	},
	browseOtherEvents: {
		ro: 'Explorează alte evenimente',
		pt: 'Explorar outros eventos',
		nl: 'Andere evenementen bekijken',
		ko: '다른 이벤트 탐색',
		it: 'Sfoglia altri eventi',
		fr: "Parcourir d'autres événements",
		es: 'Explorar otros eventos',
		en: 'Browse other events',
		de: 'Andere Veranstaltungen durchsuchen',
	},
} as const

BeswibWaitlistAlert.PreviewProps = {
	timeRemaining: '2 jours',
	sellerName: 'Marie Dupont',
	locale: 'fr',
	eventName: 'Marathon de Paris 2024',
	eventLocation: 'Paris, France',
	eventId: 'event123',
	eventDistance: '42.2 km',
	eventDate: '14 avril 2024',
	bibPrice: 150,
	bibCategory: 'Marathon',
} as BeswibWaitlistAlertProps

export default BeswibWaitlistAlert
