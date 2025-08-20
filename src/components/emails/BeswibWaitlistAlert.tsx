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
	eventName = 'Marathon de Paris 2024',
	eventId = 'event123',
	bibPrice = 150,
	eventDate = '14 avril 2024',
	eventLocation = 'Paris, France',
	eventDistance = '42.2 km',
	bibCategory = 'Marathon',
	sellerName = 'Marie',
	timeRemaining = '2 jours',
	locale = 'fr',
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
								'primary-foreground': 'oklch(1 0 0)',
								primary: 'oklch(0.6231 0.188 259.8145)',
								'muted-foreground': 'oklch(0.46 0.02 264.36)',
								muted: 'oklch(0.985 0.0015 247.8)',
								foreground: 'oklch(0.24 0 0)',
								card: 'oklch(1 0 0)',
								border: 'oklch(0.89 0.004 264.53)',
								background: 'oklch(1 0 0)',
								success: 'oklch(0.626 0.124 142.5)',
								'success-foreground': 'oklch(0.972 0.027 138.27)',
								warning: 'oklch(0.838 0.199 83.87)',
								'warning-foreground': 'oklch(0.12 0.0453 83.87)',
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
	subject: {
		fr: '🎯 Dossard disponible pour {eventName} !',
		en: '🎯 Bib available for {eventName}!',
		es: '🎯 ¡Dorsal disponible para {eventName}!',
		it: '🎯 Pettorale disponibile per {eventName}!',
		de: '🎯 Startnummer verfügbar für {eventName}!',
		pt: '🎯 Dorsal disponível para {eventName}!',
		nl: '🎯 Startnummer beschikbaar voor {eventName}!',
		ko: '🎯 {eventName} 레이스 번호 이용 가능!',
		ro: '🎯 Număr de concurs disponibil pentru {eventName}!',
	},
	title: {
		fr: 'Bonne nouvelle !',
		en: 'Great News!',
		es: '¡Buenas noticias!',
		it: 'Ottime notizie!',
		de: 'Tolle Neuigkeiten!',
		pt: 'Ótimas notícias!',
		nl: 'Geweldig nieuws!',
		ko: '좋은 소식!',
		ro: 'Vești bune!',
	},
	subtitle: {
		fr: 'Un dossard est maintenant disponible pour {eventName}',
		en: 'A bib is now available for {eventName}',
		es: 'Un dorsal está ahora disponible para {eventName}',
		it: 'Un pettorale è ora disponibile per {eventName}',
		de: 'Eine Startnummer ist jetzt für {eventName} verfügbar',
		pt: 'Um dorsal está agora disponível para {eventName}',
		nl: 'Een startnummer is nu beschikbaar voor {eventName}',
		ko: '{eventName}에 대한 레이스 번호가 이제 이용 가능합니다',
		ro: 'Un număr de concurs este acum disponibil pentru {eventName}',
	},
	urgencyMessage: {
		fr: "Ne tardez pas ! Plus que {timeRemaining} avant l'événement",
		en: "Don't wait! Only {timeRemaining} left before the event",
		es: '¡No esperes! Solo quedan {timeRemaining} antes del evento',
		it: "Non aspettare! Mancano solo {timeRemaining} all'evento",
		de: 'Warten Sie nicht! Nur noch {timeRemaining} bis zur Veranstaltung',
		pt: 'Não espere! Restam apenas {timeRemaining} antes do evento',
		nl: 'Wacht niet! Nog maar {timeRemaining} tot het evenement',
		ko: '기다리지 마세요! 이벤트까지 {timeRemaining} 남았습니다',
		ro: 'Nu aștepta! Mai sunt doar {timeRemaining} până la eveniment',
	},
	eventDetails: {
		fr: "Détails de l'événement",
		en: 'Event Details',
		es: 'Detalles del evento',
		it: "Dettagli dell'evento",
		de: 'Veranstaltungsdetails',
		pt: 'Detalhes do evento',
		nl: 'Evenementdetails',
		ko: '이벤트 세부 정보',
		ro: 'Detalii eveniment',
	},
	event: {
		fr: 'Événement',
		en: 'Event',
		es: 'Evento',
		it: 'Evento',
		de: 'Veranstaltung',
		pt: 'Evento',
		nl: 'Evenement',
		ko: '이벤트',
		ro: 'Eveniment',
	},
	category: {
		fr: 'Catégorie',
		en: 'Category',
		es: 'Categoría',
		it: 'Categoria',
		de: 'Kategorie',
		pt: 'Categoria',
		nl: 'Categorie',
		ko: '카테고리',
		ro: 'Categorie',
	},
	date: {
		fr: 'Date',
		en: 'Date',
		es: 'Fecha',
		it: 'Data',
		de: 'Datum',
		pt: 'Data',
		nl: 'Datum',
		ko: '날짜',
		ro: 'Data',
	},
	location: {
		fr: 'Lieu',
		en: 'Location',
		es: 'Ubicación',
		it: 'Luogo',
		de: 'Ort',
		pt: 'Local',
		nl: 'Locatie',
		ko: '위치',
		ro: 'Locația',
	},
	price: {
		fr: 'Prix',
		en: 'Price',
		es: 'Precio',
		it: 'Prezzo',
		de: 'Preis',
		pt: 'Preço',
		nl: 'Prijs',
		ko: '가격',
		ro: 'Preț',
	},
	seller: {
		fr: 'Vendeur',
		en: 'Seller',
		es: 'Vendedor',
		it: 'Venditore',
		de: 'Verkäufer',
		pt: 'Vendedor',
		nl: 'Verkoper',
		ko: '판매자',
		ro: 'Vânzător',
	},
	personalMessage: {
		fr: "Vous étiez sur notre liste d'attente pour cet événement. Ce dossard correspond exactement à ce que vous recherchiez !",
		en: 'You were on our waitlist for this event. This bib is exactly what you were looking for!',
		es: 'Estabas en nuestra lista de espera para este evento. ¡Este dorsal es exactamente lo que buscabas!',
		it: "Eri nella nostra lista d'attesa per questo evento. Questo pettorale è esattamente quello che stavi cercando!",
		de: 'Sie standen auf unserer Warteliste für diese Veranstaltung. Diese Startnummer ist genau das, wonach Sie gesucht haben!',
		pt: 'Estava na nossa lista de espera para este evento. Este dorsal é exactamente o que procurava!',
		nl: 'U stond op onze wachtlijst voor dit evenement. Dit startnummer is precies wat u zocht!',
		ko: '이 이벤트의 대기 목록에 있었습니다. 이 레이스 번호는 정확히 찾고 있던 것입니다!',
		ro: 'Erai pe lista noastră de așteptare pentru acest eveniment. Acest număr de concurs este exact ceea ce căutai!',
	},
	ctaButton: {
		fr: 'Voir le dossard maintenant',
		en: 'View Bib Now',
		es: 'Ver dorsal ahora',
		it: 'Vedi pettorale ora',
		de: 'Startnummer jetzt ansehen',
		pt: 'Ver dorsal agora',
		nl: 'Startnummer nu bekijken',
		ko: '지금 레이스 번호 보기',
		ro: 'Vezi numărul acum',
	},
	quickActions: {
		fr: 'Actions rapides',
		en: 'Quick Actions',
		es: 'Acciones rápidas',
		it: 'Azioni rapide',
		de: 'Schnelle Aktionen',
		pt: 'Ações rápidas',
		nl: 'Snelle acties',
		ko: '빠른 작업',
		ro: 'Acțiuni rapide',
	},
	browseOtherEvents: {
		fr: "Parcourir d'autres événements",
		en: 'Browse other events',
		es: 'Explorar otros eventos',
		it: 'Sfoglia altri eventi',
		de: 'Andere Veranstaltungen durchsuchen',
		pt: 'Explorar outros eventos',
		nl: 'Andere evenementen bekijken',
		ko: '다른 이벤트 탐색',
		ro: 'Explorează alte evenimente',
	},
	manageDashboard: {
		fr: 'Gérer mes alertes',
		en: 'Manage my alerts',
		es: 'Gestionar mis alertas',
		it: 'Gestisci i miei avvisi',
		de: 'Meine Warnungen verwalten',
		pt: 'Gerir os meus alertas',
		nl: 'Mijn waarschuwingen beheren',
		ko: '내 알림 관리',
		ro: 'Gestionează alertele mele',
	},
	unsubscribe: {
		fr: 'Se désinscrire de cette liste',
		en: 'Unsubscribe from this list',
		es: 'Darse de baja de esta lista',
		it: 'Disiscriversi da questa lista',
		de: 'Von dieser Liste abmelden',
		pt: 'Cancelar subscrição desta lista',
		nl: 'Uitschrijven van deze lijst',
		ko: '이 목록에서 구독 취소',
		ro: 'Dezabonează-te de la această listă',
	},
	ourSite: {
		fr: 'Notre site',
		en: 'Our site',
		es: 'Nuestro sitio',
		it: 'Il nostro sito',
		de: 'Unsere Seite',
		pt: 'O nosso site',
		nl: 'Onze site',
		ko: '우리 사이트',
		ro: 'Situl nostru',
	},
	contact: {
		fr: 'Contact',
		en: 'Contact',
		es: 'Contacto',
		it: 'Contatto',
		de: 'Kontakt',
		pt: 'Contacto',
		nl: 'Contact',
		ko: '연락처',
		ro: 'Contact',
	},
	dashboard: {
		fr: 'Tableau de bord',
		en: 'Dashboard',
		es: 'Panel de control',
		it: 'Dashboard',
		de: 'Dashboard',
		pt: 'Painel',
		nl: 'Dashboard',
		ko: '대시보드',
		ro: 'Panou de control',
	},
	privacy: {
		fr: 'Confidentialité',
		en: 'Privacy',
		es: 'Privacidad',
		it: 'Privacy',
		de: 'Datenschutz',
		pt: 'Privacidade',
		nl: 'Privacy',
		ko: '개인정보보호',
		ro: 'Confidențialitate',
	},
	tagline: {
		fr: 'Plateforme de revente de dossards.',
		en: 'Race bib marketplace platform.',
		es: 'Plataforma de mercado de dorsales.',
		it: 'Piattaforma marketplace pettorali.',
		de: 'Startnummern-Marktplatz.',
		pt: 'Plataforma de marketplace de dorsais.',
		nl: 'Startnummer marktplaats platform.',
		ko: '레이스 비브 마켓플레이스 플랫폼.',
		ro: 'Platforma marketplace numere de concurs.',
	},
} as const

BeswibWaitlistAlert.PreviewProps = {
	eventName: 'Marathon de Paris 2024',
	eventId: 'event123',
	bibPrice: 150,
	eventDate: '14 avril 2024',
	eventLocation: 'Paris, France',
	eventDistance: '42.2 km',
	bibCategory: 'Marathon',
	sellerName: 'Marie Dupont',
	timeRemaining: '2 jours',
	locale: 'fr',
} as BeswibWaitlistAlertProps

export default BeswibWaitlistAlert
