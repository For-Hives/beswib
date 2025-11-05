import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock fetch globally to intercept API calls
global.fetch = vi.fn()
const mockedFetch = vi.mocked(fetch)

// Mock environment variables
// Note: PAYPAL_BN_CODE is now hardcoded in the service, not needed here
process.env.PAYPAL_API_URL = 'https://api-m.sandbox.paypal.com'
process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test-client-id'
process.env.PAYPAL_CLIENT_SECRET = 'test-client-secret'
process.env.PAYPAL_MERCHANT_ID = 'test-merchant-id'

import { capturePayment } from '@/services/paypal.services'

describe('PayPal INSTRUMENT_DECLINED Error Handling', () => {
	beforeEach(() => {
		vi.clearAllMocks()

		// Mock successful OAuth token response
		mockedFetch.mockImplementation(url => {
			if (typeof url === 'string' && url.includes('/oauth2/token')) {
				return Promise.resolve(
					new Response(JSON.stringify({ token_type: 'Bearer', access_token: 'test-token' }), {
						status: 200,
						headers: { 'Content-Type': 'application/json' },
					})
				)
			}

			// Default to success response for other calls
			return Promise.resolve(
				new Response(JSON.stringify({ status: 'success', id: 'test-response' }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				})
			)
		})
	})

	describe('PayPal Error Response Parsing', () => {
		it('should detect INSTRUMENT_DECLINED from JSON error response', async () => {
			const errorResponse = {
				name: 'INSTRUMENT_DECLINED',
				message: 'The payment method was declined by the processor.',
				details: [
					{
						issue: 'INSTRUMENT_DECLINED',
						description: 'The payment method was declined by the processor.',
					},
				],
			}

			// Mock error response from PayPal API
			mockedFetch.mockImplementation(url => {
				if (typeof url === 'string' && url.includes('/oauth2/token')) {
					return Promise.resolve(
						new Response(JSON.stringify({ token_type: 'Bearer', access_token: 'test-token' }), {
							status: 200,
						})
					)
				}

				if (typeof url === 'string' && url.includes('/capture')) {
					return Promise.resolve(
						new Response(JSON.stringify(errorResponse), {
							status: 422,
							headers: { 'Content-Type': 'application/json' },
						})
					)
				}

				return Promise.resolve(new Response('{}', { status: 200 }))
			})

			const result = await capturePayment('ORDER-1234567890ABCDEFGH')

			expect(result.error).toBeDefined()
			expect(result.isInstrumentDeclined).toBe(true)
			expect(result.errorCode).toBe('INSTRUMENT_DECLINED')
		})

		it('should detect INSTRUMENT_DECLINED from error string', async () => {
			// Mock error response from PayPal API with string containing INSTRUMENT_DECLINED
			mockedFetch.mockImplementation(url => {
				if (typeof url === 'string' && url.includes('/oauth2/token')) {
					return Promise.resolve(
						new Response(JSON.stringify({ token_type: 'Bearer', access_token: 'test-token' }), {
							status: 200,
						})
					)
				}

				if (typeof url === 'string' && url.includes('/capture')) {
					return Promise.resolve(
						new Response('INSTRUMENT_DECLINED: The payment method was declined', {
							status: 422,
							headers: { 'Content-Type': 'text/plain' },
						})
					)
				}

				return Promise.resolve(new Response('{}', { status: 200 }))
			})

			const result = await capturePayment('ORDER-1234567890ABCDEFGH')

			expect(result.error).toBeDefined()
			expect(result.isInstrumentDeclined).toBe(true)
			expect(result.errorCode).toBe('INSTRUMENT_DECLINED')
		})

		it('should handle other PayPal errors without INSTRUMENT_DECLINED flag', async () => {
			const errorResponse = {
				name: 'INSUFFICIENT_FUNDS',
				message: 'The payment method has insufficient funds.',
			}

			// Mock error response from PayPal API
			mockedFetch.mockImplementation(url => {
				if (typeof url === 'string' && url.includes('/oauth2/token')) {
					return Promise.resolve(
						new Response(JSON.stringify({ token_type: 'Bearer', access_token: 'test-token' }), {
							status: 200,
						})
					)
				}

				if (typeof url === 'string' && url.includes('/capture')) {
					return Promise.resolve(
						new Response(JSON.stringify(errorResponse), {
							status: 422,
							headers: { 'Content-Type': 'application/json' },
						})
					)
				}

				return Promise.resolve(new Response('{}', { status: 200 }))
			})

			const result = await capturePayment('ORDER-1234567890ABCDEFGH')

			expect(result.error).toBeDefined()
			expect(result.isInstrumentDeclined).toBe(false)
			expect(result.errorCode).toBe('INSUFFICIENT_FUNDS')
		})

		it('should handle successful capture without error flags', async () => {
			const successResponse = {
				status: 'COMPLETED',
				id: 'CAPTURE-12345',
				amount: { value: '50.00', currency_code: 'EUR' },
			}

			// Mock successful response
			mockedFetch.mockImplementation(url => {
				if (typeof url === 'string' && url.includes('/oauth2/token')) {
					return Promise.resolve(
						new Response(JSON.stringify({ token_type: 'Bearer', access_token: 'test-token' }), {
							status: 200,
						})
					)
				}

				if (typeof url === 'string' && url.includes('/capture')) {
					return Promise.resolve(
						new Response(JSON.stringify(successResponse), {
							status: 200,
							headers: { 'Content-Type': 'application/json' },
						})
					)
				}

				return Promise.resolve(new Response('{}', { status: 200 }))
			})

			const result = await capturePayment('ORDER-1234567890ABCDEFGH')

			expect(result.data).toBeDefined()
			expect(result.error).toBeUndefined()
			expect(result.isInstrumentDeclined).toBeUndefined()
			expect(result.errorCode).toBeUndefined()
		})
	})

	describe('Error Response Format Variations', () => {
		it('should parse error from details array format', async () => {
			const errorResponse = {
				details: [
					{
						issue: 'INSTRUMENT_DECLINED',
						description: 'The funding source is declined',
					},
				],
			}

			mockedFetch.mockImplementation(url => {
				if (typeof url === 'string' && url.includes('/oauth2/token')) {
					return Promise.resolve(
						new Response(JSON.stringify({ token_type: 'Bearer', access_token: 'test-token' }), {
							status: 200,
						})
					)
				}

				if (typeof url === 'string' && url.includes('/capture')) {
					return Promise.resolve(
						new Response(JSON.stringify(errorResponse), {
							status: 422,
							headers: { 'Content-Type': 'application/json' },
						})
					)
				}

				return Promise.resolve(new Response('{}', { status: 200 }))
			})

			const result = await capturePayment('ORDER-1234567890ABCDEFGH')

			expect(result.isInstrumentDeclined).toBe(true)
			expect(result.errorCode).toBe('INSTRUMENT_DECLINED')
		})

		it('should parse error from simple error object format', async () => {
			const errorResponse = {
				error_description: 'Payment method declined',
				error: 'INSTRUMENT_DECLINED',
			}

			mockedFetch.mockImplementation(url => {
				if (typeof url === 'string' && url.includes('/oauth2/token')) {
					return Promise.resolve(
						new Response(JSON.stringify({ token_type: 'Bearer', access_token: 'test-token' }), {
							status: 200,
						})
					)
				}

				if (typeof url === 'string' && url.includes('/capture')) {
					return Promise.resolve(
						new Response(JSON.stringify(errorResponse), {
							status: 422,
							headers: { 'Content-Type': 'application/json' },
						})
					)
				}

				return Promise.resolve(new Response('{}', { status: 200 }))
			})

			const result = await capturePayment('ORDER-1234567890ABCDEFGH')

			expect(result.isInstrumentDeclined).toBe(true)
			expect(result.errorCode).toBe('INSTRUMENT_DECLINED')
		})
	})

	describe('Other Recoverable Errors', () => {
		it('should detect INSUFFICIENT_FUNDS error', async () => {
			mockedFetch.mockImplementation(url => {
				if (typeof url === 'string' && url.includes('/oauth2/token')) {
					return Promise.resolve(
						new Response(JSON.stringify({ token_type: 'Bearer', access_token: 'test-token' }), {
							status: 200,
						})
					)
				}

				if (typeof url === 'string' && url.includes('/capture')) {
					return Promise.resolve(
						new Response('Error: INSUFFICIENT_FUNDS in account', {
							status: 422,
							headers: { 'Content-Type': 'text/plain' },
						})
					)
				}

				return Promise.resolve(new Response('{}', { status: 200 }))
			})

			const result = await capturePayment('ORDER-1234567890ABCDEFGH')

			expect(result.errorCode).toBe('INSUFFICIENT_FUNDS')
			expect(result.isInstrumentDeclined).toBe(false)
		})

		it('should detect PAYER_ACCOUNT_RESTRICTED error', async () => {
			mockedFetch.mockImplementation(url => {
				if (typeof url === 'string' && url.includes('/oauth2/token')) {
					return Promise.resolve(
						new Response(JSON.stringify({ token_type: 'Bearer', access_token: 'test-token' }), {
							status: 200,
						})
					)
				}

				if (typeof url === 'string' && url.includes('/capture')) {
					return Promise.resolve(
						new Response('PayPal API error: PAYER_ACCOUNT_RESTRICTED', {
							status: 422,
							headers: { 'Content-Type': 'text/plain' },
						})
					)
				}

				return Promise.resolve(new Response('{}', { status: 200 }))
			})

			const result = await capturePayment('ORDER-1234567890ABCDEFGH')

			expect(result.errorCode).toBe('PAYER_ACCOUNT_RESTRICTED')
			expect(result.isInstrumentDeclined).toBe(false)
		})
	})
})
