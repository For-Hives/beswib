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
import constantsLocales from '@/constants/locales.json'

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

export default function BeswibBibApproval({
	sellerName = '',
	organizerName = '',
	locale = 'fr',
	eventName = '',
	eventLocation = '',
	eventDistance = '',
	eventDate = '',
	bibPrice = 0,
	bibCategory = '',
}: BeswibBibApprovalProps) {
	const t = getTranslations(locale, constantsLocales)

	// Plus besoin de fonction helper, on utilise directement t.emails.bibApproval comme HeroAlternative !

	const formatPrice = (price: number) => `${price.toFixed(2)}€`
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

	return (
		<Html lang={locale}>
			<Head>
				<Font fontFamily="Inter" fontWeight={400} fontStyle="normal" fallbackFontFamily="Arial" />
			</Head>
			<Preview>{t.emails.bibApproval.subject}</Preview>
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
							🎉 {t.emails.bibApproval.subject.replace(' 🎉', '')}
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
							{t.emails.bibApproval.greeting}
							{sellerName ? ` ${sellerName}` : ''} 👋
						</Text>

						{/* Main Message */}
						<Text
							style={{ marginBottom: '24px', lineHeight: '1.6', fontSize: '16px', color: 'hsl(var(--foreground))' }}
						>
							{t.emails.bibApproval.mainMessage} <strong>{t.emails.bibApproval.canNowSell}</strong>
						</Text>

						{/* Approval Status */}
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
								✅ {t.emails.bibApproval.approvalDetails}
							</Text>
							<Text style={{ margin: '0', fontSize: '14px', color: 'hsl(var(--success))' }}>
								<strong>{t.emails.bibApproval.approvedBy}:</strong> {organizerName || "Organisateur de l'événement"}
							</Text>
						</Section>

						{/* Bib Details */}
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
								{t.emails.bibApproval.bibDetails}
							</Heading>

							{eventName && (
								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
									<strong>{t.emails.bibApproval.event}:</strong> {eventName}
								</Text>
							)}
							{eventDate && (
								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
									<strong>{t.emails.bibApproval.date}:</strong> {eventDate}
								</Text>
							)}
							{eventLocation && (
								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
									<strong>{t.emails.bibApproval.location}:</strong> {eventLocation}
								</Text>
							)}
							{eventDistance && (
								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
									<strong>{t.emails.bibApproval.distance}:</strong> {eventDistance}
								</Text>
							)}
							{bibCategory && (
								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
									<strong>{t.emails.bibApproval.category}:</strong> {bibCategory}
								</Text>
							)}
							{bibPrice > 0 && (
								<Text style={{ margin: '4px 0', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
									<strong>{t.emails.bibApproval.price}:</strong> {formatPrice(bibPrice)}
								</Text>
							)}
						</Section>

						{/* Next Steps */}
						<Section style={{ marginBottom: '24px' }}>
							<Heading
								style={{ marginBottom: '16px', fontWeight: '600', fontSize: '16px', color: 'hsl(var(--foreground))' }}
							>
								🚀 {t.emails.bibApproval.nextSteps}
							</Heading>

							<Text
								style={{
									paddingLeft: '16px',
									margin: '8px 0',
									fontSize: '14px',
									color: 'hsl(var(--muted-foreground))',
								}}
							>
								• {t.emails.bibApproval.step1}
							</Text>
							<Text
								style={{
									paddingLeft: '16px',
									margin: '8px 0',
									fontSize: '14px',
									color: 'hsl(var(--muted-foreground))',
								}}
							>
								• {t.emails.bibApproval.step2}
							</Text>
							<Text
								style={{
									paddingLeft: '16px',
									margin: '8px 0',
									fontSize: '14px',
									color: 'hsl(var(--muted-foreground))',
								}}
							>
								• {t.emails.bibApproval.step3}
							</Text>
							<Text
								style={{
									paddingLeft: '16px',
									margin: '8px 0',
									fontSize: '14px',
									color: 'hsl(var(--muted-foreground))',
								}}
							>
								• {t.emails.bibApproval.step4}
							</Text>
						</Section>

						{/* Action Button */}
						<Section style={{ textAlign: 'center', margin: '32px 0' }}>
							<Button
								href={`${baseUrl}/dashboard/my-bibs`}
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
								{t.emails.bibApproval.sellNowButton}
							</Button>
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
								🌟 {t.emails.bibApproval.congratulations}
							</Text>
						</Section>

						<Hr style={{ margin: '24px 0', borderColor: 'hsl(var(--border))' }} />

						{/* Help Section */}
						<Section style={{ textAlign: 'center', marginBottom: '24px' }}>
							<Text style={{ marginBottom: '8px', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
								<strong>{t.emails.bibApproval.helpText}</strong>
							</Text>
							<Text style={{ marginBottom: '16px', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
								{t.emails.bibApproval.helpDescription}
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
								{t.emails.bibApproval.contactSupport}
							</Button>
						</Section>

						{/* Footer */}
						<Section style={{ textAlign: 'center' }}>
							<Text style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'hsl(var(--foreground))' }}>
								{t.emails.bibApproval.footer}
							</Text>
							<Text style={{ margin: '0', fontWeight: '600', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
								{t.emails.bibApproval.teamSignature}
							</Text>
						</Section>
					</Section>
				</Container>
			</Body>
		</Html>
	)
}
