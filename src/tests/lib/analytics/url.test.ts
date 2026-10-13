import { describe, expect, it } from 'vitest'

import { LOCALES, QUERY_ALLOW_LIST } from '@/lib/analytics/config'
import { cleanReferrer, cleanUrl, isBackOfficePath, maskPath, stripLocale } from '@/lib/analytics/url'

const ORIGIN = 'https://beswib.com'

// Every parameter the app or its providers put in a URL today: none may leave the browser
const SENSITIVE_PARAMS: Record<string, string> = {
	tkn: 'privatelistingtoken0123456789abcd',
	lockedAt: '2026-10-13T10:00:00.000Z',
	email: 'runner@example.com',
	waitlist_success: 'true',
	waitlist_error: 'already_added_email',
	name: 'Jane Runner',
	message: 'Please delete my account user_2abc',
	search: 'marathon de paris',
	geography: 'paris',
	location: 'Lyon',
	sport: 'trail',
	sort: 'price_asc',
	type: 'road',
	priceMin: '10',
	priceMax: '200',
	distanceMin: '5',
	distanceMax: '42',
	dateStart: '2026-11-01',
	dateEnd: '2026-12-01',
	redirect_url: 'https://beswib.com/fr/marketplace/abcdefghij12345?tkn=secret',
	redirectUrl: '/fr/dashboard',
	purchase_success: 'true',
	success: 'true',
	token: 'EC-1AB23456CD789012E',
	PayerID: 'ABCDEFGHIJKLM',
	trackingId: 'user_2abcDEF',
	merchantId: 'MERCHANT123',
	merchantIdInPayPal: 'MERCHANT456',
	__clerk_status: 'verified',
	__clerk_ticket: 'ticket',
	__clerk_db_jwt: 'jwt',
	gclid: 'gclid-value',
	fbclid: 'fbclid-value',
	msclkid: 'msclkid-value',
	ttclid: 'ttclid-value',
	li_fat_id: 'li-value',
	twclid: 'twclid-value',
}

describe('stripLocale', () => {
	it.each(LOCALES.map(locale => [locale]))('strips the locale %s', locale => {
		expect(stripLocale(`/${locale}`)).toEqual({ path: '/', locale })
		expect(stripLocale(`/${locale}/`)).toEqual({ path: '/', locale })
		expect(stripLocale(`/${locale}/events/abc`)).toEqual({ path: '/events/abc', locale })
	})

	it.each([
		['/xx/events', 'a two-letter segment that is not a locale'],
		['/france', 'a word starting with a locale'],
		['/frames/1', 'another word starting with a locale'],
		['/FR/events', 'an upper-case locale'],
		['/events/fr', 'a locale further down the path'],
		['/', 'the root'],
	])('leaves %s alone (%s)', pathname => {
		expect(stripLocale(pathname)).toEqual({ path: pathname, locale: null })
	})

	it('strips one locale only', () => {
		expect(stripLocale('/fr/en/blog')).toEqual({ path: '/en/blog', locale: 'fr' })
	})
})

describe('maskPath', () => {
	it('masks the id of the edit page of a listing', () => {
		expect(maskPath('/dashboard/seller/edit-bib/abcdefghij12345')).toBe('/dashboard/seller/edit-bib/:id')
		expect(maskPath('/dashboard/seller/edit-bib/abcdefghij12345/preview')).toBe(
			'/dashboard/seller/edit-bib/:id/preview'
		)
	})

	it('leaves other paths alone', () => {
		expect(maskPath('/dashboard/seller/edit-bib')).toBe('/dashboard/seller/edit-bib')
		expect(maskPath('/marketplace/abcdefghij12345')).toBe('/marketplace/abcdefghij12345')
	})
})

describe('isBackOfficePath', () => {
	it.each([
		'/admin',
		'/admin/',
		'/admin/event/create',
		'/fr/admin',
		'/ko/admin/organizer',
		// Next.js decodes the path before routing: an encoded letter still reaches the back-office
		'/fr/%61dmin/event',
		'/%61dmin',
		'/fr/Admin/event',
		'/FR/ADMIN',
		'/fr/admin%2Fevent',
	])('is true for %s', path => {
		expect(isBackOfficePath(path)).toBe(true)
	})

	it.each(['/', '/fr', '/fr/administration', '/administrator', '/fr/blog/admin', '/fr/events/admin', '/xx/admin', ''])(
		'is false for %j',
		path => {
			expect(isBackOfficePath(path)).toBe(false)
		}
	)

	it('does not throw on a malformed escape', () => {
		expect(isBackOfficePath('/fr/admin/%E0%A4%A')).toBe(true)
		expect(isBackOfficePath('/fr/%E0%A4%A')).toBe(false)
	})
})

describe('cleanUrl', () => {
	it.each(LOCALES.map(locale => [locale]))('cleans a %s page', locale => {
		expect(cleanUrl(`${ORIGIN}/${locale}/marketplace`, ORIGIN)).toEqual({
			url: `${ORIGIN}/marketplace`,
			path: '/marketplace',
			locale,
		})
	})

	it('strips the locale when the query follows it directly', () => {
		expect(cleanUrl(`${ORIGIN}/fr?utm_source=x`, ORIGIN)).toEqual({
			url: `${ORIGIN}/?utm_source=x`,
			path: '/',
			locale: 'fr',
		})
	})

	it('strips the locale when a hash follows it directly', () => {
		expect(cleanUrl(`${ORIGIN}/fr#faq`, ORIGIN)).toEqual({ url: `${ORIGIN}/`, path: '/', locale: 'fr' })
	})

	it('does not treat a two-letter segment that is not a locale as one', () => {
		expect(cleanUrl(`${ORIGIN}/xx/events`, ORIGIN)).toEqual({
			url: `${ORIGIN}/xx/events`,
			path: '/xx/events',
			locale: null,
		})
		expect(cleanUrl(`${ORIGIN}/france`, ORIGIN)?.path).toBe('/france')
	})

	it('keeps /administration distinct from /admin', () => {
		expect(cleanUrl(`${ORIGIN}/fr/administration`, ORIGIN)?.path).toBe('/administration')
		expect(cleanUrl(`${ORIGIN}/fr/admin/event`, ORIGIN)?.path).toBe('/admin/event')
	})

	it('accepts a relative URL', () => {
		expect(cleanUrl('/fr/events?search=paris', ORIGIN)?.url).toBe(`${ORIGIN}/events`)
	})

	it('keeps the five utm parameters and nothing else', () => {
		const query = [...QUERY_ALLOW_LIST.map(key => `${key}=v_${key}`), 'search=paris', 'utm_id=1', 'utm_sourcex=1'].join(
			'&'
		)
		const cleaned = cleanUrl(`${ORIGIN}/fr/events?${query}`, ORIGIN)
		const params = new URL(cleaned?.url ?? '').searchParams
		expect([...params.keys()].sort()).toEqual([...QUERY_ALLOW_LIST].sort())
		for (const key of QUERY_ALLOW_LIST) expect(params.get(key)).toBe(`v_${key}`)
	})

	it.each(Object.entries(SENSITIVE_PARAMS))('drops the parameter %s', (key, value) => {
		const query = new URLSearchParams({ [key]: value, utm_source: 'newsletter' }).toString()
		const cleaned = cleanUrl(`${ORIGIN}/fr/marketplace/abcdefghij12345?${query}`, ORIGIN)
		expect(cleaned?.url).toBe(`${ORIGIN}/marketplace/abcdefghij12345?utm_source=newsletter`)
	})

	it('drops every sensitive parameter at once', () => {
		const query = new URLSearchParams(SENSITIVE_PARAMS).toString()
		const cleaned = cleanUrl(`${ORIGIN}/fr/events/abcdefghij12345?${query}#top`, ORIGIN)
		expect(cleaned?.url).toBe(`${ORIGIN}/events/abcdefghij12345`)
		for (const value of Object.values(SENSITIVE_PARAMS)) {
			if (value.length > 4) expect(cleaned?.url).not.toContain(encodeURIComponent(value))
		}
	})

	it('drops a utm value that is not a campaign name', () => {
		const url = (value: string) => cleanUrl(`${ORIGIN}/?utm_source=${value}&utm_medium=email`, ORIGIN)?.url
		expect(url('runner@example.com')).toBe(`${ORIGIN}/?utm_medium=email`)
		expect(url('runner%40example.com')).toBe(`${ORIGIN}/?utm_medium=email`)
		expect(url('runner%2540example.com')).toBe(`${ORIGIN}/?utm_medium=email`)
		expect(url('two%20words')).toBe(`${ORIGIN}/?utm_medium=email`)
		expect(url('a'.repeat(81))).toBe(`${ORIGIN}/?utm_medium=email`)
		expect(url('')).toBe(`${ORIGIN}/?utm_medium=email`)
		expect(url('a'.repeat(80))).toBe(`${ORIGIN}/?utm_source=${'a'.repeat(80)}&utm_medium=email`)
	})

	it('drops the hash', () => {
		expect(cleanUrl(`${ORIGIN}/fr/faq#refund-policy`, ORIGIN)?.url).toBe(`${ORIGIN}/faq`)
		expect(cleanUrl(`${ORIGIN}/fr/faq?utm_term=x#access_token=secret`, ORIGIN)?.url).toBe(`${ORIGIN}/faq?utm_term=x`)
	})

	it('masks the id of the edit page of a listing', () => {
		expect(cleanUrl(`${ORIGIN}/fr/dashboard/seller/edit-bib/abcdefghij12345?tab=price`, ORIGIN)).toEqual({
			url: `${ORIGIN}/dashboard/seller/edit-bib/:id`,
			path: '/dashboard/seller/edit-bib/:id',
			locale: 'fr',
		})
	})

	it.each([
		undefined,
		null,
		'',
		42,
		{},
		'data:text/html,hello',
		'javascript:alert(1)',
		'mailto:someone@example.com',
		'http://[bad',
	])('returns null for %j', raw => {
		expect(cleanUrl(raw, ORIGIN)).toBeNull()
	})
})

describe('cleanReferrer', () => {
	it('keeps only the origin of another site', () => {
		expect(cleanReferrer('https://www.google.com/search?q=dossard+marathon+paris#x', ORIGIN)).toBe(
			'https://www.google.com'
		)
		expect(cleanReferrer('https://mail.example.com/inbox/message/123?user=jane', ORIGIN)).toBe(
			'https://mail.example.com'
		)
		expect(cleanReferrer('http://localhost:8080/a/b', ORIGIN)).toBe('http://localhost:8080')
	})

	it('treats a subdomain or another scheme of the site as another site', () => {
		expect(cleanReferrer('https://www.beswib.com/fr/events?search=x', ORIGIN)).toBe('https://www.beswib.com')
		expect(cleanReferrer('http://beswib.com/fr/events?search=x', ORIGIN)).toBe('http://beswib.com')
	})

	it('cleans a same-origin referrer exactly like a URL', () => {
		const raw = `${ORIGIN}/fr/marketplace/abcdefghij12345?tkn=secret&utm_campaign=spring#top`
		expect(cleanReferrer(raw, ORIGIN)).toBe(cleanUrl(raw, ORIGIN)?.url)
		expect(cleanReferrer(raw, ORIGIN)).toBe(`${ORIGIN}/marketplace/abcdefghij12345?utm_campaign=spring`)
		expect(cleanReferrer(`${ORIGIN}/fr/dashboard/seller/edit-bib/abcdefghij12345`, ORIGIN)).toBe(
			`${ORIGIN}/dashboard/seller/edit-bib/:id`
		)
	})

	it('keeps the scheme and host of an app referrer', () => {
		expect(cleanReferrer('android-app://com.google.android.gm/path?x=1', ORIGIN)).toBe(
			'android-app://com.google.android.gm'
		)
	})

	it.each([undefined, null, '', 42, 'about:blank', 'http://[bad'])('returns an empty string for %j', raw => {
		expect(cleanReferrer(raw, ORIGIN)).toBe('')
	})
})
