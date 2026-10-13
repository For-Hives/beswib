import { act, StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SectionViewTracker } from '@/components/analytics/SectionViewTracker'
import { TrackView } from '@/components/analytics/TrackView'

const { trackView } = vi.hoisted(() => ({ trackView: vi.fn() }))

vi.mock('@/lib/analytics/client', () => ({ trackView }))

let container: HTMLDivElement
let root: Root

beforeEach(() => {
	Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true)
	trackView.mockReset()
	container = document.createElement('div')
	document.body.appendChild(container)
	root = createRoot(container)
})

afterEach(() => {
	act(() => root.unmount())
	container.remove()
	vi.unstubAllGlobals()
})

describe('TrackView', () => {
	it('sends its event through trackView when it mounts, and renders nothing', () => {
		act(() => root.render(<TrackView name="contact_form_start" props={{ prefilled: false }} />))
		expect(trackView).toHaveBeenCalledExactlyOnceWith('contact_form_start', { prefilled: false })
		expect(container.innerHTML).toBe('')
	})

	it('sends an event without properties without a bag', () => {
		act(() => root.render(<TrackView name="event_request_start" />))
		expect(trackView).toHaveBeenCalledExactlyOnceWith('event_request_start')
	})

	it('does not send again when it renders again', () => {
		act(() => root.render(<TrackView name="contact_form_start" props={{ prefilled: false }} />))
		act(() => root.render(<TrackView name="contact_form_start" props={{ prefilled: false }} />))
		act(() => root.render(<TrackView name="contact_form_start" props={{ prefilled: true }} />))
		expect(trackView).toHaveBeenCalledTimes(1)
	})

	it('relies on trackView to absorb the double mount of StrictMode', () => {
		act(() =>
			root.render(
				<StrictMode>
					<TrackView name="event_request_start" />
				</StrictMode>
			)
		)
		// Both mounts go through trackView, whose module-level dedupe sends one event
		expect(trackView.mock.calls.every(call => call[0] === 'event_request_start')).toBe(true)
		expect(trackView.mock.calls.length).toBeGreaterThanOrEqual(1)
	})

	it('sends nothing while rendering on the server', () => {
		expect(renderToString(<TrackView name="event_request_start" />)).toBe('')
		expect(trackView).not.toHaveBeenCalled()
	})

	it('refuses at compile time what the catalogue does not declare', () => {
		const elements = [
			// @ts-expect-error unknown event
			<TrackView key="a" name="page_view" />,
			// @ts-expect-error props are required for contact_form_start
			<TrackView key="b" name="contact_form_start" />,
			// @ts-expect-error a string is not a boolean
			<TrackView key="c" name="contact_form_start" props={{ prefilled: 'false' }} />,
			// @ts-expect-error a server event cannot be sent from the browser
			<TrackView key="d" name="account_create_success" />,
			// @ts-expect-error an event without properties takes no props
			<TrackView key="e" name="event_request_start" props={{ prefilled: false }} />,
		]
		expect(elements).toHaveLength(5)
	})
})

describe('SectionViewTracker', () => {
	type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void
	let observers: {
		callback: ObserverCallback
		observe: ReturnType<typeof vi.fn>
		disconnect: ReturnType<typeof vi.fn>
	}[]

	beforeEach(() => {
		observers = []
		vi.stubGlobal(
			'IntersectionObserver',
			class {
				observe = vi.fn()
				disconnect = vi.fn()
				constructor(callback: ObserverCallback) {
					observers.push({ callback, observe: this.observe, disconnect: this.disconnect })
				}
			}
		)
	})

	it('renders a zero-size sentinel and sends nothing until it is seen', () => {
		act(() => root.render(<SectionViewTracker section="features" />))
		const sentinel = container.querySelector('span')
		expect(sentinel?.getAttribute('aria-hidden')).toBe('true')
		expect(observers).toHaveLength(1)
		expect(observers[0].observe).toHaveBeenCalledWith(sentinel)
		expect(trackView).not.toHaveBeenCalled()

		act(() => observers[0].callback([{ isIntersecting: false }]))
		expect(trackView).not.toHaveBeenCalled()
	})

	it('sends section_view once when the sentinel enters the viewport', () => {
		act(() => root.render(<SectionViewTracker section="security_process" />))
		act(() => observers[0].callback([{ isIntersecting: true }]))
		expect(trackView).toHaveBeenCalledExactlyOnceWith('section_view', { landing_section: 'security_process' })
		expect(observers[0].disconnect).toHaveBeenCalled()
	})

	it('stops observing when it unmounts', () => {
		act(() => root.render(<SectionViewTracker section="journey" />))
		act(() => root.render(null))
		expect(observers[0].disconnect).toHaveBeenCalled()
		expect(trackView).not.toHaveBeenCalled()
	})

	it('does nothing where IntersectionObserver does not exist', () => {
		vi.stubGlobal('IntersectionObserver', undefined)
		expect(() => act(() => root.render(<SectionViewTracker section="journey" />))).not.toThrow()
		expect(trackView).not.toHaveBeenCalled()
	})
})
