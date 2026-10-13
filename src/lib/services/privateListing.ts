import 'server-only'

import { createHash, timingSafeEqual } from 'node:crypto'

// The token of a private listing is all that stands between a visitor and the right to see and buy
// the bib. Every check of it goes through here, so that it is compared in constant time everywhere.

const digest = (value: string): Buffer => createHash('sha256').update(value).digest()

/**
 * True when `provided` is the token of the listing. `provided` comes straight from a request (query
 * parameter, JSON body, server action argument): it may be missing, or anything but a string.
 * A listing without a token matches nothing.
 */
export function isPrivateListingToken(expected: string | null | undefined, provided: unknown): boolean {
	if (typeof expected !== 'string' || expected === '') return false
	if (typeof provided !== 'string' || provided === '') return false
	// Digests have the same length whatever was sent: timingSafeEqual throws on buffers of different
	// lengths, and checking the length first would tell how long the token is
	return timingSafeEqual(digest(expected), digest(provided))
}
