// @vitest-environment node
import { createServer, type IncomingMessage, type Server } from 'node:http'
import { type AddressInfo, connect } from 'node:net'
import { gunzipSync } from 'node:zlib'
import * as Sentry from '@sentry/nextjs'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// The arguments of a server action travel in the body of a POST to the page it is called from, and
// the token of a private listing is one of them at every purchase step. The Sentry SDK attaches the
// body of an incoming request to every error and trace of that request, unless `httpBodies` of the
// policy in sentry.data-collection.ts leaves `incomingRequest` out.
// Nothing is mocked here: the real SDK, set up by sentry.server.config.ts, handles a real HTTP
// request and sends what it has to a local server standing in for Sentry.
// Out of reach of this test: the `http.target` attribute that Next.js puts on its own spans, which
// keeps the query string of the page as it came (see sentry.data-collection.ts).

const TOKEN = 'Zq7Lm2Xc9Vb4Nk8Jh5Gf1Ds6Ap3Wo0Ei'
const BIB_ID = 'bibprivate00001'

const readBody = (request: IncomingMessage) =>
	new Promise<Buffer>(resolve => {
		const chunks: Buffer[] = []
		request.on('data', (chunk: Buffer) => chunks.push(chunk))
		request.on('end', () => resolve(Buffer.concat(chunks)))
	})

const listen = (server: Server) =>
	new Promise<AddressInfo>(resolve => {
		server.listen(0, '127.0.0.1', () => resolve(server.address() as AddressInfo))
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
// fails inside a trace, so that both kinds of event leave: the error and the transaction.
// A failure of its own for each request: the SDK drops an error that repeats the one before
let failures = 0
const app = createServer((request, response) => {
	void readBody(request).then(body => {
		Sentry.startSpan({ op: 'http.server', name: 'handler under test', forceTransaction: true }, () => {
			failures += 1
			Sentry.captureException(new Error(`the handler failed (${failures})`))
		})
		response.end(`read ${body.length} bytes`)
	})
})

let appAddress: AddressInfo

/**
 * Posts over a bare socket, as a browser would from outside. fetch and node:http are instrumented by
 * the SDK under test: through them the request would join a trace of the test run, which is not sampled.
 */
function post(path: string, headers: Record<string, string>, body: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const host = `${appAddress.address}:${appAddress.port}`
		const head = { Host: host, Connection: 'close', 'Content-Length': String(Buffer.byteLength(body)), ...headers }
		const lines = Object.entries(head).map(([name, value]) => `${name}: ${value}`)
		const chunks: Buffer[] = []
		const socket = connect(appAddress.port, appAddress.address, () => {
			socket.write(`POST ${path} HTTP/1.1\r\n${lines.join('\r\n')}\r\n\r\n${body}`)
		})
		socket.on('data', (chunk: Buffer) => chunks.push(chunk))
		socket.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
		socket.on('error', reject)
	})
}

/** Sends the request, then answers with what Sentry received about it: everything, and the request of each event. */
async function sentAbout(path: string, headers: Record<string, string>, body: string) {
	// The handler did read the body: it was there for the SDK to copy
	expect(await post(path, headers, body)).toContain(`read ${body.length} bytes`)
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
	vi.stubEnv('SENTRY_DSN', `http://public@127.0.0.1:${(await listen(sentry)).port}/1`)
	await import('../../../sentry.server.config')
	appAddress = await listen(app)
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
			// Posted to the page the buyer is on, whose address carries the token of the link, as does the Referer
			`/fr/marketplace/${BIB_ID}?tkn=${TOKEN}&lockedAt=2031-05-01T10%3A00%3A00.000Z`,
			{
				Referer: `https://beswib.com/fr/marketplace/${BIB_ID}?tkn=${TOKEN}`,
				'Next-Action': '40a1b2c3d4e5f6',
				'Content-Type': 'text/plain;charset=UTF-8',
			},
			JSON.stringify([BIB_ID, '', TOKEN]),
		],
		[
			'the token form of a private listing (API route)',
			'/api/validate-private-token',
			{ 'Content-Type': 'application/json' },
			JSON.stringify({ token: TOKEN, bibId: BIB_ID }),
		],
	])('gets the error and the trace of %s, never its body or the token', async (_label, path, headers, body) => {
		const { requests, everything } = await sentAbout(path, headers, body)

		// Both events left, and they describe this request
		expect(everything).toContain('the handler failed')
		expect(everything).toContain('"type":"transaction"')
		expect(requests).toHaveLength(2)
		for (const request of requests) {
			// The address is recorded with the token masked (`urlQueryParams` of the same policy)
			const recorded = `http://${appAddress.address}:${appAddress.port}${path.replace(TOKEN, '[Filtered]')}`
			expect(request).toMatchObject({ url: recorded, method: 'POST' })
			expect(request).not.toHaveProperty('data')
		}
		// Not in the body, and not in the address or the Referer either
		expect(everything.includes(TOKEN)).toBe(false)
	})
})
