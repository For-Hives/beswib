import 'server-only'

/**
 * Server-side check of a Cloudflare Turnstile token (widget « beswib.com contact »).
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export interface TurnstileResult {
	success: boolean
	/** Cloudflare error codes: logged, never shown to the visitor. */
	errorCodes?: string[]
}

/**
 * Validates a Turnstile token.
 * Without `TURNSTILE_SECRET_KEY`: refused in production (a forgotten variable must not silently switch the
 * protection off), skipped in development and tests.
 */
export async function verifyTurnstile(token: unknown): Promise<TurnstileResult> {
	const secret = process.env.TURNSTILE_SECRET_KEY

	if (secret == null || secret === '') {
		if (process.env.NODE_ENV === 'production') {
			console.error('[Turnstile] TURNSTILE_SECRET_KEY is missing in production: submission refused.')
			return { success: false, errorCodes: ['missing-secret'] }
		}
		return { success: true }
	}

	if (typeof token !== 'string' || token === '' || token.length > 2048) {
		return { success: false, errorCodes: ['missing-input-response'] }
	}

	try {
		const res = await fetch(VERIFY_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ secret, response: token }),
			signal: AbortSignal.timeout(10_000),
		})
		const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] }
		return { success: data.success === true, errorCodes: data['error-codes'] }
	} catch (error) {
		console.error('[Turnstile] Verification failed:', error instanceof Error ? error.message : error)
		return { success: false, errorCodes: ['internal-error'] }
	}
}
