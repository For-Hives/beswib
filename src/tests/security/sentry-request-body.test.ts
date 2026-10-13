// @vitest-environment node
import { createServer, type IncomingMessage, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { gunzipSync } from 'node:zlib'
import * as Sentry from '@sentry/nextjs'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// The arguments of a server action travel in the body of a POST to the page it is called from, and
// the token of a private listing is one of them at every purchase step. The Sentry SDK reads the
// body of incoming requests by default and attaches it to every error and trace of the request.
// Nothing is mocked here: the real SDK, set up by sentry.server.config.ts, handles a real HTTP
// request and sends what it has to a local server standing in for Sentry.

const TOKEN = 'Zq7Lm2Xc9Vb4Nk8Jh5Gf1Ds6Ap3Wo0Ei'
const BIB_ID = 'bibprivate00001'

const readBody = (request: IncomingMessage) =>
	new Promise<Buffer>(resolve => {
		const chunks: Buffer[] = []
		request.on('data', (chunk: Buffer) => chunks.push(chunk))
		request.on('end', () => resolve(Buffer.concat(chunks)))
	})

const listen = (server: Server) =>
	new Promise<string>(resolve => {
		server.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${(server.address() as AddressInfo).port}`))
	})

// Stands in for Sentry: keeps every envelope the SDK sends
const envelopes: string[] = []
const sentry = createServer((request, response) => {
	void readBody(request).then(body => {
		envelopes.push((request.headers['content-encoding'] === 'gzip' ? gunzipSync(body) : body).toString('utf8'))
		response.end('{}')
	})
})

// Stands in for Next.js: it reads the whole body, then runs the action or the route. Here that code
// fails inside a trace, so that both kinds of event leave: the error and the transaction
const app = createServer((request, response) => {
	void readBody(request).then(body => {
		Sentry.startSpan({ op: 'http.server', name: 'handler under test', forceTransaction: true }, () => {
			Sentry.captureException(new Error('the handler failed'))
		})
		response.end(`read ${body.length} bytes`)
	})
})

let appUrl: string

/** Sends the request, then answers with what Sentry received about it: everything, and the request of each event. */
async function sentAbout(path: string, headers: Record<string, string>, body: string) {
	const response = await fetch(`${appUrl}${path}`, { method: 'POST', headers, body })
	// The handler did read the body: it was there for the SDK to copy
	expect(await response.text()).toBe(`read ${body.length} bytes`)
	await Sentry.flush(2000)

	const items = envelopes
		.flatMap(envelope => envelope.split('\n'))
		.map(line => JSON.parse(line) as { request?: Record<string, unknown> })
	return {
		requests: items.flatMap(item => (item.request == null ? [] : [item.request])),
		everything: envelopes.join('\n'),
	}
}

beforeAll(async () => {
	vi.stubEnv('SENTRY_DSN', (await listen(sentry)).replace('://', '://public@').concat('/1'))
	await import('../../../sentry.server.config')
	appUrl = await listen(app)
})

afterAll(async () => {
	await Sentry.close(2000)
	await Promise.all([sentry, app].map(server => new Promise(resolve => server.close(resolve))))
	vi.unstubAllEnvs()
})

beforeEach(() => {
	envelopes.length = 0
})

describe('what Sentry receives about a request', () => {
	it.each([
		[
			'a purchase step of a private listing (server action)',
			`/fr/marketplace/${BIB_ID}`,
			{ 'Next-Action': '40a1b2c3d4e5f6', 'Content-Type': 'text/plain;charset=UTF-8' },
			JSON.stringify([BIB_ID, '', TOKEN]),
		],
		[
			'the token form of a private listing (API route)',
			'/api/validate-private-token',
			{ 'Content-Type': 'application/json' },
			JSON.stringify({ token: TOKEN, bibId: BIB_ID }),
		],
	])('gets the error and the trace of %s, never its body', async (_label, path, headers, body) => {
		const { requests, everything } = await sentAbout(path, headers, body)

		// Both events left, and they describe this request
		expect(everything).toContain('the handler failed')
		expect(everything).toContain('"type":"transaction"')
		expect(requests).toHaveLength(2)
		for (const request of requests) {
			expect(request).toMatchObject({ url: `${appUrl}${path}`, method: 'POST' })
			expect(request).not.toHaveProperty('data')
		}
		expect(everything.includes(TOKEN)).toBe(false)
	})
})
