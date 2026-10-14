import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Clerk cannot be reached from a test: the two forms are given a Clerk that answers what the test
// decides, and what is checked is where they send the visitor once the session exists. Before, it
// was always the dashboard: a visitor who signed in to buy a bib lost the bib.

const mocks = vi.hoisted(() => ({
	track: vi.fn(),
	signUp: {
		prepareEmailAddressVerification: vi.fn(),
		create: vi.fn(),
		authenticateWithRedirect: vi.fn(),
		attemptEmailAddressVerification: vi.fn(),
	},
	signIn: { create: vi.fn(), authenticateWithRedirect: vi.fn() },
	setActive: vi.fn(),
	push: vi.fn(),
}))

vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mocks.push }),
	useParams: () => ({ locale: 'fr' }),
}))
vi.mock('next/link', () => ({
	default: ({ href, children }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))
vi.mock('@clerk/nextjs/legacy', () => ({
	useSignUp: () => ({ signUp: mocks.signUp, setActive: mocks.setActive, isLoaded: true }),
	useSignIn: () => ({ signIn: mocks.signIn, setActive: mocks.setActive, isLoaded: true }),
}))
vi.mock('@clerk/nextjs', () => ({ useUser: () => ({ user: null, isSignedIn: false, isLoaded: true }) }))
vi.mock('@/lib/analytics/client', () => ({ trackView: vi.fn(), track: mocks.track }))

import mainLocales from '@/app/[locale]/locales.json'
import CustomSignIn from '@/components/auth/CustomSignIn'
import CustomSignUp from '@/components/auth/CustomSignUp'
import { getTranslations } from '@/lib/i18n/dictionary'

const t = getTranslations('fr', mainLocales).auth

const BIB = '/fr/marketplace/abcdefghij12345?tkn=s3cr3t-Token'
const WITH_BIB = `?redirect_url=${encodeURIComponent(BIB)}`
const DASHBOARD = '/fr/dashboard'
// Where the provider hands the visitor back: Clerk finishes the attempt there (see sso-callback.test.tsx)
const CALLBACK = '/fr/auth/sso-callback'

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

function open(path: string, form: ReactNode): void {
	window.history.replaceState({}, '', path)
	act(() => root.render(form))
}

// Lets the promises of a handler run, and React apply what they changed
const settle = () =>
	act(async () => {
		await new Promise(resolve => setTimeout(resolve, 0))
	})

function field(autoComplete: string, index = 0): HTMLInputElement {
	const input = container.querySelectorAll<HTMLInputElement>(`input[autocomplete="${autoComplete}"]`)[index]
	if (input === undefined) throw new Error(`No ${autoComplete} field`)
	return input
}

// React reads the value through the native setter, then hears the input event
function type(input: HTMLInputElement, value: string): void {
	const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
	act(() => {
		setValue?.call(input, value)
		input.dispatchEvent(new Event('input', { bubbles: true }))
	})
}

async function submit(): Promise<void> {
	await act(async () => {
		container.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
		await Promise.resolve()
	})
	await settle()
}

async function click(label: string): Promise<void> {
	const button = [...container.querySelectorAll('button')].find(candidate => candidate.textContent?.includes(label))
	if (button === undefined) throw new Error(`No button "${label}"`)
	await act(async () => {
		button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		await Promise.resolve()
	})
	await settle()
}

function link(label: string): string | null {
	const anchor = [...container.querySelectorAll('a')].find(candidate => candidate.textContent?.includes(label))
	return anchor?.getAttribute('href') ?? null
}

async function signInWithPassword(): Promise<void> {
	type(field('email'), 'runner@example.com')
	type(field('current-password'), 'Trail-2026-test')
	await submit()
}

async function fillSignUp(): Promise<void> {
	type(field('given-name'), 'Ada')
	type(field('family-name'), 'Runner')
	type(field('email'), 'runner@example.com')
	type(field('new-password', 0), 'Trail-2026-test')
	type(field('new-password', 1), 'Trail-2026-test')
	await submit()
}

// Everything the forms said to the analytics, and what they left for the page the provider returns to
function analytics(): string {
	return JSON.stringify([mocks.track.mock.calls, window.sessionStorage.getItem('beswib.oauth')])
}

beforeEach(() => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	// The animation library of the fields restores the scroll position, which jsdom cannot do
	vi.stubGlobal('scrollTo', vi.fn())
	container = document.createElement('div')
	document.body.appendChild(container)
	root = createRoot(container)

	mocks.signIn.create.mockResolvedValue({ status: 'complete', createdSessionId: 'sess_1' })
	mocks.signUp.create.mockResolvedValue({ status: 'complete', createdSessionId: 'sess_1' })
	mocks.signUp.attemptEmailAddressVerification.mockResolvedValue({ status: 'complete', createdSessionId: 'sess_1' })
	mocks.setActive.mockResolvedValue(undefined)
})

afterEach(() => {
	act(() => root.unmount())
	container.remove()
	window.sessionStorage.clear()
	window.history.replaceState({}, '', '/')
	vi.unstubAllGlobals()
	vi.resetAllMocks()
})

describe('sign-in with a password', () => {
	it('goes back to the bib that asked for it, private listing token included', async () => {
		open(`/fr/auth/sign-in${WITH_BIB}`, <CustomSignIn />)
		await signInWithPassword()

		expect(mocks.setActive).toHaveBeenCalledWith({ session: 'sess_1' })
		expect(mocks.push.mock.calls).toEqual([[BIB]])
	})

	it('goes to the dashboard when no page asked for the sign-in', async () => {
		open('/fr/auth/sign-in', <CustomSignIn />)
		await signInWithPassword()

		expect(mocks.push.mock.calls).toEqual([[DASHBOARD]])
	})

	it.each(ELSEWHERE)('goes to the dashboard when redirect_url is %s', async (_name, value) => {
		open(`/fr/auth/sign-in?redirect_url=${encodeURIComponent(value)}`, <CustomSignIn />)
		await signInWithPassword()

		expect(mocks.push.mock.calls).toEqual([[DASHBOARD]])
	})

	it('goes back to the bib when Clerk says the visitor already has a session', async () => {
		mocks.signIn.create.mockRejectedValue({ errors: [{ code: 'session_exists' }] })

		open(`/fr/auth/sign-in${WITH_BIB}`, <CustomSignIn />)
		await signInWithPassword()

		expect(mocks.push.mock.calls).toEqual([[BIB]])
	})

	it('reads the destination when the attempt starts, not once the address bar has moved on', async () => {
		// Another navigation (the page, or Clerk refreshing the route) can win the race with the form
		mocks.setActive.mockImplementation(() => {
			window.history.replaceState({}, '', DASHBOARD)
			return Promise.resolve()
		})

		open(`/fr/auth/sign-in${WITH_BIB}`, <CustomSignIn />)
		await signInWithPassword()

		expect(mocks.push.mock.calls).toEqual([[BIB]])
	})

	it('stays on the form when the password is wrong', async () => {
		mocks.signIn.create.mockRejectedValue({ errors: [{ code: 'form_password_incorrect' }] })

		open(`/fr/auth/sign-in${WITH_BIB}`, <CustomSignIn />)
		await signInWithPassword()

		expect(mocks.push).not.toHaveBeenCalled()
	})

	it('tells the analytics what the sign-in was for, never the page or its token', async () => {
		open(`/fr/auth/sign-in${WITH_BIB}`, <CustomSignIn />)
		await signInWithPassword()

		expect(mocks.track.mock.calls).toEqual([
			['sign_in_start', { method: 'password', intent: 'purchase' }],
			['sign_in_success', { method: 'password', intent: 'purchase' }],
		])
	})
})

describe('sign-in with Google or Facebook', () => {
	it.each([
		['oauth_google', t.signIn.continueWithGoogle],
		['oauth_facebook', t.signIn.continueWithFacebook],
	])('asks Clerk to come back to the bib with %s, through the callback page', async (strategy, label) => {
		open(`/fr/auth/sign-in${WITH_BIB}`, <CustomSignIn />)
		await click(label)

		expect(mocks.signIn.authenticateWithRedirect.mock.calls).toEqual([
			[{ strategy, redirectUrlComplete: BIB, redirectUrl: `${CALLBACK}${WITH_BIB}` }],
		])
	})

	it('asks Clerk to come back to the dashboard when no page asked for the sign-in', async () => {
		open('/fr/auth/sign-in', <CustomSignIn />)
		await click(t.signIn.continueWithGoogle)

		// Never the destination itself: an account Beswib does not know is created on the callback page
		expect(mocks.signIn.authenticateWithRedirect.mock.calls).toEqual([
			[{ strategy: 'oauth_google', redirectUrlComplete: DASHBOARD, redirectUrl: CALLBACK }],
		])
	})

	it.each(ELSEWHERE)('never hands Clerk a redirect_url that is %s', async (_name, value) => {
		open(`/fr/auth/sign-in?redirect_url=${encodeURIComponent(value)}`, <CustomSignIn />)
		await click(t.signIn.continueWithGoogle)

		expect(mocks.signIn.authenticateWithRedirect.mock.calls).toEqual([
			[{ strategy: 'oauth_google', redirectUrlComplete: DASHBOARD, redirectUrl: CALLBACK }],
		])
	})

	it('leaves closed values for the page the provider returns to: no path, no token', async () => {
		open(`/fr/auth/sign-in${WITH_BIB}`, <CustomSignIn />)
		await click(t.signIn.continueWithGoogle)

		expect(mocks.track.mock.calls).toEqual([['sign_in_start', { method: 'google', intent: 'purchase' }]])
		expect(JSON.parse(window.sessionStorage.getItem('beswib.oauth') ?? '{}')).toEqual({
			t: expect.any(Number),
			method: 'google',
			intent: 'purchase',
			flow: 'sign_in',
		})
		expect(analytics()).not.toMatch(/tkn|s3cr3t|abcdefghij12345|marketplace/)
	})
})

describe('the link from the sign-in form to the sign-up form', () => {
	it('carries the page to come back to', () => {
		open(`/fr/auth/sign-in${WITH_BIB}`, <CustomSignIn />)

		expect(link(t.signIn.createAccount)).toBe(`/fr/auth/sign-up${WITH_BIB}`)
	})

	it('is the plain sign-up page without one', () => {
		open('/fr/auth/sign-in', <CustomSignIn />)

		expect(link(t.signIn.createAccount)).toBe('/fr/auth/sign-up')
	})

	it.each(ELSEWHERE)('does not carry a redirect_url that is %s', (_name, value) => {
		open(`/fr/auth/sign-in?redirect_url=${encodeURIComponent(value)}`, <CustomSignIn />)

		expect(link(t.signIn.createAccount)).toBe('/fr/auth/sign-up')
	})
})

// A visitor who signs in to buy a bib and has forgotten their password must not lose the bib either
describe('the link from the sign-in form to the forgotten-password page', () => {
	it('carries the page to come back to', () => {
		open(`/fr/auth/sign-in${WITH_BIB}`, <CustomSignIn />)

		expect(link(t.signIn.forgotPassword)).toBe(`/fr/auth/forgot-password${WITH_BIB}`)
	})

	it('is the plain page without one', () => {
		open('/fr/auth/sign-in', <CustomSignIn />)

		expect(link(t.signIn.forgotPassword)).toBe('/fr/auth/forgot-password')
	})

	it.each(ELSEWHERE)('does not carry a redirect_url that is %s', (_name, value) => {
		open(`/fr/auth/sign-in?redirect_url=${encodeURIComponent(value)}`, <CustomSignIn />)

		expect(link(t.signIn.forgotPassword)).toBe('/fr/auth/forgot-password')
	})
})

describe('sign-up', () => {
	it('goes back to the bib when the account is complete at once', async () => {
		open(`/fr/auth/sign-up${WITH_BIB}`, <CustomSignUp />)
		await fillSignUp()

		expect(mocks.signUp.create).toHaveBeenCalledTimes(1)
		expect(mocks.push.mock.calls).toEqual([[BIB]])
	})

	it('goes back to the bib after the e-mail verification code', async () => {
		mocks.signUp.create.mockResolvedValue({ unverifiedFields: ['email_address'], status: 'missing_requirements' })

		open(`/fr/auth/sign-up${WITH_BIB}`, <CustomSignUp />)
		await fillSignUp()
		expect(mocks.signUp.prepareEmailAddressVerification).toHaveBeenCalledTimes(1)
		expect(mocks.push).not.toHaveBeenCalled()

		type(field('one-time-code'), '123456')
		await submit()

		expect(mocks.signUp.attemptEmailAddressVerification).toHaveBeenCalledWith({ code: '123456' })
		expect(mocks.setActive).toHaveBeenCalledWith({ session: 'sess_1' })
		expect(mocks.push.mock.calls).toEqual([[BIB]])
	})

	it('goes to the dashboard when no page asked for the account', async () => {
		open('/fr/auth/sign-up', <CustomSignUp />)
		await fillSignUp()

		expect(mocks.push.mock.calls).toEqual([[DASHBOARD]])
	})

	it.each(ELSEWHERE)('goes to the dashboard when redirect_url is %s', async (_name, value) => {
		open(`/fr/auth/sign-up?redirect_url=${encodeURIComponent(value)}`, <CustomSignUp />)
		await fillSignUp()

		expect(mocks.push.mock.calls).toEqual([[DASHBOARD]])
	})

	it.each([
		['oauth_google', t.signUp.signUpWithGoogle],
		['oauth_facebook', t.signUp.signUpWithFacebook],
	])('asks Clerk to come back to the bib with %s, through the callback page', async (strategy, label) => {
		open(`/fr/auth/sign-up${WITH_BIB}`, <CustomSignUp />)
		await click(label)

		expect(mocks.signUp.authenticateWithRedirect.mock.calls).toEqual([
			[{ strategy, redirectUrlComplete: BIB, redirectUrl: `${CALLBACK}${WITH_BIB}` }],
		])
	})

	it('asks Clerk to come back to the dashboard when no page asked for the account', async () => {
		open('/fr/auth/sign-up', <CustomSignUp />)
		await click(t.signUp.signUpWithGoogle)

		// Never the destination itself: an account that already exists is signed in on the callback page
		expect(mocks.signUp.authenticateWithRedirect.mock.calls).toEqual([
			[{ strategy: 'oauth_google', redirectUrlComplete: DASHBOARD, redirectUrl: CALLBACK }],
		])
	})

	it.each(ELSEWHERE)('never hands Clerk a redirect_url that is %s', async (_name, value) => {
		open(`/fr/auth/sign-up?redirect_url=${encodeURIComponent(value)}`, <CustomSignUp />)
		await click(t.signUp.signUpWithGoogle)

		expect(mocks.signUp.authenticateWithRedirect.mock.calls).toEqual([
			[{ strategy: 'oauth_google', redirectUrlComplete: DASHBOARD, redirectUrl: CALLBACK }],
		])
	})

	it('carries the page to come back to on its link to the sign-in form', () => {
		open(`/fr/auth/sign-up${WITH_BIB}`, <CustomSignUp />)

		expect(link(t.signUp.signIn)).toBe(`/fr/auth/sign-in${WITH_BIB}`)
	})

	it('never tells the analytics the page or its token', async () => {
		open(`/fr/auth/sign-up${WITH_BIB}`, <CustomSignUp />)
		await fillSignUp()

		expect(mocks.track.mock.calls.map(call => call[0])).toEqual(['sign_up_start', 'sign_up_step', 'sign_up_success'])
		expect(analytics()).not.toMatch(/tkn|s3cr3t|abcdefghij12345|marketplace/)
	})
})
