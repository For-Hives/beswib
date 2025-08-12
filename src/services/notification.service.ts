'use server'

// Minimal notification service to support future expansion
// Currently provides sendSaleAlert() to ping a Discord webhook with @here

type SaleAlertInfo = {
	orderId?: string | null
	bibId?: string | null
	amount?: number | null
	currency?: string | null
}

/**
 * Sends a simple @here alert to a Discord webhook when a sale completes.
 * The webhook URL must be provided via env var DISCORD_SALES_WEBHOOK_URL.
 * Fails silently and returns false if the webhook URL is not set or if the request fails.
 */
export async function sendSaleAlert(info?: SaleAlertInfo): Promise<boolean> {
	const webhookUrl = process.env.DISCORD_SALES_WEBHOOK_URL ?? ''
	if (webhookUrl.length === 0) {
		// No webhook configured; skip without failing the flow
		return false
	}

	const parts: string[] = ['@here New sale completed']
	if (typeof info?.orderId === 'string' && info.orderId.length > 0) parts.push(`order: ${info.orderId}`)
	if (typeof info?.bibId === 'string' && info.bibId.length > 0) parts.push(`bib: ${info.bibId}`)
	if (info?.amount !== null && info?.amount !== undefined) {
		const hasCurrency = typeof info?.currency === 'string' && info.currency.length > 0
		parts.push(`amount: ${info.amount}${hasCurrency ? ` ${info.currency}` : ''}`)
	}

	const content = parts.join(' | ')

	try {
		const res = await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content }),
			// Discord doesn't require credentials; keep request simple
		})
		return res.ok
	} catch {
		// Swallow errors; notifications must not break primary flow
		return false
	}
}

type ContactMessageInfo = {
	name: string
	email: string
	message: string
}

/**
 * Sends a contact form message to a dedicated Discord webhook.
 * Uses DISCORD_CONTACT_WEBHOOK_URL env var. If not provided, falls back to DISCORD_SALES_WEBHOOK_URL.
 * Posts two messages: a summary line with @here, then the full message as a code block.
 */
export async function sendContactMessage(info: ContactMessageInfo): Promise<boolean> {
	const primary = process.env.DISCORD_CONTACT_WEBHOOK_URL ?? ''
	const fallback = process.env.DISCORD_SALES_WEBHOOK_URL ?? ''
	const webhookUrl = primary.length > 0 ? primary : fallback
	if (webhookUrl.length === 0) return false

	const safe = (s: string) => s.replaceAll('`', 'ˋ').slice(0, 5000)
	const name = safe(info.name ?? '').trim()
	const email = safe(info.email ?? '').trim()
	const msg = safe(info.message ?? '').trim()

	const summary = `@here New contact form message | from: ${name || 'Anonymous'} | email: ${email || 'n/a'}`
	const full = ['```', msg.slice(0, 1900), '```'].join('\n')

	try {
		const res1 = await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content: summary }),
		})
		const res2 = await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content: full }),
		})
		return res1.ok && res2.ok
	} catch {
		return false
	}
}
