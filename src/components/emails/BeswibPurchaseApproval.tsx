// import {
// 	Html,
// 	Head,
// 	Font,
// 	Preview,
// 	Body,
// 	Container,
// 	Section,
// 	Img,
// 	Heading,
// 	Text,
// 	Button,
// 	Hr,
// } from '@react-email/components'

// import { getTranslations } from '@/lib/i18n/dictionary'
// import constantsLocales from '@/constants/locales.json'

// interface BeswibPurchaseApprovalProps {
// 	buyerName?: string
// 	eventName?: string
// 	eventDate?: string
// 	eventLocation?: string
// 	bibPrice?: number
// 	eventDistance?: string
// 	bibCategory?: string
// 	organizerName?: string
// 	orderId?: string
// 	locale?: string
// }

// export default function BeswibPurchaseApproval({
// 	organizerName = '',
// 	orderId = '',
// 	locale = 'fr',
// 	eventName = '',
// 	eventLocation = '',
// 	eventDistance = '',
// 	eventDate = '',
// 	buyerName = '',
// 	bibPrice = 0,
// 	bibCategory = '',
// }: BeswibPurchaseApprovalProps) {
// 	const t = getTranslations(locale, constantsLocales)

// 	const formatPrice = (price: number) => `${price.toFixed(2)}€`
// 	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

// 	return (
// 		<Html lang={locale}>
// 			<Head>
// 				<Font fontFamily="Inter" fontWeight={400} fontStyle="normal" fallbackFontFamily="Arial" />
// 			</Head>
// 			<Preview>{t.emails.purchaseApproval.subject}</Preview>
// 			<Body style={{ fontFamily: 'Inter, Arial, sans-serif', backgroundColor: 'hsl(var(--background))' }}>
// 				<Container style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
// 					{/* Header */}
// 					<Section style={{ textAlign: 'center', marginBottom: '32px' }}>
// 						<Img src={`${baseUrl}/beswib-logo.png`} width="120" height="40" alt="Beswib" style={{ margin: '0 auto' }} />
// 					</Section>

// 					{/* Success Header */}
// 					<Section
// 						style={{
// 							textAlign: 'center',
// 							padding: '30px',
// 							borderRadius: '12px 12px 0 0',
// 							background: 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 71% 35%) 100%)',
// 						}}
// 					>
// 						<Text style={{ margin: '0', fontWeight: '700', fontSize: '24px', color: 'white' }}>
// 							🎉 {t.emails.purchaseApproval.subject.replace(' 🎉', '')}
// 						</Text>
// 					</Section>

// 					{/* Main Content */}
// 					<Section
// 						style={{
// 							padding: '30px',
// 							boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
// 							borderRadius: '0 0 12px 12px',
// 							border: '1px solid hsl(var(--border))',
// 							background: 'hsl(var(--card))',
// 						}}
// 					>
// 						{/* Greeting */}
// 						<Text style={{ marginBottom: '16px', fontSize: '16px', color: 'hsl(var(--foreground))' }}>
// 							{t.emails.purchaseApproval.greeting}
// 							{buyerName ? ` ${buyerName}` : ''} 👋
// 						</Text>

// 						{/* Main Message */}
// 						<Text
// 							style={{ marginBottom: '24px', lineHeight: '1.6', fontSize: '16px', color: 'hsl(var(--foreground))' }}
// 						>
// 							{t.emails.purchaseApproval.mainMessage} <strong>{t.emails.purchaseApproval.readyToRun}</strong>
// 						</Text>

// 						{/* Validation Status */}
// 						<Section
// 							style={{
// 								padding: '20px',
// 								marginBottom: '24px',
// 								borderRadius: '8px',
// 								border: '2px solid hsl(var(--success))',
// 								background: 'hsl(var(--success-foreground))',
// 							}}
// 						>
// 							<Text style={{ margin: '0 0 12px 0', fontWeight: '600', fontSize: '18px', color: 'hsl(var(--success))' }}>
// 								✅ {t.emails.purchaseApproval.validationDetails}
// 							</Text>
// 							<Text style={{ margin: '0', fontSize: '14px', color: 'hsl(var(--success))' }}>
// 								<strong>{t.emails.purchaseApproval.validatedBy}:</strong>{' '}
// 								{organizerName || "Organisateur de l'événement"}
// 							</Text>
// 						</Section>

// 						{/* Purchase Details */}
// 						<Section
// 							style={{
// 								padding: '20px',
// 								marginBottom: '24px',
// 								borderRadius: '8px',
// 								background: 'hsl(var(--muted))',
// 							}}
// 						>
// 							<Heading
// 								style={{ margin: '0 0 16px 0', fontWeight: '600', fontSize: '16px', color: 'hsl(var(--foreground))' }}
// 							>
// 								{t.emails.purchaseApproval.purchaseDetails}
// 							</Heading>

// 							{eventName && (
// 								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
// 									<strong>{t.emails.purchaseApproval.event}:</strong> {eventName}
// 								</Text>
// 							)}
// 							{eventDate && (
// 								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
// 									<strong>{t.emails.purchaseApproval.date}:</strong> {eventDate}
// 								</Text>
// 							)}
// 							{eventLocation && (
// 								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
// 									<strong>{t.emails.purchaseApproval.location}:</strong> {eventLocation}
// 								</Text>
// 							)}
// 							{eventDistance && (
// 								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
// 									<strong>{t.emails.purchaseApproval.distance}:</strong> {eventDistance}
// 								</Text>
// 							)}
// 							{bibCategory && (
// 								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
// 									<strong>{t.emails.purchaseApproval.category}:</strong> {bibCategory}
// 								</Text>
// 							)}
// 							{bibPrice > 0 && (
// 								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
// 									<strong>{t.emails.purchaseApproval.pricePaid}:</strong> {formatPrice(bibPrice)}
// 								</Text>
// 							)}
// 							{orderId && (
// 								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
// 									<strong>{t.emails.purchaseApproval.orderId}:</strong> {orderId}
// 								</Text>
// 							)}
// 						</Section>

// 						{/* Final Steps */}
// 						<Section style={{ marginBottom: '24px' }}>
// 							<Heading
// 								style={{ marginBottom: '16px', fontWeight: '600', fontSize: '16px', color: 'hsl(var(--foreground))' }}
// 							>
// 								🏁 {t.emails.purchaseApproval.finalSteps}
// 							</Heading>

// 							<Text
// 								style={{
// 									paddingLeft: '16px',
// 									margin: '8px 0',
// 									fontSize: '14px',
// 									color: 'hsl(var(--muted-foreground))',
// 								}}
// 							>
// 								• {t.emails.purchaseApproval.step1}
// 							</Text>
// 							<Text
// 								style={{
// 									paddingLeft: '16px',
// 									margin: '8px 0',
// 									fontSize: '14px',
// 									color: 'hsl(var(--muted-foreground))',
// 								}}
// 							>
// 								• {t.emails.purchaseApproval.step2}
// 							</Text>
// 							<Text
// 								style={{
// 									paddingLeft: '16px',
// 									margin: '8px 0',
// 									fontSize: '14px',
// 									color: 'hsl(var(--muted-foreground))',
// 								}}
// 							>
// 								• {t.emails.purchaseApproval.step3}
// 							</Text>
// 							<Text
// 								style={{
// 									paddingLeft: '16px',
// 									margin: '8px 0',
// 									fontSize: '14px',
// 									color: 'hsl(var(--muted-foreground))',
// 								}}
// 							>
// 								• {t.emails.purchaseApproval.step4}
// 							</Text>
// 						</Section>

// 						{/* Action Button */}
// 						<Section style={{ textAlign: 'center', margin: '32px 0' }}>
// 							<Button
// 								href={`${baseUrl}/events/${eventName?.toLowerCase().replace(/\s+/g, '-') || 'event'}`}
// 								style={{
// 									textDecoration: 'none',
// 									padding: '12px 24px',
// 									fontWeight: '600',
// 									fontSize: '16px',
// 									display: 'inline-block',
// 									color: 'white',
// 									borderRadius: '6px',
// 									background: 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 71% 35%) 100%)',
// 								}}
// 							>
// 								{t.emails.purchaseApproval.viewEventButton}
// 							</Button>
// 						</Section>

// 						{/* Preparation Tips */}
// 						<Section
// 							style={{
// 								padding: '20px',
// 								marginBottom: '24px',
// 								borderRadius: '8px',
// 								border: '1px solid hsl(var(--info))',
// 								background: 'hsl(var(--info-foreground))',
// 							}}
// 						>
// 							<Heading style={{ margin: '0 0 16px 0', fontWeight: '600', fontSize: '16px', color: 'hsl(var(--info))' }}>
// 								🏃‍♂️ {t.emails.purchaseApproval.preparationTips}
// 							</Heading>

// 							<Text style={{ paddingLeft: '16px', margin: '8px 0', fontSize: '14px', color: 'hsl(var(--info))' }}>
// 								• {t.emails.purchaseApproval.tip1}
// 							</Text>
// 							<Text style={{ paddingLeft: '16px', margin: '8px 0', fontSize: '14px', color: 'hsl(var(--info))' }}>
// 								• {t.emails.purchaseApproval.tip2}
// 							</Text>
// 							<Text style={{ paddingLeft: '16px', margin: '8px 0', fontSize: '14px', color: 'hsl(var(--info))' }}>
// 								• {t.emails.purchaseApproval.tip3}
// 							</Text>
// 						</Section>

// 						{/* Congratulations Message */}
// 						<Section
// 							style={{
// 								textAlign: 'center',
// 								padding: '16px',
// 								marginBottom: '24px',
// 								borderRadius: '6px',
// 								border: '1px solid hsl(var(--primary))',
// 								background: 'hsl(var(--primary-foreground))',
// 							}}
// 						>
// 							<Text style={{ margin: '0', fontWeight: '500', fontSize: '14px', color: 'hsl(var(--primary))' }}>
// 								🌟 {t.emails.purchaseApproval.congratulations}
// 							</Text>
// 						</Section>

// 						<Hr style={{ margin: '24px 0', borderColor: 'hsl(var(--border))' }} />

// 						{/* Help Section */}
// 						<Section style={{ textAlign: 'center', marginBottom: '24px' }}>
// 							<Text style={{ marginBottom: '8px', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
// 								<strong>{t.emails.purchaseApproval.helpText}</strong>
// 							</Text>
// 							<Text style={{ marginBottom: '16px', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
// 								{t.emails.purchaseApproval.helpDescription}
// 							</Text>
// 							<Button
// 								href={`${baseUrl}/contact`}
// 								style={{
// 									textDecoration: 'underline',
// 									fontSize: '14px',
// 									color: 'hsl(var(--primary))',
// 									border: 'none',
// 									background: 'transparent',
// 								}}
// 							>
// 								{t.emails.purchaseApproval.contactSupport}
// 							</Button>
// 						</Section>

// 						{/* Footer */}
// 						<Section style={{ textAlign: 'center' }}>
// 							<Text style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'hsl(var(--foreground))' }}>
// 								{t.emails.purchaseApproval.footer}
// 							</Text>
// 							<Text style={{ margin: '0', fontWeight: '600', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
// 								{t.emails.purchaseApproval.teamSignature}
// 							</Text>
// 						</Section>
// 					</Section>
// 				</Container>
// 			</Body>
// 		</Html>
// 	)
// }
