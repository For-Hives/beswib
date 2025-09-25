'use server'

import type { PayPalApiAction, PayPalApiLog } from '@/models/paypalApi.model'

import { pb } from '@/lib/services/pocketbase'

// Keys that must never be persisted
const SENSITIVE_KEYS = new Set([
	'access_token',
	'authorization',
	'client_secret',
	'password',
	'card',
	'cc',
	'number',
	'ssn',
	'email', // Avoid persisting payer email
	'phone',
	'paypal_client_id',
])

function sanitizeValue(value: unknown, keyPath: string[] = []): unknown {
	if (value == null) return value
	if (typeof value === 'string') {
		// Mask long tokens/ids that look like secrets in strings
		if (value.length > 80) return value.slice(0, 10) + '…' + value.slice(-6)
		return value
	}
	if (typeof value === 'number' || typeof value === 'boolean') return value
	if (Array.isArray(value)) return value.map(v => sanitizeValue(v, keyPath))
	if (typeof value === 'object') {
		const out: Record<string, unknown> = {}
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			const lower = k.toLowerCase()
			const pathLower = [...keyPath, lower].join('.')
			if (SENSITIVE_KEYS.has(lower) || /token|secret|password|authorization/.test(pathLower)) {
				out[k] = '[REDACTED]'
				continue
			}
			// Mask potential payer/contact details
			if (/email|phone|payer|contact/.test(pathLower)) {
				out[k] = '[REDACTED]'
				continue
			}
			out[k] = sanitizeValue(v, [...keyPath, k])
		}
		return out
	}
	return undefined
}

export async function extractPayPalDebugId(
	headers?: Headers | Record<string, string> | null,
	body?: unknown
): Promise<string | null> {
	try {
		// Yield once to satisfy async function contract for Server Actions context
		await Promise.resolve()
		// Accept any headers-like object (undici Headers, fetch Headers, or plain object)
		if (headers) {
			// Type guards for header-like objects
			type HeadersGet = { get: (key: string) => string | null | undefined }
			type HeadersEntries = { entries: () => Iterable<[string, string]> }
			const hasGet = (h: unknown): h is HeadersGet =>
				typeof h === 'object' && h !== null && typeof (h as { get?: unknown }).get === 'function'
			const hasEntries = (h: unknown): h is HeadersEntries =>
				typeof h === 'object' && h !== null && typeof (h as { entries?: unknown }).entries === 'function'

			// Prefer using .get if available (works for Headers from undici/fetch)
			if (hasGet(headers)) {
				const candidates = ['paypal-debug-id', 'debug_id', 'correlation-id'] as const
				for (const key of candidates) {
					const v = headers.get(key)
					if (v != null && v !== '') return v
				}
			}
			// Fallback: iterate entries if available
			if (hasEntries(headers)) {
				for (const [k, v] of headers.entries()) {
					const lowerK = k.toLowerCase()
					if (lowerK === 'paypal-debug-id' || lowerK === 'debug_id' || lowerK === 'correlation-id') {
						if (v != null && v !== '') return v
					}
				}
			}
			// Plain object support
			if (typeof headers === 'object' && !hasGet(headers)) {
				const lower: Record<string, string> = {}
				for (const [k, v] of Object.entries(headers)) lower[k.toLowerCase()] = String(v)
				const id = lower['paypal-debug-id'] ?? lower['debug_id'] ?? lower['correlation-id']
				if (id != null && id !== '') return id
			}
		}
		if (body != null && typeof body === 'object') {
			const any = body as Record<string, unknown>
			const id = (any['paypal-debug-id'] as string) ?? (any['debug_id'] as string) ?? (any['correlation-id'] as string)
			return id ?? null
		}
		return null
	} catch {
		return null
	}
}

export async function logPayPalApi(
	action: PayPalApiAction,
	params: {
		response?: Response | null
		headers?: Headers | Record<string, string> | null
		requestBody?: unknown
		responseBody?: unknown
	}
): Promise<void> {
	try {
		const response = params.response
		const headers = params.headers
		const requestBody = params.requestBody
		const responseBody = params.responseBody
		// Prefer header-derived debug ID over body
		let debugId: string | null = await extractPayPalDebugId(headers, undefined)
		if ((debugId == null || debugId === '') && response != null) {
			debugId = await extractPayPalDebugId(response.headers, undefined)
		}
		let resp: unknown = responseBody

		if (response) {
			// Attempt to read response safely
			try {
				const cloned = response.clone()
				const text = await cloned.text()
				try {
					resp = JSON.parse(text)
				} catch {
					resp = text
				}
				// Only fall back to body if we still don't have a header-derived ID
				if (debugId == null || debugId === '') {
					debugId = await extractPayPalDebugId(cloned.headers, undefined)
					if (debugId == null || debugId === '') {
						debugId = await extractPayPalDebugId(undefined, resp)
					}
				}
			} catch {
				// ignore body read issues
			}
		}

		const payload = {
			response: sanitizeValue(resp),
			request: sanitizeValue(requestBody),
		}
		await pb.collection('paypalAPI').create<PayPalApiLog>({ raw: payload, debugId: debugId ?? null, action })
	} catch (e) {
		console.warn('Failed to log PayPal API event:', e)
	}
}
