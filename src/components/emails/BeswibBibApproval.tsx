import {
	Html,
	Head,
	Font,
	Preview,
	Body,
	Container,
	Section,
	Img,
	Heading,
	Text,
	Button,
	Hr,
} from '@react-email/components'

import { getTranslations } from '@/lib/i18n/dictionary'

interface BeswibBibApprovalProps {
	sellerName?: string
	eventName?: string
	eventDate?: string
	eventLocation?: string
	bibPrice?: number
	eventDistance?: string
	bibCategory?: string
	organizerName?: string
	locale?: string
}

const constantsLocales = {
	fr: {
		bibApproval: {
			subject: 'Félicitations ! Votre dossard a été approuvé 🎉',
			greeting: 'Bonjour',
			mainMessage: "Excellente nouvelle ! L'organisateur de l'événement a approuvé votre dossard.",
			canNowSell: 'Vous pouvez maintenant le mettre en vente sur Beswib.',
			approvalDetails: "Détails de l'approbation",
			bibDetails: 'Détails du dossard',
			event: 'Événement',
			date: 'Date',
			location: 'Lieu',
			distance: 'Distance',
			category: 'Catégorie',
			price: 'Prix de vente',
			organizerValidation: 'Validation organisateur',
			approvedBy: 'Approuvé par',
			nextSteps: 'Prochaines étapes',
			step1: 'Votre dossard est désormais visible sur la marketplace',
			step2: 'Les coureurs intéressés peuvent maintenant le découvrir',
			step3: "Vous recevrez une notification dès qu'un acheteur se manifeste",
			step4: 'Le paiement sera sécurisé via notre plateforme',
			sellNowButton: 'Voir mon dossard en vente',
			helpText: "Besoin d'aide ?",
			helpDescription: 'Notre équipe est là pour vous accompagner dans le processus de vente.',
			contactSupport: 'Contacter le support',
			footer: 'Bonne vente !',
			teamSignature: "L'équipe Beswib",
			congratulations: 'Félicitations pour cette validation !',
		},
	},
	en: {
		bibApproval: {
			subject: 'Congratulations! Your bib has been approved 🎉',
			greeting: 'Hello',
			mainMessage: 'Great news! The event organizer has approved your bib.',
			canNowSell: 'You can now list it for sale on Beswib.',
			approvalDetails: 'Approval Details',
			bibDetails: 'Bib Details',
			event: 'Event',
			date: 'Date',
			location: 'Location',
			distance: 'Distance',
			category: 'Category',
			price: 'Sale price',
			organizerValidation: 'Organizer validation',
			approvedBy: 'Approved by',
			nextSteps: 'Next Steps',
			step1: 'Your bib is now visible on the marketplace',
			step2: 'Interested runners can now discover it',
			step3: "You'll receive a notification as soon as a buyer shows interest",
			step4: 'Payment will be secured through our platform',
			sellNowButton: 'View my bib for sale',
			helpText: 'Need help?',
			helpDescription: 'Our team is here to support you through the selling process.',
			contactSupport: 'Contact support',
			footer: 'Happy selling!',
			teamSignature: 'The Beswib Team',
			congratulations: 'Congratulations on this validation!',
		},
	},
	es: {
		bibApproval: {
			subject: '¡Felicidades! Tu dorsal ha sido aprobado 🎉',
			greeting: 'Hola',
			mainMessage: '¡Excelente noticia! El organizador del evento ha aprobado tu dorsal.',
			canNowSell: 'Ahora puedes ponerlo a la venta en Beswib.',
			approvalDetails: 'Detalles de la aprobación',
			bibDetails: 'Detalles del dorsal',
			event: 'Evento',
			date: 'Fecha',
			location: 'Ubicación',
			distance: 'Distancia',
			category: 'Categoría',
			price: 'Precio de venta',
			organizerValidation: 'Validación del organizador',
			approvedBy: 'Aprobado por',
			nextSteps: 'Próximos pasos',
			step1: 'Tu dorsal ahora es visible en el marketplace',
			step2: 'Los corredores interesados ahora pueden descubrirlo',
			step3: 'Recibirás una notificación en cuanto un comprador se interese',
			step4: 'El pago será seguro a través de nuestra plataforma',
			sellNowButton: 'Ver mi dorsal en venta',
			helpText: '¿Necesitas ayuda?',
			helpDescription: 'Nuestro equipo está aquí para apoyarte en el proceso de venta.',
			contactSupport: 'Contactar soporte',
			footer: '¡Feliz venta!',
			teamSignature: 'El equipo Beswib',
			congratulations: '¡Felicitaciones por esta validación!',
		},
	},
	it: {
		bibApproval: {
			subject: 'Congratulazioni! Il tuo pettorale è stato approvato 🎉',
			greeting: 'Ciao',
			mainMessage: "Ottima notizia! L'organizzatore dell'evento ha approvato il tuo pettorale.",
			canNowSell: 'Ora puoi metterlo in vendita su Beswib.',
			approvalDetails: "Dettagli dell'approvazione",
			bibDetails: 'Dettagli del pettorale',
			event: 'Evento',
			date: 'Data',
			location: 'Luogo',
			distance: 'Distanza',
			category: 'Categoria',
			price: 'Prezzo di vendita',
			organizerValidation: 'Validazione organizzatore',
			approvedBy: 'Approvato da',
			nextSteps: 'Prossimi passi',
			step1: 'Il tuo pettorale è ora visibile sul marketplace',
			step2: 'I corridori interessati ora possono scoprirlo',
			step3: 'Riceverai una notifica non appena un acquirente mostrerà interesse',
			step4: 'Il pagamento sarà sicuro attraverso la nostra piattaforma',
			sellNowButton: 'Visualizza il mio pettorale in vendita',
			helpText: 'Hai bisogno di aiuto?',
			helpDescription: 'Il nostro team è qui per supportarti nel processo di vendita.',
			contactSupport: 'Contatta il supporto',
			footer: 'Buona vendita!',
			teamSignature: 'Il team Beswib',
			congratulations: 'Congratulazioni per questa validazione!',
		},
	},
	de: {
		bibApproval: {
			subject: 'Glückwunsch! Ihre Startnummer wurde genehmigt 🎉',
			greeting: 'Hallo',
			mainMessage: 'Großartige Neuigkeiten! Der Veranstalter hat Ihre Startnummer genehmigt.',
			canNowSell: 'Sie können sie jetzt auf Beswib zum Verkauf anbieten.',
			approvalDetails: 'Genehmigungsdetails',
			bibDetails: 'Startnummer-Details',
			event: 'Veranstaltung',
			date: 'Datum',
			location: 'Ort',
			distance: 'Distanz',
			category: 'Kategorie',
			price: 'Verkaufspreis',
			organizerValidation: 'Veranstalter-Validierung',
			approvedBy: 'Genehmigt von',
			nextSteps: 'Nächste Schritte',
			step1: 'Ihre Startnummer ist jetzt auf dem Marktplatz sichtbar',
			step2: 'Interessierte Läufer können sie jetzt entdecken',
			step3: 'Sie erhalten eine Benachrichtigung, sobald ein Käufer Interesse zeigt',
			step4: 'Die Zahlung wird über unsere Plattform abgesichert',
			sellNowButton: 'Meine Startnummer zum Verkauf ansehen',
			helpText: 'Benötigen Sie Hilfe?',
			helpDescription: 'Unser Team ist da, um Sie beim Verkaufsprozess zu unterstützen.',
			contactSupport: 'Support kontaktieren',
			footer: 'Viel Erfolg beim Verkauf!',
			teamSignature: 'Das Beswib Team',
			congratulations: 'Herzlichen Glückwunsch zu dieser Validierung!',
		},
	},
	pt: {
		bibApproval: {
			subject: 'Parabéns! O seu dorsal foi aprovado 🎉',
			greeting: 'Olá',
			mainMessage: 'Excelente notícia! O organizador do evento aprovou o seu dorsal.',
			canNowSell: 'Agora pode colocá-lo à venda na Beswib.',
			approvalDetails: 'Detalhes da aprovação',
			bibDetails: 'Detalhes do dorsal',
			event: 'Evento',
			date: 'Data',
			location: 'Local',
			distance: 'Distância',
			category: 'Categoria',
			price: 'Preço de venda',
			organizerValidation: 'Validação do organizador',
			approvedBy: 'Aprovado por',
			nextSteps: 'Próximos passos',
			step1: 'O seu dorsal está agora visível no marketplace',
			step2: 'Os corredores interessados podem agora descobri-lo',
			step3: 'Receberá uma notificação assim que um comprador mostrar interesse',
			step4: 'O pagamento será seguro através da nossa plataforma',
			sellNowButton: 'Ver o meu dorsal à venda',
			helpText: 'Precisa de ajuda?',
			helpDescription: 'A nossa equipa está aqui para o apoiar no processo de venda.',
			contactSupport: 'Contactar suporte',
			footer: 'Boa venda!',
			teamSignature: 'A equipa Beswib',
			congratulations: 'Parabéns por esta validação!',
		},
	},
	nl: {
		bibApproval: {
			subject: 'Gefeliciteerd! Uw startnummer is goedgekeurd 🎉',
			greeting: 'Hallo',
			mainMessage: 'Geweldig nieuws! De evenement organisator heeft uw startnummer goedgekeurd.',
			canNowSell: 'U kunt het nu te koop aanbieden op Beswib.',
			approvalDetails: 'Goedkeuring details',
			bibDetails: 'Startnummer details',
			event: 'Evenement',
			date: 'Datum',
			location: 'Locatie',
			distance: 'Afstand',
			category: 'Categorie',
			price: 'Verkoopprijs',
			organizerValidation: 'Organisator validatie',
			approvedBy: 'Goedgekeurd door',
			nextSteps: 'Volgende stappen',
			step1: 'Uw startnummer is nu zichtbaar op de marktplaats',
			step2: 'Geïnteresseerde lopers kunnen het nu ontdekken',
			step3: 'U ontvangt een melding zodra een koper interesse toont',
			step4: 'De betaling wordt beveiligd via ons platform',
			sellNowButton: 'Bekijk mijn startnummer te koop',
			helpText: 'Hulp nodig?',
			helpDescription: 'Ons team is er om u te ondersteunen tijdens het verkoopproces.',
			contactSupport: 'Contact opnemen met ondersteuning',
			footer: 'Veel succes met verkopen!',
			teamSignature: 'Het Beswib Team',
			congratulations: 'Gefeliciteerd met deze validatie!',
		},
	},
	ko: {
		bibApproval: {
			subject: '축하합니다! 레이스 번호가 승인되었습니다 🎉',
			greeting: '안녕하세요',
			mainMessage: '좋은 소식입니다! 이벤트 주최자가 귀하의 레이스 번호를 승인했습니다.',
			canNowSell: '이제 Beswib에서 판매할 수 있습니다.',
			approvalDetails: '승인 세부사항',
			bibDetails: '레이스 번호 세부사항',
			event: '이벤트',
			date: '날짜',
			location: '장소',
			distance: '거리',
			category: '카테고리',
			price: '판매 가격',
			organizerValidation: '주최자 검증',
			approvedBy: '승인자',
			nextSteps: '다음 단계',
			step1: '귀하의 레이스 번호가 이제 마켓플레이스에 표시됩니다',
			step2: '관심 있는 러너들이 이제 발견할 수 있습니다',
			step3: '구매자가 관심을 보이는 즉시 알림을 받으실 것입니다',
			step4: '결제는 저희 플랫폼을 통해 안전하게 처리됩니다',
			sellNowButton: '판매 중인 내 레이스 번호 보기',
			helpText: '도움이 필요하신가요?',
			helpDescription: '저희 팀이 판매 과정에서 귀하를 지원해 드립니다.',
			contactSupport: '지원팀 문의',
			footer: '성공적인 판매 되세요!',
			teamSignature: 'Beswib 팀',
			congratulations: '이 검증을 축하드립니다!',
		},
	},
	ro: {
		bibApproval: {
			subject: 'Felicitări! Numărul tău de concurs a fost aprobat 🎉',
			greeting: 'Bună ziua',
			mainMessage: 'Vești excelente! Organizatorul evenimentului a aprobat numărul tău de concurs.',
			canNowSell: 'Acum îl poți pune la vânzare pe Beswib.',
			approvalDetails: 'Detaliile aprobării',
			bibDetails: 'Detaliile numărului de concurs',
			event: 'Eveniment',
			date: 'Data',
			location: 'Locația',
			distance: 'Distanța',
			category: 'Categoria',
			price: 'Prețul de vânzare',
			organizerValidation: 'Validarea organizatorului',
			approvedBy: 'Aprobat de',
			nextSteps: 'Pașii următori',
			step1: 'Numărul tău de concurs este acum vizibil pe marketplace',
			step2: 'Alergătorii interesați îl pot descoperi acum',
			step3: 'Vei primi o notificare de îndată ce un cumpărător va arăta interest',
			step4: 'Plata va fi securizată prin platforma noastră',
			sellNowButton: 'Vezi numărul meu de concurs la vânzare',
			helpText: 'Ai nevoie de ajutor?',
			helpDescription: 'Echipa noastră este aici să te sprijine în procesul de vânzare.',
			contactSupport: 'Contactează suportul',
			footer: 'Vânzare cu succes!',
			teamSignature: 'Echipa Beswib',
			congratulations: 'Felicitări pentru această validare!',
		},
	},
}

export default function BeswibBibApproval({
	sellerName = '',
	eventName = '',
	eventDate = '',
	eventLocation = '',
	bibPrice = 0,
	eventDistance = '',
	bibCategory = '',
	organizerName = '',
	locale = 'fr',
}: BeswibBibApprovalProps) {
	const t = getTranslations(locale, constantsLocales)

	const getLocalizedText = (key: string) => {
		const keys = key.split('.')
		let value = t.bibApproval
		for (const k of keys) {
			value = (value as any)?.[k]
		}
		return value || key
	}

	const formatPrice = (price: number) => `${price.toFixed(2)}€`
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beswib.com'

	return (
		<Html lang={locale}>
			<Head>
				<Font
					fontFamily="Inter"
					src="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
					fontWeight={400}
					fontStyle="normal"
				/>
			</Head>
			<Preview>{getLocalizedText('subject')}</Preview>
			<Body style={{ backgroundColor: 'hsl(var(--background))', fontFamily: 'Inter, Arial, sans-serif' }}>
				<Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
					{/* Header */}
					<Section style={{ textAlign: 'center', marginBottom: '32px' }}>
						<Img src={`${baseUrl}/beswib-logo.png`} width="120" height="40" alt="Beswib" style={{ margin: '0 auto' }} />
					</Section>

					{/* Success Header */}
					<Section
						style={{
							background: 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 71% 35%) 100%)',
							padding: '30px',
							borderRadius: '12px 12px 0 0',
							textAlign: 'center',
						}}
					>
						<Text style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: '0' }}>
							🎉 {getLocalizedText('subject').replace(' 🎉', '')}
						</Text>
					</Section>

					{/* Main Content */}
					<Section
						style={{
							background: 'hsl(var(--card))',
							padding: '30px',
							border: '1px solid hsl(var(--border))',
							borderRadius: '0 0 12px 12px',
							boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
						}}
					>
						{/* Greeting */}
						<Text style={{ fontSize: '16px', color: 'hsl(var(--foreground))', marginBottom: '16px' }}>
							{getLocalizedText('greeting')}
							{sellerName ? ` ${sellerName}` : ''} 👋
						</Text>

						{/* Main Message */}
						<Text
							style={{ fontSize: '16px', color: 'hsl(var(--foreground))', lineHeight: '1.6', marginBottom: '24px' }}
						>
							{getLocalizedText('mainMessage')} <strong>{getLocalizedText('canNowSell')}</strong>
						</Text>

						{/* Approval Status */}
						<Section
							style={{
								background: 'hsl(var(--success-foreground))',
								border: '2px solid hsl(var(--success))',
								padding: '20px',
								borderRadius: '8px',
								marginBottom: '24px',
							}}
						>
							<Text style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--success))', margin: '0 0 12px 0' }}>
								✅ {getLocalizedText('approvalDetails')}
							</Text>
							<Text style={{ fontSize: '14px', color: 'hsl(var(--success))', margin: '0' }}>
								<strong>{getLocalizedText('approvedBy')}:</strong> {organizerName || "Organisateur de l'événement"}
							</Text>
						</Section>

						{/* Bib Details */}
						<Section
							style={{
								background: 'hsl(var(--muted))',
								padding: '20px',
								borderRadius: '8px',
								marginBottom: '24px',
							}}
						>
							<Heading
								style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--foreground))', margin: '0 0 16px 0' }}
							>
								{getLocalizedText('bibDetails')}
							</Heading>

							{eventName && (
								<Text style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', margin: '4px 0' }}>
									<strong>{getLocalizedText('event')}:</strong> {eventName}
								</Text>
							)}
							{eventDate && (
								<Text style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', margin: '4px 0' }}>
									<strong>{getLocalizedText('date')}:</strong> {eventDate}
								</Text>
							)}
							{eventLocation && (
								<Text style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', margin: '4px 0' }}>
									<strong>{getLocalizedText('location')}:</strong> {eventLocation}
								</Text>
							)}
							{eventDistance && (
								<Text style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', margin: '4px 0' }}>
									<strong>{getLocalizedText('distance')}:</strong> {eventDistance}
								</Text>
							)}
							{bibCategory && (
								<Text style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', margin: '4px 0' }}>
									<strong>{getLocalizedText('category')}:</strong> {bibCategory}
								</Text>
							)}
							{bibPrice > 0 && (
								<Text style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', margin: '4px 0' }}>
									<strong>{getLocalizedText('price')}:</strong> {formatPrice(bibPrice)}
								</Text>
							)}
						</Section>

						{/* Next Steps */}
						<Section style={{ marginBottom: '24px' }}>
							<Heading
								style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--foreground))', marginBottom: '16px' }}
							>
								🚀 {getLocalizedText('nextSteps')}
							</Heading>

							<Text
								style={{
									fontSize: '14px',
									color: 'hsl(var(--muted-foreground))',
									margin: '8px 0',
									paddingLeft: '16px',
								}}
							>
								• {getLocalizedText('step1')}
							</Text>
							<Text
								style={{
									fontSize: '14px',
									color: 'hsl(var(--muted-foreground))',
									margin: '8px 0',
									paddingLeft: '16px',
								}}
							>
								• {getLocalizedText('step2')}
							</Text>
							<Text
								style={{
									fontSize: '14px',
									color: 'hsl(var(--muted-foreground))',
									margin: '8px 0',
									paddingLeft: '16px',
								}}
							>
								• {getLocalizedText('step3')}
							</Text>
							<Text
								style={{
									fontSize: '14px',
									color: 'hsl(var(--muted-foreground))',
									margin: '8px 0',
									paddingLeft: '16px',
								}}
							>
								• {getLocalizedText('step4')}
							</Text>
						</Section>

						{/* Action Button */}
						<Section style={{ textAlign: 'center', margin: '32px 0' }}>
							<Button
								href={`${baseUrl}/dashboard/my-bibs`}
								style={{
									background: 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 71% 35%) 100%)',
									color: 'white',
									padding: '12px 24px',
									borderRadius: '6px',
									textDecoration: 'none',
									fontWeight: '600',
									fontSize: '16px',
									display: 'inline-block',
								}}
							>
								{getLocalizedText('sellNowButton')}
							</Button>
						</Section>

						{/* Congratulations Message */}
						<Section
							style={{
								background: 'hsl(var(--primary-foreground))',
								border: '1px solid hsl(var(--primary))',
								padding: '16px',
								borderRadius: '6px',
								textAlign: 'center',
								marginBottom: '24px',
							}}
						>
							<Text style={{ fontSize: '14px', color: 'hsl(var(--primary))', margin: '0', fontWeight: '500' }}>
								🌟 {getLocalizedText('congratulations')}
							</Text>
						</Section>

						<Hr style={{ borderColor: 'hsl(var(--border))', margin: '24px 0' }} />

						{/* Help Section */}
						<Section style={{ textAlign: 'center', marginBottom: '24px' }}>
							<Text style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', marginBottom: '8px' }}>
								<strong>{getLocalizedText('helpText')}</strong>
							</Text>
							<Text style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', marginBottom: '16px' }}>
								{getLocalizedText('helpDescription')}
							</Text>
							<Button
								href={`${baseUrl}/contact`}
								style={{
									color: 'hsl(var(--primary))',
									textDecoration: 'underline',
									fontSize: '14px',
									background: 'transparent',
									border: 'none',
								}}
							>
								{getLocalizedText('contactSupport')}
							</Button>
						</Section>

						{/* Footer */}
						<Section style={{ textAlign: 'center' }}>
							<Text style={{ fontSize: '16px', color: 'hsl(var(--foreground))', margin: '0 0 8px 0' }}>
								{getLocalizedText('footer')}
							</Text>
							<Text style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', margin: '0', fontWeight: '600' }}>
								{getLocalizedText('teamSignature')}
							</Text>
						</Section>
					</Section>
				</Container>
			</Body>
		</Html>
	)
}
