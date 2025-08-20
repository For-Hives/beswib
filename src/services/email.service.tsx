'use server'

import { render } from '@react-email/components'

import { Resend } from 'resend'

import { BeswibEmailVerification, BeswibWelcomeEmail } from '@/components/emails'

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
		react: <BeswibWelcomeEmail firstName={firstName} />,
	})
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

// Export the main send function for custom use cases
export { sendEmail }
