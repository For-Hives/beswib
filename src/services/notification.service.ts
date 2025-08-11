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
