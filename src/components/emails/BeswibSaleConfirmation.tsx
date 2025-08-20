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
	sellerName = 'Marie',
	buyerName = 'Jean',
	eventName = 'Marathon de Paris 2024',
	bibPrice = 150,
	platformFee = 15,
	totalReceived = 135,
	orderId = 'BW123456789',
	eventDate = '14 avril 2024',
	eventLocation = 'Paris, France',
	locale = 'fr',
}: BeswibSaleConfirmationProps) => {
	const t = getTranslations(locale, constantsLocales)
	
	const formatPrice = (price: number) => `${price.toFixed(2)}€`

	const getLocalizedText = (key: keyof typeof localizedTexts) => {
		return localizedTexts[key][locale as keyof typeof localizedTexts[typeof key]] || localizedTexts[key]['fr']
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
								<Heading className="text-foreground mb-2 text-2xl font-bold">
									{getLocalizedText('title')}
								</Heading>
								<Text className="text-muted-foreground text-base">
									{getLocalizedText('subtitle')}
								</Text>
							</Section>

							{/* Informations de la vente */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{getLocalizedText('saleDetails')}
								</Heading>
								
								<Section className="space-y-3">
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{getLocalizedText('event')}:
										</Text>
										<Text className="text-foreground text-sm font-semibold">
											{eventName}
										</Text>
									</Section>
									
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{getLocalizedText('date')}:
										</Text>
										<Text className="text-foreground text-sm">
											{eventDate}
										</Text>
									</Section>
									
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{getLocalizedText('location')}:
										</Text>
										<Text className="text-foreground text-sm">
											{eventLocation}
										</Text>
									</Section>
									
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{getLocalizedText('buyer')}:
										</Text>
										<Text className="text-foreground text-sm">
											{buyerName}
										</Text>
									</Section>
									
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{getLocalizedText('orderId')}:
										</Text>
										<Text className="text-foreground text-sm font-mono">
											{orderId}
										</Text>
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
										<Text className="text-muted-foreground text-sm">
											{getLocalizedText('salePrice')}:
										</Text>
										<Text className="text-foreground text-sm">
											{formatPrice(bibPrice)}
										</Text>
									</Section>
									
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm">
											{getLocalizedText('platformFee')} (10%):
										</Text>
										<Text className="text-foreground text-sm">
											-{formatPrice(platformFee)}
										</Text>
									</Section>
									
									<Section className="border-border border-t pt-3">
										<Section className="flex justify-between">
											<Text className="text-foreground text-base font-bold">
												{getLocalizedText('totalReceived')}:
											</Text>
											<Text className="text-success text-base font-bold">
												{formatPrice(totalReceived)}
											</Text>
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
									<Text className="text-muted-foreground text-sm">
										• {getLocalizedText('step1')}
									</Text>
									<Text className="text-muted-foreground text-sm">
										• {getLocalizedText('step2')}
									</Text>
									<Text className="text-muted-foreground text-sm">
										• {getLocalizedText('step3')}
									</Text>
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
	subject: {
		fr: 'Félicitations ! Votre dossard a été vendu',
		en: 'Congratulations! Your bib has been sold',
		es: '¡Felicidades! Tu dorsal ha sido vendido',
		it: 'Congratulazioni! Il tuo pettorale è stato venduto',
		de: 'Glückwunsch! Ihre Startnummer wurde verkauft',
		pt: 'Parabéns! O seu dorsal foi vendido',
		nl: 'Gefeliciteerd! Uw startnummer is verkocht',
		ko: '축하합니다! 레이스 번호가 판매되었습니다',
		ro: 'Felicitări! Numărul tău de concurs a fost vândut',
	},
	title: {
		fr: 'Vente confirmée !',
		en: 'Sale Confirmed!',
		es: '¡Venta confirmada!',
		it: 'Vendita confermata!',
		de: 'Verkauf bestätigt!',
		pt: 'Venda confirmada!',
		nl: 'Verkoop bevestigd!',
		ko: '판매 확인됨!',
		ro: 'Vânzare confirmată!',
	},
	subtitle: {
		fr: 'Votre dossard a trouvé un nouveau coureur',
		en: 'Your bib has found a new runner',
		es: 'Tu dorsal ha encontrado un nuevo corredor',
		it: 'Il tuo pettorale ha trovato un nuovo corridore',
		de: 'Ihre Startnummer hat einen neuen Läufer gefunden',
		pt: 'O seu dorsal encontrou um novo corredor',
		nl: 'Uw startnummer heeft een nieuwe loper gevonden',
		ko: '레이스 번호가 새로운 러너를 찾았습니다',
		ro: 'Numărul tău de concurs a găsit un nou alergător',
	},
	saleDetails: {
		fr: 'Détails de la vente',
		en: 'Sale Details',
		es: 'Detalles de la venta',
		it: 'Dettagli della vendita',
		de: 'Verkaufsdetails',
		pt: 'Detalhes da venda',
		nl: 'Verkoopdetails',
		ko: '판매 세부 정보',
		ro: 'Detaliile vânzării',
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
	buyer: {
		fr: 'Acheteur',
		en: 'Buyer',
		es: 'Comprador',
		it: 'Acquirente',
		de: 'Käufer',
		pt: 'Comprador',
		nl: 'Koper',
		ko: '구매자',
		ro: 'Cumpărător',
	},
	orderId: {
		fr: 'N° de commande',
		en: 'Order ID',
		es: 'ID del pedido',
		it: 'ID ordine',
		de: 'Bestellnummer',
		pt: 'ID do pedido',
		nl: 'Bestelling ID',
		ko: '주문 ID',
		ro: 'ID comandă',
	},
	financialBreakdown: {
		fr: 'Détail financier',
		en: 'Financial Breakdown',
		es: 'Desglose financiero',
		it: 'Dettaglio finanziario',
		de: 'Finanzielle Aufschlüsselung',
		pt: 'Breakdown financeiro',
		nl: 'Financiële uitsplitsing',
		ko: '금융 세부 내역',
		ro: 'Detaliere financiară',
	},
	salePrice: {
		fr: 'Prix de vente',
		en: 'Sale Price',
		es: 'Precio de venta',
		it: 'Prezzo di vendita',
		de: 'Verkaufspreis',
		pt: 'Preço de venda',
		nl: 'Verkoopprijs',
		ko: '판매 가격',
		ro: 'Preț de vânzare',
	},
	platformFee: {
		fr: 'Commission Beswib',
		en: 'Beswib Commission',
		es: 'Comisión Beswib',
		it: 'Commissione Beswib',
		de: 'Beswib-Provision',
		pt: 'Comissão Beswib',
		nl: 'Beswib Commissie',
		ko: 'Beswib 수수료',
		ro: 'Comision Beswib',
	},
	totalReceived: {
		fr: 'Total reçu',
		en: 'Total Received',
		es: 'Total recibido',
		it: 'Totale ricevuto',
		de: 'Gesamt erhalten',
		pt: 'Total recebido',
		nl: 'Totaal ontvangen',
		ko: '총 수령액',
		ro: 'Total primit',
	},
	congratulations: {
		fr: 'Félicitations {sellerName} ! Votre dossard a été vendu avec succès. Le montant sera crédité sur votre compte PayPal sous 24-48h.',
		en: 'Congratulations {sellerName}! Your bib has been sold successfully. The amount will be credited to your PayPal account within 24-48h.',
		es: '¡Felicidades {sellerName}! Tu dorsal se ha vendido con éxito. El importe se acreditará en tu cuenta PayPal en 24-48h.',
		it: 'Congratulazioni {sellerName}! Il tuo pettorale è stato venduto con successo. L\'importo verrà accreditato sul tuo conto PayPal entro 24-48h.',
		de: 'Glückwunsch {sellerName}! Ihre Startnummer wurde erfolgreich verkauft. Der Betrag wird innerhalb von 24-48h auf Ihr PayPal-Konto gutgeschrieben.',
		pt: 'Parabéns {sellerName}! O seu dorsal foi vendido com sucesso. O valor será creditado na sua conta PayPal em 24-48h.',
		nl: 'Gefeliciteerd {sellerName}! Uw startnummer is succesvol verkocht. Het bedrag wordt binnen 24-48u gecrediteerd op uw PayPal-account.',
		ko: '축하합니다 {sellerName}! 레이스 번호가 성공적으로 판매되었습니다. 금액은 24-48시간 내에 PayPal 계정에 입금됩니다.',
		ro: 'Felicitări {sellerName}! Numărul tău de concurs a fost vândut cu succes. Suma va fi creditată în contul tău PayPal în 24-48h.',
	},
	nextSteps: {
		fr: 'Prochaines étapes',
		en: 'Next Steps',
		es: 'Próximos pasos',
		it: 'Prossimi passi',
		de: 'Nächste Schritte',
		pt: 'Próximos passos',
		nl: 'Volgende stappen',
		ko: '다음 단계',
		ro: 'Pașii următori',
	},
	step1: {
		fr: 'Le paiement sera traité automatiquement via PayPal',
		en: 'Payment will be processed automatically via PayPal',
		es: 'El pago se procesará automáticamente a través de PayPal',
		it: 'Il pagamento verrà elaborato automaticamente tramite PayPal',
		de: 'Die Zahlung wird automatisch über PayPal abgewickelt',
		pt: 'O pagamento será processado automaticamente via PayPal',
		nl: 'Betaling wordt automatisch verwerkt via PayPal',
		ko: '결제는 PayPal을 통해 자동으로 처리됩니다',
		ro: 'Plata va fi procesată automat prin PayPal',
	},
	step2: {
		fr: 'Vous recevrez une notification une fois le transfert effectué',
		en: 'You will receive a notification once the transfer is completed',
		es: 'Recibirás una notificación una vez completada la transferencia',
		it: 'Riceverai una notifica una volta completato il trasferimento',
		de: 'Sie erhalten eine Benachrichtigung, sobald die Überweisung abgeschlossen ist',
		pt: 'Receberá uma notificação assim que a transferência for concluída',
		nl: 'U ontvangt een melding zodra de overdracht is voltooid',
		ko: '이체가 완료되면 알림을 받게 됩니다',
		ro: 'Veți primi o notificare odată ce transferul este finalizat',
	},
	step3: {
		fr: 'Consultez votre tableau de bord vendeur pour plus de détails',
		en: 'Check your seller dashboard for more details',
		es: 'Consulta tu panel de vendedor para más detalles',
		it: 'Controlla il tuo dashboard venditore per maggiori dettagli',
		de: 'Überprüfen Sie Ihr Verkäufer-Dashboard für weitere Details',
		pt: 'Consulte o seu painel de vendedor para mais detalhes',
		nl: 'Bekijk uw verkoper dashboard voor meer details',
		ko: '자세한 내용은 판매자 대시보드를 확인하세요',
		ro: 'Verificați panoul dvs. de vânzător pentru mai multe detalii',
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

BeswibSaleConfirmation.PreviewProps = {
	sellerName: 'Marie Dupont',
	buyerName: 'Jean Martin',
	eventName: 'Marathon de Paris 2024',
	bibPrice: 150,
	platformFee: 15,
	totalReceived: 135,
	orderId: 'BW123456789',
	eventDate: '14 avril 2024',
	eventLocation: 'Paris, France',
	locale: 'fr',
} as BeswibSaleConfirmationProps

export default BeswibSaleConfirmation