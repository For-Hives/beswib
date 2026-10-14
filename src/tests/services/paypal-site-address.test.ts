import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { BibSale } from '@/models/marketplace.model'

vi.mock('@/services/paypalApiLog.services', () => ({ logPayPalApi: vi.fn(async () => undefined) }))
vi.mock('@/services/transaction.services', () => ({ getTransactionByOrderId: vi.fn(), updateTransaction: vi.fn() }))
vi.mock('@/lib/analytics/server', () => ({ trackServer: vi.fn() }))

import { createOrder, setupPayPalWebhooks } from '@/services/paypal.services'

// The addresses of the site that PayPal is given: where the buyer comes back to after a payment,
// and where PayPal sends its webhooks. Without NEXT_PUBLIC_BASE_URL they used to be localhost
// ones, and the deployments only name themselves with SERVER_URL.

const SELLER = 'SELLERMERCHANT1'

const bib = {
	id: 'bib000000000001',
	price: 60,
	event: {
		name: 'Trail des Templiers',
		date: '2027-05-20',
		distance: 42,
		distanceUnit: 'km',
		type: 'trail',
		location: 'Millau',
	},
} as unknown as BibSale

/** What was posted to the PayPal endpoint whose path contains `fragment`, as an object. */
function postedTo(fragment: string): Record<string, unknown> {
	const call = vi.mocked(fetch).mock.calls.find(([url]) => String(url).includes(fragment))
	expect(call, `no request to ${fragment}`).toBeDefined()
	return JSON.parse(String(call?.[1]?.body)) as Record<string, unknown>
}

beforeEach(() => {
	vi.stubGlobal(
		'fetch',
		vi.fn(async (url: string | URL | Request) => {
			const address = String(url)
			if (address.includes('/v1/oauth2/token')) return Response.json({ access_token: 'token', expires_in: 3600 })
			if (address.includes('/merchant-integrations/')) {
				return Response.json({ payments_receivable: true, primary_email_confirmed: true, merchant_id: SELLER })
			}
			if (address.includes('/v2/checkout/orders')) return Response.json({ id: '5O190127TN364715T' }, { status: 201 })
			if (address.includes('/v1/notifications/webhooks')) return Response.json({ id: 'WH-1' }, { status: 201 })
			return new Response('not expected', { status: 500 })
		})
	)
	vi.spyOn(console, 'info').mockImplementation(() => undefined)
	// A deployment: a production build that names itself with the older variable only
	vi.stubEnv('NODE_ENV', 'production')
	vi.stubEnv('PAYPAL_MERCHANT_ID', 'PLATFORMMERCHANT')
	vi.stubEnv('NEXT_PUBLIC_BASE_URL', undefined)
	vi.stubEnv('NEXT_URL_SERVER_URL', undefined)
	vi.stubEnv('SERVER_URL', 'https://beswib.com')
})

afterEach(() => {
	vi.unstubAllGlobals()
	vi.unstubAllEnvs()
	vi.restoreAllMocks()
})

describe('the addresses of the site given to PayPal', () => {
	it('sends the buyer back to the site the deployment names with SERVER_URL, in their language', async () => {
		expect(await createOrder(SELLER, bib, 'fr')).toEqual({ id: '5O190127TN364715T' })

		expect(postedTo('/v2/checkout/orders').application_context).toMatchObject({
			return_url: 'https://beswib.com/fr/purchase/success',
			cancel_url: 'https://beswib.com/fr/marketplace',
		})
	})

	it('prefers NEXT_PUBLIC_BASE_URL when the deployment has it, without its trailing slash', async () => {
		vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://staging.beswib.com/')

		await createOrder(SELLER, bib)

		expect(postedTo('/v2/checkout/orders').application_context).toMatchObject({
			return_url: 'https://staging.beswib.com/en/purchase/success',
			cancel_url: 'https://staging.beswib.com/en/marketplace',
		})
	})

	it('registers the webhook on the same address', async () => {
		expect(await setupPayPalWebhooks()).toEqual({ success: true })

		expect(postedTo('/v1/notifications/webhooks').url).toBe('https://beswib.com/api/webhooks/paypal')
	})

	it('never gives PayPal a local address from a production build', async () => {
		vi.stubEnv('SERVER_URL', undefined)
		vi.spyOn(console, 'warn').mockImplementation(() => undefined)

		await createOrder(SELLER, bib, 'fr')

		expect(JSON.stringify(postedTo('/v2/checkout/orders'))).not.toContain('localhost')
	})
})
