import { mockPocketbase, mockPocketbaseCollection } from '@/tests/mocks/pocketbase'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/services/pocketbase', () => ({
	pb: mockPocketbase,
}))

import { extractPayPalDebugId, logPayPalApi } from '@/services/paypalApiLog.services'

describe('paypalApiLog.services', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('extractPayPalDebugId reads from Headers', async () => {
		const headers = new Headers({ 'paypal-debug-id': 'HDR-123' })
		const id = await extractPayPalDebugId(headers, undefined)
		expect(id).toBe('HDR-123')
	})

	it('extractPayPalDebugId reads from plain headers object', async () => {
		const headers = { 'Correlation-Id': 'CORR-999' }
		const id = await extractPayPalDebugId(headers, undefined)
		expect(id).toBe('CORR-999')
	})

	it('extractPayPalDebugId falls back to body fields', async () => {
		const id = await extractPayPalDebugId(undefined, { debug_id: 'DBG-555' })
		expect(id).toBe('DBG-555')
	})

	it('logPayPalApi stores sanitized payload and debugId', async () => {
		const respBody = JSON.stringify({ payer: { email: 'payer@example.com' }, debug_id: 'DBG-777' })
		const response = new Response(respBody, {
			status: 200,
			headers: { 'paypal-debug-id': 'HDR-ABC', 'content-type': 'application/json' },
		})

		const requestBody = {
			email: 'user@example.com',
			Authorization: 'Bearer super-secret-token',
			amount: 10,
		}

		await logPayPalApi('OrderCreate', { response, requestBody })

		expect(mockPocketbase.collection).toHaveBeenCalledWith('paypalAPI')
		expect(mockPocketbaseCollection.create).toHaveBeenCalledTimes(1)

		const payload = mockPocketbaseCollection.create.mock.calls[0][0] as {
			action: string
			debugId: string | null
			raw: { request: Record<string, unknown>; response: Record<string, unknown> }
		}

		// Action and debug id present
		expect(payload.action).toBe('OrderCreate')
		expect(payload.debugId).toBe('HDR-ABC')

		// Request fields sanitized
		expect(payload.raw.request.email).toBe('[REDACTED]')
		expect(payload.raw.request.Authorization).toBe('[REDACTED]')
		expect(payload.raw.request.amount).toBe(10)

		// Response fields sanitized
		expect(payload.raw.response.payer).toBe('[REDACTED]')
	})
})
