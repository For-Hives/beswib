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
}))

vi.mock('@clerk/nextjs', () => ({ useUser: () => mocks.user }))
vi.mock('@/lib/analytics/client', () => ({ trackView: vi.fn(), track: mocks.track }))

import { clearOAuthMarker, SessionsTracker, writeOAuthMarker } from '@/components/global/sessionsTrackers'

const MARKER = 'beswib.oauth'
const LONG_AGO = new Date('2025-01-01T00:00:00Z')

let container: HTMLDivElement
let root: Root

function land(): void {
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
