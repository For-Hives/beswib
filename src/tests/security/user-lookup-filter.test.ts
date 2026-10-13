// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mockPocketbase, mockPocketbaseCollection } from '@/tests/mocks/pocketbase'

// The waitlist form is open to anonymous visitors, and the address they type is looked up among the
// users (an address that has an account is subscribed as that user). The lookup is a PocketBase filter
// built around the address, run with the admin token: an address that closes the quote would turn it
// into a query over any field of any user.

vi.mock('@/lib/services/pocketbase', () => ({
	pb: mockPocketbase,
}))
vi.mock('@/services/email.service', () => ({
	sendWaitlistConfirmationEmail: vi.fn(),
}))

import { fetchUserByEmail } from '@/services/user.services'
import { addToWaitlist } from '@/services/waitlist.services'

const notFound = () => Promise.reject(Object.assign(new Error('Not found'), { status: 404 }))

beforeEach(() => {
	vi.clearAllMocks()
	vi.spyOn(console, 'error').mockImplementation(() => {})
	mockPocketbase.collection.mockReturnValue(mockPocketbaseCollection)
	mockPocketbaseCollection.getFirstListItem.mockImplementation(notFound)
	mockPocketbaseCollection.create.mockImplementation((data: object) => Promise.resolve({ id: 'wl_1', ...data }))
	mockPocketbaseCollection.getOne.mockResolvedValue({ name: 'Trail des Crêtes', id: 'event_1' })
})

describe('looking a user up by e-mail (fetchUserByEmail)', () => {
	it('keeps the filter of an ordinary address as it was', async () => {
		await fetchUserByEmail(' runner@example.com ')

		expect(mockPocketbaseCollection.getFirstListItem).toHaveBeenCalledExactlyOnceWith('email = "runner@example.com"')
	})

	it.each([
		[
			'a quote that closes the string',
			'x"||role="admin"||email~"@a.b',
			String.raw`email = "x\"||role=\"admin\"||email~\"@a.b"`,
		],
		['a backslash before the closing quote', String.raw`x\"||id!="@a.b`, String.raw`email = "x\\\"||id!=\"@a.b"`],
	])('keeps %s inside the quoted value', async (_label, email, filter) => {
		await fetchUserByEmail(email)

		expect(mockPocketbaseCollection.getFirstListItem).toHaveBeenCalledExactlyOnceWith(filter)
	})

	it('is what the waitlist form of an anonymous visitor goes through', async () => {
		// Passes the format check of the form: no space, one @, a dot after it
		const email = 'x"||role="admin"||email~"@a.b'

		await addToWaitlist('event_1', null, email)

		const filters = mockPocketbaseCollection.getFirstListItem.mock.calls.map(([filter]) => filter as string)
		expect(filters[0]).toBe(String.raw`email = "x\"||role=\"admin\"||email~\"@a.b"`)
		// No quote of the address is left bare in any of the filters it was written into
		for (const filter of filters) expect(filter).not.toMatch(/[^\\]"\|\|/)
	})
})
