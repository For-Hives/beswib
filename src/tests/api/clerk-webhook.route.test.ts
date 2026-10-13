// @vitest-environment node
import { createHmac, randomBytes } from 'node:crypto'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
	sendWelcomeEmail: vi.fn(),
	linkEmailWaitlistsToUser: vi.fn(),
	createUser: vi.fn(),
}))

vi.mock('@/services/user.services', () => ({ createUser: mocks.createUser }))
vi.mock('@/services/waitlist.services', () => ({ linkEmailWaitlistsToUser: mocks.linkEmailWaitlistsToUser }))
vi.mock('@/services/notification.service', () => ({ sendWelcomeEmail: mocks.sendWelcomeEmail }))

const ENDPOINT = 'https://beswib.test/api/webhooks/clerk'

// Throwaway signing secret in the format Clerk (Svix) hands out: `whsec_` + base64 key.
const newSecret = () => `whsec_${randomBytes(24).toString('base64')}`

// Signs like Svix does: HMAC-SHA256 over `${id}.${timestamp}.${body}`, keyed with the decoded secret.
function sign(secret: string, id: string, timestamp: number, body: string): string {
	const key = Buffer.from(secret.slice('whsec_'.length), 'base64')
	return `v1,${createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64')}`
}

const nowInSeconds = () => Math.floor(Date.now() / 1000)

const userCreatedEvent = {
	type: 'user.created',
	object: 'event',
	data: {
		primary_email_address_id: 'idn_primary',
		last_name: 'Doe',
		id: 'user_2abcDEF',
		first_name: 'Jane',
		email_addresses: [
			{ id: 'idn_other', email_address: 'other@example.com' },
			{ id: 'idn_primary', email_address: 'jane@example.com' },
		],
	},
}

function signedRequest(options: {
	body: string
	id?: string
	sentBody?: string
	signingSecret: string
	timestamp?: number
}): NextRequest {
	const id = options.id ?? 'msg_2abcDEF'
	const timestamp = options.timestamp ?? nowInSeconds()
	return new NextRequest(ENDPOINT, {
		method: 'POST',
		headers: {
			'svix-timestamp': String(timestamp),
			'svix-signature': sign(options.signingSecret, id, timestamp, options.body),
			'svix-id': id,
			'content-type': 'application/json',
		},
		body: options.sentBody ?? options.body,
	})
}

// The route reads CLERK_WEBHOOK_SIGNING_SECRET when the module is evaluated, so load it fresh per test.
async function loadRoute(configuredSecret: string | undefined) {
	vi.stubEnv('CLERK_WEBHOOK_SIGNING_SECRET', configuredSecret)
	vi.resetModules()
	const { POST } = await import('@/app/api/webhooks/clerk/route')
	return POST
}

describe('Clerk webhook route', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
		mocks.createUser.mockResolvedValue({ id: 'pb_user_1' })
		mocks.linkEmailWaitlistsToUser.mockResolvedValue(0)
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.unstubAllEnvs()
	})

	it('creates the PocketBase user for a correctly signed user.created event', async () => {
		const secret = newSecret()
		const POST = await loadRoute(secret)

		const res = await POST(signedRequest({ signingSecret: secret, body: JSON.stringify(userCreatedEvent) }))

		expect(res.status).toBe(200)
		expect(await res.json()).toEqual({
			welcomeEmailQueued: true,
			message: 'User created and metadata updated successfully',
			linkedWaitlistEntries: 0,
		})
		expect(mocks.createUser).toHaveBeenCalledTimes(1)
		expect(mocks.createUser).toHaveBeenCalledWith(
			expect.objectContaining({
				role: 'user',
				lastName: 'Doe',
				firstName: 'Jane',
				email: 'jane@example.com',
				clerkId: 'user_2abcDEF',
			})
		)
		expect(mocks.linkEmailWaitlistsToUser).toHaveBeenCalledWith('jane@example.com', { id: 'pb_user_1' })
		expect(mocks.sendWelcomeEmail).toHaveBeenCalledWith({ to: 'jane@example.com', firstName: 'Jane' })
	})

	it('verifies the raw body, whatever its JSON formatting', async () => {
		const secret = newSecret()
		const POST = await loadRoute(secret)
		// Not what JSON.stringify would produce: indentation and an escaped character.
		const body = JSON.stringify(userCreatedEvent, null, 2).replace('Jane', 'J\\u00e9r\\u00f4me')

		const res = await POST(signedRequest({ signingSecret: secret, body }))

		expect(res.status).toBe(200)
		expect(mocks.createUser).toHaveBeenCalledWith(
			expect.objectContaining({ firstName: 'Jérôme', clerkId: 'user_2abcDEF' })
		)
	})

	it('rejects a body modified after signing', async () => {
		const secret = newSecret()
		const POST = await loadRoute(secret)
		const body = JSON.stringify(userCreatedEvent)

		const res = await POST(
			signedRequest({
				signingSecret: secret,
				sentBody: body.replace('jane@example.com', 'evil@example.com'),
				body,
			})
		)

		expect(res.status).toBe(400)
		expect(await res.json()).toEqual({ error: 'Error occured during webhook verification' })
		expect(mocks.createUser).not.toHaveBeenCalled()
		expect(mocks.sendWelcomeEmail).not.toHaveBeenCalled()
	})

	it('rejects a payload signed with another secret', async () => {
		const POST = await loadRoute(newSecret())

		const res = await POST(signedRequest({ signingSecret: newSecret(), body: JSON.stringify(userCreatedEvent) }))

		expect(res.status).toBe(400)
		expect(await res.json()).toEqual({ error: 'Error occured during webhook verification' })
		expect(mocks.createUser).not.toHaveBeenCalled()
	})

	it('rejects a signature made for another message id', async () => {
		const secret = newSecret()
		const POST = await loadRoute(secret)
		const req = signedRequest({ signingSecret: secret, body: JSON.stringify(userCreatedEvent) })
		req.headers.set('svix-id', 'msg_replayed')

		const res = await POST(req)

		expect(res.status).toBe(400)
		expect(mocks.createUser).not.toHaveBeenCalled()
	})

	it('rejects a timestamp outside the tolerance window', async () => {
		const secret = newSecret()
		const POST = await loadRoute(secret)

		const res = await POST(
			signedRequest({
				timestamp: nowInSeconds() - 60 * 60,
				signingSecret: secret,
				body: JSON.stringify(userCreatedEvent),
			})
		)

		expect(res.status).toBe(400)
		expect(await res.json()).toEqual({ error: 'Error occured during webhook verification' })
		expect(mocks.createUser).not.toHaveBeenCalled()
	})

	it.each(['svix-id', 'svix-timestamp', 'svix-signature'])('rejects a request without the %s header', async header => {
		const secret = newSecret()
		const POST = await loadRoute(secret)
		const req = signedRequest({ signingSecret: secret, body: JSON.stringify(userCreatedEvent) })
		req.headers.delete(header)

		const res = await POST(req)

		expect(res.status).toBe(400)
		expect(await res.json()).toEqual({ error: 'Error occured -- no svix headers' })
		expect(mocks.createUser).not.toHaveBeenCalled()
	})

	it.each([undefined, '', '   '])('answers 500 when the signing secret is %j', async configuredSecret => {
		const POST = await loadRoute(configuredSecret)

		const res = await POST(signedRequest({ signingSecret: newSecret(), body: JSON.stringify(userCreatedEvent) }))

		expect(res.status).toBe(500)
		expect(await res.json()).toEqual({ error: 'Internal Server Error: Webhook secret not configured' })
		expect(mocks.createUser).not.toHaveBeenCalled()
	})

	it('acknowledges other verified events without creating a user', async () => {
		const secret = newSecret()
		const POST = await loadRoute(secret)
		const body = JSON.stringify({ ...userCreatedEvent, type: 'user.updated' })

		const res = await POST(signedRequest({ signingSecret: secret, body }))

		expect(res.status).toBe(200)
		expect(await res.json()).toEqual({ message: 'Webhook received: user.updated, but no handler configured.' })
		expect(mocks.createUser).not.toHaveBeenCalled()
	})

	it('answers 400 when the verified user has no primary email', async () => {
		const secret = newSecret()
		const POST = await loadRoute(secret)
		const body = JSON.stringify({
			...userCreatedEvent,
			data: { ...userCreatedEvent.data, primary_email_address_id: null },
		})

		const res = await POST(signedRequest({ signingSecret: secret, body }))

		expect(res.status).toBe(400)
		expect(await res.json()).toEqual({ error: 'Primary email address missing' })
		expect(mocks.createUser).not.toHaveBeenCalled()
	})

	it('answers 500 when PocketBase does not create the user, so Clerk retries', async () => {
		const secret = newSecret()
		const POST = await loadRoute(secret)
		mocks.createUser.mockResolvedValue(null)

		const res = await POST(signedRequest({ signingSecret: secret, body: JSON.stringify(userCreatedEvent) }))

		expect(res.status).toBe(500)
		expect(await res.json()).toEqual({ error: 'Failed to create user in database' })
		expect(mocks.sendWelcomeEmail).not.toHaveBeenCalled()
	})
})
