// @vitest-environment node
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockPocketbase, mockPocketbaseCollection } from '@/tests/mocks/pocketbase'

// The middleware lets every /api path through without authentication: a route handler that does not
// identify its caller answers anyone. These two did: the PayPal status of any seller named in the query
// string, and the maintenance job to whoever posted to it.

vi.mock('@clerk/nextjs/server', () => ({
	auth: vi.fn(),
}))
vi.mock('@/lib/services/pocketbase', () => ({
	pb: mockPocketbase,
}))
vi.mock('@/lib/analytics/server', () => ({
	trackServer: vi.fn(),
}))
vi.mock('@/services/paypal.services', () => ({
	getMerchantIntegrationStatus: vi.fn(),
}))

import { auth } from '@clerk/nextjs/server'
import { POST as updateExpiredBibs } from '@/app/api/maintenance/update-expired-bibs/route'
import { GET as merchantStatus } from '@/app/api/paypal/merchant-status/route'
import { GET as waitlistStatus } from '@/app/api/waitlist/status/route'
import { trackServer } from '@/lib/analytics/server'
import { getMerchantIntegrationStatus } from '@/services/paypal.services'

const MAINTENANCE_TOKEN = 'maintenance-token-of-the-test-run'

interface UserRecord {
	id: string
	clerkId: string
	role: 'admin' | 'user'
	paypalMerchantId: string | null
	paypal_kyc: boolean
	created: string
	updated: string
}

const users: UserRecord[] = [
	{ role: 'user', paypalMerchantId: 'MERCHANTALICE01', paypal_kyc: false, id: 'alice_pb', clerkId: 'clerk_alice' },
	{ role: 'user', paypalMerchantId: 'MERCHANTMALLORY', paypal_kyc: false, id: 'mallory_pb', clerkId: 'clerk_mallory' },
	{ role: 'admin', paypalMerchantId: null, paypal_kyc: false, id: 'admin_pb', clerkId: 'clerk_admin' },
].map(user => ({ ...user, created: '', updated: '' }) as UserRecord)

function signIn(clerkId: string | null) {
	vi.mocked(auth).mockResolvedValue({ userId: clerkId } as Awaited<ReturnType<typeof auth>>)
}

function maintenanceRequest(headers: Record<string, string> = {}, body: unknown = {}) {
	return new NextRequest('http://localhost:3000/api/maintenance/update-expired-bibs', {
		method: 'POST',
		headers: { 'content-type': 'application/json', ...headers },
		body: JSON.stringify(body),
	})
}

beforeEach(() => {
	vi.clearAllMocks()
	vi.spyOn(console, 'error').mockImplementation(() => {})
	vi.spyOn(console, 'info').mockImplementation(() => {})
	vi.stubEnv('MAINTENANCE_API_TOKEN', MAINTENANCE_TOKEN)

	mockPocketbase.collection.mockReturnValue(mockPocketbaseCollection)
	mockPocketbaseCollection.getFirstListItem.mockImplementation((filter: string) => {
		const user = users.find(candidate => filter === `clerkId = "${candidate.clerkId}"`)
		return user ? Promise.resolve(user) : Promise.reject(Object.assign(new Error('Not found'), { status: 404 }))
	})
	mockPocketbaseCollection.getFullList.mockResolvedValue([{ id: 'bib_expired', eventId: 'event_1' }])
	mockPocketbaseCollection.update.mockImplementation((id: string, data: object) => Promise.resolve({ id, ...data }))

	vi.mocked(getMerchantIntegrationStatus).mockResolvedValue({
		status: { primary_email_confirmed: true, payments_receivable: true, oauth_integrations: [{}] },
	} as Awaited<ReturnType<typeof getMerchantIntegrationStatus>>)
})

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllEnvs()
})

describe('GET /api/paypal/merchant-status', () => {
	it('answers 401 to a visitor who is not signed in, without asking PayPal anything', async () => {
		signIn(null)

		const response = await merchantStatus()

		expect(response.status).toBe(401)
		expect(await response.json()).toEqual({ error: 'Unauthorized' })
		expect(getMerchantIntegrationStatus).not.toHaveBeenCalled()
		expect(mockPocketbaseCollection.update).not.toHaveBeenCalled()
	})

	it('answers with the PayPal status of the signed-in user, never of a user named in the query string', async () => {
		signIn('clerk_mallory')

		// The request the browser made before: ?userId=<any seller>
		const legacyRoute = merchantStatus as unknown as (request: NextRequest) => Promise<Response>
		const response = await legacyRoute(
			new NextRequest('http://localhost:3000/api/paypal/merchant-status?userId=alice_pb')
		)

		expect(response.status).toBe(200)
		expect(getMerchantIntegrationStatus).toHaveBeenCalledExactlyOnceWith('MERCHANTMALLORY')
		// The KYC flag that the check persists is the one of the caller
		expect(mockPocketbaseCollection.update).toHaveBeenCalledExactlyOnceWith('mallory_pb', { paypal_kyc: true })
		expect(trackServer).toHaveBeenCalledExactlyOnceWith('paypal_kyc_success')
	})

	it('answers 404 to a session that has no account in the database', async () => {
		signIn('clerk_ghost')

		const response = await merchantStatus()

		expect(response.status).toBe(404)
		expect(getMerchantIntegrationStatus).not.toHaveBeenCalled()
	})

	it('keeps answering 400 to a user who has not linked PayPal', async () => {
		signIn('clerk_admin')

		const response = await merchantStatus()

		expect(response.status).toBe(400)
		expect(await response.json()).toEqual({ error: 'Merchant not linked' })
	})
})

describe('POST /api/maintenance/update-expired-bibs', () => {
	it('answers 401 to a visitor who is not signed in, and touches no bib', async () => {
		signIn(null)

		const response = await updateExpiredBibs(maintenanceRequest())

		expect(response.status).toBe(401)
		expect(mockPocketbaseCollection.getFullList).not.toHaveBeenCalled()
		expect(mockPocketbaseCollection.update).not.toHaveBeenCalled()
	})

	it('answers 401 to a signed-in user who is not an admin', async () => {
		signIn('clerk_mallory')

		const response = await updateExpiredBibs(maintenanceRequest())

		expect(response.status).toBe(401)
		expect(mockPocketbaseCollection.update).not.toHaveBeenCalled()
	})

	it.each([
		['a wrong token', { authorization: 'Bearer not-the-token' }],
		['a token of the same length', { authorization: `Bearer ${'x'.repeat(MAINTENANCE_TOKEN.length)}` }],
		['an empty token', { authorization: 'Bearer ' }],
		['the token without its scheme', { authorization: MAINTENANCE_TOKEN }],
	])('answers 401 to %s', async (_label, headers) => {
		signIn(null)

		const response = await updateExpiredBibs(maintenanceRequest(headers))

		expect(response.status).toBe(401)
		expect(mockPocketbaseCollection.update).not.toHaveBeenCalled()
	})

	it('accepts no token at all when the deployment has none configured', async () => {
		vi.stubEnv('MAINTENANCE_API_TOKEN', '')
		signIn(null)

		expect((await updateExpiredBibs(maintenanceRequest({ authorization: 'Bearer ' }))).status).toBe(401)
		expect((await updateExpiredBibs(maintenanceRequest({ authorization: 'Bearer undefined' }))).status).toBe(401)
		expect(mockPocketbaseCollection.update).not.toHaveBeenCalled()
	})

	it('runs for a scheduler that sends the token of the deployment', async () => {
		signIn(null)

		const response = await updateExpiredBibs(maintenanceRequest({ authorization: `Bearer ${MAINTENANCE_TOKEN}` }))

		expect(response.status).toBe(200)
		expect(await response.json()).toMatchObject({ updatedCount: 1, success: true })
		expect(mockPocketbaseCollection.update).toHaveBeenCalledExactlyOnceWith(
			'bib_expired',
			expect.objectContaining({ status: 'withdrawn' })
		)
	})

	it('runs for an admin signed in', async () => {
		signIn('clerk_admin')

		const response = await updateExpiredBibs(maintenanceRequest())

		expect(response.status).toBe(200)
		expect(await response.json()).toMatchObject({ updatedCount: 1, success: true })
	})

	it('cannot be widened to other bibs through the seller id of the body', async () => {
		signIn('clerk_admin')

		await updateExpiredBibs(maintenanceRequest({}, { sellerUserId: "x' || status = 'available" }))

		const [{ filter }] = mockPocketbaseCollection.getFullList.mock.calls[0] as [{ filter: string }]
		// The value stays one quoted string: its quotes are escaped, none of them closes it
		expect(filter).toContain(String.raw`&& sellerUserId = 'x\' || status = \'available'`)
		expect(filter.endsWith("'")).toBe(true)
	})

	it('ignores a seller id that is not a string', async () => {
		signIn('clerk_admin')

		await updateExpiredBibs(maintenanceRequest({}, { sellerUserId: { $ne: '' } }))

		const [{ filter }] = mockPocketbaseCollection.getFullList.mock.calls[0] as [{ filter: string }]
		expect(filter).not.toContain('sellerUserId')
	})
})

describe('GET /api/waitlist/status', () => {
	it('keeps the event id of the query string inside its quotes', async () => {
		signIn('clerk_mallory')
		const eventId = 'x" || user_id != "'

		await waitlistStatus(
			new Request(`http://localhost:3000/api/waitlist/status?eventId=${encodeURIComponent(eventId)}`)
		)

		const filters = mockPocketbaseCollection.getFirstListItem.mock.calls.map(([filter]) => filter as string)
		expect(filters.at(-1)).toBe(String.raw`user_id = "mallory_pb" && event_id = "x\" || user_id != \""`)
	})

	it('still answers 401 to a visitor who is not signed in', async () => {
		signIn(null)

		const response = await waitlistStatus(new Request('http://localhost:3000/api/waitlist/status?eventId=event_1'))

		expect(response.status).toBe(401)
	})
})
