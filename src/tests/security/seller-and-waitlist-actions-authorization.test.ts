// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// An action the browser calls in place of a service it used to call itself. addToWaitlist subscribes
// whichever user record it is handed: the action takes the user from the Clerk session and nothing
// about them from the browser.

vi.mock('@clerk/nextjs/server', () => ({
	auth: vi.fn(),
}))
vi.mock('@/services/user.services', () => ({
	fetchUserByClerkId: vi.fn(),
}))
vi.mock('@/services/waitlist.services', () => ({
	addToWaitlist: vi.fn(),
}))

import { auth } from '@clerk/nextjs/server'
import { joinEventWaitlist } from '@/app/[locale]/events/actions'
import type { User } from '@/models/user.model'
import type { Waitlist } from '@/models/waitlist.model'
import { fetchUserByClerkId } from '@/services/user.services'
import { addToWaitlist } from '@/services/waitlist.services'

const mallory = { lastName: 'Mallory', id: 'mallory_pb', firstName: 'M', email: 'mallory@example.com' } as User

function signIn(user: User | null) {
	vi.mocked(auth).mockResolvedValue({ userId: user ? 'clerk_mallory' : null } as Awaited<ReturnType<typeof auth>>)
	vi.mocked(fetchUserByClerkId).mockResolvedValue(user)
}

beforeEach(() => {
	vi.clearAllMocks()
	vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('joining a waitlist (joinEventWaitlist)', () => {
	const entry = { user_id: 'someone_pb', mail_notification: true, id: 'wl_1', event_id: 'event_1' } as Waitlist

	beforeEach(() => {
		vi.mocked(addToWaitlist).mockResolvedValue(entry)
	})

	it('subscribes the signed-in user of the session', async () => {
		signIn(mallory)

		expect(await joinEventWaitlist('event_1')).toEqual({})

		expect(addToWaitlist).toHaveBeenCalledExactlyOnceWith('event_1', mallory)
	})

	it('does not subscribe the user the browser hands over', async () => {
		signIn(mallory)

		// The call the browser made before: addToWaitlist(eventId, user, email), with the record of its choice
		const legacyCall = joinEventWaitlist as unknown as (eventId: string, user: User, email?: string) => Promise<unknown>
		await legacyCall('event_1', { ...mallory, id: 'alice_pb', email: 'alice@example.com' }, 'alice@example.com')

		expect(addToWaitlist).toHaveBeenCalledExactlyOnceWith('event_1', mallory)
	})

	it('subscribes the address of a visitor who is not signed in', async () => {
		signIn(null)

		expect(await joinEventWaitlist('event_1', 'visitor@example.org')).toEqual({})

		expect(addToWaitlist).toHaveBeenCalledExactlyOnceWith('event_1', null, 'visitor@example.org')
	})

	it('never hands the waitlist entry to the browser: it names the account behind an address', async () => {
		signIn(null)

		const result = await joinEventWaitlist('event_1', 'someone@example.org')

		expect(JSON.stringify(result)).not.toContain('someone_pb')
		expect(result).toEqual({})
	})

	it('tells a duplicate, and nothing more', async () => {
		signIn(null)
		vi.mocked(addToWaitlist).mockResolvedValue({ ...entry, error: 'already_on_waitlist' })

		expect(await joinEventWaitlist('event_1', 'someone@example.org')).toEqual({ error: 'already_on_waitlist' })
	})

	it('answers null when the subscription failed', async () => {
		signIn(null)
		vi.mocked(addToWaitlist).mockResolvedValue(null)

		expect(await joinEventWaitlist('event_1', 'not-an-address')).toBeNull()
		expect(await joinEventWaitlist('')).toBeNull()
	})
})
