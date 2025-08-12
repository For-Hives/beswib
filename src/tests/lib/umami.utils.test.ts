import { describe, expect, it } from 'vitest'

import { beforeSendHandler, umamiIdentify, umamiTrack } from '../../lib/umami.utils'

describe('umami.utils', () => {
	it('beforeSendHandler returns false for invalid payloads', () => {
		// @ts-expect-error testing invalid input
		expect(beforeSendHandler('event', null)).toBe(false)
		// @ts-expect-error testing invalid input
		expect(beforeSendHandler('event', undefined)).toBe(false)
	})

	it('beforeSendHandler redacts email and name', () => {
		const event_data: Record<string, string> = {}
		event_data.email = 'a@b.c'
		event_data.name = 'Bob'
		event_data.other = 'x'

		const res = beforeSendHandler('event', {
			event_name: 'foo',
			data: event_data,
		})

		if (res === false) throw new Error('beforeSendHandler unexpectedly returned false')
		expect(res.data?.email).toBe('[redacted]')
		expect(res.data?.name).toBe('[redacted]')
	})

	it('umamiTrack/umamiIdentify are SSR safe', () => {
		// In Vitest (node) window is undefined, wrappers should return undefined
		expect(umamiTrack()).toBeUndefined()
		expect(umamiIdentify('id', { email: 'a@b.c' })).toBeUndefined()
	})
})
