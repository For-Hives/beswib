import { describe, expect, it } from 'vitest'

import {
	countBucket,
	daysToEventBucket,
	elapsedBucket,
	leadTimeBucket,
	priceBucket,
	readTimeBucket,
} from '@/lib/analytics/buckets'
import {
	ARTICLE_LINK_TARGETS,
	AUTH_ERROR_KINDS,
	COUNT_BUCKETS,
	DAYS_TO_EVENT_BUCKETS,
	ELAPSED_BUCKETS,
	type EventProps,
	FUNDING_SOURCES,
	LEAD_TIME_BUCKETS,
	LISTINGS,
	PRICE_BUCKETS,
	PURCHASE_ERROR_KINDS,
	READ_TIME_BUCKETS,
	REFERRER_SOURCES,
	SECTIONS,
	SIGN_IN_INTENTS,
	SPORTS,
	VERIFIED_EMAIL_KINDS,
	WIZARD_STEPS,
} from '@/lib/analytics/catalog'
import {
	articleLinkTarget,
	clerkErrorKind,
	fundingSource,
	listingOf,
	paypalCodeKind,
	referrerSource,
	sectionOf,
	signInIntent,
	sportOf,
	verifiedEmailKind,
	wizardStep,
} from '@/lib/analytics/classify'
import {
	articleIdOf,
	bibIdOf,
	bibIdOfTransaction,
	eventIdOf,
	eventIdOfBib,
	eventIdOfWaitlist,
} from '@/lib/analytics/ids'
import type { Bib } from '@/models/bib.model'

const ORIGIN = 'https://beswib.com'
const NOW = new Date('2026-10-13T12:00:00Z')
const DAY = 86_400_000

// Inputs no mapper knows: each must still answer with a member of its closed list
const UNKNOWN_INPUTS = [undefined, '', 'something else', 'runner@example.com', 'Error: boom at line 3', '__proto__']

describe('buckets', () => {
	it.each([
		[0, 'lt_25'],
		[24.99, 'lt_25'],
		[25, '25_49'],
		[49.99, '25_49'],
		[50, '50_99'],
		[99.99, '50_99'],
		[100, '100_199'],
		[199.99, '100_199'],
		[200, '200_499'],
		[499.99, '200_499'],
		[500, '500_plus'],
		[12_000, '500_plus'],
		[-5, 'lt_25'],
		[Number.NaN, 'lt_25'],
	])('priceBucket(%s) is %s', (price, expected) => {
		expect(priceBucket(price)).toBe(expected)
	})

	it.each([
		[0, '0'],
		[1, '1'],
		[2, '2_5'],
		[5, '2_5'],
		[6, '6_20'],
		[20, '6_20'],
		[21, '21_plus'],
		[4000, '21_plus'],
		[-1, '0'],
		[Number.NaN, '0'],
	])('countBucket(%s) is %s', (count, expected) => {
		expect(countBucket(count)).toBe(expected)
	})

	it.each([
		[-1, 'past'],
		[0.5, '0_7'],
		[7.5, '0_7'],
		[8.5, '8_30'],
		[30.5, '8_30'],
		[31.5, '31_90'],
		[90.5, '31_90'],
		[91.5, '91_plus'],
	])('daysToEventBucket of an event in %s days is %s', (days, expected) => {
		expect(daysToEventBucket(new Date(NOW.getTime() + days * DAY), NOW)).toBe(expected)
	})

	it('daysToEventBucket accepts a date string and answers past for an unusable date', () => {
		expect(daysToEventBucket('2026-10-20T12:00:00Z', NOW)).toBe('0_7')
		expect(daysToEventBucket('not a date', NOW)).toBe('past')
		expect(daysToEventBucket(null, NOW)).toBe('past')
		expect(daysToEventBucket(undefined, NOW)).toBe('past')
	})

	it.each([
		[-10, '0_30'],
		[0.5, '0_30'],
		[30.5, '0_30'],
		[31.5, '31_90'],
		[90.5, '31_90'],
		[91.5, '91_180'],
		[180.5, '91_180'],
		[181.5, '181_plus'],
	])('leadTimeBucket of a date in %s days is %s', (days, expected) => {
		expect(leadTimeBucket(new Date(NOW.getTime() + days * DAY), NOW)).toBe(expected)
	})

	it('leadTimeBucket answers the shortest range for an unusable date', () => {
		expect(leadTimeBucket('not a date', NOW)).toBe('0_30')
		expect(leadTimeBucket(null, NOW)).toBe('0_30')
	})

	it.each([
		[0, 'lt_15s'],
		[14_999, 'lt_15s'],
		[15_000, '15_60s'],
		[59_999, '15_60s'],
		[60_000, '1_3m'],
		[179_999, '1_3m'],
		[180_000, '3_10m'],
		[600_000, '3_10m'],
		[600_001, 'gt_10m'],
		[Number.NaN, 'lt_15s'],
	])('elapsedBucket(%s) is %s', (milliseconds, expected) => {
		expect(elapsedBucket(milliseconds)).toBe(expected)
	})

	it.each([
		[0, '1_2'],
		[2, '1_2'],
		[3, '3_5'],
		[5, '3_5'],
		[6, '6_10'],
		[10, '6_10'],
		[11, 'gt_10'],
		[Number.NaN, '1_2'],
	])('readTimeBucket(%s) is %s', (minutes, expected) => {
		expect(readTimeBucket(minutes)).toBe(expected)
	})

	it('always answers with a member of its closed list', () => {
		for (const value of [Number.NaN, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, -1, 0, 1e12]) {
			expect(PRICE_BUCKETS).toContain(priceBucket(value))
			expect(COUNT_BUCKETS).toContain(countBucket(value))
			expect(ELAPSED_BUCKETS).toContain(elapsedBucket(value))
			expect(READ_TIME_BUCKETS).toContain(readTimeBucket(value))
			expect(DAYS_TO_EVENT_BUCKETS).toContain(daysToEventBucket(value, NOW))
			expect(LEAD_TIME_BUCKETS).toContain(leadTimeBucket(value, NOW))
		}
	})
})

describe('classifiers', () => {
	it.each(UNKNOWN_INPUTS)('answer with a member of their closed list for %j', input => {
		expect(AUTH_ERROR_KINDS).toContain(clerkErrorKind(input))
		expect(VERIFIED_EMAIL_KINDS).toContain(verifiedEmailKind(input))
		expect(PURCHASE_ERROR_KINDS).toContain(paypalCodeKind(input))
		expect(FUNDING_SOURCES).toContain(fundingSource(input))
		expect(SECTIONS).toContain(sectionOf(input))
		expect(REFERRER_SOURCES).toContain(referrerSource(input, ORIGIN))
		expect(SIGN_IN_INTENTS).toContain(signInIntent(input))
		expect(ARTICLE_LINK_TARGETS).toContain(articleLinkTarget(input, ORIGIN))
		expect(WIZARD_STEPS).toContain(wizardStep(input))
		expect(SPORTS).toContain(sportOf(input))
	})

	it.each([
		['form_password_incorrect', 'wrong_password'],
		['form_identifier_not_found', 'account_not_found'],
		['form_identifier_exists', 'account_exists'],
		['form_code_incorrect', 'code_incorrect'],
		['verification_expired', 'code_expired'],
		['verification_failed', 'verification_failed'],
		['form_password_pwned', 'password_rejected'],
		['form_password_length_too_short', 'password_rejected'],
		['captcha_invalid', 'captcha'],
		['too_many_requests', 'rate_limited'],
		['form_param_format_invalid', 'invalid_param'],
		['oauth_access_denied', 'oauth'],
		['external_account_not_found', 'oauth'],
		['session_exists', 'session_exists'],
		['network_error', 'network'],
		['some_new_clerk_code', 'unknown'],
		[undefined, 'unknown'],
	])('clerkErrorKind(%j) is %s', (code, expected) => {
		expect(clerkErrorKind(code)).toBe(expected)
	})

	it.each([
		['RATE_LIMIT_EXCEEDED', 'rate_limited'],
		['EMAIL_ALREADY_VERIFIED', 'already_verified'],
		['VERIFICATION_CODE_EXPIRED', 'code_expired'],
		['INVALID_VERIFICATION_CODE', 'code_incorrect'],
		['EMAIL_SEND_FAILED', 'send_failed'],
		['CREATE_EMAIL_FAILED', 'failed'],
		['Please wait 42 seconds before requesting another code', 'rate_limited'],
		['Maximum daily attempts reached', 'rate_limited'],
		['Anything else', 'unknown'],
		[undefined, 'unknown'],
	])('verifiedEmailKind(%j) is %s', (code, expected) => {
		expect(verifiedEmailKind(code)).toBe(expected)
	})

	it.each([
		['INSTRUMENT_DECLINED', 'instrument_declined'],
		['INSUFFICIENT_FUNDS', 'insufficient_funds'],
		['PAYER_ACCOUNT_RESTRICTED', 'payer_restricted'],
		['UNPROCESSABLE_ENTITY', 'paypal_error'],
		[undefined, 'paypal_error'],
	])('paypalCodeKind(%j) is %s', (code, expected) => {
		expect(paypalCodeKind(code)).toBe(expected)
	})

	it.each([
		['paypal', 'paypal'],
		['card', 'card'],
		['paylater', 'paylater'],
		['credit', 'paylater'],
		['sepa', 'sepa'],
		['venmo', 'other'],
		[undefined, 'other'],
	])('fundingSource(%j) is %s', (sdkValue, expected) => {
		expect(fundingSource(sdkValue)).toBe(expected)
	})

	it.each([
		['/', 'home'],
		['/fr', 'home'],
		['/fr/', 'home'],
		['/fr/marketplace/abcdefghij12345', 'marketplace'],
		['/events', 'events'],
		['/ko/blog/some-article', 'blog'],
		['/fr/faq', 'faq'],
		['/fr/contact', 'contact'],
		['/fr/legals/privacy-policy', 'legals'],
		['/fr/auth/sign-in', 'auth'],
		['/fr/sign-in', 'auth'],
		['/fr/dashboard/seller', 'dashboard'],
		['/fr/profile', 'profile'],
		['/fr/purchase/success', 'purchase'],
		['/fr/admin/event', 'other'],
		['/xx/marketplace', 'other'],
		[undefined, 'home'],
	])('sectionOf(%j) is %s', (pathname, expected) => {
		expect(sectionOf(pathname)).toBe(expected)
	})

	it('referrerSource tells internal, external and direct apart', () => {
		expect(referrerSource('', ORIGIN)).toBe('direct')
		expect(referrerSource(`${ORIGIN}/fr/events`, ORIGIN)).toBe('internal')
		expect(referrerSource('https://www.google.com/search?q=x', ORIGIN)).toBe('external')
		expect(referrerSource('not a url', ORIGIN)).toBe('direct')
		// Without arguments it reads the document and the window
		expect(REFERRER_SOURCES).toContain(referrerSource())
	})

	it.each([
		['?redirect_url=%2Ffr%2Fmarketplace%2Fabcdefghij12345', 'purchase'],
		['?redirect_url=https%3A%2F%2Fbeswib.com%2Ffr%2Fpurchase%2Fsuccess', 'purchase'],
		['?redirectUrl=%2Ffr%2Fdashboard%2Fseller%2Fsell-bib', 'sell'],
		['?redirect_url=%2Ffr%2Fdashboard%2Fbuyer', 'none'],
		['?other=1', 'none'],
		['', 'none'],
		[undefined, 'none'],
	])('signInIntent(%j) is %s', (search, expected) => {
		expect(signInIntent(search)).toBe(expected)
	})

	it.each([
		['/fr/marketplace', 'marketplace'],
		['/events/abcdefghij12345', 'events'],
		['/fr/dashboard/seller/sell-bib', 'sell_bib'],
		['/fr/blog/another-article', 'blog'],
		['/faq#refunds', 'faq'],
		['/fr/contact', 'contact'],
		['/fr/auth/sign-up', 'auth'],
		['/fr', 'home'],
		['/fr/profile', 'internal_other'],
		['https://beswib.com/fr/marketplace', 'marketplace'],
		['https://www.beswib.com/fr/events', 'events'],
		['https://www.strava.com/clubs/beswib', 'external'],
		['mailto:contact@beswib.com', 'mailto'],
		['tel:+33123456789', 'external'],
		['http://[bad', 'external'],
		[undefined, 'home'],
	])('articleLinkTarget(%j) is %s', (href, expected) => {
		expect(articleLinkTarget(href, ORIGIN)).toBe(expected)
	})

	it('articleLinkTarget treats a relative link as internal when there is no browser origin', () => {
		expect(articleLinkTarget('/fr/marketplace', '')).toBe('marketplace')
		expect(articleLinkTarget('https://example.org/', '')).toBe('external')
	})

	it.each([
		['eventSelection', 'event_selection'],
		['emailVerification', 'email_verification'],
		['bibDetails', 'bib_details'],
		['pricing', 'pricing'],
		['confirmation', 'confirmation'],
		[undefined, 'event_selection'],
	])('wizardStep(%j) is %s', (step, expected) => {
		expect(wizardStep(step)).toBe(expected)
	})

	it.each([
		['road', 'road'],
		['trail', 'trail'],
		['triathlon', 'triathlon'],
		['cycle', 'cycle'],
		['ultra', 'other'],
		[null, 'other'],
		[undefined, 'other'],
	])('sportOf(%j) is %s', (typeCourse, expected) => {
		expect(sportOf(typeCourse)).toBe(expected)
	})
})

describe('listingOf', () => {
	it.each([
		['public', 'public'],
		['private', 'private'],
		[null, undefined],
		[undefined, undefined],
		['', undefined],
		['Public', undefined],
		['draft', undefined],
	])('listingOf(%j) is %s', (listed, expected) => {
		expect(listingOf(listed)).toBe(expected)
	})

	it('only returns a member of the closed list', () => {
		for (const listed of ['public', 'private']) expect(LISTINGS).toContain(listingOf(listed))
	})

	it('takes Bib.listed as it is, null included', () => {
		const bib: Pick<Bib, 'listed'> = { listed: null }
		const props: EventProps<'listing_edit_view'> = { state: 'ok', listing: listingOf(bib.listed) }
		expect(props.listing).toBeUndefined()
		const required: EventProps<'payment_capture_success'>['listing'] = listingOf(bib.listed) ?? 'public'
		expect(required).toBe('public')
	})
})

describe('ids', () => {
	it('reads the id each helper is named after', () => {
		expect(bibIdOf({ id: 'bib000000000001', eventId: 'event0000000001' })).toBe('bib000000000001')
		expect(eventIdOfBib({ id: 'bib000000000001', eventId: 'event0000000001' })).toBe('event0000000001')
		expect(eventIdOf({ id: 'event0000000001', typeCourse: 'road' })).toBe('event0000000001')
		expect(articleIdOf({ id: 'article00000001', slug: 'a-slug' })).toBe('article00000001')
	})

	it('never returns the id of the transaction or of the waitlist entry', () => {
		const transaction = { id: 'tx0000000000001', bib_id: 'bib000000000001', amount: 85 }
		expect(bibIdOfTransaction(transaction)).toBe('bib000000000001')
		const waitlist = { id: 'wait00000000001', event_id: 'event0000000001', added_at: new Date(NOW) }
		expect(eventIdOfWaitlist(waitlist)).toBe('event0000000001')
	})
})
