import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// A sign-in with Google or Facebook that needs one more step is only finished by Clerk's callback:
// an account Beswib does not know becomes a sign-up, an account that exists becomes a sign-in.
// The forms used to name the destination as the page the provider returns to, and nothing on a
// bib or on the dashboard finishes an attempt: those visitors came back signed out.
//
// Clerk cannot be reached from a test. What is checked is what its callback is told: where to send
// the visitor once there is a session, and where when there is none.

const mocks = vi.hoisted(() => ({ callback: vi.fn() }))

vi.mock('next/navigation', () => ({ useParams: () => ({ locale: 'fr' }) }))
vi.mock('@clerk/nextjs', () => ({
	AuthenticateWithRedirectCallback: (props: Record<string, unknown>) => {
		mocks.callback(props)
		return null
	},
}))

import Page from '@/app/[locale]/auth/sso-callback/page'
import { oauthCallbackPath } from '@/lib/utils/redirect'

const BIB = '/fr/marketplace/abcdefghij12345?tkn=s3cr3t-Token'
const WITH_BIB = `?redirect_url=${encodeURIComponent(BIB)}`
const DASHBOARD = '/fr/dashboard'

// redirect_url values that must leave the visitor on the dashboard: see redirect-target.test.ts
const ELSEWHERE = [
	['another site', 'https://evil.tld/fr/dashboard'],
	['a protocol-relative address', '//evil.tld'],
	['a backslash', '/\\evil.tld'],
	['an encoded slash', '/%2Fevil.tld'],
	['a tab', '/\t/evil.tld'],
	['a script', 'javascript:alert(1)'],
	['an API route', '/api/waitlist/remove?token=abc'],
] as const

let container: HTMLDivElement
let root: Root

function land(path: string): void {
	window.history.replaceState({}, '', path)
	act(() => root.render(<Page />))
}

// What Clerk's callback was told, which must be the same every time React rendered it
function told(): Record<string, unknown> {
	const calls = mocks.callback.mock.calls.map(call => call[0] as Record<string, unknown>)
	expect(calls.length).toBeGreaterThan(0)
	for (const props of calls) expect(props).toEqual(calls[0])
	return calls[0] ?? {}
}

beforeEach(() => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	container = document.createElement('div')
	document.body.appendChild(container)
	root = createRoot(container)
})

afterEach(() => {
	act(() => root.unmount())
	container.remove()
	window.history.replaceState({}, '', '/')
	vi.unstubAllGlobals()
	vi.resetAllMocks()
})

describe('the page Google or Facebook returns to', () => {
	it('is the one the forms name to Clerk, and reads back the page they asked to come back to', () => {
		land(oauthCallbackPath('fr', BIB))

		expect(window.location.pathname).toBe('/fr/auth/sso-callback')
		expect(told()).toMatchObject({ signUpForceRedirectUrl: BIB, signInForceRedirectUrl: BIB })
	})

	it('sends the visitor to the bib once Clerk has a session, whether it signed in or created the account', () => {
		land(`/fr/auth/sso-callback${WITH_BIB}`)

		expect(told()).toEqual({
			signUpUrl: `/fr/auth/sign-up${WITH_BIB}`,
			signUpForceRedirectUrl: BIB,
			signInUrl: `/fr/auth/sign-in${WITH_BIB}`,
			signInForceRedirectUrl: BIB,
		})
	})

	it('sends the visitor back to a form that still knows the bib when the attempt cannot be finished', () => {
		land(`/fr/auth/sso-callback${WITH_BIB}`)

		const { signInUrl, signUpUrl } = told()
		for (const form of [signInUrl, signUpUrl]) {
			expect(new URL(String(form), 'https://beswib.com').searchParams.get('redirect_url')).toBe(BIB)
		}
	})

	it('sends the visitor to the dashboard when no page asked for the sign-in', () => {
		land('/fr/auth/sso-callback')

		expect(told()).toEqual({
			signUpUrl: '/fr/auth/sign-up',
			signUpForceRedirectUrl: DASHBOARD,
			signInUrl: '/fr/auth/sign-in',
			signInForceRedirectUrl: DASHBOARD,
		})
	})

	it.each(ELSEWHERE)('keeps the visitor on the site, on the dashboard, when redirect_url is %s', (_name, value) => {
		land(`/fr/auth/sso-callback?redirect_url=${encodeURIComponent(value)}`)

		expect(told()).toEqual({
			signUpUrl: '/fr/auth/sign-up',
			signUpForceRedirectUrl: DASHBOARD,
			signInUrl: '/fr/auth/sign-in',
			signInForceRedirectUrl: DASHBOARD,
		})
	})

	it('gives Clerk nothing else a link could carry: its own redirect parameters are not passed on', () => {
		land(
			`/fr/auth/sso-callback?sign_in_force_redirect_url=${encodeURIComponent('https://evil.tld')}&sign_up_fallback_redirect_url=%2Fapi%2Fx`
		)

		expect(JSON.stringify(told())).not.toMatch(/evil|api/)
		expect(Object.keys(told()).sort()).toEqual([
			'signInForceRedirectUrl',
			'signInUrl',
			'signUpForceRedirectUrl',
			'signUpUrl',
		])
	})

	it('has the element Clerk draws its bot protection in when the attempt becomes a sign-up', () => {
		land(`/fr/auth/sso-callback${WITH_BIB}`)

		expect(container.querySelector('#clerk-captcha')).not.toBeNull()
	})
})
