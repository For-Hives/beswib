import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'

import { TrackClick } from '@/components/analytics/TrackClick'
import { bibIdOf, eventIdOf } from '@/lib/analytics/ids'

const bibId = bibIdOf({ id: 'abcdefghij12345', eventId: 'zyxwvutsrq09876' })
const eventId = eventIdOf({ id: 'zyxwvutsrq09876', typeCourse: 'trail' })

function mount(markup: string): HTMLElement {
	document.body.innerHTML = markup
	return document.body
}

// What the deployed tracker does on every click (capture phase), reduced to its decisions
function trackerDecision(
	target: Element
): { name: string; data: Record<string, string>; hijacksNavigation: boolean } | null {
	const element = target.closest('[data-umami-event]')
	if (element == null) return null
	const data: Record<string, string> = {}
	for (const attribute of element.getAttributeNames()) {
		const match = attribute.match(/data-umami-event-([\w-_]+)/)
		if (match) data[match[1]] = element.getAttribute(attribute) ?? ''
	}
	const anchor = element as HTMLAnchorElement
	return {
		name: element.getAttribute('data-umami-event') ?? '',
		data,
		// The tracker cancels the click and reloads the page at the href for a same-tab anchor
		hijacksNavigation: element.tagName === 'A' && Boolean(anchor.href) && anchor.target !== '_blank',
	}
}

afterEach(() => {
	document.body.innerHTML = ''
})

describe('TrackClick', () => {
	it('renders in a Server Component: a span with display contents carrying the attributes', () => {
		const markup = renderToStaticMarkup(
			<TrackClick name="cta_click" props={{ cta: 'sell_bib', where: 'hero' }}>
				<a href="/fr/dashboard/seller/sell-bib">Sell</a>
			</TrackClick>
		)
		expect(markup).toBe(
			'<span style="display:contents" data-umami-event="cta_click" data-umami-event-cta="sell_bib" data-umami-event-where="hero">' +
				'<a href="/fr/dashboard/seller/sell-bib">Sell</a></span>'
		)
	})

	it('keeps the attributes off the anchor, so the tracker leaves the navigation alone', () => {
		const body = mount(
			renderToStaticMarkup(
				<TrackClick name="nav_click" props={{ item: 'marketplace', where: 'header' }}>
					<a href="/fr/marketplace">
						<strong>Marketplace</strong>
					</a>
				</TrackClick>
			)
		)
		const anchor = body.querySelector('a')
		expect(anchor?.getAttributeNames()).toEqual(['href'])

		// A click on the innermost element resolves to the wrapper, not to the anchor
		const decision = trackerDecision(body.querySelector('strong') as Element)
		expect(decision).toEqual({
			name: 'nav_click',
			data: { item: 'marketplace', where: 'header' },
			hijacksNavigation: false,
		})
	})

	it('shows why the attributes must not sit on a same-tab anchor', () => {
		const body = mount('<a href="/fr/marketplace" data-umami-event="nav_click"><strong>Marketplace</strong></a>')
		expect(trackerDecision(body.querySelector('strong') as Element)?.hijacksNavigation).toBe(true)
	})

	it('carries integers, booleans and ids as strings', () => {
		const body = mount(
			renderToStaticMarkup(
				<TrackClick
					name="bib_card_click"
					props={{
						where: 'event_page',
						target: 'bib',
						position: 4,
						bib_id: bibId,
						event_id: eventId,
						price_bucket: '100_199',
					}}
				>
					<a href="/fr/marketplace/abcdefghij12345">Bib</a>
				</TrackClick>
			)
		)
		expect(trackerDecision(body.querySelector('a') as Element)?.data).toEqual({
			where: 'event_page',
			target: 'bib',
			position: '4',
			bib_id: 'abcdefghij12345',
			event_id: 'zyxwvutsrq09876',
			price_bucket: '100_199',
		})
	})

	it('takes no props for an event without properties', () => {
		const markup = renderToStaticMarkup(
			<TrackClick name="private_token_cancel">
				<a href="/fr/marketplace">Back</a>
			</TrackClick>
		)
		expect(markup).toContain('data-umami-event="private_token_cancel"')
	})

	it('still renders its children, without any attribute, when the event is invalid', () => {
		const props = { cta: 'sell_bib', where: 'nowhere' } as unknown as { cta: 'sell_bib'; where: 'hero' }
		const markup = renderToStaticMarkup(
			<TrackClick name="cta_click" props={props}>
				<a href="/fr">Home</a>
			</TrackClick>
		)
		expect(markup).toBe('<span style="display:contents"><a href="/fr">Home</a></span>')
	})

	it('refuses at compile time what the catalogue does not declare', () => {
		const elements = [
			// @ts-expect-error unknown event
			<TrackClick key="a" name="hero_click">
				x
			</TrackClick>,
			// @ts-expect-error props are required for cta_click
			<TrackClick key="b" name="cta_click">
				x
			</TrackClick>,
			// @ts-expect-error value outside its list
			<TrackClick key="c" name="cta_click" props={{ cta: 'sell_bib', where: 'homepage' }}>
				x
			</TrackClick>,
			// @ts-expect-error undeclared property
			<TrackClick key="d" name="cta_click" props={{ cta: 'sell_bib', where: 'hero', label: 'Sell' }}>
				x
			</TrackClick>,
			// @ts-expect-error a server event cannot be sent from the browser
			<TrackClick key="e" name="paypal_kyc_success">
				x
			</TrackClick>,
			// @ts-expect-error an event without properties takes no props
			<TrackClick key="f" name="private_token_cancel" props={{ where: 'hero' }}>
				x
			</TrackClick>,
			// @ts-expect-error a raw string is not an id
			<TrackClick key="g" name="waitlist_leave_start" props={{ event_id: 'abcdefghij12345' }}>
				x
			</TrackClick>,
			// @ts-expect-error one literal name per element: a union would let required props be omitted
			<TrackClick key="h" name={bibId === '' ? 'cta_click' : 'sign_up_cancel'}>
				x
			</TrackClick>,
		]
		expect(elements).toHaveLength(8)
	})
})
