// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as Sentry from '@sentry/nextjs'
import { beforeEach, describe, expect, it } from 'vitest'

import { dataCollection } from '../../../sentry.data-collection'

// Since Sentry 11 every category of `dataCollection` is collected unless it is switched off, and nothing fails
// when a line disappears: the SDK just starts sending more. These tests are the alarm.

const INIT_FILES = ['sentry.server.config.ts', 'sentry.edge.config.ts', 'instrumentation-client.ts']

const denyList = (behavior: unknown): string[] => {
	expect(behavior).toHaveProperty('deny')
	return (behavior as { deny: string[] }).deny
}

describe('Sentry data collection policy', () => {
	it('collects nothing personal on its own', () => {
		expect(dataCollection.userInfo).toBe(false)
		expect(dataCollection.cookies).toBe(false)
		expect(dataCollection.httpBodies).toEqual([])
		expect(dataCollection.genAI).toEqual({ inputs: false, outputs: false })
		expect(dataCollection.graphQL).toEqual({ document: false, variables: false })
		expect(dataCollection.databaseQueryData).toBe(false)
		expect(dataCollection.queues).toBe(false)
		expect(dataCollection.stackFrameVariables).toBe(false)
	})

	it('masks the headers that carry an address, an identity or a URL copied with its query string', () => {
		const { request, response } = dataCollection.httpHeaders as { request: unknown; response: unknown }
		expect(denyList(request)).toEqual(
			expect.arrayContaining(['forwarded', '-ip', 'remote-', 'via', '-user', 'x-clerk', 'referer'])
		)
		expect(denyList(response)).toEqual(expect.arrayContaining(['forwarded', '-ip', 'remote-', 'via', '-user']))
	})

	it('masks the query parameters that open a private listing or a session, or that name a person', () => {
		expect(denyList(dataCollection.urlQueryParams)).toEqual(
			expect.arrayContaining(['forwarded', '-ip', 'remote-', 'via', '-user', 'tkn', '__clerk', 'redirect'])
		)
		expect(denyList(dataCollection.urlQueryParams)).toEqual(
			expect.arrayContaining(['mail', 'name', 'message', 'user', 'tracking', 'merchant', 'phone', 'filter'])
		)
	})

	it.each(INIT_FILES)('%s hands the policy to Sentry.init', file => {
		const source = readFileSync(join(process.cwd(), file), 'utf8')
		const init = source.slice(source.indexOf('Sentry.init({'))
		expect(init).toMatch(/^\tdataCollection,$/m)
		// A second policy written next to the shared one would win over it without anyone noticing
		expect(source).not.toMatch(/dataCollection\s*:/)
	})

	it('keeps the telemetry of the source-map upload CLI off at build time', () => {
		const source = readFileSync(join(process.cwd(), 'next.config.ts'), 'utf8')
		// A top-level statement, so that it has run by the time the upload starts; the CLI only stays quiet for '1'
		expect(source).toMatch(/^process\.env\.SENTRY_CLI_NO_TELEMETRY \?\?= '1'$/m)
	})
})

// The lists above are only names: what counts is what the SDK does with them. This hands the policy to a server
// client of the installed SDK, reports one error per request and reads the event back from the transport, so a
// URL of this app that carries a person is checked against the SDK's own matching (and against its next version).
describe('what the SDK sends about a request under the policy', () => {
	interface SentRequest {
		url?: string
		query_string?: string
		headers?: Record<string, string>
		cookies?: Record<string, string>
	}

	const envelopes: string[] = []

	const client = new Sentry.NodeClient({
		// Never contacted: the transport below records instead of sending
		dsn: 'http://publickey@127.0.0.1:9/1',
		dataCollection,
		integrations: [Sentry.requestDataIntegration()],
		stackParser: () => [],
		transport: () =>
			Sentry.createTransport({ recordDroppedEvent: () => undefined }, request => {
				envelopes.push(String(request.body))
				return Promise.resolve({ statusCode: 200 })
			}),
	})
	client.init()

	beforeEach(() => {
		envelopes.length = 0
	})

	// What a visitor's request looks like once it reaches the server: the cookie, the proxy's address headers,
	// Clerk's copy of the URL and the page the visitor came from
	const VISITOR_HEADERS = {
		host: 'beswib.com',
		'user-agent': 'vitest',
		cookie: '__session=SESSION_SECRET; NEXT_LOCALE=fr',
		authorization: 'Bearer BEARER_SECRET',
		'x-forwarded-for': '203.0.113.7',
		'x-real-ip': '203.0.113.8',
		'cf-connecting-ip': '203.0.113.9',
		'x-clerk-clerk-url': 'https://beswib.com/en/marketplace/bib1?tkn=TKN_IN_CLERK_HEADER',
		referer: 'https://beswib.com/en/marketplace/bib1?tkn=TKN_IN_REFERER&email=referer%40example.com',
	}

	async function report(pathAndQuery: string): Promise<{ envelope: string; request: SentRequest; user: unknown }> {
		await Sentry.withIsolationScope(async scope => {
			scope.setSDKProcessingMetadata({
				normalizedRequest: {
					method: 'GET',
					url: `https://beswib.com${pathAndQuery}`,
					query_string: pathAndQuery.split('?')[1],
					headers: VISITOR_HEADERS,
				},
				ipAddress: '203.0.113.10',
			})
			client.captureException(new Error('probe'), undefined, scope)
			await client.flush(2000)
		})
		expect(envelopes).toHaveLength(1)
		const envelope = envelopes[0] ?? ''
		// An envelope is three lines here: its header, the item header, the event
		const event = JSON.parse(envelope.split('\n')[2] ?? '{}') as { request?: SentRequest; user?: unknown }
		expect(event.request).toBeDefined()
		return { envelope, request: event.request ?? {}, user: event.user }
	}

	it('masks the e-mail of the waiting-list confirmation', async () => {
		const { envelope, request } = await report('/en/events/abc?waitlist_success=true&email=runner%40example.com')
		expect(request.url).toBe('https://beswib.com/en/events/abc?waitlist_success=true&email=[Filtered]')
		expect(request.query_string).toBe('waitlist_success=true&email=[Filtered]')
		expect(envelope).not.toContain('runner%40example.com')
	})

	it('masks the name, the e-mail and the message of the prefilled contact form', async () => {
		const { envelope, request } = await report(
			'/en/contact?name=Jeanne%20Martin&email=jeanne%40example.com&message=Please%20delete%20my%20account'
		)
		expect(request.query_string).toBe('name=[Filtered]&email=[Filtered]&message=[Filtered]')
		expect(envelope).not.toMatch(/Jeanne|jeanne%40example\.com|Please%20delete/)
	})

	it('masks the Clerk and PayPal ids of a seller', async () => {
		const status = await report('/api/paypal/merchant-status?userId=user_CLERKID')
		expect(status.request.query_string).toBe('userId=[Filtered]')
		expect(status.envelope).not.toContain('user_CLERKID')

		envelopes.length = 0
		const onboarded = await report(
			'/en/paypal/callback?trackingId=user_CLERKID&merchantId=user_CLERKID&merchantIdInPayPal=PAYPALID&permissionsGranted=true'
		)
		expect(onboarded.request.query_string).toBe(
			'trackingId=[Filtered]&merchantId=[Filtered]&merchantIdInPayPal=[Filtered]&permissionsGranted=true'
		)
		expect(onboarded.envelope).not.toMatch(/user_CLERKID|PAYPALID/)
	})

	it('masks a PocketBase filter and a phone number by the name of their parameter', async () => {
		// Outgoing requests go through the same list and the same matching; that side is measured on a build
		const { envelope, request } = await report(
			'/api/collections/waitlists/records?page=1&filter=email%20%3D%20%22runner%40example.com%22&sort=-created&phoneNumber=%2B33600000000'
		)
		expect(request.query_string).toBe('page=1&filter=[Filtered]&sort=-created&phoneNumber=[Filtered]')
		expect(envelope).not.toMatch(/runner%40example\.com|33600000000/)
	})

	it('masks the token of a private listing and leaves the marketplace filters readable', async () => {
		const { envelope, request } = await report('/en/marketplace/bib1?tkn=TKN_IN_URL&sport=trail&sort=price-asc')
		expect(request.url).toBe('https://beswib.com/en/marketplace/bib1?tkn=[Filtered]&sport=trail&sort=price-asc')
		expect(envelope).not.toContain('TKN_IN_URL')
	})

	it('sends no cookie, no address, no user, and neither the Referer nor the URL copied by Clerk', async () => {
		const { envelope, request, user } = await report('/en/marketplace')
		expect(request.cookies).toBeUndefined()
		expect(user).toBeUndefined()
		expect(request.headers).toEqual({
			host: 'beswib.com',
			'user-agent': 'vitest',
			authorization: '[Filtered]',
			'x-clerk-clerk-url': '[Filtered]',
			referer: '[Filtered]',
		})
		expect(envelope).not.toMatch(
			/SESSION_SECRET|BEARER_SECRET|203\.0\.113\.|TKN_IN_CLERK_HEADER|TKN_IN_REFERER|referer%40example/
		)
	})
})
