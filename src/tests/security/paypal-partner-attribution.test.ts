import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch globally to intercept API calls
global.fetch = vi.fn()
const mockedFetch = vi.mocked(fetch)

// Mock environment variables
vi.mock('@/constants/global.constant', () => ({
	PLATFORM_FEE: 0.05,
}))

// Mock environment variables
// Note: PAYPAL_BN_CODE is now hardcoded in the service, so this env var is ignored
process.env.PAYPAL_API_URL = 'https://api-m.sandbox.paypal.com'
process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test-client-id'
process.env.PAYPAL_CLIENT_SECRET = 'test-client-secret'
process.env.PAYPAL_MERCHANT_ID = 'test-merchant-id'

// Expected hardcoded BN Code
const EXPECTED_BN_CODE = 'CINQUINANDY_SP_PPCP'

import {
	createOrder,
	capturePayment,
	getMerchantId,
	listPayPalWebhooks,
	setupPayPalWebhooks,
	getMerchantIntegrationStatus,
} from '@/services/paypal.services'

describe('PayPal Partner Attribution Header', () => {
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

			// Mock successful API responses
			if (typeof url === 'string' && url.includes('/merchant-integrations/')) {
				// Mock merchant integration status response
				return Promise.resolve(
					new Response(
						JSON.stringify({
							status: 'success',
							primary_email_confirmed: true,
							payments_receivable: true,
						}),
						{
							status: 200,
							headers: { 'Content-Type': 'application/json' },
						}
					)
				)
			}

			return Promise.resolve(
				new Response(JSON.stringify({ status: 'success', id: 'test-response' }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				})
			)
		})
	})

	describe('createOrder', () => {
		it('should include PayPal-Partner-Attribution-Id header with hardcoded value', async () => {
			const mockBib = {
				user: { lastName: '', id: 'user-123', firstName: '' },
				status: 'available' as const,
				price: 50.0,
				originalPrice: 50.0,
				lockedAt: null,
				id: 'bib-123',
				event: {
					type: 'road' as const,
					participantCount: 0,
					name: '',
					location: '',
					image: '',
					id: 'event-123',
					distanceUnit: 'km' as const,
					distance: 0,
					date: new Date(),
				},
			}

			await createOrder('test-merchant-id', mockBib, 'en')

			// Find the create order API call (POST to /v2/checkout/orders)
			const createOrderCall = mockedFetch.mock.calls.find(
				call =>
					typeof call[0] === 'string' &&
					call[0].includes('/v2/checkout/orders') &&
					!call[0].includes('/capture') &&
					(call[1] as RequestInit)?.method === 'POST'
			)

			expect(createOrderCall).toBeDefined()

			if (createOrderCall) {
				const options = createOrderCall[1] as RequestInit
				expect(options.headers).toHaveProperty('PayPal-Partner-Attribution-Id', EXPECTED_BN_CODE)
			}
		})
	})

	describe('capturePayment', () => {
		it('should include PayPal-Partner-Attribution-Id header with hardcoded value', async () => {
			await capturePayment('ORDER-1234567890ABCDEFGH')

			// Find the capture payment API call
			const captureCall = mockedFetch.mock.calls.find(
				call => typeof call[0] === 'string' && call[0].includes('/capture')
			)

			expect(captureCall).toBeDefined()

			if (captureCall) {
				const options = captureCall[1] as RequestInit
				expect(options.headers).toHaveProperty('PayPal-Partner-Attribution-Id', EXPECTED_BN_CODE)
			}
		})
	})

	describe('getMerchantId', () => {
		it('should include PayPal-Partner-Attribution-Id header with hardcoded value', async () => {
			await getMerchantId('REFERRAL-1234567890ABCDEFGHIJ')

			// Find the get merchant ID API call
			const getMerchantCall = mockedFetch.mock.calls.find(
				call => typeof call[0] === 'string' && call[0].includes('/partner-referrals/')
			)

			expect(getMerchantCall).toBeDefined()

			if (getMerchantCall) {
				const options = getMerchantCall[1] as RequestInit
				expect(options.headers).toHaveProperty('PayPal-Partner-Attribution-Id', EXPECTED_BN_CODE)
			}
		})
	})

	describe('listPayPalWebhooks', () => {
		it('should include PayPal-Partner-Attribution-Id header with hardcoded value', async () => {
			await listPayPalWebhooks()

			// Find the list webhooks API call
			const listWebhooksCall = mockedFetch.mock.calls.find(
				call => typeof call[0] === 'string' && call[0].includes('/notifications/webhooks') && call[1]?.method === 'GET'
			)

			expect(listWebhooksCall).toBeDefined()

			if (listWebhooksCall) {
				const options = listWebhooksCall[1] as RequestInit
				expect(options.headers).toHaveProperty('PayPal-Partner-Attribution-Id', EXPECTED_BN_CODE)
			}
		})
	})

	describe('setupPayPalWebhooks', () => {
		it('should include PayPal-Partner-Attribution-Id header with hardcoded value', async () => {
			await setupPayPalWebhooks()

			// Find the setup webhooks API call
			const setupWebhooksCall = mockedFetch.mock.calls.find(
				call => typeof call[0] === 'string' && call[0].includes('/notifications/webhooks') && call[1]?.method === 'POST'
			)

			expect(setupWebhooksCall).toBeDefined()

			if (setupWebhooksCall) {
				const options = setupWebhooksCall[1] as RequestInit
				expect(options.headers).toHaveProperty('PayPal-Partner-Attribution-Id', EXPECTED_BN_CODE)
			}
		})
	})

	describe('getMerchantIntegrationStatus', () => {
		it('should include PayPal-Partner-Attribution-Id header with hardcoded value', async () => {
			await getMerchantIntegrationStatus('test-merchant-id')

			// Find the merchant status API call
			const statusCall = mockedFetch.mock.calls.find(
				call => typeof call[0] === 'string' && call[0].includes('/merchant-integrations/')
			)

			expect(statusCall).toBeDefined()

			if (statusCall) {
				const options = statusCall[1] as RequestInit
				expect(options.headers).toHaveProperty('PayPal-Partner-Attribution-Id', EXPECTED_BN_CODE)
			}
		})
	})

	describe('Hardcoded BN Code validation', () => {
		it('should always use hardcoded BN Code regardless of environment variable', async () => {
			// Set a different value in env var to prove it's not used
			const originalBnCode = process.env.PAYPAL_BN_CODE
			process.env.PAYPAL_BN_CODE = 'WRONG-CODE-SHOULD-NOT-BE-USED'

			try {
				await capturePayment('ORDER-1234567890ABCDEFGH')

				const captureCall = mockedFetch.mock.calls.find(
					call => typeof call[0] === 'string' && call[0].includes('/capture')
				)

				if (captureCall) {
					const options = captureCall[1] as RequestInit
					// Should use hardcoded value, not the env var
					expect(options.headers).toHaveProperty('PayPal-Partner-Attribution-Id', EXPECTED_BN_CODE)
					expect(options.headers).not.toHaveProperty('PayPal-Partner-Attribution-Id', 'WRONG-CODE-SHOULD-NOT-BE-USED')
				}
			} finally {
				// Restore environment variable
				if (originalBnCode !== undefined && originalBnCode !== null && originalBnCode !== '') {
					process.env.PAYPAL_BN_CODE = originalBnCode
				} else {
					delete process.env.PAYPAL_BN_CODE
				}
			}
		})
	})
})
