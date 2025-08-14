import { describe, expect, it } from 'vitest'

import { beforeSendHandler, umamiIdentify, umamiTrack } from '../../lib/utils/umami'

describe('umami.utils', () => {
	it('beforeSendHandler returns false for invalid payloads', () => {
		expect(beforeSendHandler('event', null as never)).toBe(false)
		expect(beforeSendHandler('event', undefined as never)).toBe(false)
	})

	it('beforeSendHandler extracts locale and rewrites URL', () => {
		const res = beforeSendHandler('event', {
			url: 'https://example.com/fr/some/path',
			data: {},
		})

		if (res === false) throw new Error('beforeSendHandler unexpectedly returned false')
		expect((res.data as { locale?: string })?.locale).toBe('fr')
		expect(res.url).toBe('https://example.com/some/path')
	})

	it('umamiTrack/umamiIdentify are SSR safe', () => {
		// In Vitest (node) window is undefined, wrappers should return undefined
		expect(umamiTrack()).toBeUndefined()
		expect(umamiIdentify('id', { email: 'a@b.c' })).toBeUndefined()
	})
})
