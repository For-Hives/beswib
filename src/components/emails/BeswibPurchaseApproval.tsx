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

interface BeswibPurchaseApprovalProps {
	buyerName?: string
	eventName?: string
	eventDate?: string
	eventLocation?: string
	bibPrice?: number
	eventDistance?: string
	bibCategory?: string
	organizerName?: string
	orderId?: string
	locale?: string
}

const constantsLocales = {
	fr: {
		purchaseApproval: {
			subject: 'Tout est en ordre ! Votre achat a été validé 🎉',
			greeting: 'Bonjour',
			mainMessage: "Excellente nouvelle ! L'organisateur a validé le changement de propriétaire de votre dossard.",
			readyToRun: 'Vous êtes officiellement inscrit(e) et prêt(e) à courir !',
			validationDetails: 'Validation officielle',
			purchaseDetails: 'Détails de votre achat',
			event: 'Événement',
			date: 'Date',
			location: 'Lieu',
			distance: 'Distance',
			category: 'Catégorie',
			pricePaid: 'Prix payé',
			orderId: 'Numéro de commande',
			organizerValidation: 'Validation organisateur',
			validatedBy: 'Validé par',
			finalSteps: 'Étapes finales',
			step1: 'Votre inscription est maintenant officielle',
			step2: 'Vous recevrez bientôt vos instructions pré-course',
			step3: 'Préparez-vous pour le jour J !',
			step4: "Consultez le site de l'événement pour plus de détails",
			viewEventButton: "Voir les détails de l'événement",
			preparationTips: 'Conseils de préparation',
			tip1: 'Vérifiez les consignes de retrait de dossard',
			tip2: 'Consultez le parcours et les points de ravitaillement',
			tip3: 'Préparez votre matériel et votre nutrition',
			helpText: 'Des questions ?',
			helpDescription: 'Notre équipe de support est là pour vous aider.',
			contactSupport: 'Contacter le support',
			footer: 'Excellente course !',
			teamSignature: "L'équipe Beswib",
			congratulations: "Félicitations, c'est officiel ! 🏃‍♂️",
		},
	},
	en: {
		purchaseApproval: {
			subject: 'All set! Your purchase has been validated 🎉',
			greeting: 'Hello',
			mainMessage: 'Great news! The organizer has validated the ownership change of your bib.',
			readyToRun: 'You are officially registered and ready to run!',
			validationDetails: 'Official validation',
			purchaseDetails: 'Your purchase details',
			event: 'Event',
			date: 'Date',
			location: 'Location',
			distance: 'Distance',
			category: 'Category',
			pricePaid: 'Price paid',
			orderId: 'Order ID',
			organizerValidation: 'Organizer validation',
			validatedBy: 'Validated by',
			finalSteps: 'Final steps',
			step1: 'Your registration is now official',
			step2: 'You will soon receive your pre-race instructions',
			step3: 'Get ready for race day!',
			step4: 'Check the event website for more details',
			viewEventButton: 'View event details',
			preparationTips: 'Preparation tips',
			tip1: 'Check the bib pickup instructions',
			tip2: 'Review the course and aid stations',
			tip3: 'Prepare your gear and nutrition',
			helpText: 'Questions?',
			helpDescription: 'Our support team is here to help you.',
			contactSupport: 'Contact support',
			footer: 'Have a great race!',
			teamSignature: 'The Beswib Team',
			congratulations: "Congratulations, it's official! 🏃‍♂️",
		},
	},
	es: {
		purchaseApproval: {
			subject: '¡Todo listo! Tu compra ha sido validada 🎉',
			greeting: 'Hola',
			mainMessage: '¡Excelente noticia! El organizador ha validado el cambio de propietario de tu dorsal.',
			readyToRun: '¡Estás oficialmente inscrito/a y listo/a para correr!',
			validationDetails: 'Validación oficial',
			purchaseDetails: 'Detalles de tu compra',
			event: 'Evento',
			date: 'Fecha',
			location: 'Ubicación',
			distance: 'Distancia',
			category: 'Categoría',
			pricePaid: 'Precio pagado',
			orderId: 'ID de pedido',
			organizerValidation: 'Validación del organizador',
			validatedBy: 'Validado por',
			finalSteps: 'Pasos finales',
			step1: 'Tu inscripción es ahora oficial',
			step2: 'Pronto recibirás tus instrucciones pre-carrera',
			step3: '¡Prepárate para el día de la carrera!',
			step4: 'Consulta el sitio web del evento para más detalles',
			viewEventButton: 'Ver detalles del evento',
			preparationTips: 'Consejos de preparación',
			tip1: 'Verifica las instrucciones de recogida del dorsal',
			tip2: 'Revisa el recorrido y los puntos de avituallamiento',
			tip3: 'Prepara tu equipo y nutrición',
			helpText: '¿Preguntas?',
			helpDescription: 'Nuestro equipo de soporte está aquí para ayudarte.',
			contactSupport: 'Contactar soporte',
			footer: '¡Que tengas una gran carrera!',
			teamSignature: 'El equipo Beswib',
			congratulations: '¡Felicidades, es oficial! 🏃‍♂️',
		},
	},
	it: {
		purchaseApproval: {
			subject: 'Tutto a posto! Il tuo acquisto è stato validato 🎉',
			greeting: 'Ciao',
			mainMessage: "Ottima notizia! L'organizzatore ha validato il cambio di proprietà del tuo pettorale.",
			readyToRun: 'Sei ufficialmente iscritto/a e pronto/a a correre!',
			validationDetails: 'Validazione ufficiale',
			purchaseDetails: 'Dettagli del tuo acquisto',
			event: 'Evento',
			date: 'Data',
			location: 'Luogo',
			distance: 'Distanza',
			category: 'Categoria',
			pricePaid: 'Prezzo pagato',
			orderId: 'ID ordine',
			organizerValidation: 'Validazione organizzatore',
			validatedBy: 'Validato da',
			finalSteps: 'Passi finali',
			step1: 'La tua iscrizione è ora ufficiale',
			step2: 'Riceverai presto le tue istruzioni pre-gara',
			step3: 'Preparati per il giorno della gara!',
			step4: "Consulta il sito dell'evento per maggiori dettagli",
			viewEventButton: 'Visualizza dettagli evento',
			preparationTips: 'Consigli per la preparazione',
			tip1: 'Verifica le istruzioni per il ritiro del pettorale',
			tip2: 'Esamina il percorso e i punti di ristoro',
			tip3: 'Prepara la tua attrezzatura e nutrizione',
			helpText: 'Domande?',
			helpDescription: 'Il nostro team di supporto è qui per aiutarti.',
			contactSupport: 'Contatta il supporto',
			footer: 'Buona gara!',
			teamSignature: 'Il team Beswib',
			congratulations: 'Congratulazioni, è ufficiale! 🏃‍♂️',
		},
	},
	de: {
		purchaseApproval: {
			subject: 'Alles bereit! Ihr Kauf wurde validiert 🎉',
			greeting: 'Hallo',
			mainMessage: 'Großartige Neuigkeiten! Der Veranstalter hat den Eigentümerwechsel Ihrer Startnummer validiert.',
			readyToRun: 'Sie sind offiziell registriert und bereit zu laufen!',
			validationDetails: 'Offizielle Validierung',
			purchaseDetails: 'Ihre Kaufdetails',
			event: 'Veranstaltung',
			date: 'Datum',
			location: 'Ort',
			distance: 'Distanz',
			category: 'Kategorie',
			pricePaid: 'Bezahlter Preis',
			orderId: 'Bestellnummer',
			organizerValidation: 'Veranstalter-Validierung',
			validatedBy: 'Validiert von',
			finalSteps: 'Finale Schritte',
			step1: 'Ihre Anmeldung ist jetzt offiziell',
			step2: 'Sie erhalten bald Ihre Vorwettkampf-Anweisungen',
			step3: 'Bereiten Sie sich auf den Wettkampftag vor!',
			step4: 'Besuchen Sie die Event-Website für weitere Details',
			viewEventButton: 'Event-Details ansehen',
			preparationTips: 'Vorbereitungstipps',
			tip1: 'Überprüfen Sie die Startnummern-Abholanweisungen',
			tip2: 'Überprüfen Sie die Strecke und Verpflegungsstationen',
			tip3: 'Bereiten Sie Ihre Ausrüstung und Ernährung vor',
			helpText: 'Fragen?',
			helpDescription: 'Unser Support-Team ist da, um Ihnen zu helfen.',
			contactSupport: 'Support kontaktieren',
			footer: 'Einen großartigen Lauf!',
			teamSignature: 'Das Beswib Team',
			congratulations: 'Herzlichen Glückwunsch, es ist offiziell! 🏃‍♂️',
		},
	},
	pt: {
		purchaseApproval: {
			subject: 'Tudo pronto! A sua compra foi validada 🎉',
			greeting: 'Olá',
			mainMessage: 'Excelente notícia! O organizador validou a mudança de propriedade do seu dorsal.',
			readyToRun: 'Está oficialmente inscrito/a e pronto/a para correr!',
			validationDetails: 'Validação oficial',
			purchaseDetails: 'Detalhes da sua compra',
			event: 'Evento',
			date: 'Data',
			location: 'Local',
			distance: 'Distância',
			category: 'Categoria',
			pricePaid: 'Preço pago',
			orderId: 'ID do pedido',
			organizerValidation: 'Validação do organizador',
			validatedBy: 'Validado por',
			finalSteps: 'Passos finais',
			step1: 'A sua inscrição é agora oficial',
			step2: 'Em breve receberá as suas instruções pré-prova',
			step3: 'Prepare-se para o dia da prova!',
			step4: 'Consulte o site do evento para mais detalhes',
			viewEventButton: 'Ver detalhes do evento',
			preparationTips: 'Dicas de preparação',
			tip1: 'Verifique as instruções de levantamento do dorsal',
			tip2: 'Reveja o percurso e os postos de abastecimento',
			tip3: 'Prepare o seu equipamento e nutrição',
			helpText: 'Dúvidas?',
			helpDescription: 'A nossa equipa de suporte está aqui para o ajudar.',
			contactSupport: 'Contactar suporte',
			footer: 'Excelente corrida!',
			teamSignature: 'A equipa Beswib',
			congratulations: 'Parabéns, é oficial! 🏃‍♂️',
		},
	},
	nl: {
		purchaseApproval: {
			subject: 'Alles klaar! Uw aankoop is gevalideerd 🎉',
			greeting: 'Hallo',
			mainMessage: 'Geweldig nieuws! De organisator heeft de eigendomsoverdracht van uw startnummer gevalideerd.',
			readyToRun: 'U bent officieel geregistreerd en klaar om te lopen!',
			validationDetails: 'Officiële validatie',
			purchaseDetails: 'Uw aankoop details',
			event: 'Evenement',
			date: 'Datum',
			location: 'Locatie',
			distance: 'Afstand',
			category: 'Categorie',
			pricePaid: 'Betaalde prijs',
			orderId: 'Bestelnummer',
			organizerValidation: 'Organisator validatie',
			validatedBy: 'Gevalideerd door',
			finalSteps: 'Laatste stappen',
			step1: 'Uw registratie is nu officieel',
			step2: 'U ontvangt binnenkort uw pre-race instructies',
			step3: 'Bereid u voor op de racedag!',
			step4: 'Bekijk de evenement website voor meer details',
			viewEventButton: 'Bekijk evenement details',
			preparationTips: 'Voorbereidingstips',
			tip1: 'Controleer de startnummer ophaalinstructies',
			tip2: 'Bekijk het parcours en verzorgingsposten',
			tip3: 'Bereid uw uitrusting en voeding voor',
			helpText: 'Vragen?',
			helpDescription: 'Ons support team staat klaar om u te helpen.',
			contactSupport: 'Contact opnemen met support',
			footer: 'Veel succes met de race!',
			teamSignature: 'Het Beswib Team',
			congratulations: 'Gefeliciteerd, het is officieel! 🏃‍♂️',
		},
	},
	ko: {
		purchaseApproval: {
			subject: '모든 준비 완료! 구매가 확인되었습니다 🎉',
			greeting: '안녕하세요',
			mainMessage: '좋은 소식입니다! 주최자가 레이스 번호의 소유권 변경을 확인했습니다.',
			readyToRun: '공식적으로 등록되어 달릴 준비가 되었습니다!',
			validationDetails: '공식 확인',
			purchaseDetails: '구매 세부사항',
			event: '이벤트',
			date: '날짜',
			location: '장소',
			distance: '거리',
			category: '카테고리',
			pricePaid: '지불 금액',
			orderId: '주문 번호',
			organizerValidation: '주최자 확인',
			validatedBy: '확인자',
			finalSteps: '최종 단계',
			step1: '귀하의 등록이 이제 공식적입니다',
			step2: '곧 레이스 전 지침을 받게 됩니다',
			step3: '레이스 데이를 준비하세요!',
			step4: '더 자세한 내용은 이벤트 웹사이트를 확인하세요',
			viewEventButton: '이벤트 세부사항 보기',
			preparationTips: '준비 팁',
			tip1: '레이스 번호 수령 지침을 확인하세요',
			tip2: '코스와 급수대를 검토하세요',
			tip3: '장비와 영양 섭취를 준비하세요',
			helpText: '궁금한 점이 있나요?',
			helpDescription: '저희 지원팀이 도와드리겠습니다.',
			contactSupport: '지원팀 문의',
			footer: '훌륭한 레이스 되세요!',
			teamSignature: 'Beswib 팀',
			congratulations: '축하합니다, 공식적입니다! 🏃‍♂️',
		},
	},
	ro: {
		purchaseApproval: {
			subject: 'Totul este gata! Achiziția ta a fost validată 🎉',
			greeting: 'Bună ziua',
			mainMessage: 'Vești excelente! Organizatorul a validat schimbarea de proprietate a numărului tău de concurs.',
			readyToRun: 'Ești oficial înregistrat/ă și gata/ă să alergi!',
			validationDetails: 'Validarea oficială',
			purchaseDetails: 'Detaliile achiziției tale',
			event: 'Eveniment',
			date: 'Data',
			location: 'Locația',
			distance: 'Distanța',
			category: 'Categoria',
			pricePaid: 'Prețul plătit',
			orderId: 'ID comandă',
			organizerValidation: 'Validarea organizatorului',
			validatedBy: 'Validat de',
			finalSteps: 'Pașii finali',
			step1: 'Înregistrarea ta este acum oficială',
			step2: 'Vei primi în curând instrucțiunile pre-cursă',
			step3: 'Pregătește-te pentru ziua cursei!',
			step4: 'Consultă site-ul evenimentului pentru mai multe detalii',
			viewEventButton: 'Vezi detaliile evenimentului',
			preparationTips: 'Sfaturi de pregătire',
			tip1: 'Verifică instrucțiunile de ridicare a numărului de concurs',
			tip2: 'Studiază traseul și punctele de aprovizionare',
			tip3: 'Pregătește-ți echipamentul și nutriția',
			helpText: 'Întrebări?',
			helpDescription: 'Echipa noastră de suport este aici să te ajute.',
			contactSupport: 'Contactează suportul',
			footer: 'O cursă excelentă!',
			teamSignature: 'Echipa Beswib',
			congratulations: 'Felicitări, este oficial! 🏃‍♂️',
		},
	},
}

export default function BeswibPurchaseApproval({
	buyerName = '',
	eventName = '',
	eventDate = '',
	eventLocation = '',
	bibPrice = 0,
	eventDistance = '',
	bibCategory = '',
	organizerName = '',
	orderId = '',
	locale = 'fr',
}: BeswibPurchaseApprovalProps) {
	const t = getTranslations(locale, constantsLocales)

	const getLocalizedText = (key: string) => {
		const keys = key.split('.')
		let value = t.purchaseApproval
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
							{buyerName ? ` ${buyerName}` : ''} 👋
						</Text>

						{/* Main Message */}
						<Text
							style={{ fontSize: '16px', color: 'hsl(var(--foreground))', lineHeight: '1.6', marginBottom: '24px' }}
						>
							{getLocalizedText('mainMessage')} <strong>{getLocalizedText('readyToRun')}</strong>
						</Text>

						{/* Validation Status */}
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
								✅ {getLocalizedText('validationDetails')}
							</Text>
							<Text style={{ fontSize: '14px', color: 'hsl(var(--success))', margin: '0' }}>
								<strong>{getLocalizedText('validatedBy')}:</strong> {organizerName || "Organisateur de l'événement"}
							</Text>
						</Section>

						{/* Purchase Details */}
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
								{getLocalizedText('purchaseDetails')}
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
									<strong>{getLocalizedText('pricePaid')}:</strong> {formatPrice(bibPrice)}
								</Text>
							)}
							{orderId && (
								<Text style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', margin: '4px 0' }}>
									<strong>{getLocalizedText('orderId')}:</strong> {orderId}
								</Text>
							)}
						</Section>

						{/* Final Steps */}
						<Section style={{ marginBottom: '24px' }}>
							<Heading
								style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--foreground))', marginBottom: '16px' }}
							>
								🏁 {getLocalizedText('finalSteps')}
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
								href={`${baseUrl}/events/${eventName?.toLowerCase().replace(/\s+/g, '-') || 'event'}`}
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
								{getLocalizedText('viewEventButton')}
							</Button>
						</Section>

						{/* Preparation Tips */}
						<Section
							style={{
								background: 'hsl(var(--info-foreground))',
								border: '1px solid hsl(var(--info))',
								padding: '20px',
								borderRadius: '8px',
								marginBottom: '24px',
							}}
						>
							<Heading style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--info))', margin: '0 0 16px 0' }}>
								🏃‍♂️ {getLocalizedText('preparationTips')}
							</Heading>

							<Text style={{ fontSize: '14px', color: 'hsl(var(--info))', margin: '8px 0', paddingLeft: '16px' }}>
								• {getLocalizedText('tip1')}
							</Text>
							<Text style={{ fontSize: '14px', color: 'hsl(var(--info))', margin: '8px 0', paddingLeft: '16px' }}>
								• {getLocalizedText('tip2')}
							</Text>
							<Text style={{ fontSize: '14px', color: 'hsl(var(--info))', margin: '8px 0', paddingLeft: '16px' }}>
								• {getLocalizedText('tip3')}
							</Text>
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
