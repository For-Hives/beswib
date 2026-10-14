import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// A visitor who signs in to buy a bib and has forgotten their password goes through this page.
// The sign-in form hands it the page to come back to (see return-after-auth.test.tsx); it must not
// drop it on the way: a reset ends with a session, and the visitor on the dashboard.

const mocks = vi.hoisted(() => {
	const push = vi.fn()
	// One router for the life of the page, as Next.js gives
	return { auth: { isSignedIn: false, isLoaded: true }, router: { push }, push }
})

vi.mock('next/navigation', () => ({
	useRouter: () => mocks.router,
	useParams: () => ({ locale: 'fr' }),
}))
vi.mock('next/link', () => ({
	default: ({ href, children }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))
vi.mock('@clerk/nextjs', () => ({ useAuth: () => mocks.auth }))
vi.mock('@clerk/nextjs/legacy', () => ({ useSignIn: () => ({ signIn: {}, setActive: vi.fn() }) }))
vi.mock('@/lib/analytics/client', () => ({ trackView: vi.fn(), track: vi.fn() }))
// The animated background of the auth pages draws on a canvas, which jsdom does not have
vi.mock('@/components/ui/AuthSplitScreen', () => ({
	default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import ForgotPasswordPage from '@/app/[locale]/auth/forgot-password/page'
import mainLocales from '@/app/[locale]/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'

const t = getTranslations('fr', mainLocales).auth

const BIB = '/fr/marketplace/abcdefghij12345?tkn=s3cr3t-Token'
const WITH_BIB = `?redirect_url=${encodeURIComponent(BIB)}`
const DASHBOARD = '/fr/dashboard'

// redirect_url values that must leave the visitor on the dashboard: see redirect-target.test.ts
const ELSEWHERE = [
	['another site', 'https://evil.tld/fr/dashboard'],
	['a protocol-relative address', '//evil.tld'],
	['a backslash', '/\\evil.tld'],
	['an encoded slash', '/%2Fevil.tld'],
	['a script', 'javascript:alert(1)'],
] as const

let container: HTMLDivElement
let root: Root

function open(path: string): void {
	window.history.replaceState({}, '', path)
	act(() => root.render(<ForgotPasswordPage />))
}

function link(label: string): string | null {
	const anchor = [...container.querySelectorAll('a')].find(candidate => candidate.textContent?.includes(label))
	return anchor?.getAttribute('href') ?? null
}

beforeEach(() => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	container = document.createElement('div')
	document.body.appendChild(container)
	root = createRoot(container)
	mocks.auth = { isSignedIn: false, isLoaded: true }
})

afterEach(() => {
	act(() => root.unmount())
	container.remove()
	window.history.replaceState({}, '', '/')
	vi.unstubAllGlobals()
	vi.resetAllMocks()
})

describe('the link back to the sign-in form', () => {
	it('carries the page to come back to', () => {
		open(`/fr/auth/forgot-password${WITH_BIB}`)

		expect(link(t.forgotPassword.backToSignIn)).toBe(`/fr/auth/sign-in${WITH_BIB}`)
		expect(mocks.push).not.toHaveBeenCalled()
	})

	it('is the plain sign-in page without one', () => {
		open('/fr/auth/forgot-password')

		expect(link(t.forgotPassword.backToSignIn)).toBe('/fr/auth/sign-in')
	})

	it.each(ELSEWHERE)('does not carry a redirect_url that is %s', (_name, value) => {
		open(`/fr/auth/forgot-password?redirect_url=${encodeURIComponent(value)}`)

		expect(link(t.forgotPassword.backToSignIn)).toBe('/fr/auth/sign-in')
	})
})

describe('once the visitor has a session: the password was reset, or they were signed in already', () => {
	beforeEach(() => {
		mocks.auth = { isSignedIn: true, isLoaded: true }
	})

	it('goes back to the bib that asked for the sign-in, private listing token included', () => {
		open(`/fr/auth/forgot-password${WITH_BIB}`)

		expect(mocks.push.mock.calls).toEqual([[BIB]])
	})

	it('goes to the dashboard when no page asked for the sign-in', () => {
		open('/fr/auth/forgot-password')

		expect(mocks.push.mock.calls).toEqual([[DASHBOARD]])
	})

	it.each(ELSEWHERE)('goes to the dashboard when redirect_url is %s', (_name, value) => {
		open(`/fr/auth/forgot-password?redirect_url=${encodeURIComponent(value)}`)

		expect(mocks.push.mock.calls).toEqual([[DASHBOARD]])
	})

	it('waits for Clerk before it sends the visitor anywhere', () => {
		mocks.auth = { isSignedIn: true, isLoaded: false }
		open(`/fr/auth/forgot-password${WITH_BIB}`)

		expect(mocks.push).not.toHaveBeenCalled()
	})
})
