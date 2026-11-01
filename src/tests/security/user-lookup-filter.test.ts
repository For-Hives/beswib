// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mockPocketbase, mockPocketbaseCollection } from '@/tests/mocks/pocketbase'

// The lookup is a PocketBase filter built around an address, run with the admin token: an address that
// closes the quote would turn it into a query over any field of any user.

vi.mock('@/lib/services/pocketbase', () => ({
	pb: mockPocketbase,
}))

import { fetchUserByEmail } from '@/services/user.services'

const notFound = () => Promise.reject(Object.assign(new Error('Not found'), { status: 404 }))

beforeEach(() => {
	vi.clearAllMocks()
	vi.spyOn(console, 'error').mockImplementation(() => {})
	mockPocketbase.collection.mockReturnValue(mockPocketbaseCollection)
	mockPocketbaseCollection.getFirstListItem.mockImplementation(notFound)
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
})
