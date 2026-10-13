import 'server-only'

import { createHash, timingSafeEqual } from 'node:crypto'
import type { Bib } from '@/models/bib.model'

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

/**
 * True when the visitor may buy the bib as far as its listing goes: a public listing, or a private one
 * whose token they hold. A bib that is not listed is sold to nobody. The lock, the order creation and
 * the capture all ask this one question: a step that let through what the next one refuses is how a
 * buyer ends up approving a payment that cannot be captured.
 */
export function isPurchasableListing(bib: Pick<Bib, 'listed' | 'privateListingToken'>, privateToken: unknown): boolean {
	if (bib.listed === 'public') return true
	return bib.listed === 'private' && isPrivateListingToken(bib.privateListingToken, privateToken)
}
