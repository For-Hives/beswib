import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Client = typeof import('@/lib/analytics/client')

let client: Client
let trackerTrack: ReturnType<typeof vi.fn>

function installTracker(): void {
	// The tracker's own track() returns a promise
	trackerTrack = vi.fn(() => Promise.resolve('ok'))
	window.umami = { track: trackerTrack } as unknown as typeof window.umami
}

beforeEach(async () => {
	vi.useFakeTimers()
	// Queue and dedupe memory live in the module: start every test from a fresh one
	vi.resetModules()
	Reflect.deleteProperty(window, 'umami')
	window.history.replaceState({}, '', '/fr/marketplace')
	client = await import('@/lib/analytics/client')
})

afterEach(() => {
	vi.useRealTimers()
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
	Reflect.deleteProperty(window, 'umami')
})

describe('track', () => {
	it('sends a catalogue event to the tracker', () => {
		installTracker()
		client.track('cta_click', { cta: 'sell_bib', where: 'hero' })
		expect(trackerTrack).toHaveBeenCalledExactlyOnceWith('cta_click', { cta: 'sell_bib', where: 'hero' })
	})

	it('sends an event without properties with an empty bag', () => {
		installTracker()
		client.track('show_special_tooltip')
		expect(trackerTrack).toHaveBeenCalledExactlyOnceWith('show_special_tooltip', {})
	})

	it('does not dedupe: the same action twice is two events', () => {
		installTracker()
		client.track('show_special_tooltip')
		client.track('show_special_tooltip')
		expect(trackerTrack).toHaveBeenCalledTimes(2)
	})

	it('drops what the catalogue refuses, with a warning outside production', () => {
		installTracker()
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const anyTrack = client.track as (name: string, props?: unknown) => void
		anyTrack('unknown_event', { email: 'runner@example.com' })
		anyTrack('cta_click', { cta: 'sell_bib', where: 'nowhere' })
		anyTrack('sale_success', { bib_id: 'abcdefghij12345', price_bucket: '50_99' })
		expect(trackerTrack).not.toHaveBeenCalled()
		expect(warn).toHaveBeenCalledTimes(3)
		// The warning names the event, never its properties
		expect(JSON.stringify(warn.mock.calls)).not.toContain('runner@example.com')
	})

	it.each(['/fr/admin', '/fr/admin/event/create', '/admin', '/fr/%61dmin/event', '/fr/Admin'])(
		'sends nothing from the back-office (%s)',
		path => {
			installTracker()
			window.history.replaceState({}, '', path)
			client.track('nav_click', { item: 'logo', where: 'header' })
			client.trackView('event_request_start')
			expect(trackerTrack).not.toHaveBeenCalled()
		}
	)

	it('does not queue a back-office event for a later page', () => {
		window.history.replaceState({}, '', '/fr/admin/event')
		client.track('nav_click', { item: 'logo', where: 'header' })
		window.history.replaceState({}, '', '/fr/marketplace')
		installTracker()
		client.flushQueue()
		vi.advanceTimersByTime(1000)
		expect(trackerTrack).not.toHaveBeenCalled()
	})

	it('still sends from a path that only starts like the back-office', () => {
		installTracker()
		window.history.replaceState({}, '', '/fr/administration')
		client.track('show_special_tooltip')
		expect(trackerTrack).toHaveBeenCalledOnce()
	})

	it('removes undeclared properties before the tracker sees them', () => {
		installTracker()
		const anyTrack = client.track as (name: string, props?: unknown) => void
		anyTrack('cta_click', { cta: 'sell_bib', where: 'hero', email: 'runner@example.com' })
		expect(trackerTrack).toHaveBeenCalledExactlyOnceWith('cta_click', { cta: 'sell_bib', where: 'hero' })
	})

	it('never throws when the tracker throws or rejects', async () => {
		window.umami = {
			track: vi.fn(() => {
				throw new Error('tracker broke')
			}),
		} as unknown as typeof window.umami
		expect(() => client.track('show_special_tooltip')).not.toThrow()

		const rejected = vi.fn(() => Promise.reject(new Error('network')))
		window.umami = { track: rejected } as unknown as typeof window.umami
		expect(() => client.track('show_special_tooltip')).not.toThrow()
		await vi.runAllTimersAsync()
		expect(rejected).toHaveBeenCalledOnce()
	})

	it('never throws when window.umami is not a tracker', () => {
		window.umami = { track: 'nope' } as unknown as typeof window.umami
		expect(() => client.track('show_special_tooltip')).not.toThrow()
	})
})

describe('track, before the tracker has loaded', () => {
	it('queues events and flushes them in order once the tracker exists', () => {
		client.track('cta_click', { cta: 'sell_bib', where: 'hero' })
		client.track('show_special_tooltip')

		installTracker()
		expect(trackerTrack).not.toHaveBeenCalled()
		client.flushQueue()

		expect(trackerTrack.mock.calls).toEqual([
			['cta_click', { cta: 'sell_bib', where: 'hero' }],
			['show_special_tooltip', {}],
		])
		// Nothing is sent twice
		client.flushQueue()
		vi.advanceTimersByTime(5000)
		expect(trackerTrack).toHaveBeenCalledTimes(2)
	})

	it('flushes by itself, by polling, when nobody calls flushQueue', () => {
		client.track('show_special_tooltip')
		vi.advanceTimersByTime(1000)
		installTracker()
		vi.advanceTimersByTime(250)
		expect(trackerTrack).toHaveBeenCalledExactlyOnceWith('show_special_tooltip', {})
		expect(vi.getTimerCount()).toBe(0)
	})

	it('sends what was waiting before a new event when the tracker has just appeared', () => {
		client.track('cta_click', { cta: 'sell_bib', where: 'hero' })
		installTracker()
		client.track('show_special_tooltip')
		expect(trackerTrack.mock.calls.map(call => call[0])).toEqual(['cta_click', 'show_special_tooltip'])
	})

	it('keeps at most 30 events', () => {
		for (let i = 0; i < 45; i++) client.track('show_special_tooltip')
		installTracker()
		client.flushQueue()
		expect(trackerTrack).toHaveBeenCalledTimes(30)
	})

	it('forgets the queue when the tracker never comes (ad-blocker) and stops polling', () => {
		client.track('show_special_tooltip')
		vi.advanceTimersByTime(10_000)
		expect(vi.getTimerCount()).toBe(0)
		installTracker()
		client.flushQueue()
		vi.advanceTimersByTime(1000)
		expect(trackerTrack).not.toHaveBeenCalled()
	})

	it('does nothing when flushing an empty queue', () => {
		installTracker()
		expect(() => client.flushQueue()).not.toThrow()
		expect(trackerTrack).not.toHaveBeenCalled()
	})
})

describe('trackView', () => {
	it('sends the same view once within 2 seconds', () => {
		installTracker()
		client.trackView('contact_form_start', { prefilled: false })
		client.trackView('contact_form_start', { prefilled: false })
		vi.advanceTimersByTime(1999)
		client.trackView('contact_form_start', { prefilled: false })
		expect(trackerTrack).toHaveBeenCalledTimes(1)
	})

	it('sends it again after 2 seconds', () => {
		installTracker()
		client.trackView('contact_form_start', { prefilled: false })
		vi.advanceTimersByTime(2000)
		client.trackView('contact_form_start', { prefilled: false })
		expect(trackerTrack).toHaveBeenCalledTimes(2)
	})

	it('treats other properties, another name or another pathname as another view', () => {
		installTracker()
		client.trackView('contact_form_start', { prefilled: false })
		client.trackView('contact_form_start', { prefilled: true })
		client.trackView('event_request_start')
		window.history.pushState({}, '', '/fr/contact')
		client.trackView('contact_form_start', { prefilled: false })
		expect(trackerTrack).toHaveBeenCalledTimes(4)
	})

	it('does not depend on the order of the properties', () => {
		installTracker()
		client.trackView('not_found_view', { section: 'blog', source: 'direct' })
		client.trackView('not_found_view', { source: 'direct', section: 'blog' })
		expect(trackerTrack).toHaveBeenCalledTimes(1)
	})

	it('dedupes while the tracker is still loading too', () => {
		client.trackView('contact_form_start', { prefilled: false })
		client.trackView('contact_form_start', { prefilled: false })
		installTracker()
		client.flushQueue()
		expect(trackerTrack).toHaveBeenCalledTimes(1)
	})

	it('does not remember a view the catalogue refused', () => {
		installTracker()
		vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const anyTrackView = client.trackView as (name: string, props?: unknown) => void
		anyTrackView('contact_form_start', { prefilled: 'maybe' })
		client.trackView('contact_form_start', { prefilled: false })
		expect(trackerTrack).toHaveBeenCalledTimes(1)
	})
})

describe('on the server', () => {
	it('does nothing and does not throw when there is no window', () => {
		installTracker()
		vi.stubGlobal('window', undefined)
		expect(() => client.track('show_special_tooltip')).not.toThrow()
		expect(() => client.trackView('event_request_start')).not.toThrow()
		expect(() => client.flushQueue()).not.toThrow()
		vi.unstubAllGlobals()
		expect(trackerTrack).not.toHaveBeenCalled()
		expect(vi.getTimerCount()).toBe(0)
	})
})
