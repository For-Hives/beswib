// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Two actions the browser calls in place of a service it used to call itself. createBib lists a bib
// for whichever seller id it is given, addToWaitlist subscribes whichever user record it is handed:
// the actions take the user from the Clerk session and nothing about them from the browser.

vi.mock('@clerk/nextjs/server', () => ({
	auth: vi.fn(),
}))
vi.mock('@/services/user.services', () => ({
	fetchUserByClerkId: vi.fn(),
}))
vi.mock('@/services/bib.services', () => ({
	createBib: vi.fn(),
}))
vi.mock('@/services/verifiedEmail.services', () => ({
	fetchVerifiedEmailById: vi.fn(),
}))
vi.mock('@/services/waitlist.services', () => ({
	addToWaitlist: vi.fn(),
}))

import { auth } from '@clerk/nextjs/server'
import { handleCreateBib } from '@/app/[locale]/dashboard/seller/sell-bib/actions'
import { joinEventWaitlist } from '@/app/[locale]/events/actions'
import type { Bib } from '@/models/bib.model'
import type { User } from '@/models/user.model'
import type { VerifiedEmail } from '@/models/verifiedEmail.model'
import type { Waitlist } from '@/models/waitlist.model'
import { createBib } from '@/services/bib.services'
import { fetchUserByClerkId } from '@/services/user.services'
import { fetchVerifiedEmailById } from '@/services/verifiedEmail.services'
import { addToWaitlist } from '@/services/waitlist.services'

const mallory = { lastName: 'Mallory', id: 'mallory_pb', firstName: 'M', email: 'mallory@example.com' } as User

const listing: Omit<Bib, 'id' | 'sellerUserId'> = {
	validated: false,
	status: 'available',
	registrationNumber: 'REG-42',
	price: 80,
	originalPrice: 100,
	optionValues: {},
	listed: 'public',
	eventId: 'event_1',
}

function signIn(user: User | null) {
	vi.mocked(auth).mockResolvedValue({ userId: user ? 'clerk_mallory' : null } as Awaited<ReturnType<typeof auth>>)
	vi.mocked(fetchUserByClerkId).mockResolvedValue(user)
}

beforeEach(() => {
	vi.clearAllMocks()
	vi.spyOn(console, 'error').mockImplementation(() => {})
	vi.mocked(createBib).mockImplementation(data => Promise.resolve({ ...data, id: 'bib_new' } as Bib))
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('listing a bib (handleCreateBib)', () => {
	it('lists the bib for the signed-in seller', async () => {
		signIn(mallory)

		const created = await handleCreateBib(listing)

		expect(fetchUserByClerkId).toHaveBeenCalledExactlyOnceWith('clerk_mallory')
		expect(createBib).toHaveBeenCalledExactlyOnceWith({ ...listing, sellerUserId: 'mallory_pb' })
		expect(created).toMatchObject({ sellerUserId: 'mallory_pb', id: 'bib_new' })
	})

	it('does not list a bib for the seller the browser names', async () => {
		signIn(mallory)

		// What the browser sent before: the whole record, seller included
		await handleCreateBib({ ...listing, sellerUserId: 'alice_pb' } as Omit<Bib, 'id' | 'sellerUserId'>)

		expect(createBib).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ sellerUserId: 'mallory_pb' }))
	})

	it('links a verified e-mail of the seller', async () => {
		signIn(mallory)
		vi.mocked(fetchVerifiedEmailById).mockResolvedValue({ userId: 'mallory_pb', isVerified: true } as VerifiedEmail)

		await handleCreateBib({ ...listing, linkedEmailId: 've_mallory' })

		expect(fetchVerifiedEmailById).toHaveBeenCalledExactlyOnceWith('ve_mallory')
		expect(createBib).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ linkedEmailId: 've_mallory' }))
	})

	it.each([
		['the verified e-mail of someone else', { userId: 'alice_pb', isVerified: true }],
		['an e-mail the seller has not verified', { userId: 'mallory_pb', isVerified: false }],
		['an e-mail that does not exist', null],
	])('refuses to link %s', async (_label, linkedEmail) => {
		signIn(mallory)
		vi.mocked(fetchVerifiedEmailById).mockResolvedValue(linkedEmail as VerifiedEmail | null)

		expect(await handleCreateBib({ ...listing, linkedEmailId: 've_alice' })).toBeNull()

		expect(createBib).not.toHaveBeenCalled()
	})

	it('refuses a visitor who is not signed in', async () => {
		signIn(null)

		expect(await handleCreateBib(listing)).toBeNull()

		expect(fetchUserByClerkId).not.toHaveBeenCalled()
		expect(createBib).not.toHaveBeenCalled()
	})

	it('refuses a session that has no account in the database', async () => {
		vi.mocked(auth).mockResolvedValue({ userId: 'clerk_ghost' } as Awaited<ReturnType<typeof auth>>)
		vi.mocked(fetchUserByClerkId).mockResolvedValue(null)

		expect(await handleCreateBib(listing)).toBeNull()

		expect(createBib).not.toHaveBeenCalled()
	})
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
