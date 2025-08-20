'use server'

import { render } from '@react-email/components'

import { Resend } from 'resend'

import { BeswibEmailVerification, BeswibWelcomeEmail } from '@/components/emails'
import BeswibSaleConfirmation from '@/components/emails/BeswibSaleConfirmation'
import BeswibPurchaseConfirmation from '@/components/emails/BeswibPurchaseConfirmation'
import BeswibSaleAlert from '@/components/emails/BeswibSaleAlert'
import BeswibWaitlistAlert from '@/components/emails/BeswibWaitlistAlert'
import BeswibBibApproval from '@/components/emails/BeswibBibApproval'
import BeswibPurchaseApproval from '@/components/emails/BeswibPurchaseApproval'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailParams {
	to: string | string[]
	subject: string
	react?: React.ReactElement
	html?: string
	text?: string
	from?: string
}

/**
 * Sends an email using Resend with React Email components
 */
async function sendEmail({ to, text, subject, react, html, from }: SendEmailParams): Promise<boolean> {
	try {
		const fromEmail = from ?? process.env.NOTIFY_EMAIL_FROM ?? 'noreply@beswib.com'

		let emailData: any = {
			to,
			subject,
			from: fromEmail,
		}

		if (react) {
			emailData.react = react
		} else if (html) {
			emailData.html = html
			emailData.text = text || stripHtml(html)
		} else {
			throw new Error('Either react component or html content must be provided')
		}

		const { error, data } = await resend.emails.send(emailData)

		if (error) {
			console.error('Email sending error:', error)
			return false
		}

		console.log('Email sent successfully:', data?.id)
		return true
	} catch (error) {
		console.error('Email service error:', error)
		return false
	}
}

/**
 * Sends a verification email using the React Email template
 */
export async function sendVerificationEmail(
	email: string,
	verificationCode: string,
	locale: string = 'fr'
): Promise<boolean> {
	const subject =
		locale === 'fr' ? '🔐 Confirmez votre adresse email - Beswib' : '🔐 Verify your email address - Beswib'

	return sendEmail({
		to: email,
		subject,
		react: <BeswibEmailVerification validationCode={verificationCode} locale={locale} />,
	})
}

/**
 * Sends a welcome email using the React Email template
 */
export async function sendWelcomeEmail(email: string, firstName?: string, locale: string = 'fr'): Promise<boolean> {
	const subject =
		locale === 'fr'
			? `Bienvenue sur Beswib${firstName ? `, ${firstName}` : ''} ! 🏃‍♂️`
			: `Welcome to Beswib${firstName ? `, ${firstName}` : ''} ! 🏃‍♂️`

	return sendEmail({
		to: email,
		subject,
		react: <BeswibWelcomeEmail firstName={firstName} locale={locale} />,
	})
}

interface SaleConfirmationParams {
	sellerEmail: string
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

/**
 * Sends a sale confirmation email to the seller using the React Email template
 */
export async function sendSaleConfirmationEmail({
	sellerEmail,
	sellerName,
	buyerName,
	eventName,
	bibPrice,
	platformFee,
	totalReceived,
	orderId,
	eventDate,
	eventLocation,
	locale = 'fr'
}: SaleConfirmationParams): Promise<boolean> {
	const getLocalizedSubject = (locale: string) => {
		switch (locale) {
			case 'en': return 'Congratulations! Your bib has been sold 💰'
			case 'es': return '¡Felicidades! Tu dorsal ha sido vendido 💰'
			case 'it': return 'Congratulazioni! Il tuo pettorale è stato venduto 💰'
			case 'de': return 'Glückwunsch! Ihre Startnummer wurde verkauft 💰'
			case 'pt': return 'Parabéns! O seu dorsal foi vendido 💰'
			case 'nl': return 'Gefeliciteerd! Uw startnummer is verkocht 💰'
			case 'ko': return '축하합니다! 레이스 번호가 판매되었습니다 💰'
			case 'ro': return 'Felicitări! Numărul tău de concurs a fost vândut 💰'
			default: return 'Félicitations ! Votre dossard a été vendu 💰'
		}
	}

	return sendEmail({
		to: sellerEmail,
		subject: getLocalizedSubject(locale),
		react: <BeswibSaleConfirmation 
			sellerName={sellerName}
			buyerName={buyerName}
			eventName={eventName}
			bibPrice={bibPrice}
			platformFee={platformFee}
			totalReceived={totalReceived}
			orderId={orderId}
			eventDate={eventDate}
			eventLocation={eventLocation}
			locale={locale}
		/>,
	})
}

interface PurchaseConfirmationParams {
	buyerEmail: string
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

/**
 * Sends a purchase confirmation email to the buyer using the React Email template
 */
export async function sendPurchaseConfirmationEmail({
	buyerEmail,
	buyerName,
	sellerName,
	eventName,
	bibPrice,
	orderId,
	eventDate,
	eventLocation,
	eventDistance,
	bibCategory,
	locale = 'fr'
}: PurchaseConfirmationParams): Promise<boolean> {
	const getLocalizedSubject = (locale: string) => {
		switch (locale) {
			case 'en': return 'Congratulations! Your purchase has been confirmed 🏃‍♂️'
			case 'es': return '¡Felicidades! Tu compra ha sido confirmada 🏃‍♂️'
			case 'it': return 'Congratulazioni! Il tuo acquisto è stato confermato 🏃‍♂️'
			case 'de': return 'Glückwunsch! Ihr Kauf wurde bestätigt 🏃‍♂️'
			case 'pt': return 'Parabéns! A sua compra foi confirmada 🏃‍♂️'
			case 'nl': return 'Gefeliciteerd! Uw aankoop is bevestigd 🏃‍♂️'
			case 'ko': return '축하합니다! 구매가 확인되었습니다 🏃‍♂️'
			case 'ro': return 'Felicitări! Achiziția ta a fost confirmată 🏃‍♂️'
			default: return 'Félicitations ! Votre achat a été confirmé 🏃‍♂️'
		}
	}

	return sendEmail({
		to: buyerEmail,
		subject: getLocalizedSubject(locale),
		react: <BeswibPurchaseConfirmation 
			buyerName={buyerName}
			sellerName={sellerName}
			eventName={eventName}
			bibPrice={bibPrice}
			orderId={orderId}
			eventDate={eventDate}
			eventLocation={eventLocation}
			eventDistance={eventDistance}
			bibCategory={bibCategory}
			locale={locale}
		/>,
	})
}

interface SaleAlertParams {
	sellerName?: string
	sellerEmail?: string
	buyerName?: string
	buyerEmail?: string
	eventName?: string
	bibPrice?: number
	platformFee?: number
	netRevenue?: number
	orderId?: string
	eventDate?: string
	eventLocation?: string
	eventDistance?: string
	bibCategory?: string
	transactionId?: string
	paypalCaptureId?: string
	saleTimestamp?: string
}

/**
 * Sends a sale alert email to administrators with transaction details
 */
export async function sendSaleAlertEmail(params: SaleAlertParams): Promise<boolean> {
	const adminEmails = process.env.NOTIFY_SALES_EMAIL_TO ?? process.env.NOTIFY_CONTACT_EMAIL_TO
	
	if (!adminEmails) {
		console.warn('No admin emails configured for sale alerts')
		return false
	}

	const subject = `🚨 Nouvelle Vente • ${params.eventName} • ${params.bibPrice?.toFixed(2)}€`
	
	return sendEmail({
		to: adminEmails.split(',').map(email => email.trim()),
		subject,
		react: <BeswibSaleAlert 
			sellerName={params.sellerName}
			sellerEmail={params.sellerEmail}
			buyerName={params.buyerName}
			buyerEmail={params.buyerEmail}
			eventName={params.eventName}
			bibPrice={params.bibPrice}
			platformFee={params.platformFee}
			netRevenue={params.netRevenue}
			orderId={params.orderId}
			eventDate={params.eventDate}
			eventLocation={params.eventLocation}
			eventDistance={params.eventDistance}
			bibCategory={params.bibCategory}
			transactionId={params.transactionId}
			paypalCaptureId={params.paypalCaptureId}
			saleTimestamp={params.saleTimestamp}
		/>,
	})
}

interface WaitlistAlertParams {
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

/**
 * Sends a waitlist alert email to users when a new bib becomes available for their event
 */
export async function sendWaitlistAlertEmail(
	emails: string[],
	params: WaitlistAlertParams
): Promise<{ sent: number; failed: number }> {
	if (emails.length === 0) {
		return { sent: 0, failed: 0 }
	}

	const getLocalizedSubject = (locale: string) => {
		const eventName = params.eventName || 'votre événement'
		switch (locale) {
			case 'en': return `🎯 Bib available for ${eventName}!`
			case 'es': return `🎯 ¡Dorsal disponible para ${eventName}!`
			case 'it': return `🎯 Pettorale disponibile per ${eventName}!`
			case 'de': return `🎯 Startnummer verfügbar für ${eventName}!`
			case 'pt': return `🎯 Dorsal disponível para ${eventName}!`
			case 'nl': return `🎯 Startnummer beschikbaar voor ${eventName}!`
			case 'ko': return `🎯 ${eventName} 레이스 번호 이용 가능!`
			case 'ro': return `🎯 Număr de concurs disponibil pentru ${eventName}!`
			default: return `🎯 Dossard disponible pour ${eventName} !`
		}
	}

	return sendBatchEmails(
		emails,
		getLocalizedSubject(params.locale || 'fr'),
		<BeswibWaitlistAlert 
			eventName={params.eventName}
			eventId={params.eventId}
			bibPrice={params.bibPrice}
			eventDate={params.eventDate}
			eventLocation={params.eventLocation}
			eventDistance={params.eventDistance}
			bibCategory={params.bibCategory}
			sellerName={params.sellerName}
			timeRemaining={params.timeRemaining}
			locale={params.locale}
		/>
	)
}

/**
 * Sends a batch of emails using React Email templates
 */
export async function sendBatchEmails(
	emails: string[],
	subject: string,
	reactComponent: React.ReactElement,
	options?: {
		chunkSize?: number
		from?: string
	}
): Promise<{ sent: number; failed: number }> {
	const chunkSize = options?.chunkSize ?? 50
	const chunks = []

	for (let i = 0; i < emails.length; i += chunkSize) {
		chunks.push(emails.slice(i, i + chunkSize))
	}

	let sent = 0
	let failed = 0

	for (const chunk of chunks) {
		try {
			const success = await sendEmail({
				to: chunk,
				subject,
				react: reactComponent,
				from: options?.from,
			})

			if (success) {
				sent += chunk.length
			} else {
				failed += chunk.length
			}
		} catch (error) {
			console.error('Batch email error:', error)
			failed += chunk.length
		}
	}

	return { sent, failed }
}

/**
 * Sends admin notification emails
 */
export async function sendAdminNotification(
	subject: string,
	reactComponent: React.ReactElement,
	options?: {
		to?: string
		fallbackHtml?: string
	}
): Promise<boolean> {
	const adminEmails = options?.to ?? process.env.NOTIFY_CONTACT_EMAIL_TO ?? process.env.NOTIFY_SALES_EMAIL_TO

	if (!adminEmails) {
		console.warn('No admin email configured for notifications')
		return false
	}

	return sendEmail({
		to: adminEmails.split(',').map(email => email.trim()),
		subject,
		react: reactComponent,
	})
}

/**
 * Renders a React Email component to HTML string
 */
export async function renderEmailToHtml(component: React.ReactElement): Promise<string> {
	try {
		return await render(component)
	} catch (error) {
		console.error('Email rendering error:', error)
		throw error
	}
}

/**
 * Utility function to strip HTML tags for text fallback
 */
function stripHtml(html: string): string {
	return html
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

interface BibApprovalParams {
	sellerEmail: string
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

/**
 * Sends a bib approval notification email to the seller when their bib is approved by the organizer
 */
export async function sendBibApprovalEmail({
	sellerEmail,
	sellerName,
	eventName,
	eventDate,
	eventLocation,
	bibPrice,
	eventDistance,
	bibCategory,
	organizerName,
	locale = 'fr'
}: BibApprovalParams): Promise<boolean> {
	const getLocalizedSubject = (locale: string) => {
		switch (locale) {
			case 'en': return 'Congratulations! Your bib has been approved 🎉'
			case 'es': return '¡Felicidades! Tu dorsal ha sido aprobado 🎉'
			case 'it': return 'Congratulazioni! Il tuo pettorale è stato approvato 🎉'
			case 'de': return 'Glückwunsch! Ihre Startnummer wurde genehmigt 🎉'
			case 'pt': return 'Parabéns! O seu dorsal foi aprovado 🎉'
			case 'nl': return 'Gefeliciteerd! Uw startnummer is goedgekeurd 🎉'
			case 'ko': return '축하합니다! 레이스 번호가 승인되었습니다 🎉'
			case 'ro': return 'Felicitări! Numărul tău de concurs a fost aprobat 🎉'
			default: return 'Félicitations ! Votre dossard a été approuvé 🎉'
		}
	}

	return sendEmail({
		to: sellerEmail,
		subject: getLocalizedSubject(locale),
		react: <BeswibBibApproval 
			sellerName={sellerName}
			eventName={eventName}
			eventDate={eventDate}
			eventLocation={eventLocation}
			bibPrice={bibPrice}
			eventDistance={eventDistance}
			bibCategory={bibCategory}
			organizerName={organizerName}
			locale={locale}
		/>,
	})
}

interface PurchaseApprovalParams {
	buyerEmail: string
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

/**
 * Sends a purchase approval notification email to the buyer when their purchase is validated by the organizer
 */
export async function sendPurchaseApprovalEmail({
	buyerEmail,
	buyerName,
	eventName,
	eventDate,
	eventLocation,
	bibPrice,
	eventDistance,
	bibCategory,
	organizerName,
	orderId,
	locale = 'fr'
}: PurchaseApprovalParams): Promise<boolean> {
	const getLocalizedSubject = (locale: string) => {
		switch (locale) {
			case 'en': return 'All set! Your purchase has been validated 🎉'
			case 'es': return '¡Todo listo! Tu compra ha sido validada 🎉'
			case 'it': return 'Tutto a posto! Il tuo acquisto è stato validato 🎉'
			case 'de': return 'Alles bereit! Ihr Kauf wurde validiert 🎉'
			case 'pt': return 'Tudo pronto! A sua compra foi validada 🎉'
			case 'nl': return 'Alles klaar! Uw aankoop is gevalideerd 🎉'
			case 'ko': return '모든 준비 완료! 구매가 확인되었습니다 🎉'
			case 'ro': return 'Totul este gata! Achiziția ta a fost validată 🎉'
			default: return 'Tout est en ordre ! Votre achat a été validé 🎉'
		}
	}

	return sendEmail({
		to: buyerEmail,
		subject: getLocalizedSubject(locale),
		react: <BeswibPurchaseApproval 
			buyerName={buyerName}
			eventName={eventName}
			eventDate={eventDate}
			eventLocation={eventLocation}
			bibPrice={bibPrice}
			eventDistance={eventDistance}
			bibCategory={bibCategory}
			organizerName={organizerName}
			orderId={orderId}
			locale={locale}
		/>,
	})
}

// Export the main send function for custom use cases
export { sendEmail }
