import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// A sign-in with Google or Facebook leaves the site and comes back on the page the visitor signed
// in for: a bib, an event, their dashboard. The form that started it left a marker, and the page
// that receives the visitor says how it ended. That page can now be any page.

const mocks = vi.hoisted(() => ({
	user: { user: null as { createdAt: Date } | null, isSignedIn: false, isLoaded: true },
	track: vi.fn(),
	pathname: '/fr/marketplace/abcdefghij12345',
}))

vi.mock('@clerk/nextjs', () => ({ useUser: () => mocks.user }))
vi.mock('next/navigation', () => ({ usePathname: () => mocks.pathname }))
vi.mock('@/lib/analytics/client', () => ({ trackView: vi.fn(), track: mocks.track }))

import { clearOAuthMarker, SessionsTracker, writeOAuthMarker } from '@/components/global/sessionsTrackers'
import { i18n } from '@/lib/i18n/config'

const MARKER = 'beswib.oauth'
const LONG_AGO = new Date('2025-01-01T00:00:00Z')
const BIB = '/fr/marketplace/abcdefghij12345'
const CALLBACK = '/fr/auth/sso-callback'

let container: HTMLDivElement
let root: Root

// The tracker is in the root layout: a navigation renders it again, it is not mounted again
function land(pathname: string = mocks.pathname): void {
	mocks.pathname = pathname
	act(() => root.render(<SessionsTracker />))
}

function signedIn(createdAt: Date): void {
	mocks.user = { user: { createdAt }, isSignedIn: true, isLoaded: true }
}

beforeEach(() => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	container = document.createElement('div')
	document.body.appendChild(container)
	root = createRoot(container)
	mocks.user = { user: null, isSignedIn: false, isLoaded: true }
	mocks.pathname = BIB
})

afterEach(() => {
	act(() => root.unmount())
	container.remove()
	window.sessionStorage.clear()
	vi.unstubAllGlobals()
	vi.resetAllMocks()
})

describe('the page an OAuth round trip comes back to', () => {
	it('counts a sign-in that succeeded, with what it was for', () => {
		writeOAuthMarker('sign_in', 'google', 'purchase')
		signedIn(LONG_AGO)
		land()

		expect(mocks.track.mock.calls).toEqual([['sign_in_success', { method: 'google', intent: 'purchase' }]])
	})

	it('counts a sign-up when the account was created by the round trip', () => {
		writeOAuthMarker('sign_in', 'facebook', 'none')
		signedIn(new Date())
		land()

		expect(mocks.track.mock.calls).toEqual([['sign_up_success', { method: 'facebook' }]])
	})

	it('counts a sign-in that did not finish: the visitor is back without a session', () => {
		writeOAuthMarker('sign_in', 'google', 'purchase')
		land()

		expect(mocks.track.mock.calls).toEqual([
			['sign_in_error', { method: 'google', kind: 'oauth_incomplete', field: 'none' }],
		])
	})

	it('counts a sign-up that did not finish', () => {
		writeOAuthMarker('sign_up', 'google', 'none')
		land()

		expect(mocks.track.mock.calls).toEqual([
			['sign_up_error', { step: 'oauth', method: 'google', kind: 'oauth_incomplete', field: 'none' }],
		])
	})

	it('counts the round trip once: the marker is gone after the first page', () => {
		writeOAuthMarker('sign_in', 'google', 'purchase')
		signedIn(LONG_AGO)
		land()
		act(() => root.unmount())
		root = createRoot(container)
		land()

		expect(mocks.track).toHaveBeenCalledTimes(1)
		expect(window.sessionStorage.getItem(MARKER)).toBeNull()
	})

	it('waits for Clerk before it judges, and keeps the marker until then', () => {
		writeOAuthMarker('sign_in', 'google', 'purchase')
		mocks.user = { user: null, isSignedIn: false, isLoaded: false }
		land()

		expect(mocks.track).not.toHaveBeenCalled()
		expect(window.sessionStorage.getItem(MARKER)).not.toBeNull()

		signedIn(LONG_AGO)
		land()

		expect(mocks.track.mock.calls).toEqual([['sign_in_success', { method: 'google', intent: 'purchase' }]])
	})

	it('says nothing on a page nobody came back to', () => {
		signedIn(LONG_AGO)
		land()

		expect(mocks.track).not.toHaveBeenCalled()
	})

	it('says nothing after a password sign-in took over: the form removed the marker', () => {
		writeOAuthMarker('sign_in', 'google', 'purchase')
		clearOAuthMarker()
		signedIn(LONG_AGO)
		land()

		expect(mocks.track).not.toHaveBeenCalled()
	})

	it('ignores a marker that is too old, or that holds anything but the closed values', () => {
		window.sessionStorage.setItem(
			MARKER,
			JSON.stringify({ t: Date.now() - 11 * 60 * 1000, method: 'google', intent: 'purchase', flow: 'sign_in' })
		)
		signedIn(LONG_AGO)
		land()
		expect(mocks.track).not.toHaveBeenCalled()

		window.sessionStorage.setItem(
			MARKER,
			JSON.stringify({ t: Date.now(), method: 'google', intent: '/fr/marketplace/abc?tkn=secret', flow: 'sign_in' })
		)
		act(() => root.unmount())
		root = createRoot(container)
		land()
		// A value that is not an intent is not sent: the outcome is counted without it
		expect(mocks.track.mock.calls).toEqual([['sign_in_success', { method: 'google', intent: 'none' }]])
	})
})

// The provider hands the visitor back on the callback page, where Clerk finishes the attempt: the
// session of an account it has to create only exists a moment later. Judged there, every such
// sign-up would be counted as a sign-in that failed.
describe('the callback page, where the round trip is not over yet', () => {
	it.each(i18n.locales)('says nothing and keeps the marker, in the %s locale', locale => {
		writeOAuthMarker('sign_in', 'google', 'purchase')
		land(`/${locale}/auth/sso-callback`)

		expect(mocks.track).not.toHaveBeenCalled()
		expect(window.sessionStorage.getItem(MARKER)).not.toBeNull()
	})

	it('counts the sign-up on the page Clerk sends the visitor to, once the account exists', () => {
		writeOAuthMarker('sign_in', 'google', 'purchase')
		land(CALLBACK)

		// Clerk has created the account and the session, still on the callback page
		signedIn(new Date())
		land(CALLBACK)
		expect(mocks.track).not.toHaveBeenCalled()

		land(BIB)
		expect(mocks.track.mock.calls).toEqual([['sign_up_success', { method: 'google' }]])
		expect(window.sessionStorage.getItem(MARKER)).toBeNull()
	})

	it('counts the sign-in of an account that already existed, started from the sign-up form', () => {
		writeOAuthMarker('sign_up', 'facebook', 'none')
		land(CALLBACK)
		signedIn(LONG_AGO)
		land('/fr/dashboard')

		expect(mocks.track.mock.calls).toEqual([['sign_in_success', { method: 'facebook', intent: 'none' }]])
	})

	it('waits for Clerk on the next page too: the session is announced after the navigation', () => {
		writeOAuthMarker('sign_in', 'google', 'purchase')
		land(CALLBACK)

		// Clerk holds its state back while it navigates, then says who is signed in
		mocks.user = { user: null, isSignedIn: false, isLoaded: false }
		land(BIB)
		expect(mocks.track).not.toHaveBeenCalled()
		expect(window.sessionStorage.getItem(MARKER)).not.toBeNull()

		signedIn(LONG_AGO)
		land(BIB)
		expect(mocks.track.mock.calls).toEqual([['sign_in_success', { method: 'google', intent: 'purchase' }]])
	})

	it('counts an attempt that could not be finished on the form the visitor is sent back to', () => {
		writeOAuthMarker('sign_in', 'google', 'purchase')
		land(CALLBACK)
		land('/fr/auth/sign-in')

		expect(mocks.track.mock.calls).toEqual([
			['sign_in_error', { method: 'google', kind: 'oauth_incomplete', field: 'none' }],
		])
	})

	it('counts the round trip once, however many pages follow', () => {
		writeOAuthMarker('sign_in', 'google', 'purchase')
		land(CALLBACK)
		signedIn(LONG_AGO)
		land(BIB)
		land('/fr/dashboard')
		land(CALLBACK)
		land(BIB)

		expect(mocks.track).toHaveBeenCalledTimes(1)
	})

	it.each(['/fr/auth/sso-callback/more', '/xx/auth/sso-callback', '/fr/sso-callback', '/fr/auth/sign-in'])(
		'is that page only: %s judges at once',
		pathname => {
			writeOAuthMarker('sign_in', 'google', 'none')
			land(pathname)

			expect(mocks.track).toHaveBeenCalledTimes(1)
			expect(window.sessionStorage.getItem(MARKER)).toBeNull()
		}
	)
})

// An admin sent to sign-in from /admin comes back there. Nothing is recorded from the back-office
// (track() sends nothing there: see client.test.ts), and nothing may wait there for a later page.
describe('a round trip that ends in the back-office', () => {
	it('is resolved there and then: the marker does not wait for the next page outside it', () => {
		writeOAuthMarker('sign_in', 'google', 'none')
		signedIn(LONG_AGO)
		land('/fr/admin/event')

		expect(window.sessionStorage.getItem(MARKER)).toBeNull()

		land(BIB)
		expect(mocks.track).toHaveBeenCalledTimes(1)
	})
})

describe('where the outcome is resolved', () => {
	const ROOT = resolve(process.cwd(), 'src')

	function listSources(directory: string): string[] {
		return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
			const full = join(directory, entry.name)
			if (entry.isDirectory()) return entry.name === 'tests' ? [] : listSources(full)
			return /\.tsx$/.test(entry.name) ? [full] : []
		})
	}

	it('is the root layout, and only there: every page of the app is under it', () => {
		const mounting = listSources(ROOT)
			.filter(file => readFileSync(file, 'utf8').includes('<SessionsTracker />'))
			.map(file => relative(ROOT, file).split(sep).join('/'))

		expect(mounting).toEqual(['app/[locale]/layout.tsx'])
	})
})
