import 'server-only'

import { isIP } from 'node:net'

/**
 * In-memory sliding-window rate limiter, per key (one process: enough for the single Coolify container that
 * serves beswib.com; the counters start over on each deploy, which is acceptable for an anti-spam limit).
 */
export class SlidingWindowLimiter {
	private readonly hits = new Map<string, number[]>()
	private lastSweep = 0

	constructor(
		private readonly limit: number,
		private readonly windowMs: number
	) {}

	/** Records an attempt for `key`; false when the key already used its `limit` attempts in the window. */
	consume(key: string, now = Date.now()): boolean {
		this.sweep(now)
		const recent = (this.hits.get(key) ?? []).filter(time => now - time < this.windowMs)
		if (recent.length >= this.limit) {
			this.hits.set(key, recent)
			return false
		}
		recent.push(now)
		this.hits.set(key, recent)
		return true
	}

	reset(): void {
		this.hits.clear()
		this.lastSweep = 0
	}

	/** Drops the keys with no attempt left in the window, at most once per window, so the map cannot grow forever. */
	private sweep(now: number): void {
		if (now - this.lastSweep < this.windowMs) return
		this.lastSweep = now
		for (const [key, times] of this.hits) {
			if (times.every(time => now - time >= this.windowMs)) this.hits.delete(key)
		}
	}
}

/**
 * The visitor's IP address, from the headers set by the reverse proxy (Traefik, in front of the container).
 *
 * beswib.com points straight at the server (no Cloudflare proxy), so `cf-connecting-ip` would be whatever the
 * visitor typed and is ignored. The proxy APPENDS the address it received the connection from to
 * `x-forwarded-for`: the last entry is the only one a visitor cannot choose; the first ones are theirs to forge.
 * Returns null when no usable address is found (the caller must not lump those requests into one shared bucket).
 */
export function getClientIp(headers: Pick<Headers, 'get'>): string | null {
	const forwarded = headers.get('x-forwarded-for')
	if (forwarded != null) {
		const last = forwarded.split(',').at(-1)?.trim() ?? ''
		if (isIP(last) !== 0) return last
	}
	const realIp = headers.get('x-real-ip')?.trim() ?? ''
	if (isIP(realIp) !== 0) return realIp
	return null
}

const TEN_MINUTES = 10 * 60 * 1000

/** Contact form: 3 messages per visitor IP in 10 minutes. */
export const contactIpLimiter = new SlidingWindowLimiter(3, TEN_MINUTES)

/** Contact form, requests with no usable IP: one looser shared limit, so they can neither flood nor lock out everyone. */
export const contactUnknownIpLimiter = new SlidingWindowLimiter(30, TEN_MINUTES)

/** true when a contact message from this IP (or from an unknown one) may still be sent. */
export function consumeContactQuota(ip: string | null): boolean {
	return ip == null ? contactUnknownIpLimiter.consume('unknown') : contactIpLimiter.consume(ip)
}
