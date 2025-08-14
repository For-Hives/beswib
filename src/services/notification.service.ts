'use server'

// Minimal notification service to support future expansion
// Currently provides sendSaleAlert() to ping a Discord webhook with @here
// Now also sends email notifications via Resend if configured

import { Resend } from 'resend'

import { saleAlertText, contactSummaryText, contactFullText } from '../constants/discord.constant'

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
			html: contactHtml({ name: info.name ?? '', message: info.message ?? '', email: info.email ?? '' }),
		}),
	])

	return Boolean((d1 && d2) || emailOk)
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

function contactHtml(info: { name: string; email: string; message: string }): string {
	const nl2br = (t: string) => escapeHtml(t).replaceAll('\n', '<br/>')
	return `
	<div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"; line-height: 1.5; color: #111827">
		<h2 style="margin:0 0 12px">New contact message</h2>
		<p style="margin:0 0 8px"><strong>From:</strong> ${escapeHtml(info.name || 'Anonymous')}</p>
		<p style="margin:0 0 8px"><strong>Email:</strong> ${escapeHtml(info.email || 'n/a')}</p>
		<hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0"/>
		<div>${nl2br(info.message)}</div>
	</div>
	`
}

function stripTags(html: string): string {
	return html
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}
