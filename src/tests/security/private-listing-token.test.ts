// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

// timingSafeEqual is watched, not replaced: the real comparison runs
vi.mock('node:crypto', async importOriginal => {
	const crypto = await importOriginal<typeof import('node:crypto')>()
	return { ...crypto, timingSafeEqual: vi.fn(crypto.timingSafeEqual) }
})

import { timingSafeEqual } from 'node:crypto'
import { isPrivateListingToken } from '@/lib/services/privateListing'

const TOKEN = 'Zq7Lm2Xc9Vb4Nk8Jh5Gf1Ds6Ap3Wo0Ei'

describe('isPrivateListingToken', () => {
	beforeEach(() => {
		vi.mocked(timingSafeEqual).mockClear()
	})

	it('accepts the token of the listing', () => {
		expect(isPrivateListingToken(TOKEN, TOKEN)).toBe(true)
	})

	it.each([
		['one character changed', `${TOKEN.slice(0, -1)}j`],
		['its first half', TOKEN.slice(0, 16)],
		['something appended', `${TOKEN} `],
		['another case', TOKEN.toUpperCase()],
		['a much longer value', TOKEN.repeat(50)],
	])('refuses the token with %s', (_label, provided) => {
		expect(isPrivateListingToken(TOKEN, provided)).toBe(false)
	})

	it('compares in constant time, on buffers of one length whatever was sent', () => {
		for (const provided of [TOKEN, 'x', TOKEN.slice(0, 16), TOKEN.repeat(50)]) {
			isPrivateListingToken(TOKEN, provided)
		}

		const calls = vi.mocked(timingSafeEqual).mock.calls
		expect(calls).toHaveLength(4)
		for (const [expected, provided] of calls) {
			expect(expected.byteLength).toBe(32)
			expect(provided.byteLength).toBe(32)
		}
	})

	it.each([
		['undefined', undefined],
		['null', null],
		['an empty string', ''],
		['a number', 42],
		['an array holding the token', [TOKEN]],
		['an object', { token: TOKEN }],
	])('refuses %s without throwing', (_label, provided) => {
		expect(isPrivateListingToken(TOKEN, provided)).toBe(false)
	})

	it.each([
		['undefined', undefined],
		['null', null],
		['empty', ''],
	])('matches nothing when the listing has an %s token', (_label, expected) => {
		expect(isPrivateListingToken(expected, '')).toBe(false)
		expect(isPrivateListingToken(expected, undefined)).toBe(false)
		expect(isPrivateListingToken(expected, null)).toBe(false)
		expect(isPrivateListingToken(expected, TOKEN)).toBe(false)
	})
})
