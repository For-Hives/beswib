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
	ro: {
		purchaseApproval: {
			viewEventButton: 'Vezi detaliile evenimentului',
			validationDetails: 'Validarea oficială',
			validatedBy: 'Validat de',
			tip3: 'Pregătește-ți echipamentul și nutriția',
			tip2: 'Studiază traseul și punctele de aprovizionare',
			tip1: 'Verifică instrucțiunile de ridicare a numărului de concurs',
			teamSignature: 'Echipa Beswib',
			subject: 'Totul este gata! Achiziția ta a fost validată 🎉',
			step4: 'Consultă site-ul evenimentului pentru mai multe detalii',
			step3: 'Pregătește-te pentru ziua cursei!',
			step2: 'Vei primi în curând instrucțiunile pre-cursă',
			step1: 'Înregistrarea ta este acum oficială',
			readyToRun: 'Ești oficial înregistrat/ă și gata/ă să alergi!',
			purchaseDetails: 'Detaliile achiziției tale',
			pricePaid: 'Prețul plătit',
			preparationTips: 'Sfaturi de pregătire',
			organizerValidation: 'Validarea organizatorului',
			orderId: 'ID comandă',
			mainMessage: 'Vești excelente! Organizatorul a validat schimbarea de proprietate a numărului tău de concurs.',
			location: 'Locația',
			helpText: 'Întrebări?',
			helpDescription: 'Echipa noastră de suport este aici să te ajute.',
			greeting: 'Bună ziua',
			footer: 'O cursă excelentă!',
			finalSteps: 'Pașii finali',
			event: 'Eveniment',
			distance: 'Distanța',
			date: 'Data',
			contactSupport: 'Contactează suportul',
			congratulations: 'Felicitări, este oficial! 🏃‍♂️',
			category: 'Categoria',
		},
	},
	pt: {
		purchaseApproval: {
			viewEventButton: 'Ver detalhes do evento',
			validationDetails: 'Validação oficial',
			validatedBy: 'Validado por',
			tip3: 'Prepare o seu equipamento e nutrição',
			tip2: 'Reveja o percurso e os postos de abastecimento',
			tip1: 'Verifique as instruções de levantamento do dorsal',
			teamSignature: 'A equipa Beswib',
			subject: 'Tudo pronto! A sua compra foi validada 🎉',
			step4: 'Consulte o site do evento para mais detalhes',
			step3: 'Prepare-se para o dia da prova!',
			step2: 'Em breve receberá as suas instruções pré-prova',
			step1: 'A sua inscrição é agora oficial',
			readyToRun: 'Está oficialmente inscrito/a e pronto/a para correr!',
			purchaseDetails: 'Detalhes da sua compra',
			pricePaid: 'Preço pago',
			preparationTips: 'Dicas de preparação',
			organizerValidation: 'Validação do organizador',
			orderId: 'ID do pedido',
			mainMessage: 'Excelente notícia! O organizador validou a mudança de propriedade do seu dorsal.',
			location: 'Local',
			helpText: 'Dúvidas?',
			helpDescription: 'A nossa equipa de suporte está aqui para o ajudar.',
			greeting: 'Olá',
			footer: 'Excelente corrida!',
			finalSteps: 'Passos finais',
			event: 'Evento',
			distance: 'Distância',
			date: 'Data',
			contactSupport: 'Contactar suporte',
			congratulations: 'Parabéns, é oficial! 🏃‍♂️',
			category: 'Categoria',
		},
	},
	nl: {
		purchaseApproval: {
			viewEventButton: 'Bekijk evenement details',
			validationDetails: 'Officiële validatie',
			validatedBy: 'Gevalideerd door',
			tip3: 'Bereid uw uitrusting en voeding voor',
			tip2: 'Bekijk het parcours en verzorgingsposten',
			tip1: 'Controleer de startnummer ophaalinstructies',
			teamSignature: 'Het Beswib Team',
			subject: 'Alles klaar! Uw aankoop is gevalideerd 🎉',
			step4: 'Bekijk de evenement website voor meer details',
			step3: 'Bereid u voor op de racedag!',
			step2: 'U ontvangt binnenkort uw pre-race instructies',
			step1: 'Uw registratie is nu officieel',
			readyToRun: 'U bent officieel geregistreerd en klaar om te lopen!',
			purchaseDetails: 'Uw aankoop details',
			pricePaid: 'Betaalde prijs',
			preparationTips: 'Voorbereidingstips',
			organizerValidation: 'Organisator validatie',
			orderId: 'Bestelnummer',
			mainMessage: 'Geweldig nieuws! De organisator heeft de eigendomsoverdracht van uw startnummer gevalideerd.',
			location: 'Locatie',
			helpText: 'Vragen?',
			helpDescription: 'Ons support team staat klaar om u te helpen.',
			greeting: 'Hallo',
			footer: 'Veel succes met de race!',
			finalSteps: 'Laatste stappen',
			event: 'Evenement',
			distance: 'Afstand',
			date: 'Datum',
			contactSupport: 'Contact opnemen met support',
			congratulations: 'Gefeliciteerd, het is officieel! 🏃‍♂️',
			category: 'Categorie',
		},
	},
	ko: {
		purchaseApproval: {
			viewEventButton: '이벤트 세부사항 보기',
			validationDetails: '공식 확인',
			validatedBy: '확인자',
			tip3: '장비와 영양 섭취를 준비하세요',
			tip2: '코스와 급수대를 검토하세요',
			tip1: '레이스 번호 수령 지침을 확인하세요',
			teamSignature: 'Beswib 팀',
			subject: '모든 준비 완료! 구매가 확인되었습니다 🎉',
			step4: '더 자세한 내용은 이벤트 웹사이트를 확인하세요',
			step3: '레이스 데이를 준비하세요!',
			step2: '곧 레이스 전 지침을 받게 됩니다',
			step1: '귀하의 등록이 이제 공식적입니다',
			readyToRun: '공식적으로 등록되어 달릴 준비가 되었습니다!',
			purchaseDetails: '구매 세부사항',
			pricePaid: '지불 금액',
			preparationTips: '준비 팁',
			organizerValidation: '주최자 확인',
			orderId: '주문 번호',
			mainMessage: '좋은 소식입니다! 주최자가 레이스 번호의 소유권 변경을 확인했습니다.',
			location: '장소',
			helpText: '궁금한 점이 있나요?',
			helpDescription: '저희 지원팀이 도와드리겠습니다.',
			greeting: '안녕하세요',
			footer: '훌륭한 레이스 되세요!',
			finalSteps: '최종 단계',
			event: '이벤트',
			distance: '거리',
			date: '날짜',
			contactSupport: '지원팀 문의',
			congratulations: '축하합니다, 공식적입니다! 🏃‍♂️',
			category: '카테고리',
		},
	},
	it: {
		purchaseApproval: {
			viewEventButton: 'Visualizza dettagli evento',
			validationDetails: 'Validazione ufficiale',
			validatedBy: 'Validato da',
			tip3: 'Prepara la tua attrezzatura e nutrizione',
			tip2: 'Esamina il percorso e i punti di ristoro',
			tip1: 'Verifica le istruzioni per il ritiro del pettorale',
			teamSignature: 'Il team Beswib',
			subject: 'Tutto a posto! Il tuo acquisto è stato validato 🎉',
			step4: "Consulta il sito dell'evento per maggiori dettagli",
			step3: 'Preparati per il giorno della gara!',
			step2: 'Riceverai presto le tue istruzioni pre-gara',
			step1: 'La tua iscrizione è ora ufficiale',
			readyToRun: 'Sei ufficialmente iscritto/a e pronto/a a correre!',
			purchaseDetails: 'Dettagli del tuo acquisto',
			pricePaid: 'Prezzo pagato',
			preparationTips: 'Consigli per la preparazione',
			organizerValidation: 'Validazione organizzatore',
			orderId: 'ID ordine',
			mainMessage: "Ottima notizia! L'organizzatore ha validato il cambio di proprietà del tuo pettorale.",
			location: 'Luogo',
			helpText: 'Domande?',
			helpDescription: 'Il nostro team di supporto è qui per aiutarti.',
			greeting: 'Ciao',
			footer: 'Buona gara!',
			finalSteps: 'Passi finali',
			event: 'Evento',
			distance: 'Distanza',
			date: 'Data',
			contactSupport: 'Contatta il supporto',
			congratulations: 'Congratulazioni, è ufficiale! 🏃‍♂️',
			category: 'Categoria',
		},
	},
	fr: {
		purchaseApproval: {
			viewEventButton: "Voir les détails de l'événement",
			validationDetails: 'Validation officielle',
			validatedBy: 'Validé par',
			tip3: 'Préparez votre matériel et votre nutrition',
			tip2: 'Consultez le parcours et les points de ravitaillement',
			tip1: 'Vérifiez les consignes de retrait de dossard',
			teamSignature: "L'équipe Beswib",
			subject: 'Tout est en ordre ! Votre achat a été validé 🎉',
			step4: "Consultez le site de l'événement pour plus de détails",
			step3: 'Préparez-vous pour le jour J !',
			step2: 'Vous recevrez bientôt vos instructions pré-course',
			step1: 'Votre inscription est maintenant officielle',
			readyToRun: 'Vous êtes officiellement inscrit(e) et prêt(e) à courir !',
			purchaseDetails: 'Détails de votre achat',
			pricePaid: 'Prix payé',
			preparationTips: 'Conseils de préparation',
			organizerValidation: 'Validation organisateur',
			orderId: 'Numéro de commande',
			mainMessage: "Excellente nouvelle ! L'organisateur a validé le changement de propriétaire de votre dossard.",
			location: 'Lieu',
			helpText: 'Des questions ?',
			helpDescription: 'Notre équipe de support est là pour vous aider.',
			greeting: 'Bonjour',
			footer: 'Excellente course !',
			finalSteps: 'Étapes finales',
			event: 'Événement',
			distance: 'Distance',
			date: 'Date',
			contactSupport: 'Contacter le support',
			congratulations: "Félicitations, c'est officiel ! 🏃‍♂️",
			category: 'Catégorie',
		},
	},
	es: {
		purchaseApproval: {
			viewEventButton: 'Ver detalles del evento',
			validationDetails: 'Validación oficial',
			validatedBy: 'Validado por',
			tip3: 'Prepara tu equipo y nutrición',
			tip2: 'Revisa el recorrido y los puntos de avituallamiento',
			tip1: 'Verifica las instrucciones de recogida del dorsal',
			teamSignature: 'El equipo Beswib',
			subject: '¡Todo listo! Tu compra ha sido validada 🎉',
			step4: 'Consulta el sitio web del evento para más detalles',
			step3: '¡Prepárate para el día de la carrera!',
			step2: 'Pronto recibirás tus instrucciones pre-carrera',
			step1: 'Tu inscripción es ahora oficial',
			readyToRun: '¡Estás oficialmente inscrito/a y listo/a para correr!',
			purchaseDetails: 'Detalles de tu compra',
			pricePaid: 'Precio pagado',
			preparationTips: 'Consejos de preparación',
			organizerValidation: 'Validación del organizador',
			orderId: 'ID de pedido',
			mainMessage: '¡Excelente noticia! El organizador ha validado el cambio de propietario de tu dorsal.',
			location: 'Ubicación',
			helpText: '¿Preguntas?',
			helpDescription: 'Nuestro equipo de soporte está aquí para ayudarte.',
			greeting: 'Hola',
			footer: '¡Que tengas una gran carrera!',
			finalSteps: 'Pasos finales',
			event: 'Evento',
			distance: 'Distancia',
			date: 'Fecha',
			contactSupport: 'Contactar soporte',
			congratulations: '¡Felicidades, es oficial! 🏃‍♂️',
			category: 'Categoría',
		},
	},
	en: {
		purchaseApproval: {
			viewEventButton: 'View event details',
			validationDetails: 'Official validation',
			validatedBy: 'Validated by',
			tip3: 'Prepare your gear and nutrition',
			tip2: 'Review the course and aid stations',
			tip1: 'Check the bib pickup instructions',
			teamSignature: 'The Beswib Team',
			subject: 'All set! Your purchase has been validated 🎉',
			step4: 'Check the event website for more details',
			step3: 'Get ready for race day!',
			step2: 'You will soon receive your pre-race instructions',
			step1: 'Your registration is now official',
			readyToRun: 'You are officially registered and ready to run!',
			purchaseDetails: 'Your purchase details',
			pricePaid: 'Price paid',
			preparationTips: 'Preparation tips',
			organizerValidation: 'Organizer validation',
			orderId: 'Order ID',
			mainMessage: 'Great news! The organizer has validated the ownership change of your bib.',
			location: 'Location',
			helpText: 'Questions?',
			helpDescription: 'Our support team is here to help you.',
			greeting: 'Hello',
			footer: 'Have a great race!',
			finalSteps: 'Final steps',
			event: 'Event',
			distance: 'Distance',
			date: 'Date',
			contactSupport: 'Contact support',
			congratulations: "Congratulations, it's official! 🏃‍♂️",
			category: 'Category',
		},
	},
	de: {
		purchaseApproval: {
			viewEventButton: 'Event-Details ansehen',
			validationDetails: 'Offizielle Validierung',
			validatedBy: 'Validiert von',
			tip3: 'Bereiten Sie Ihre Ausrüstung und Ernährung vor',
			tip2: 'Überprüfen Sie die Strecke und Verpflegungsstationen',
			tip1: 'Überprüfen Sie die Startnummern-Abholanweisungen',
			teamSignature: 'Das Beswib Team',
			subject: 'Alles bereit! Ihr Kauf wurde validiert 🎉',
			step4: 'Besuchen Sie die Event-Website für weitere Details',
			step3: 'Bereiten Sie sich auf den Wettkampftag vor!',
			step2: 'Sie erhalten bald Ihre Vorwettkampf-Anweisungen',
			step1: 'Ihre Anmeldung ist jetzt offiziell',
			readyToRun: 'Sie sind offiziell registriert und bereit zu laufen!',
			purchaseDetails: 'Ihre Kaufdetails',
			pricePaid: 'Bezahlter Preis',
			preparationTips: 'Vorbereitungstipps',
			organizerValidation: 'Veranstalter-Validierung',
			orderId: 'Bestellnummer',
			mainMessage: 'Großartige Neuigkeiten! Der Veranstalter hat den Eigentümerwechsel Ihrer Startnummer validiert.',
			location: 'Ort',
			helpText: 'Fragen?',
			helpDescription: 'Unser Support-Team ist da, um Ihnen zu helfen.',
			greeting: 'Hallo',
			footer: 'Einen großartigen Lauf!',
			finalSteps: 'Finale Schritte',
			event: 'Veranstaltung',
			distance: 'Distanz',
			date: 'Datum',
			contactSupport: 'Support kontaktieren',
			congratulations: 'Herzlichen Glückwunsch, es ist offiziell! 🏃‍♂️',
			category: 'Kategorie',
		},
	},
}

export default function BeswibPurchaseApproval({
	organizerName = '',
	orderId = '',
	locale = 'fr',
	eventName = '',
	eventLocation = '',
	eventDistance = '',
	eventDate = '',
	buyerName = '',
	bibPrice = 0,
	bibCategory = '',
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
			<Body style={{ fontFamily: 'Inter, Arial, sans-serif', backgroundColor: 'hsl(var(--background))' }}>
				<Container style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
					{/* Header */}
					<Section style={{ textAlign: 'center', marginBottom: '32px' }}>
						<Img src={`${baseUrl}/beswib-logo.png`} width="120" height="40" alt="Beswib" style={{ margin: '0 auto' }} />
					</Section>

					{/* Success Header */}
					<Section
						style={{
							textAlign: 'center',
							padding: '30px',
							borderRadius: '12px 12px 0 0',
							background: 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 71% 35%) 100%)',
						}}
					>
						<Text style={{ margin: '0', fontWeight: '700', fontSize: '24px', color: 'white' }}>
							🎉 {getLocalizedText('subject').replace(' 🎉', '')}
						</Text>
					</Section>

					{/* Main Content */}
					<Section
						style={{
							padding: '30px',
							boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
							borderRadius: '0 0 12px 12px',
							border: '1px solid hsl(var(--border))',
							background: 'hsl(var(--card))',
						}}
					>
						{/* Greeting */}
						<Text style={{ marginBottom: '16px', fontSize: '16px', color: 'hsl(var(--foreground))' }}>
							{getLocalizedText('greeting')}
							{buyerName ? ` ${buyerName}` : ''} 👋
						</Text>

						{/* Main Message */}
						<Text
							style={{ marginBottom: '24px', lineHeight: '1.6', fontSize: '16px', color: 'hsl(var(--foreground))' }}
						>
							{getLocalizedText('mainMessage')} <strong>{getLocalizedText('readyToRun')}</strong>
						</Text>

						{/* Validation Status */}
						<Section
							style={{
								padding: '20px',
								marginBottom: '24px',
								borderRadius: '8px',
								border: '2px solid hsl(var(--success))',
								background: 'hsl(var(--success-foreground))',
							}}
						>
							<Text style={{ margin: '0 0 12px 0', fontWeight: '600', fontSize: '18px', color: 'hsl(var(--success))' }}>
								✅ {getLocalizedText('validationDetails')}
							</Text>
							<Text style={{ margin: '0', fontSize: '14px', color: 'hsl(var(--success))' }}>
								<strong>{getLocalizedText('validatedBy')}:</strong> {organizerName || "Organisateur de l'événement"}
							</Text>
						</Section>

						{/* Purchase Details */}
						<Section
							style={{
								padding: '20px',
								marginBottom: '24px',
								borderRadius: '8px',
								background: 'hsl(var(--muted))',
							}}
						>
							<Heading
								style={{ margin: '0 0 16px 0', fontWeight: '600', fontSize: '16px', color: 'hsl(var(--foreground))' }}
							>
								{getLocalizedText('purchaseDetails')}
							</Heading>

							{eventName && (
								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
									<strong>{getLocalizedText('event')}:</strong> {eventName}
								</Text>
							)}
							{eventDate && (
								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
									<strong>{getLocalizedText('date')}:</strong> {eventDate}
								</Text>
							)}
							{eventLocation && (
								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
									<strong>{getLocalizedText('location')}:</strong> {eventLocation}
								</Text>
							)}
							{eventDistance && (
								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
									<strong>{getLocalizedText('distance')}:</strong> {eventDistance}
								</Text>
							)}
							{bibCategory && (
								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
									<strong>{getLocalizedText('category')}:</strong> {bibCategory}
								</Text>
							)}
							{bibPrice > 0 && (
								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
									<strong>{getLocalizedText('pricePaid')}:</strong> {formatPrice(bibPrice)}
								</Text>
							)}
							{orderId && (
								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
									<strong>{getLocalizedText('orderId')}:</strong> {orderId}
								</Text>
							)}
						</Section>

						{/* Final Steps */}
						<Section style={{ marginBottom: '24px' }}>
							<Heading
								style={{ marginBottom: '16px', fontWeight: '600', fontSize: '16px', color: 'hsl(var(--foreground))' }}
							>
								🏁 {getLocalizedText('finalSteps')}
							</Heading>

							<Text
								style={{
									paddingLeft: '16px',
									margin: '8px 0',
									fontSize: '14px',
									color: 'hsl(var(--muted-foreground))',
								}}
							>
								• {getLocalizedText('step1')}
							</Text>
							<Text
								style={{
									paddingLeft: '16px',
									margin: '8px 0',
									fontSize: '14px',
									color: 'hsl(var(--muted-foreground))',
								}}
							>
								• {getLocalizedText('step2')}
							</Text>
							<Text
								style={{
									paddingLeft: '16px',
									margin: '8px 0',
									fontSize: '14px',
									color: 'hsl(var(--muted-foreground))',
								}}
							>
								• {getLocalizedText('step3')}
							</Text>
							<Text
								style={{
									paddingLeft: '16px',
									margin: '8px 0',
									fontSize: '14px',
									color: 'hsl(var(--muted-foreground))',
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
									textDecoration: 'none',
									padding: '12px 24px',
									fontWeight: '600',
									fontSize: '16px',
									display: 'inline-block',
									color: 'white',
									borderRadius: '6px',
									background: 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 71% 35%) 100%)',
								}}
							>
								{getLocalizedText('viewEventButton')}
							</Button>
						</Section>

						{/* Preparation Tips */}
						<Section
							style={{
								padding: '20px',
								marginBottom: '24px',
								borderRadius: '8px',
								border: '1px solid hsl(var(--info))',
								background: 'hsl(var(--info-foreground))',
							}}
						>
							<Heading style={{ margin: '0 0 16px 0', fontWeight: '600', fontSize: '16px', color: 'hsl(var(--info))' }}>
								🏃‍♂️ {getLocalizedText('preparationTips')}
							</Heading>

							<Text style={{ paddingLeft: '16px', margin: '8px 0', fontSize: '14px', color: 'hsl(var(--info))' }}>
								• {getLocalizedText('tip1')}
							</Text>
							<Text style={{ paddingLeft: '16px', margin: '8px 0', fontSize: '14px', color: 'hsl(var(--info))' }}>
								• {getLocalizedText('tip2')}
							</Text>
							<Text style={{ paddingLeft: '16px', margin: '8px 0', fontSize: '14px', color: 'hsl(var(--info))' }}>
								• {getLocalizedText('tip3')}
							</Text>
						</Section>

						{/* Congratulations Message */}
						<Section
							style={{
								textAlign: 'center',
								padding: '16px',
								marginBottom: '24px',
								borderRadius: '6px',
								border: '1px solid hsl(var(--primary))',
								background: 'hsl(var(--primary-foreground))',
							}}
						>
							<Text style={{ margin: '0', fontWeight: '500', fontSize: '14px', color: 'hsl(var(--primary))' }}>
								🌟 {getLocalizedText('congratulations')}
							</Text>
						</Section>

						<Hr style={{ margin: '24px 0', borderColor: 'hsl(var(--border))' }} />

						{/* Help Section */}
						<Section style={{ textAlign: 'center', marginBottom: '24px' }}>
							<Text style={{ marginBottom: '8px', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
								<strong>{getLocalizedText('helpText')}</strong>
							</Text>
							<Text style={{ marginBottom: '16px', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
								{getLocalizedText('helpDescription')}
							</Text>
							<Button
								href={`${baseUrl}/contact`}
								style={{
									textDecoration: 'underline',
									fontSize: '14px',
									color: 'hsl(var(--primary))',
									border: 'none',
									background: 'transparent',
								}}
							>
								{getLocalizedText('contactSupport')}
							</Button>
						</Section>

						{/* Footer */}
						<Section style={{ textAlign: 'center' }}>
							<Text style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'hsl(var(--foreground))' }}>
								{getLocalizedText('footer')}
							</Text>
							<Text style={{ margin: '0', fontWeight: '600', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
								{getLocalizedText('teamSignature')}
							</Text>
						</Section>
					</Section>
				</Container>
			</Body>
		</Html>
	)
}
