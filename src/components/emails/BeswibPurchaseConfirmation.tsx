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

interface BeswibPurchaseConfirmationProps {
	buyerName?: string
	sellerName?: string
	eventName?: string
	bibPrice?: number
	orderId?: string
	eventDate?: string
	eventLocation?: string
	eventDistance?: string
	bibCategory?: string
	locale?: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

export const BeswibPurchaseConfirmation = ({
	buyerName = 'Jean',
	sellerName = 'Marie',
	eventName = 'Marathon de Paris 2024',
	bibPrice = 150,
	orderId = 'BW123456789',
	eventDate = '14 avril 2024',
	eventLocation = 'Paris, France',
	eventDistance = '42.2 km',
	bibCategory = 'Marathon',
	locale = 'fr',
}: BeswibPurchaseConfirmationProps) => {
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
								<Text className="text-success mb-4 text-4xl">🏃‍♂️</Text>
								<Heading className="text-foreground mb-2 text-2xl font-bold">
									{getLocalizedText('title')}
								</Heading>
								<Text className="text-muted-foreground text-base">
									{getLocalizedText('subtitle')}
								</Text>
							</Section>

							{/* Informations de l'achat */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{getLocalizedText('purchaseDetails')}
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
											{getLocalizedText('category')}:
										</Text>
										<Text className="text-foreground text-sm">
											{bibCategory}
										</Text>
									</Section>
									
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{getLocalizedText('distance')}:
										</Text>
										<Text className="text-foreground text-sm">
											{eventDistance}
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
											{getLocalizedText('seller')}:
										</Text>
										<Text className="text-foreground text-sm">
											{sellerName}
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

							{/* Détails du paiement */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{getLocalizedText('paymentSummary')}
								</Heading>
								
								<Section className="space-y-3">
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm">
											{getLocalizedText('bibPrice')}:
										</Text>
										<Text className="text-foreground text-sm">
											{formatPrice(bibPrice)}
										</Text>
									</Section>
									
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm">
											{getLocalizedText('processingFee')}:
										</Text>
										<Text className="text-foreground text-sm">
											{getLocalizedText('included')}
										</Text>
									</Section>
									
									<Section className="border-border border-t pt-3">
										<Section className="flex justify-between">
											<Text className="text-foreground text-base font-bold">
												{getLocalizedText('totalPaid')}:
											</Text>
											<Text className="text-success text-base font-bold">
												{formatPrice(bibPrice)}
											</Text>
										</Section>
									</Section>
								</Section>
							</Section>

							{/* Message de félicitations */}
							<Section className="mb-6 text-center">
								<Text className="text-muted-foreground text-base leading-relaxed">
									{getLocalizedText('congratulations').replace('{buyerName}', buyerName || '')}
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
									<Text className="text-muted-foreground text-sm">
										• {getLocalizedText('step4')}
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

// Traductions pour l'email de confirmation d'achat
const localizedTexts = {
	subject: {
		fr: 'Félicitations ! Votre achat a été confirmé',
		en: 'Congratulations! Your purchase has been confirmed',
		es: '¡Felicidades! Tu compra ha sido confirmada',
		it: 'Congratulazioni! Il tuo acquisto è stato confermato',
		de: 'Glückwunsch! Ihr Kauf wurde bestätigt',
		pt: 'Parabéns! A sua compra foi confirmada',
		nl: 'Gefeliciteerd! Uw aankoop is bevestigd',
		ko: '축하합니다! 구매가 확인되었습니다',
		ro: 'Felicitări! Achiziția ta a fost confirmată',
	},
	title: {
		fr: 'Achat confirmé !',
		en: 'Purchase Confirmed!',
		es: '¡Compra confirmada!',
		it: 'Acquisto confermato!',
		de: 'Kauf bestätigt!',
		pt: 'Compra confirmada!',
		nl: 'Aankoop bevestigd!',
		ko: '구매 확인됨!',
		ro: 'Achiziție confirmată!',
	},
	subtitle: {
		fr: 'Votre dossard vous attend !',
		en: 'Your bib is waiting for you!',
		es: '¡Tu dorsal te está esperando!',
		it: 'Il tuo pettorale ti aspetta!',
		de: 'Ihre Startnummer wartet auf Sie!',
		pt: 'O seu dorsal está à sua espera!',
		nl: 'Uw startnummer wacht op u!',
		ko: '레이스 번호가 기다리고 있습니다!',
		ro: 'Numărul tău de concurs te așteaptă!',
	},
	purchaseDetails: {
		fr: 'Détails de l\'achat',
		en: 'Purchase Details',
		es: 'Detalles de la compra',
		it: 'Dettagli dell\'acquisto',
		de: 'Kaufdetails',
		pt: 'Detalhes da compra',
		nl: 'Aankoopdetails',
		ko: '구매 세부 정보',
		ro: 'Detaliile achiziției',
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
	distance: {
		fr: 'Distance',
		en: 'Distance',
		es: 'Distancia',
		it: 'Distanza',
		de: 'Distanz',
		pt: 'Distância',
		nl: 'Afstand',
		ko: '거리',
		ro: 'Distanță',
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
	paymentSummary: {
		fr: 'Résumé du paiement',
		en: 'Payment Summary',
		es: 'Resumen del pago',
		it: 'Riepilogo pagamento',
		de: 'Zahlungsübersicht',
		pt: 'Resumo do pagamento',
		nl: 'Betalingsoverzicht',
		ko: '결제 요약',
		ro: 'Rezumatul plății',
	},
	bibPrice: {
		fr: 'Prix du dossard',
		en: 'Bib Price',
		es: 'Precio del dorsal',
		it: 'Prezzo pettorale',
		de: 'Startnummer-Preis',
		pt: 'Preço do dorsal',
		nl: 'Startnummer prijs',
		ko: '레이스 번호 가격',
		ro: 'Preț număr concurs',
	},
	processingFee: {
		fr: 'Frais de traitement',
		en: 'Processing Fee',
		es: 'Tarifa de procesamiento',
		it: 'Commissione di elaborazione',
		de: 'Bearbeitungsgebühr',
		pt: 'Taxa de processamento',
		nl: 'Verwerkingskosten',
		ko: '처리 수수료',
		ro: 'Taxă de procesare',
	},
	included: {
		fr: 'Inclus',
		en: 'Included',
		es: 'Incluido',
		it: 'Incluso',
		de: 'Inbegriffen',
		pt: 'Incluído',
		nl: 'Inbegrepen',
		ko: '포함됨',
		ro: 'Inclus',
	},
	totalPaid: {
		fr: 'Total payé',
		en: 'Total Paid',
		es: 'Total pagado',
		it: 'Totale pagato',
		de: 'Gesamt bezahlt',
		pt: 'Total pago',
		nl: 'Totaal betaald',
		ko: '총 지불액',
		ro: 'Total plătit',
	},
	congratulations: {
		fr: 'Félicitations {buyerName} ! Votre achat a été confirmé avec succès. Vous êtes maintenant inscrit(e) pour cet événement exceptionnel !',
		en: 'Congratulations {buyerName}! Your purchase has been confirmed successfully. You are now registered for this exceptional event!',
		es: '¡Felicidades {buyerName}! Tu compra ha sido confirmada con éxito. ¡Ahora estás registrado para este evento excepcional!',
		it: 'Congratulazioni {buyerName}! Il tuo acquisto è stato confermato con successo. Ora sei registrato per questo evento eccezionale!',
		de: 'Glückwunsch {buyerName}! Ihr Kauf wurde erfolgreich bestätigt. Sie sind jetzt für diese außergewöhnliche Veranstaltung registriert!',
		pt: 'Parabéns {buyerName}! A sua compra foi confirmada com sucesso. Está agora registado para este evento excecional!',
		nl: 'Gefeliciteerd {buyerName}! Uw aankoop is succesvol bevestigd. U bent nu geregistreerd voor dit uitzonderlijke evenement!',
		ko: '축하합니다 {buyerName}! 구매가 성공적으로 확인되었습니다. 이제 이 특별한 이벤트에 등록되었습니다!',
		ro: 'Felicitări {buyerName}! Achiziția ta a fost confirmată cu succes. Acum ești înregistrat pentru acest eveniment excepțional!',
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
		fr: 'Contactez l\'organisateur pour les détails de retrait du dossard',
		en: 'Contact the organizer for bib pickup details',
		es: 'Contacta con el organizador para los detalles de recogida del dorsal',
		it: 'Contatta l\'organizzatore per i dettagli del ritiro del pettorale',
		de: 'Kontaktieren Sie den Veranstalter für Details zur Startnummer-Abholung',
		pt: 'Contacte o organizador para os detalhes de levantamento do dorsal',
		nl: 'Neem contact op met de organisator voor startnummer ophaaldetails',
		ko: '레이스 번호 수령 세부 정보는 주최자에게 문의하세요',
		ro: 'Contactați organizatorul pentru detaliile ridicării numărului de concurs',
	},
	step2: {
		fr: 'Préparez-vous pour la course avec nos conseils d\'entraînement',
		en: 'Prepare for the race with our training tips',
		es: 'Prepárate para la carrera con nuestros consejos de entrenamiento',
		it: 'Preparati per la gara con i nostri consigli di allenamento',
		de: 'Bereiten Sie sich mit unseren Trainingstipps auf das Rennen vor',
		pt: 'Prepare-se para a corrida com as nossas dicas de treino',
		nl: 'Bereid u voor op de race met onze trainingstips',
		ko: '우리의 훈련 팁으로 경주를 준비하세요',
		ro: 'Pregătește-te pentru cursă cu sfaturile noastre de antrenament',
	},
	step3: {
		fr: 'Suivez vos achats dans votre tableau de bord acheteur',
		en: 'Track your purchases in your buyer dashboard',
		es: 'Sigue tus compras en tu panel de comprador',
		it: 'Traccia i tuoi acquisti nel tuo dashboard acquirente',
		de: 'Verfolgen Sie Ihre Käufe in Ihrem Käufer-Dashboard',
		pt: 'Acompanhe as suas compras no seu painel de comprador',
		nl: 'Volg uw aankopen in uw koper dashboard',
		ko: '구매자 대시보드에서 구매를 추적하세요',
		ro: 'Urmărește achizițiile în panoul tău de cumpărător',
	},
	step4: {
		fr: 'Rejoignez notre communauté pour partager votre expérience',
		en: 'Join our community to share your experience',
		es: 'Únete a nuestra comunidad para compartir tu experiencia',
		it: 'Unisciti alla nostra comunità per condividere la tua esperienza',
		de: 'Treten Sie unserer Community bei, um Ihre Erfahrungen zu teilen',
		pt: 'Junte-se à nossa comunidade para partilhar a sua experiência',
		nl: 'Doe mee met onze gemeenschap om uw ervaring te delen',
		ko: '경험을 공유하기 위해 커뮤니티에 참여하세요',
		ro: 'Alătură-te comunității noastre pentru a-ți împărtăși experiența',
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

BeswibPurchaseConfirmation.PreviewProps = {
	buyerName: 'Jean Martin',
	sellerName: 'Marie Dupont',
	eventName: 'Marathon de Paris 2024',
	bibPrice: 150,
	orderId: 'BW123456789',
	eventDate: '14 avril 2024',
	eventLocation: 'Paris, France',
	eventDistance: '42.2 km',
	bibCategory: 'Marathon',
	locale: 'fr',
} as BeswibPurchaseConfirmationProps

export default BeswibPurchaseConfirmation