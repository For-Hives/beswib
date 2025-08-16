'use server'

// Minimal notification service to support future expansion
// Currently provides sendSaleAlert() to ping a Discord webhook with @here
// Now also sends email notifications via Resend if configured

import { Resend } from 'resend'

import {
	renderContactMessageEmailHtml as renderContactMessageEmailHtmlUnsafe,
	renderWelcomeEmailHtml as renderWelcomeEmailHtmlUnsafe,
} from '../constants/email.constant'
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
 * Sends notifications to all waitlisted users when a new bib becomes available for an event.
 * Sends both email notifications to waitlisted users and Discord alerts to admins.
 * @param bibInfo Information about the new bib that was listed
 * @param waitlistedEmails Array of email addresses of users on the waitlist
 * @returns Success status and counts of sent/failed notifications
 */
export async function sendNewBibNotification(
	bibInfo: NewBibNotificationInfo,
	waitlistedEmails: string[]
): Promise<{ success: boolean; emailsSent: number; emailsFailed: number; adminNotified: boolean }> {
	if (waitlistedEmails.length === 0) {
		return { success: true, emailsSent: 0, emailsFailed: 0, adminNotified: false }
	}

	const formatPrice = (price: number) => {
		try {
			return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(price)
		} catch {
			return `€${price.toFixed(2)}`
		}
	}

	const formatDate = (date?: Date | string) => {
		if (date == null || date === '') return ''
		try {
			const d = new Date(date)
			return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
		} catch {
			return ''
		}
	}

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

	// Email content for waitlisted users
	const userEmailSubject = `🏃 New bib available for ${bibInfo.eventName}!`
	const userEmailText = `Great news! A new bib is now available for ${bibInfo.eventName}.

Event: ${bibInfo.eventName}
${bibInfo.eventLocation != null && bibInfo.eventLocation.trim() !== '' ? `Location: ${bibInfo.eventLocation}` : ''}
${bibInfo.eventDate != null ? `Date: ${formatDate(bibInfo.eventDate)}` : ''}
Price: ${formatPrice(bibInfo.bibPrice)}

Don't wait - check it out now: ${baseUrl}/events/${bibInfo.eventId}

This notification was sent because you're on the waitlist for this event. You can manage your waitlist preferences in your dashboard.

Happy running!
The Beswib Team`

	const userEmailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
		<h1 style="color: white; margin: 0; font-size: 24px;">🏃 New Bib Available!</h1>
	</div>
	
	<div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
		<p style="font-size: 16px; color: #333; margin: 0 0 20px;">Great news! A new bib is now available for <strong>${escapeHtml(bibInfo.eventName)}</strong>.</p>
		
		<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
			<h3 style="margin: 0 0 15px; color: #333;">Event Details:</h3>
			<p style="margin: 5px 0; color: #555;"><strong>Event:</strong> ${escapeHtml(bibInfo.eventName)}</p>
			${bibInfo.eventLocation != null && bibInfo.eventLocation.trim() !== '' ? `<p style="margin: 5px 0; color: #555;"><strong>Location:</strong> ${escapeHtml(bibInfo.eventLocation)}</p>` : ''}
			${bibInfo.eventDate != null ? `<p style="margin: 5px 0; color: #555;"><strong>Date:</strong> ${formatDate(bibInfo.eventDate)}</p>` : ''}
			<p style="margin: 5px 0; color: #555;"><strong>Price:</strong> ${formatPrice(bibInfo.bibPrice)}</p>
		</div>
		
		<div style="text-align: center; margin: 30px 0;">
			<a href="${baseUrl}/events/${bibInfo.eventId}" 
			   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
				View Bib Now
			</a>
		</div>
		
		<p style="font-size: 14px; color: #666; margin: 20px 0 0; text-align: center;">
			This notification was sent because you're on the waitlist for this event.<br>
			You can manage your waitlist preferences in your dashboard.
		</p>
		
		<p style="font-size: 14px; color: #666; margin: 20px 0 0; text-align: center;">
			Happy running!<br>
			<strong>The Beswib Team</strong>
		</p>
	</div>
</div>`

	// Admin Discord notification
	const adminDiscordContent = `🚨 **New Bib Listed - Waitlist Notified**

📋 **Bib ID:** ${bibInfo.bibId}
🏃 **Event:** ${bibInfo.eventName}
📍 **Location:** ${bibInfo.eventLocation ?? 'Not specified'}
💰 **Price:** ${formatPrice(bibInfo.bibPrice)}
📧 **Waitlisted Users Notified:** ${waitlistedEmails.length}

Event Link: ${baseUrl}/events/${bibInfo.eventId}`

	// Send emails to waitlisted users
	const emailResults = await sendBatchEmail(waitlistedEmails, {
		text: userEmailText,
		subject: userEmailSubject,
		html: userEmailHtml,
	})

	// Send admin notification
	const adminNotified = await notifyAdmins({
		text: `New bib listed for ${bibInfo.eventName}. ${waitlistedEmails.length} waitlisted users have been notified.`,
		subject: `[Beswib] New bib listed - ${waitlistedEmails.length} users notified`,
		html: userEmailHtml.replace(
			'Great news! A new bib is now available',
			`Admin Alert: New bib listed for ${bibInfo.eventName}. ${waitlistedEmails.length} waitlisted users have been notified.`
		),
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

export async function sendWelcomeEmail(params: { to: string; firstName?: string }): Promise<boolean> {
	const to = (params.to ?? '').trim()
	if (to.length === 0) return false
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'
	const safeFirst = (params.firstName ?? '').trim()
	const commaName = safeFirst.length > 0 ? `, ${safeFirst}` : ''
	const html = renderWelcomeEmailHtml({ firstName: safeFirst, baseUrl })
	const subject = `Welcome to Beswib${commaName}!`
	const text = `Welcome${commaName} to Beswib!\n\nExplore the marketplace: ${baseUrl}/marketplace\n\nBeswib Team`
	const from = process.env.NOTIFY_EMAIL_FROM ?? ''
	return sendEmail({ to, text, subject, html, from })
}

/**
 * Sends verification email with code
 */
export async function sendVerificationEmail(
	email: string,
	verificationCode: string,
	expiryMinutes: number
): Promise<boolean> {
	const subject = '🔐 Verify your email address - Beswib'
	const text = `Hi there!

Your verification code is: ${verificationCode}

This code will expire in ${expiryMinutes} minutes.

If you didn't request this verification, please ignore this email.

Best regards,
The Beswib Team`

	const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
		<h1 style="color: white; margin: 0; font-size: 24px;">🔐 Email Verification</h1>
	</div>
	
	<div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
		<p style="font-size: 16px; color: #333; margin: 0 0 20px;">Hi there!</p>
		
		<p style="font-size: 16px; color: #333; margin: 0 0 20px;">Your verification code is:</p>
		
		<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
			<h2 style="margin: 0; color: #333; font-size: 32px; letter-spacing: 4px; font-family: monospace;">${verificationCode}</h2>
		</div>
		
		<p style="font-size: 14px; color: #666; margin: 20px 0 0;">
			⏰ This code will expire in <strong>${expiryMinutes} minutes</strong>.
		</p>
		
		<p style="font-size: 14px; color: #666; margin: 20px 0 0;">
			If you didn't request this verification, please ignore this email.
		</p>
		
		<p style="font-size: 14px; color: #666; margin: 20px 0 0; text-align: center;">
			Best regards,<br>
			<strong>The Beswib Team</strong>
		</p>
	</div>
</div>`

	return sendUserEmail(email, { text, subject, html })
}
