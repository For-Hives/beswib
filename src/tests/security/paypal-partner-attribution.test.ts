import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch globally to intercept API calls
global.fetch = vi.fn()
const mockedFetch = vi.mocked(fetch)

// Mock environment variables
vi.mock('@/constants/global.constant', () => ({
	PLATFORM_FEE: 0.05,
}))

// Mock environment variables
process.env.PAYPAL_BN_CODE = 'TEST-BN-CODE-12345'
process.env.PAYPAL_API_URL = 'https://api-m.sandbox.paypal.com'
process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test-client-id'
process.env.PAYPAL_CLIENT_SECRET = 'test-client-secret'
process.env.PAYPAL_MERCHANT_ID = 'test-merchant-id'

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
			return Promise.resolve(
				new Response(JSON.stringify({ status: 'success', id: 'test-response' }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				})
			)
		})
	})

	describe('createOrder', () => {
		it('should include PayPal-Partner-Attribution-Id header', async () => {
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

			// Find the create order API call (should be the second call after OAuth)
			const createOrderCall = mockedFetch.mock.calls.find(
				call => typeof call[0] === 'string' && call[0].includes('/v2/checkout/orders') && !call[0].includes('/capture')
			)

			expect(createOrderCall).toBeDefined()

			if (createOrderCall) {
				const options = createOrderCall[1] as RequestInit
				expect(options.headers).toHaveProperty('PayPal-Partner-Attribution-Id', 'TEST-BN-CODE-12345')
			}
		})
	})

	describe('capturePayment', () => {
		it('should include PayPal-Partner-Attribution-Id header', async () => {
			await capturePayment('ORDER-1234567890ABCDEFGH')

			// Find the capture payment API call
			const captureCall = mockedFetch.mock.calls.find(
				call => typeof call[0] === 'string' && call[0].includes('/capture')
			)

			expect(captureCall).toBeDefined()

			if (captureCall) {
				const options = captureCall[1] as RequestInit
				expect(options.headers).toHaveProperty('PayPal-Partner-Attribution-Id', 'TEST-BN-CODE-12345')
			}
		})
	})

	describe('getMerchantId', () => {
		it('should include PayPal-Partner-Attribution-Id header', async () => {
			await getMerchantId('REFERRAL-1234567890ABCDEFGHIJ')

			// Find the get merchant ID API call
			const getMerchantCall = mockedFetch.mock.calls.find(
				call => typeof call[0] === 'string' && call[0].includes('/partner-referrals/')
			)

			expect(getMerchantCall).toBeDefined()

			if (getMerchantCall) {
				const options = getMerchantCall[1] as RequestInit
				expect(options.headers).toHaveProperty('PayPal-Partner-Attribution-Id', 'TEST-BN-CODE-12345')
			}
		})
	})

	describe('listPayPalWebhooks', () => {
		it('should include PayPal-Partner-Attribution-Id header', async () => {
			await listPayPalWebhooks()

			// Find the list webhooks API call
			const listWebhooksCall = mockedFetch.mock.calls.find(
				call => typeof call[0] === 'string' && call[0].includes('/notifications/webhooks') && call[1]?.method === 'GET'
			)

			expect(listWebhooksCall).toBeDefined()

			if (listWebhooksCall) {
				const options = listWebhooksCall[1] as RequestInit
				expect(options.headers).toHaveProperty('PayPal-Partner-Attribution-Id', 'TEST-BN-CODE-12345')
			}
		})
	})

	describe('setupPayPalWebhooks', () => {
		it('should include PayPal-Partner-Attribution-Id header', async () => {
			await setupPayPalWebhooks()

			// Find the setup webhooks API call
			const setupWebhooksCall = mockedFetch.mock.calls.find(
				call => typeof call[0] === 'string' && call[0].includes('/notifications/webhooks') && call[1]?.method === 'POST'
			)

			expect(setupWebhooksCall).toBeDefined()

			if (setupWebhooksCall) {
				const options = setupWebhooksCall[1] as RequestInit
				expect(options.headers).toHaveProperty('PayPal-Partner-Attribution-Id', 'TEST-BN-CODE-12345')
			}
		})
	})

	describe('getMerchantIntegrationStatus', () => {
		it('should include PayPal-Partner-Attribution-Id header', async () => {
			await getMerchantIntegrationStatus('test-merchant-id')

			// Find the merchant status API call
			const statusCall = mockedFetch.mock.calls.find(
				call => typeof call[0] === 'string' && call[0].includes('/merchant-integrations/')
			)

			expect(statusCall).toBeDefined()

			if (statusCall) {
				const options = statusCall[1] as RequestInit
				expect(options.headers).toHaveProperty('PayPal-Partner-Attribution-Id', 'TEST-BN-CODE-12345')
			}
		})
	})

	describe('Environment variable validation', () => {
		it('should use empty string when PAYPAL_BN_CODE is not set', async () => {
			const originalBnCode = process.env.PAYPAL_BN_CODE
			delete process.env.PAYPAL_BN_CODE

			try {
				await capturePayment('ORDER-1234567890ABCDEFGH')

				const captureCall = mockedFetch.mock.calls.find(
					call => typeof call[0] === 'string' && call[0].includes('/capture')
				)

				if (captureCall) {
					const options = captureCall[1] as RequestInit
					expect(options.headers).toHaveProperty('PayPal-Partner-Attribution-Id', '')
				}
			} finally {
				// Restore environment variable
				process.env.PAYPAL_BN_CODE = originalBnCode
			}
		})
	})
})
