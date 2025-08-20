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

interface BeswibSaleConfirmationProps {
	sellerName?: string
	buyerName?: string
	eventName?: string
	bibPrice?: number
	platformFee?: number
	totalReceived?: number
	orderId?: string
	eventDate?: string
	eventLocation?: string
	locale?: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

export const BeswibSaleConfirmation = ({
	totalReceived = 135,
	sellerName = 'Marie',
	platformFee = 15,
	orderId = 'BW123456789',
	locale = 'fr',
	eventName = 'Marathon de Paris 2024',
	eventLocation = 'Paris, France',
	eventDate = '14 avril 2024',
	buyerName = 'Jean',
	bibPrice = 150,
}: BeswibSaleConfirmationProps) => {
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
					<Preview>{getLocalizedText('subject')}</Preview>
					<Container className="mx-auto max-w-[600px] px-4 py-8">
						{/* Header avec logo */}
						<Section className="mb-8">
							<Img src={`/beswib.png`} width="100" height="100" alt="Beswib" className="mx-auto" />
						</Section>

						{/* Card principale */}
						<Section className="bg-card border-border rounded-lg border px-8 py-6 shadow-sm">
							{/* Icon et titre */}
							<Section className="mb-6 text-center">
								<Text className="text-success mb-4 text-4xl">💰</Text>
								<Heading className="text-foreground mb-2 text-2xl font-bold">{getLocalizedText('title')}</Heading>
								<Text className="text-muted-foreground text-base">{getLocalizedText('subtitle')}</Text>
							</Section>

							{/* Informations de la vente */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{getLocalizedText('saleDetails')}
								</Heading>

								<Section className="space-y-3">
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{getLocalizedText('event')}:</Text>
										<Text className="text-foreground text-sm font-semibold">{eventName}</Text>
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
										<Text className="text-muted-foreground text-sm font-medium">{getLocalizedText('buyer')}:</Text>
										<Text className="text-foreground text-sm">{buyerName}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">{getLocalizedText('orderId')}:</Text>
										<Text className="text-foreground font-mono text-sm">{orderId}</Text>
									</Section>
								</Section>
							</Section>

							{/* Détails financiers */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{getLocalizedText('financialBreakdown')}
								</Heading>

								<Section className="space-y-3">
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm">{getLocalizedText('salePrice')}:</Text>
										<Text className="text-foreground text-sm">{formatPrice(bibPrice)}</Text>
									</Section>

									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm">{getLocalizedText('platformFee')} (10%):</Text>
										<Text className="text-foreground text-sm">-{formatPrice(platformFee)}</Text>
									</Section>

									<Section className="border-border border-t pt-3">
										<Section className="flex justify-between">
											<Text className="text-foreground text-base font-bold">{getLocalizedText('totalReceived')}:</Text>
											<Text className="text-success text-base font-bold">{formatPrice(totalReceived)}</Text>
										</Section>
									</Section>
								</Section>
							</Section>

							{/* Message de félicitations */}
							<Section className="mb-6 text-center">
								<Text className="text-muted-foreground text-base leading-relaxed">
									{getLocalizedText('congratulations').replace('{sellerName}', sellerName || '')}
								</Text>
							</Section>

							{/* Prochaines étapes */}
							<Section className="bg-card border-border rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{getLocalizedText('nextSteps')}
								</Heading>

								<Section className="space-y-3">
									<Text className="text-muted-foreground text-sm">• {getLocalizedText('step1')}</Text>
									<Text className="text-muted-foreground text-sm">• {getLocalizedText('step2')}</Text>
									<Text className="text-muted-foreground text-sm">• {getLocalizedText('step3')}</Text>
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
								<Link href={`${baseUrl}/dashboard/seller`} className="text-muted-foreground text-xs underline">
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

// Traductions pour l'email de confirmation de vente
const localizedTexts = {
	totalReceived: {
		ro: 'Total primit',
		pt: 'Total recebido',
		nl: 'Totaal ontvangen',
		ko: '총 수령액',
		it: 'Totale ricevuto',
		fr: 'Total reçu',
		es: 'Total recibido',
		en: 'Total Received',
		de: 'Gesamt erhalten',
	},
	title: {
		ro: 'Vânzare confirmată!',
		pt: 'Venda confirmada!',
		nl: 'Verkoop bevestigd!',
		ko: '판매 확인됨!',
		it: 'Vendita confermata!',
		fr: 'Vente confirmée !',
		es: '¡Venta confirmada!',
		en: 'Sale Confirmed!',
		de: 'Verkauf bestätigt!',
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
		ro: 'Numărul tău de concurs a găsit un nou alergător',
		pt: 'O seu dorsal encontrou um novo corredor',
		nl: 'Uw startnummer heeft een nieuwe loper gevonden',
		ko: '레이스 번호가 새로운 러너를 찾았습니다',
		it: 'Il tuo pettorale ha trovato un nuovo corridore',
		fr: 'Votre dossard a trouvé un nouveau coureur',
		es: 'Tu dorsal ha encontrado un nuevo corredor',
		en: 'Your bib has found a new runner',
		de: 'Ihre Startnummer hat einen neuen Läufer gefunden',
	},
	subject: {
		ro: 'Felicitări! Numărul tău de concurs a fost vândut',
		pt: 'Parabéns! O seu dorsal foi vendido',
		nl: 'Gefeliciteerd! Uw startnummer is verkocht',
		ko: '축하합니다! 레이스 번호가 판매되었습니다',
		it: 'Congratulazioni! Il tuo pettorale è stato venduto',
		fr: 'Félicitations ! Votre dossard a été vendu',
		es: '¡Felicidades! Tu dorsal ha sido vendido',
		en: 'Congratulations! Your bib has been sold',
		de: 'Glückwunsch! Ihre Startnummer wurde verkauft',
	},
	step3: {
		ro: 'Verificați panoul dvs. de vânzător pentru mai multe detalii',
		pt: 'Consulte o seu painel de vendedor para mais detalhes',
		nl: 'Bekijk uw verkoper dashboard voor meer details',
		ko: '자세한 내용은 판매자 대시보드를 확인하세요',
		it: 'Controlla il tuo dashboard venditore per maggiori dettagli',
		fr: 'Consultez votre tableau de bord vendeur pour plus de détails',
		es: 'Consulta tu panel de vendedor para más detalles',
		en: 'Check your seller dashboard for more details',
		de: 'Überprüfen Sie Ihr Verkäufer-Dashboard für weitere Details',
	},
	step2: {
		ro: 'Veți primi o notificare odată ce transferul este finalizat',
		pt: 'Receberá uma notificação assim que a transferência for concluída',
		nl: 'U ontvangt een melding zodra de overdracht is voltooid',
		ko: '이체가 완료되면 알림을 받게 됩니다',
		it: 'Riceverai una notifica una volta completato il trasferimento',
		fr: 'Vous recevrez une notification une fois le transfert effectué',
		es: 'Recibirás una notificación una vez completada la transferencia',
		en: 'You will receive a notification once the transfer is completed',
		de: 'Sie erhalten eine Benachrichtigung, sobald die Überweisung abgeschlossen ist',
	},
	step1: {
		ro: 'Plata va fi procesată automat prin PayPal',
		pt: 'O pagamento será processado automaticamente via PayPal',
		nl: 'Betaling wordt automatisch verwerkt via PayPal',
		ko: '결제는 PayPal을 통해 자동으로 처리됩니다',
		it: 'Il pagamento verrà elaborato automaticamente tramite PayPal',
		fr: 'Le paiement sera traité automatiquement via PayPal',
		es: 'El pago se procesará automáticamente a través de PayPal',
		en: 'Payment will be processed automatically via PayPal',
		de: 'Die Zahlung wird automatisch über PayPal abgewickelt',
	},
	salePrice: {
		ro: 'Preț de vânzare',
		pt: 'Preço de venda',
		nl: 'Verkoopprijs',
		ko: '판매 가격',
		it: 'Prezzo di vendita',
		fr: 'Prix de vente',
		es: 'Precio de venta',
		en: 'Sale Price',
		de: 'Verkaufspreis',
	},
	saleDetails: {
		ro: 'Detaliile vânzării',
		pt: 'Detalhes da venda',
		nl: 'Verkoopdetails',
		ko: '판매 세부 정보',
		it: 'Dettagli della vendita',
		fr: 'Détails de la vente',
		es: 'Detalles de la venta',
		en: 'Sale Details',
		de: 'Verkaufsdetails',
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
	platformFee: {
		ro: 'Comision Beswib',
		pt: 'Comissão Beswib',
		nl: 'Beswib Commissie',
		ko: 'Beswib 수수료',
		it: 'Commissione Beswib',
		fr: 'Commission Beswib',
		es: 'Comisión Beswib',
		en: 'Beswib Commission',
		de: 'Beswib-Provision',
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
	orderId: {
		ro: 'ID comandă',
		pt: 'ID do pedido',
		nl: 'Bestelling ID',
		ko: '주문 ID',
		it: 'ID ordine',
		fr: 'N° de commande',
		es: 'ID del pedido',
		en: 'Order ID',
		de: 'Bestellnummer',
	},
	nextSteps: {
		ro: 'Pașii următori',
		pt: 'Próximos passos',
		nl: 'Volgende stappen',
		ko: '다음 단계',
		it: 'Prossimi passi',
		fr: 'Prochaines étapes',
		es: 'Próximos pasos',
		en: 'Next Steps',
		de: 'Nächste Schritte',
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
	financialBreakdown: {
		ro: 'Detaliere financiară',
		pt: 'Breakdown financeiro',
		nl: 'Financiële uitsplitsing',
		ko: '금융 세부 내역',
		it: 'Dettaglio finanziario',
		fr: 'Détail financier',
		es: 'Desglose financiero',
		en: 'Financial Breakdown',
		de: 'Finanzielle Aufschlüsselung',
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
	congratulations: {
		ro: 'Felicitări {sellerName}! Numărul tău de concurs a fost vândut cu succes. Suma va fi creditată în contul tău PayPal în 24-48h.',
		pt: 'Parabéns {sellerName}! O seu dorsal foi vendido com sucesso. O valor será creditado na sua conta PayPal em 24-48h.',
		nl: 'Gefeliciteerd {sellerName}! Uw startnummer is succesvol verkocht. Het bedrag wordt binnen 24-48u gecrediteerd op uw PayPal-account.',
		ko: '축하합니다 {sellerName}! 레이스 번호가 성공적으로 판매되었습니다. 금액은 24-48시간 내에 PayPal 계정에 입금됩니다.',
		it: "Congratulazioni {sellerName}! Il tuo pettorale è stato venduto con successo. L'importo verrà accreditato sul tuo conto PayPal entro 24-48h.",
		fr: 'Félicitations {sellerName} ! Votre dossard a été vendu avec succès. Le montant sera crédité sur votre compte PayPal sous 24-48h.',
		es: '¡Felicidades {sellerName}! Tu dorsal se ha vendido con éxito. El importe se acreditará en tu cuenta PayPal en 24-48h.',
		en: 'Congratulations {sellerName}! Your bib has been sold successfully. The amount will be credited to your PayPal account within 24-48h.',
		de: 'Glückwunsch {sellerName}! Ihre Startnummer wurde erfolgreich verkauft. Der Betrag wird innerhalb von 24-48h auf Ihr PayPal-Konto gutgeschrieben.',
	},
	buyer: {
		ro: 'Cumpărător',
		pt: 'Comprador',
		nl: 'Koper',
		ko: '구매자',
		it: 'Acquirente',
		fr: 'Acheteur',
		es: 'Comprador',
		en: 'Buyer',
		de: 'Käufer',
	},
} as const

BeswibSaleConfirmation.PreviewProps = {
	totalReceived: 135,
	sellerName: 'Marie Dupont',
	platformFee: 15,
	orderId: 'BW123456789',
	locale: 'fr',
	eventName: 'Marathon de Paris 2024',
	eventLocation: 'Paris, France',
	eventDate: '14 avril 2024',
	buyerName: 'Jean Martin',
	bibPrice: 150,
} as BeswibSaleConfirmationProps

export default BeswibSaleConfirmation
