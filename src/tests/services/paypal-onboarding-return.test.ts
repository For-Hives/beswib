// @vitest-environment node
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/lib/i18n/config'

// PayPal sends the seller back to return_url once the onboarding is done. The address used to be
// /en/paypal/callback, a page that never existed: the seller came back on the not-found page, in English.

const { logPayPalApi } = vi.hoisted(() => ({ logPayPalApi: vi.fn() }))

vi.mock('@/services/paypalApiLog.services', () => ({ logPayPalApi }))
vi.mock('@/services/transaction.services', () => ({ updateTransaction: vi.fn(), getTransactionByOrderId: vi.fn() }))
vi.mock('@/lib/analytics/server', () => ({ trackServer: vi.fn() }))

import { onboardSeller } from '@/services/paypal.services'
import { initiatePayPalOnboarding } from '@/services/paypal-onboarding.services'

vi.mock('@/services/user.services', () => ({ updateUser: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const SITE = 'https://staging.beswib.com'
const SELLER_ID = 'abcdefghij12345'

const mockedFetch = vi.fn<typeof fetch>()

interface ReferralBody {
	tracking_id: string
	partner_config_override: { return_url: string }
}

// The body of the partner referral PayPal received
function referralSent(): ReferralBody {
	const call = mockedFetch.mock.calls.find(([url]) => String(url).includes('/v2/customer/partner-referrals'))
	if (call === undefined) throw new Error('No partner referral was sent to PayPal')
	return JSON.parse(String(call[1]?.body)) as ReferralBody
}

function returnUrlSent(): URL {
	return new URL(referralSent().partner_config_override.return_url)
}

beforeEach(() => {
	vi.stubGlobal('fetch', mockedFetch)
	vi.stubEnv('NEXT_PUBLIC_BASE_URL', `${SITE}/`)
	vi.stubEnv('NEXT_PUBLIC_PAYPAL_CLIENT_ID', 'test-client-id')
	vi.stubEnv('PAYPAL_CLIENT_SECRET', 'test-client-secret')
	vi.stubEnv('PAYPAL_API_URL', 'https://api-m.sandbox.paypal.com')

	mockedFetch.mockImplementation(url => {
		const body = String(url).includes('/oauth2/token')
			? { token_type: 'Bearer', access_token: 'test-token' }
			: { links: [{ rel: 'action_url', href: 'https://www.sandbox.paypal.com/onboard' }], id: 'referral-1' }
		return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))
	})
})

afterEach(() => {
	vi.unstubAllEnvs()
	vi.unstubAllGlobals()
	vi.clearAllMocks()
})

describe('where PayPal sends the seller back after the onboarding', () => {
	it('is the profile page, the one that shows the PayPal onboarding card', async () => {
		await onboardSeller(SELLER_ID, 'fr')

		expect(returnUrlSent().href).toBe(`${SITE}/fr/profile`)
		expect(existsSync(join(process.cwd(), 'src/app/[locale]/profile/page.tsx'))).toBe(true)
	})

	it.each(i18n.locales)('keeps the %s locale of the seller', async locale => {
		await onboardSeller(SELLER_ID, locale)

		expect(returnUrlSent().pathname).toBe(`/${locale}/profile`)
	})

	it.each([
		['none', undefined],
		['an unknown one', 'xx'],
		['a path', 'fr/../../admin'],
		['another site', '//evil.tld'],
		['capitals', 'FR'],
	])('falls back to the default locale when the locale given is %s', async (_name, locale) => {
		await onboardSeller(SELLER_ID, locale)

		expect(returnUrlSent().href).toBe(`${SITE}/en/profile`)
	})

	it('no longer writes the id of the seller in the address: the page reads nothing from it', async () => {
		await onboardSeller(SELLER_ID, 'fr')

		expect(returnUrlSent().search).toBe('')
		expect(returnUrlSent().href).not.toContain(SELLER_ID)
		// PayPal still needs it, as the tracking id the webhook gives back
		expect(referralSent().tracking_id).toBe(SELLER_ID)
	})

	it('logs the address that was really sent', async () => {
		await onboardSeller(SELLER_ID, 'de')

		const logged = logPayPalApi.mock.calls.find(([action]) => action === 'PartnerReferralCreate')?.[1] as
			| { requestBody: ReferralBody }
			| undefined
		expect(logged?.requestBody.partner_config_override.return_url).toBe(`${SITE}/de/profile`)
	})

	it('still answers with the address of the PayPal onboarding', async () => {
		expect(await onboardSeller(SELLER_ID, 'fr')).toEqual({
			referral_id: 'referral-1',
			action_url: 'https://www.sandbox.paypal.com/onboard',
		})
	})
})

describe('the action the profile page calls', () => {
	it('passes the locale of the page on to the return address', async () => {
		const result = await initiatePayPalOnboarding(SELLER_ID, 'it')

		expect(result.actionUrl).toBe('https://www.sandbox.paypal.com/onboard')
		expect(returnUrlSent().href).toBe(`${SITE}/it/profile`)
	})
})
