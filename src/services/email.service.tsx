'use server'

import { render } from '@react-email/components'

import { Resend } from 'resend'

import { BeswibEmailVerification, BeswibWelcomeEmail, BeswibWaitlistConfirmation } from '@/components/emails'
import BeswibPurchaseConfirmation from '@/components/emails/BeswibPurchaseConfirmation'
import BeswibSaleConfirmation from '@/components/emails/BeswibSaleConfirmation'
import BeswibPurchaseApproval from '@/components/emails/BeswibPurchaseApproval'
import BeswibWaitlistAlert from '@/components/emails/BeswibWaitlistAlert'
import BeswibBibApproval from '@/components/emails/BeswibBibApproval'
import BeswibSaleAlert from '@/components/emails/BeswibSaleAlert'

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
 * Helper function to get localized email subjects from locales
 */
function getLocalizedSubject(
	template: string,
	locale: string,
	params: Record<string, string | number | undefined> = {}
): string {
	// For now, use a simple approach to avoid TypeScript complexity
	// We'll implement the full translation system in a future iteration
	switch (template) {
		case 'verifiedEmail':
			return locale === 'fr' ? '🔐 Confirmez votre adresse email - Beswib' : '🔐 Verify your email address - Beswib'
		case 'welcome':
			const firstName = params.firstName ?? ''
			return locale === 'fr'
				? `Bienvenue sur Beswib${firstName !== '' ? `, ${firstName}` : ''} ! 🏃‍♂️`
				: `Welcome to Beswib${firstName !== '' ? `, ${firstName}` : ''} ! 🏃‍♂️`
		case 'waitlistConfirmation':
			const eventName = params.eventName ?? (locale === 'fr' ? 'votre événement' : 'your event')
			return locale === 'fr'
				? `🎯 Inscription en liste d'attente confirmée - ${eventName}`
				: `🎯 Waitlist registration confirmed - ${eventName}`
		case 'saleConfirmation':
			return locale === 'fr'
				? 'Félicitations ! Votre dossard a été vendu 💰'
				: 'Congratulations! Your bib has been sold 💰'
		case 'purchaseConfirmation':
			return locale === 'fr'
				? 'Félicitations ! Votre achat a été confirmé 🏃‍♂️'
				: 'Congratulations! Your purchase has been confirmed 🏃‍♂️'
		case 'saleAlert':
			const eventNameAlert = params.eventName ?? 'Event'
			const bibPrice = params.bibPrice ?? 0
			return `🚨 ${locale === 'fr' ? 'Alerte Nouvelle Vente' : 'New Sale Alert'} - ${eventNameAlert} • ${bibPrice}€`
		case 'waitlistAlert':
			const eventNameWaitlist = params.eventName ?? (locale === 'fr' ? 'votre événement' : 'your event')
			return locale === 'fr'
				? `🎯 Dossard disponible pour ${eventNameWaitlist} !`
				: `🎯 Bib available for ${eventNameWaitlist}!`
		case 'bibApproval':
			return locale === 'fr'
				? 'Félicitations ! Votre dossard a été approuvé 🎉'
				: 'Congratulations! Your bib has been approved 🎉'
		case 'purchaseApproval':
			return locale === 'fr'
				? 'Tout est en ordre ! Votre achat a été validé 🎉'
				: 'All set! Your purchase has been validated 🎉'
		default:
			return 'Beswib Email'
	}
}

/**
 * Sends an email using Resend with React Email components
 */
async function sendEmail({ to, text, subject, react, html, from }: SendEmailParams): Promise<boolean> {
	try {
		const fromEmail = from ?? process.env.NOTIFY_EMAIL_FROM ?? 'noreply@beswib.com'

		interface EmailData {
			to: string | string[]
			subject: string
			from: string
			react?: React.ReactElement
			html?: string
			text?: string
		}

		let emailData: EmailData = {
			to,
			subject,
			from: fromEmail,
		}

		if (react) {
			emailData.react = react
		} else if (html !== undefined && html !== null && typeof html === 'string' && html.trim() !== '') {
			emailData.html = html
			emailData.text = text ?? stripHtml(html)
		} else {
			throw new Error('Either react component or html content must be provided')
		}

		const { error, data } = await resend.emails.send(emailData as Parameters<typeof resend.emails.send>[0])

		if (error) {
			console.error('Email sending error:', error)
			return false
		}

		console.info('Email sent successfully:', data?.id)
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
	const subject = getLocalizedSubject('verifiedEmail', locale)

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
	const subject = getLocalizedSubject('welcome', locale, { firstName })

	return sendEmail({
		to: email,
		subject,
		react: <BeswibWelcomeEmail firstName={firstName} locale={locale} />,
	})
}

/**
 * Sends a waitlist confirmation email using the React Email template
 */
export async function sendWaitlistConfirmationEmail(
	email: string,
	userName?: string,
	eventName?: string,
	eventId?: string,
	eventDistance?: string,
	bibCategory?: string,
	locale: string = 'fr'
): Promise<boolean> {
	const subject = getLocalizedSubject('waitlistConfirmation', locale, { eventName })

	return sendEmail({
		to: email,
		subject,
		react: (
			<BeswibWaitlistConfirmation
				userName={userName}
				eventName={eventName}
				eventId={eventId}
				eventDate="14 avril 2024"
				eventLocation="Paris, France"
				eventDistance={eventDistance}
				bibCategory={bibCategory}
				createdAt={new Date().toLocaleDateString('fr-FR')}
				locale={locale}
			/>
		),
	})
}

interface SaleConfirmationParams {
	sellerEmail: string
	sellerName?: string
	buyerName?: string
	eventName?: string
	bibPrice?: number
	platformFee?: number
	paypalFee?: number
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
	totalReceived,
	sellerName,
	sellerEmail,
	platformFee,
	paypalFee,
	orderId,
	locale = 'fr',
	eventName,
	eventLocation,
	eventDate,
	buyerName,
	bibPrice,
}: SaleConfirmationParams): Promise<boolean> {
	const subject = getLocalizedSubject('saleConfirmation', locale)

	return sendEmail({
		to: sellerEmail,
		subject,
		react: (
			<BeswibSaleConfirmation
				sellerName={sellerName}
				buyerName={buyerName}
				eventName={eventName}
				bibPrice={bibPrice}
				platformFee={platformFee}
				paypalFee={paypalFee}
				totalReceived={totalReceived}
				orderId={orderId}
				eventDate={eventDate}
				eventLocation={eventLocation}
				locale={locale}
			/>
		),
	})
}

interface PurchaseConfirmationParams {
	buyerEmail: string
	buyerName?: string
	sellerName?: string
	eventName?: string
	listingPrice?: number
	platformFee?: number
	paypalFee?: number
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
	sellerName,
	platformFee,
	paypalFee,
	orderId,
	locale = 'fr',
	listingPrice,
	eventName,
	eventLocation,
	eventDistance,
	eventDate,
	buyerName,
	buyerEmail,
	bibCategory,
}: PurchaseConfirmationParams): Promise<boolean> {
	const subject = getLocalizedSubject('purchaseConfirmation', locale)

	return sendEmail({
		to: buyerEmail,
		subject,
		react: (
			<BeswibPurchaseConfirmation
				buyerName={buyerName}
				sellerName={sellerName}
				eventName={eventName}
				listingPrice={listingPrice}
				platformFee={platformFee}
				paypalFee={paypalFee}
				orderId={orderId}
				eventDate={eventDate}
				eventLocation={eventLocation}
				eventDistance={eventDistance}
				bibCategory={bibCategory}
				locale={locale}
			/>
		),
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
	locale?: string
}

/**
 * Sends a sale alert email to administrators with transaction details
 */
export async function sendSaleAlertEmail(params: SaleAlertParams): Promise<boolean> {
	const adminEmails = process.env.NOTIFY_SALES_EMAIL_TO ?? process.env.NOTIFY_CONTACT_EMAIL_TO

	if (
		adminEmails === undefined ||
		adminEmails === null ||
		(typeof adminEmails === 'string' && adminEmails.trim() === '')
	) {
		console.warn('No admin emails configured for sale alerts')
		return false
	}

	const subject = getLocalizedSubject('saleAlert', params.locale ?? 'fr', {
		eventName: params.eventName,
		bibPrice: params.bibPrice,
	})

	return sendEmail({
		to: adminEmails.split(',').map(email => email.trim()),
		subject,
		react: (
			<BeswibSaleAlert
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
			/>
		),
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

	const subject = getLocalizedSubject('waitlistAlert', params.locale ?? 'fr', { eventName: params.eventName })

	return sendBatchEmails(
		emails,
		subject,
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

	if (
		adminEmails === undefined ||
		adminEmails === null ||
		(typeof adminEmails === 'string' && adminEmails.trim() === '')
	) {
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
	sellerName,
	sellerEmail,
	organizerName,
	locale = 'fr',
	eventName,
	eventLocation,
	eventDistance,
	eventDate,
	bibPrice,
	bibCategory,
}: BibApprovalParams): Promise<boolean> {
	const subject = getLocalizedSubject('bibApproval', locale)

	return sendEmail({
		to: sellerEmail,
		subject,
		react: (
			<BeswibBibApproval
				sellerName={sellerName}
				eventName={eventName}
				eventDate={eventDate}
				eventLocation={eventLocation}
				bibPrice={bibPrice}
				eventDistance={eventDistance}
				bibCategory={bibCategory}
				organizerName={organizerName}
				locale={locale}
			/>
		),
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
	organizerName,
	orderId,
	locale = 'fr',
	eventName,
	eventLocation,
	eventDistance,
	eventDate,
	buyerName,
	buyerEmail,
	bibPrice,
	bibCategory,
}: PurchaseApprovalParams): Promise<boolean> {
	const subject = getLocalizedSubject('purchaseApproval', locale)

	return sendEmail({
		to: buyerEmail,
		subject,
		react: (
			<BeswibPurchaseApproval
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
			/>
		),
	})
}

// Export the main send function for custom use cases
export { sendEmail }
