import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The language switch of the header and of the footer sends the visitor to the same page in the
// other language. It used to keep the path only: on the sign-in form the page to come back to was
// lost (redirect_url), and on the link of a private listing its token, so the buyer was left with
// the form that asks for one.

const mocks = vi.hoisted(() => {
	const push = vi.fn()
	return {
		updateUserLocalePreference: vi.fn(),
		track: vi.fn(),
		router: { push },
		push,
		getArticleTranslatedSlug: vi.fn(),
	}
})

vi.mock('next/navigation', () => ({ useRouter: () => mocks.router }))
vi.mock('@clerk/nextjs', () => ({ useUser: () => ({ isSignedIn: false }) }))
vi.mock('@/app/[locale]/actions/locale', () => ({
	updateUserLocalePreference: mocks.updateUserLocalePreference,
	getArticleTranslatedSlug: mocks.getArticleTranslatedSlug,
}))
vi.mock('@/lib/analytics/client', () => ({ trackView: vi.fn(), track: mocks.track }))

import { useLocale } from '@/hooks/useLocale'

const BIB = '/fr/marketplace/abcdefghij12345?tkn=s3cr3t-Token'
const WITH_BIB = `?redirect_url=${encodeURIComponent(BIB)}`

let container: HTMLDivElement
let root: Root
let changeLocale: (locale: string) => Promise<void>

function Switch() {
	changeLocale = useLocale('fr', 'header').changeLocale
	return null
}

// The visitor is on a French page and picks another language
async function switchFrom(path: string, locale: string): Promise<void> {
	window.history.replaceState({}, '', path)
	act(() => root.render(<Switch />))
	await act(async () => {
		await changeLocale(locale)
	})
}

beforeEach(() => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	container = document.createElement('div')
	document.body.appendChild(container)
	root = createRoot(container)
	mocks.getArticleTranslatedSlug.mockResolvedValue({ success: false, slug: null })
})

afterEach(() => {
	act(() => root.unmount())
	container.remove()
	window.localStorage.clear()
	// biome-ignore lint/suspicious/noDocumentCookie: the switch writes the cookie this way, the test removes it the same way
	document.cookie = 'NEXT_LOCALE=; path=/; max-age=0'
	window.history.replaceState({}, '', '/')
	vi.unstubAllGlobals()
	vi.resetAllMocks()
})

describe('the same page in another language', () => {
	it.each(['sign-in', 'sign-up', 'forgot-password'])('keeps the page to come back to on the %s form', async form => {
		await switchFrom(`/fr/auth/${form}${WITH_BIB}`, 'de')

		expect(mocks.push.mock.calls).toEqual([[`/de/auth/${form}${WITH_BIB}`]])
	})

	it('keeps the token of a private listing: the buyer stays on the bib', async () => {
		await switchFrom(BIB, 'de')

		expect(mocks.push.mock.calls).toEqual([['/de/marketplace/abcdefghij12345?tkn=s3cr3t-Token']])
	})

	it('keeps them towards English too, where the middleware adds the locale', async () => {
		await switchFrom(BIB, 'en')

		// middleware-sign-in-url.test.ts: /marketplace/...?tkn=... is answered with /en/marketplace/...?tkn=...
		expect(mocks.push.mock.calls).toEqual([['/marketplace/abcdefghij12345?tkn=s3cr3t-Token']])
	})

	it('keeps the place in the page', async () => {
		await switchFrom('/fr/dashboard/seller#my-listings', 'es')

		expect(mocks.push.mock.calls).toEqual([['/es/dashboard/seller#my-listings']])
	})

	it.each([
		['/fr/events', '/de/events'],
		['/fr', '/de/'],
	])('changes nothing for %s, whose address carries nothing', async (path, expected) => {
		await switchFrom(path, 'de')

		expect(mocks.push.mock.calls).toEqual([[expected]])
	})

	it('tells the analytics the language and the kind of page, never the address', async () => {
		await switchFrom(`/fr/auth/sign-in${WITH_BIB}`, 'de')

		expect(mocks.track.mock.calls).toEqual([['locale_change', { where: 'header', to: 'de', result: 'same_page' }]])
	})
})

describe('an article, which has another address in each language', () => {
	it('goes to the translated article, without what the address of the French one carried', async () => {
		mocks.getArticleTranslatedSlug.mockResolvedValue({ success: true, slug: 'mein-artikel' })

		await switchFrom('/fr/blog/mon-article?utm_source=newsletter#partie-2', 'de')

		expect(mocks.getArticleTranslatedSlug).toHaveBeenCalledWith('mon-article', 'de')
		expect(mocks.push.mock.calls).toEqual([['/de/blog/mein-artikel']])
	})
})
