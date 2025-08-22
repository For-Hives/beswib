'use server'

import { render } from '@react-email/components'

import { Resend } from 'resend'

import { BeswibEmailVerification, BeswibWelcomeEmail, BeswibWaitlistConfirmation } from '@/components/emails'
import { getLocalizedEmailSubject, type EmailTemplateKey } from '@/lib/utils/email-localization'
import BeswibPurchaseConfirmation from '@/components/emails/BeswibPurchaseConfirmation'
import BeswibSaleConfirmation from '@/components/emails/BeswibSaleConfirmation'
import BeswibPurchaseApproval from '@/components/emails/BeswibPurchaseApproval'
import BeswibWaitlistAlert from '@/components/emails/BeswibWaitlistAlert'
import BeswibBibApproval from '@/components/emails/BeswibBibApproval'
import BeswibSaleAlert from '@/components/emails/BeswibSaleAlert'
import { getUserLocaleByEmail } from '@/services/user.services'

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
 * Helper function to automatically detect user locale and get localized subject
 */
async function getLocalizedSubjectForUser(
	template: EmailTemplateKey | 'verifiedEmail',
	email: string,
	params: Record<string, string | number | undefined> = {}
): Promise<string> {
	const userLocale = await getUserLocaleByEmail(email)
	return getLocalizedEmailSubject(template, userLocale, params)
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
	locale?: string
): Promise<boolean> {
	// Auto-detect user locale if not provided
	const userLocale = locale ?? (await getUserLocaleByEmail(email))
	const subject = await getLocalizedSubjectForUser('verifiedEmail', email)

	return sendEmail({
		to: email,
		subject,
		react: <BeswibEmailVerification validationCode={verificationCode} locale={userLocale} />,
	})
}

/**
 * Sends a welcome email using the React Email template
 */
export async function sendWelcomeEmail(email: string, firstName?: string, locale?: string): Promise<boolean> {
	// Auto-detect user locale if not provided
	const userLocale = locale ?? (await getUserLocaleByEmail(email))
	// userLocale is already handled by getTranslations with fallback
	const subject = await getLocalizedSubjectForUser('welcome', email, { firstName })

	return sendEmail({
		to: email,
		subject,
		react: <BeswibWelcomeEmail firstName={firstName} locale={userLocale} />,
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
	locale?: string
): Promise<boolean> {
	// Auto-detect user locale if not provided
	const userLocale = locale ?? (await getUserLocaleByEmail(email))
	// userLocale is already handled by getTranslations with fallback
	const subject = await getLocalizedSubjectForUser('waitlistConfirmation', email, { eventName })

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
				createdAt={new Date().toLocaleDateString(userLocale === 'fr' ? 'fr-FR' : 'en-US')}
				locale={userLocale}
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
	locale,
	eventName,
	eventLocation,
	eventDate,
	buyerName,
	bibPrice,
}: SaleConfirmationParams): Promise<boolean> {
	// Auto-detect user locale if not provided
	const userLocale = locale ?? (await getUserLocaleByEmail(sellerEmail))
	// userLocale is already handled by getTranslations with fallback
	const subject = await getLocalizedSubjectForUser('saleConfirmation', sellerEmail)

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
				locale={userLocale}
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
	locale,
	listingPrice,
	eventName,
	eventLocation,
	eventDistance,
	eventDate,
	buyerName,
	buyerEmail,
	bibCategory,
}: PurchaseConfirmationParams): Promise<boolean> {
	// Auto-detect user locale if not provided
	const userLocale = locale ?? (await getUserLocaleByEmail(buyerEmail))
	// userLocale is already handled by getTranslations with fallback
	const subject = await getLocalizedSubjectForUser('purchaseConfirmation', buyerEmail)

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
				locale={userLocale}
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

	// Use French as default for admin emails, but allow override
	const locale = params.locale ?? 'fr'
	// locale is already handled by getTranslations with fallback
	const subject = getLocalizedEmailSubject('saleAlert', locale, {
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

	// For batch emails, we'll use a default locale or the provided one
	// In the future, we could optimize by grouping emails by user locale
	const locale = params.locale ?? 'fr'
	// locale is already handled by getTranslations with fallback
	const subject = getLocalizedEmailSubject('waitlistAlert', locale, { eventName: params.eventName })

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
			locale={locale}
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
	locale,
	eventName,
	eventLocation,
	eventDistance,
	eventDate,
	bibPrice,
	bibCategory,
}: BibApprovalParams): Promise<boolean> {
	// Auto-detect user locale if not provided
	const userLocale = locale ?? (await getUserLocaleByEmail(sellerEmail))
	// userLocale is already handled by getTranslations with fallback
	const subject = await getLocalizedSubjectForUser('bibApproval', sellerEmail)

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
				locale={userLocale}
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
	locale,
	eventName,
	eventLocation,
	eventDistance,
	eventDate,
	buyerName,
	buyerEmail,
	bibPrice,
	bibCategory,
}: PurchaseApprovalParams): Promise<boolean> {
	// Auto-detect user locale if not provided
	const userLocale = locale ?? (await getUserLocaleByEmail(buyerEmail))
	// userLocale is already handled by getTranslations with fallback
	const subject = await getLocalizedSubjectForUser('purchaseApproval', buyerEmail)

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
				locale={userLocale}
			/>
		),
	})
}

// Export the main send function for custom use cases
export { sendEmail }
