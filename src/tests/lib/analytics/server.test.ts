// @vitest-environment node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Server = typeof import('@/lib/analytics/server')

const { afterMock } = vi.hoisted(() => ({ afterMock: vi.fn() }))

vi.mock('next/server', () => ({ after: afterMock }))

const BIB_ID = 'abcdefghij12345'
const EVENT_ID = 'zyxwvutsrq09876'

let server: Server
let fetchMock: ReturnType<typeof vi.fn>
// Callbacks handed to after(): the test plays the part of Next.js and runs them "after the response"
let afterCallbacks: (() => unknown)[]

async function loadServer(): Promise<void> {
	vi.resetModules()
	server = await import('@/lib/analytics/server')
}

async function runAfterCallbacks(): Promise<void> {
	for (const callback of afterCallbacks) await callback()
}

function lastRequest(): { url: string; init: RequestInit; body: { type: string; payload: Record<string, unknown> } } {
	const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit]
	return { url, init, body: JSON.parse(String(init.body)) }
}

beforeEach(async () => {
	afterCallbacks = []
	afterMock.mockReset()
	afterMock.mockImplementation((callback: () => unknown) => {
		afterCallbacks.push(callback)
	})
	fetchMock = vi.fn(async () => new Response('{"cache":"x"}', { status: 200 }))
	vi.stubGlobal('fetch', fetchMock)
	// The production site: a production build whose base URL is beswib.com
	vi.stubEnv('NODE_ENV', 'production')
	vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://beswib.com')
	// The older names of the same address: unset unless a test says otherwise
	vi.stubEnv('SERVER_URL', undefined)
	vi.stubEnv('NEXT_URL_SERVER_URL', undefined)
	vi.stubEnv('NEXT_PUBLIC_UMAMI_HOST', '')
	await loadServer()
})

afterEach(() => {
	vi.unstubAllGlobals()
	vi.unstubAllEnvs()
	vi.restoreAllMocks()
})

describe('isServerTrackingEnabled', () => {
	it.each(['https://beswib.com', 'https://www.beswib.com', 'https://beswib.com/', 'https://www.beswib.com/fr'])(
		'is on for %s',
		baseUrl => {
			vi.stubEnv('NEXT_PUBLIC_BASE_URL', baseUrl)
			expect(server.isServerTrackingEnabled()).toBe(true)
		}
	)

	it.each([
		'',
		'http://localhost:3000',
		'https://staging.beswib.com',
		'https://beswib.com.example.org',
		'https://example.org/?next=beswib.com',
		'https://notbeswib.com',
		'beswib.com',
		'not a url',
	])('is off for %j', baseUrl => {
		vi.stubEnv('NEXT_PUBLIC_BASE_URL', baseUrl)
		expect(server.isServerTrackingEnabled()).toBe(false)
	})

	it('is off when no variable names the address of the deployment', () => {
		vi.stubEnv('NEXT_PUBLIC_BASE_URL', undefined)
		expect(server.isServerTrackingEnabled()).toBe(false)
	})

	// The deployments name themselves with SERVER_URL only
	it.each(['SERVER_URL', 'NEXT_URL_SERVER_URL'])('is on when only %s names the production site', name => {
		vi.stubEnv('NEXT_PUBLIC_BASE_URL', undefined)
		vi.stubEnv(name, 'https://beswib.com')
		expect(server.isServerTrackingEnabled()).toBe(true)
	})

	it.each(['SERVER_URL', 'NEXT_URL_SERVER_URL'])('is off when only %s is set and names staging', name => {
		vi.stubEnv('NEXT_PUBLIC_BASE_URL', undefined)
		vi.stubEnv(name, 'https://staging.beswib.com')
		expect(server.isServerTrackingEnabled()).toBe(false)
	})

	it('believes the first variable that is set: staging stays off whatever an older name says', () => {
		vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://staging.beswib.com')
		vi.stubEnv('SERVER_URL', 'https://beswib.com')
		expect(server.isServerTrackingEnabled()).toBe(false)
	})
})

describe('isServerTrackingEnabled, outside a production build', () => {
	// A developer machine or a test run may well carry the production base URL in its environment
	it.each(['development', 'test', ''])('is off when NODE_ENV is %j, even with the production base URL', nodeEnv => {
		vi.stubEnv('NODE_ENV', nodeEnv)
		vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://beswib.com')
		expect(server.isServerTrackingEnabled()).toBe(false)
	})

	it.each(['development', 'test'])('trackServer sends nothing when NODE_ENV is %j', async nodeEnv => {
		vi.stubEnv('NODE_ENV', nodeEnv)
		server.trackServer('account_create_success')
		await runAfterCallbacks()
		expect(afterMock).not.toHaveBeenCalled()
		expect(fetchMock).not.toHaveBeenCalled()
	})
})

describe('trackServer, in a browser', () => {
	it('is a server-only module: its first statement makes a client bundle fail to build', () => {
		const source = readFileSync(resolve(process.cwd(), 'src/lib/analytics/server.ts'), 'utf8')
		expect(source.startsWith("import 'server-only'\n")).toBe(true)
	})

	it('sends nothing when a window exists, whatever the environment says', async () => {
		// In a browser after() throws: without a guard the event would be POSTed straight from the
		// visitor's browser, past the before-send hook
		vi.stubGlobal('window', {})
		afterMock.mockImplementation(() => {
			throw new Error('`after` was called outside a request scope')
		})
		expect(server.isServerTrackingEnabled()).toBe(false)
		server.trackServer('account_create_success')
		await new Promise(resolve => setTimeout(resolve, 10))
		expect(afterMock).not.toHaveBeenCalled()
		expect(fetchMock).not.toHaveBeenCalled()
	})
})

describe('trackServer, outside the production site', () => {
	it.each(['', 'http://localhost:3000', 'https://staging.beswib.com'])('sends nothing for %j', async baseUrl => {
		vi.stubEnv('NEXT_PUBLIC_BASE_URL', baseUrl)
		server.trackServer('account_create_success')
		await runAfterCallbacks()
		expect(afterMock).not.toHaveBeenCalled()
		expect(fetchMock).not.toHaveBeenCalled()
	})
})

describe('trackServer, on the production site', () => {
	it('returns at once and sends after the response', async () => {
		expect(server.trackServer('account_create_success')).toBeUndefined()
		expect(afterMock).toHaveBeenCalledOnce()
		// Nothing has left yet: the request belongs to after()
		expect(fetchMock).not.toHaveBeenCalled()

		await runAfterCallbacks()
		expect(fetchMock).toHaveBeenCalledOnce()
	})

	it('posts the event to the Umami send endpoint', async () => {
		server.trackServer('payment_capture_success', {
			bib_id: BIB_ID as never,
			event_id: EVENT_ID as never,
			price_bucket: '50_99',
			listing: 'public',
		})
		await runAfterCallbacks()

		const { url, init, body } = lastRequest()
		expect(url).toBe('https://umami.wadefade.fr/api/send')
		expect(init.method).toBe('POST')
		const headers = new Headers(init.headers)
		expect(headers.get('content-type')).toBe('application/json')
		// Umami discards requests whose user agent looks like a bot or contains "server"
		expect(headers.get('user-agent')).toMatch(/^Mozilla\/5\.0 .*Chrome\//)
		expect(body).toEqual({
			type: 'event',
			payload: {
				website: 'e9168017-b73b-491b-b7b0-fee64f07c847',
				hostname: 'beswib.com',
				url: '/_server',
				tag: expect.stringMatching(/^v\d+\.\d+\.\d+/),
				name: 'payment_capture_success',
				data: { bib_id: BIB_ID, event_id: EVENT_ID, price_bucket: '50_99', listing: 'public' },
			},
		})
	})

	it('sends an empty bag for an event without properties, and no visitor data', async () => {
		server.trackServer('paypal_kyc_success')
		await runAfterCallbacks()
		const { init, body } = lastRequest()
		expect(body.payload.data).toEqual({})
		for (const key of ['id', 'ip', 'userAgent', 'referrer', 'language', 'screen', 'title']) {
			expect(body.payload).not.toHaveProperty(key)
		}
		expect(body.payload.data).not.toHaveProperty('locale')
		const headers = new Headers(init.headers)
		expect(headers.has('x-forwarded-for')).toBe(false)
		expect(headers.has('cookie')).toBe(false)
	})

	it('gives up after 2 seconds', async () => {
		const timeout = vi.spyOn(AbortSignal, 'timeout')
		server.trackServer('account_create_success')
		await runAfterCallbacks()
		expect(timeout).toHaveBeenCalledExactlyOnceWith(2000)
		expect(lastRequest().init.signal).toBe(timeout.mock.results[0].value)
	})

	it('swallows a timeout', async () => {
		const timedOut = AbortSignal.abort(new DOMException('The operation timed out', 'TimeoutError'))
		vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timedOut)
		fetchMock.mockImplementation((_url: string, init: RequestInit) => Promise.reject(init.signal?.reason))
		server.trackServer('account_create_success')
		await expect(runAfterCallbacks()).resolves.toBeUndefined()
		expect(fetchMock).toHaveBeenCalledOnce()
	})

	it('swallows a network error and an error status', async () => {
		fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'))
		server.trackServer('account_create_success')
		await expect(runAfterCallbacks()).resolves.toBeUndefined()

		afterCallbacks = []
		fetchMock.mockResolvedValueOnce(new Response('Bad request', { status: 400 }))
		server.trackServer('account_create_success')
		await expect(runAfterCallbacks()).resolves.toBeUndefined()
	})

	it('does not throw when fetch itself throws', async () => {
		fetchMock.mockImplementation(() => {
			throw new Error('no fetch here')
		})
		server.trackServer('account_create_success')
		await expect(runAfterCallbacks()).resolves.toBeUndefined()
	})

	it('falls back to a detached promise when there is no request scope', async () => {
		afterMock.mockImplementation(() => {
			throw new Error('`after` was called outside a request scope')
		})
		expect(() => server.trackServer('paypal_webhook_error', { kind: 'exception' })).not.toThrow()
		await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
		expect(lastRequest().body.payload).toMatchObject({ name: 'paypal_webhook_error', data: { kind: 'exception' } })
	})

	it('does not throw when the detached send fails', async () => {
		afterMock.mockImplementation(() => {
			throw new Error('no request scope')
		})
		const unhandled = vi.fn()
		process.on('unhandledRejection', unhandled)
		fetchMock.mockRejectedValue(new TypeError('fetch failed'))
		expect(() => server.trackServer('account_create_success')).not.toThrow()
		await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
		await new Promise(resolve => setTimeout(resolve, 10))
		process.off('unhandledRejection', unhandled)
		expect(unhandled).not.toHaveBeenCalled()
	})

	it('drops what the catalogue refuses', async () => {
		const anyTrackServer = server.trackServer as (name: string, props?: unknown) => void
		anyTrackServer('unknown_event', { user_id: 'user_2abc' })
		anyTrackServer('paypal_webhook_error', { kind: 'Error: connect ECONNREFUSED 10.0.0.1' })
		anyTrackServer('sale_success', { bib_id: 'user_2abcDEFghiJKLmnoPQR', price_bucket: '50_99' })
		// A browser event is not sent from the server
		anyTrackServer('cta_click', { cta: 'sell_bib', where: 'hero' })
		await runAfterCallbacks()
		expect(afterMock).not.toHaveBeenCalled()
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it('removes undeclared properties, a user id included', async () => {
		const anyTrackServer = server.trackServer as (name: string, props?: unknown) => void
		anyTrackServer('paypal_webhook_error', { kind: 'exception', user_id: 'user_2abc', email: 'runner@example.com' })
		await runAfterCallbacks()
		expect(lastRequest().body.payload.data).toEqual({ kind: 'exception' })
	})

	it('warns once when Umami answers like it does to a bot', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		fetchMock.mockImplementation(async () => new Response('{"beep":"boop"}', { status: 200 }))
		server.trackServer('account_create_success')
		server.trackServer('account_create_success')
		await runAfterCallbacks()
		expect(fetchMock).toHaveBeenCalledTimes(2)
		expect(warn).toHaveBeenCalledOnce()
	})
})

describe('trackServer, with another Umami host', () => {
	it('uses NEXT_PUBLIC_UMAMI_HOST', async () => {
		vi.stubEnv('NEXT_PUBLIC_UMAMI_HOST', 'http://localhost:3001/')
		await loadServer()
		server.trackServer('account_create_success')
		await runAfterCallbacks()
		expect(lastRequest().url).toBe('http://localhost:3001/api/send')
	})
})
