'use server'

// Minimal notification service to support future expansion
// Currently provides sendSaleAlert() to ping a Discord webhook with @here
// Now also sends email notifications via Resend if configured

import { Resend } from 'resend'

import {
	sendVerificationEmail as sendModernVerificationEmail,
	sendWelcomeEmail as sendModernWelcomeEmail,
	sendSaleConfirmationEmail,
	sendPurchaseConfirmationEmail,
	sendSaleAlertEmail,
	sendLocalizedWaitlistAlertEmails,
} from './email.service'
import {
	renderContactMessageEmailHtml as renderContactMessageEmailHtmlUnsafe,
	renderWelcomeEmailHtml as renderWelcomeEmailHtmlUnsafe,
} from '../constants/email.constant'
import {
	VERIFICATION_EMAIL_HTML_TEMPLATE,
	VERIFICATION_EMAIL_SUBJECT,
	VERIFICATION_EMAIL_TEXT_TEMPLATE,
} from '../constants/verifiedEmail.constant'
import { contactSummaryText, contactFullText, saleAlertText } from '../constants/discord.constant'

const renderContactMessageEmailHtml = (p: { name: string; email: string; message: string }): string =>
	(renderContactMessageEmailHtmlUnsafe as unknown as (p: { name: string; email: string; message: string }) => string)(p)

const renderWelcomeEmailHtml = (p: { firstName?: string; baseUrl?: string }): string =>
	(renderWelcomeEmailHtmlUnsafe as unknown as (p: { firstName?: string; baseUrl?: string }) => string)(p)

type SaleAlertInfo = {
	orderId?: string | null
	bibId?: string | null
	amount?: number | null
	currency?: string | null
}

/**
 * Sends a simple @here alert to a Discord webhook when a sale completes.
 * The webhook URL must be provided via env var DISCORD_WEBHOOK_URL.
 * Fails silently and returns false if the webhook URL is not set or if the request fails.
 */
export async function sendSaleAlert(info?: SaleAlertInfo): Promise<boolean> {
	const content = saleAlertText(info)
	return notifyAdmins({
		text: content,
		subject: '[Beswib] New sale completed',
		html: `<p>${escapeHtml(content)}</p>`,
		discordContent: content,
	})
}

type ContactMessageInfo = {
	name: string
	email: string
	message: string
}

/**
 * Sends a contact form message to the configured Discord webhook.
 * Uses DISCORD_WEBHOOK_URL env var (single channel).
 * Posts two messages: a summary line with @here, then the full message as a code block.
 */
export async function sendContactMessage(info: ContactMessageInfo): Promise<boolean> {
	const webhookUrl = process.env.DISCORD_WEBHOOK_URL ?? ''
	const summary = contactSummaryText(info.name, info.email)
	const full = contactFullText(info.message)

	const [d1, d2, emailOk] = await Promise.all([
		postDiscord(webhookUrl, summary),
		postDiscord(webhookUrl, full),
		sendAdminAlertEmail({
			text: `From: ${info.name || 'Anonymous'}\\nEmail: ${info.email || 'n/a'}\\n\\n${info.message}`,
			subject: '[Beswib] New contact message',
			html: renderContactMessageEmailHtml({
				name: info.name ?? '',
				message: info.message ?? '',
				email: info.email ?? '',
			}),
		}),
	])

	return Boolean((d1 && d2) || emailOk)
}

type NewBibNotificationInfo = {
	eventName: string
	eventId: string
	bibPrice: number
	bibId: string
	eventLocation?: string
	eventDate?: Date | string
}

/**
 * Sends modern waitlist notifications to all waitlisted users when a new bib becomes available for an event.
 * Uses React Email templates with full multilingual support and Discord alerts to admins.
 * @param bibInfo Information about the new bib that was listed
 * @param waitlistedEmailsWithLocales Array of email addresses with their preferred locales
 * @returns Success status and counts of sent/failed notifications
 */
export async function sendNewBibNotification(
	bibInfo: NewBibNotificationInfo & { bibCategory?: string; eventDistance?: string; sellerName?: string },
	waitlistedEmailsWithLocales: Array<{ email: string; locale?: string }>
): Promise<{ success: boolean; emailsSent: number; emailsFailed: number; adminNotified: boolean }> {
	if (waitlistedEmailsWithLocales.length === 0) {
		return { success: true, emailsSent: 0, emailsFailed: 0, adminNotified: false }
	}

	// Calculate time remaining until event
	const calculateTimeRemaining = (eventDate?: Date | string, locale: string = 'fr'): string => {
		// Import translations to get the time units
		const { getTranslations } = require('../lib/i18n/dictionary')
		const translations = getTranslations(locale, {})
		const timeUnits = translations.GLOBAL.timeUnits

		if (eventDate === undefined || eventDate === null || (typeof eventDate === 'string' && eventDate.trim() === ''))
			return timeUnits.defaultDays
		try {
			const event = new Date(eventDate)
			const now = new Date()
			const diffTime = event.getTime() - now.getTime()
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

			if (diffDays <= 0) return timeUnits.zeroDays
			if (diffDays === 1) return timeUnits.oneDay
			if (diffDays < 7) return `${diffDays} ${timeUnits.days}`
			const weeks = Math.floor(diffDays / 7)
			if (weeks === 1) return timeUnits.oneWeek
			if (weeks < 4) return `${weeks} ${timeUnits.weeks}`
			const months = Math.floor(diffDays / 30)
			return months === 1 ? timeUnits.oneMonth : `${months} ${timeUnits.months}`
		} catch {
			return timeUnits.defaultDays
		}
	}

	const formatEventDate = (date?: Date | string) => {
		if (date === undefined || date === null || (typeof date === 'string' && date.trim() === '')) return ''
		try {
			const d = new Date(date)
			return d.toLocaleDateString('fr-FR', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			})
		} catch {
			return ''
		}
	}

	// Use modern React Email template for waitlist notifications with proper localization
	const emailResults = await sendLocalizedWaitlistAlertEmails(waitlistedEmailsWithLocales, {
		sellerName: bibInfo.sellerName,
		eventName: bibInfo.eventName,
		eventLocation: bibInfo.eventLocation,
		eventId: bibInfo.eventId,
		eventDistance: bibInfo.eventDistance,
		eventDateRaw: bibInfo.eventDate, // Pass raw date for timeRemaining calculation
		eventDate: formatEventDate(bibInfo.eventDate),
		calculateTimeRemaining, // Pass the function so each email can calculate with its locale
		bibPrice: bibInfo.bibPrice,
		bibCategory: bibInfo.bibCategory,
	})

	// Admin Discord notification
	const formatPrice = (price: number) => `${price.toFixed(2)}€`
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'
	const adminDiscordContent = `🚨 **New Bib Listed - Waitlist Notified**

📋 **Bib ID:** ${bibInfo.bibId}
🏃 **Event:** ${bibInfo.eventName}
📍 **Location:** ${bibInfo.eventLocation ?? 'Not specified'}
💰 **Price:** ${formatPrice(bibInfo.bibPrice)}
📧 **Waitlisted Users Notified:** ${waitlistedEmailsWithLocales.length}

Event Link: ${baseUrl}/events/${bibInfo.eventId}`

	// Send admin notification
	const adminNotified = await notifyAdmins({
		text: `New bib listed for ${bibInfo.eventName}. ${waitlistedEmailsWithLocales.length} waitlisted users have been notified.`,
		subject: `[Beswib] New bib listed - ${waitlistedEmailsWithLocales.length} users notified`,
		html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 24px;">🚨 Admin Alert: New Bib Listed</h1></div><div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><p style="font-size: 16px; color: #333; margin: 0 0 20px;">A new bib has been listed for <strong>${escapeHtml(bibInfo.eventName)}</strong> and <strong>${waitlistedEmailsWithLocales.length}</strong> waitlisted users have been notified.</p></div></div>`,
		discordContent: adminDiscordContent,
	})

	return {
		success: emailResults.sent > 0 || emailResults.failed === 0,
		emailsSent: emailResults.sent,
		emailsFailed: emailResults.failed,
		adminNotified,
	}
}

// --- Internal utilities ----------------------------------------------------

// Admin-only webhook (Discord); true if posted, false otherwise.
export async function sendAdminWebhook(content: string, opts?: { webhookUrl?: string }): Promise<boolean> {
	const url = opts?.webhookUrl ?? process.env.DISCORD_WEBHOOK_URL ?? ''
	return postDiscord(url, content)
}

// Admin-only alert email; sends to NOTIFY_SALES_EMAIL_TO (comma-separated supported).
export async function sendAdminAlertEmail(params: { subject: string; text?: string; html?: string }): Promise<boolean> {
	const toAdmins = process.env.NOTIFY_CONTACT_EMAIL_TO ?? process.env.NOTIFY_SALES_EMAIL_TO ?? undefined
	return sendEmail({
		to: toAdmins,
		text: params.text,
		subject: params.subject,
		html: params.html,
		from: process.env.NOTIFY_EMAIL_FROM,
	})
}

// Convenience: email admins and also post on Discord.
export async function notifyAdmins(params: {
	subject: string
	text?: string
	html?: string
	discordContent?: string
	webhookUrl?: string
}): Promise<boolean> {
	const [emailOk, webhookOk] = await Promise.all([
		sendAdminAlertEmail({ text: params.text, subject: params.subject, html: params.html }),
		typeof params.discordContent === 'string' && params.discordContent.length > 0
			? sendAdminWebhook(params.discordContent, { webhookUrl: params.webhookUrl })
			: Promise.resolve(false),
	])
	return Boolean(emailOk || webhookOk)
}

// Single-user email; true if sent.
export async function sendUserEmail(
	to: string,
	params: { subject: string; text?: string; html?: string; from?: string }
): Promise<boolean> {
	const from = params.from ?? process.env.NOTIFY_EMAIL_FROM ?? ''
	return sendEmail({ to, text: params.text, subject: params.subject, html: params.html, from })
}

// Batch email; chunked sending to avoid oversized requests.
export async function sendBatchEmail(
	toList: Array<string> | Set<string>,
	params: { subject: string; text?: string; html?: string; from?: string; chunkSize?: number }
): Promise<{ sent: number; failed: number }> {
	const unique = Array.from(new Set(Array.isArray(toList) ? toList : Array.from(toList)))
		.map(s => s.trim())
		.filter(s => s.length > 0)
	const from = params.from ?? process.env.NOTIFY_EMAIL_FROM ?? ''
	const chunkSize = Number(params.chunkSize ?? process.env.NOTIFY_BATCH_CHUNK_SIZE ?? 100)
	if (unique.length === 0 || from.length === 0) return { sent: 0, failed: unique.length }

	let sent = 0
	let failed = 0
	for (let i = 0; i < unique.length; i += chunkSize) {
		const chunk = unique.slice(i, i + chunkSize)
		// Resend supports array recipients; single API call per chunk
		// If a chunk fails, count all as failed
		// For finer-grained reporting, loop per user instead
		const ok = await sendEmail({ to: chunk, text: params.text, subject: params.subject, html: params.html, from })
		if (ok) sent += chunk.length
		else failed += chunk.length
	}
	return { sent, failed }
}

function getResend(): Resend | null {
	const key = process.env.RESEND_API_KEY
	if (typeof key !== 'string' || key.length === 0) return null
	try {
		return new Resend(key)
	} catch {
		return null
	}
}

async function sendEmail(params: {
	to?: string | string[] | null
	from?: string | null
	subject: string
	text?: string
	html?: string
}): Promise<boolean> {
	const resend = getResend()
	if (!resend) return false

	const to = normalizeEmails(params.to)
	const from = (params.from ?? '').trim()
	if (to.length === 0 || from.length === 0) return false

	try {
		const text = params.text ?? stripTags(params.html ?? '')
		const result = await resend.emails.send({
			to,
			text,
			subject: params.subject,
			html: params.html,
			from,
		})
		if (result.error) return false
		const id = result.data?.id
		return typeof id === 'string' && id.length > 0
	} catch {
		return false
	}
}

async function postDiscord(webhookUrl: string, content: string): Promise<boolean> {
	if (!webhookUrl || webhookUrl.length === 0) return false
	try {
		const res = await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content }),
		})
		return res.ok
	} catch {
		return false
	}
}

function normalizeEmails(value?: string | string[] | null): string[] {
	if (value === null || value === undefined) return []
	const arr = Array.isArray(value) ? value : String(value).split(',')
	return arr.map(s => s.trim()).filter(s => s.length > 0)
}

function escapeHtml(s: string): string {
	return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

// (Email HTML for contact messages now rendered via ContactMessageEmail component)

function stripTags(html: string): string {
	return html
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

// --- Welcome email --------------------------------------------------------------

export async function sendWelcomeEmail(params: { to: string; firstName?: string; locale?: string }): Promise<boolean> {
	const to = (params.to ?? '').trim()
	if (to.length === 0) return false

	// Use modern React Email template
	const success = await sendModernWelcomeEmail(to, params.firstName, params.locale)
	if (success) return true

	// Fallback to legacy template (with localized subject)
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'
	const safeFirst = (params.firstName ?? '').trim()
	const fallbackLocale = params.locale ?? 'fr'

	// Try to get localized subject even for fallback
	let subject = `Welcome to Beswib!`
	try {
		const { getLocalizedEmailSubject } = await import('@/lib/utils/email-localization')
		subject = getLocalizedEmailSubject('welcome', fallbackLocale, { firstName: safeFirst })
	} catch (error) {
		console.warn('Failed to get localized subject for fallback welcome email:', error)
		// Keep default hardcoded subject
	}

	const html = renderWelcomeEmailHtml({ firstName: safeFirst, baseUrl })
	const text = `Welcome to Beswib!\n\nExplore the marketplace: ${baseUrl}/marketplace\n\nBeswib Team`
	const from = process.env.NOTIFY_EMAIL_FROM ?? ''
	return sendEmail({ to, text, subject, html, from })
}

/**
 * Sends verification email with code
 */
export async function sendVerificationEmail(
	email: string,
	verificationCode: string,
	expiryMinutes: number,
	locale?: string
): Promise<boolean> {
	// Use modern React Email template
	const success = await sendModernVerificationEmail(email, verificationCode, locale)
	if (success) return true

	// Fallback to legacy template
	const subject = VERIFICATION_EMAIL_SUBJECT
	const text = VERIFICATION_EMAIL_TEXT_TEMPLATE(verificationCode, expiryMinutes)
	const html = VERIFICATION_EMAIL_HTML_TEMPLATE(verificationCode, expiryMinutes)

	return sendUserEmail(email, { text, subject, html })
}

/**
 * Sends a sale confirmation email to the seller with all transaction details
 */
export async function sendSellerSaleConfirmation(params: {
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
}): Promise<boolean> {
	try {
		// Use modern React Email template
		return await sendSaleConfirmationEmail(params)
	} catch (error) {
		console.error('Error sending sale confirmation email:', error)
		return false
	}
}

/**
 * Sends a purchase confirmation email to the buyer with all transaction details
 */
export async function sendBuyerPurchaseConfirmation(params: {
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
}): Promise<boolean> {
	try {
		// Use modern React Email template
		return await sendPurchaseConfirmationEmail(params)
	} catch (error) {
		console.error('Error sending purchase confirmation email:', error)
		return false
	}
}

/**
 * Sends a comprehensive sale alert email to administrators with all transaction details
 */
export async function sendAdminSaleAlert(params: {
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
}): Promise<boolean> {
	try {
		// Use modern React Email template
		return await sendSaleAlertEmail({
			...params,
			saleTimestamp: new Date().toLocaleString('fr-FR'),
		})
	} catch (error) {
		console.error('Error sending admin sale alert email:', error)
		return false
	}
}
