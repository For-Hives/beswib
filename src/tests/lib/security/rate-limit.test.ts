// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { getClientIp, SlidingWindowLimiter } from '@/lib/security/rate-limit'

describe('SlidingWindowLimiter', () => {
	it('allows `limit` attempts per window and frees them as the window slides', () => {
		const limiter = new SlidingWindowLimiter(3, 1000)
		expect([0, 100, 200].map(time => limiter.consume('a', time))).toEqual([true, true, true])
		expect(limiter.consume('a', 300)).toBe(false)
		expect(limiter.consume('b', 300)).toBe(true)
		expect(limiter.consume('a', 1001)).toBe(true)
		expect(limiter.consume('a', 1002)).toBe(false)
	})
})

describe('getClientIp', () => {
	it('takes the address appended by the proxy, not the ones the visitor sent', () => {
		expect(getClientIp(new Headers({ 'x-forwarded-for': '1.2.3.4, 203.0.113.7' }))).toBe('203.0.113.7')
	})

	it('ignores cf-connecting-ip, which a visitor can set on a site not proxied by Cloudflare', () => {
		expect(getClientIp(new Headers({ 'cf-connecting-ip': '1.2.3.4' }))).toBeNull()
	})

	it('falls back to x-real-ip, then to null', () => {
		expect(getClientIp(new Headers({ 'x-real-ip': '2001:db8::1' }))).toBe('2001:db8::1')
		expect(getClientIp(new Headers({ 'x-forwarded-for': 'not-an-ip' }))).toBeNull()
		expect(getClientIp(new Headers())).toBeNull()
	})
})
