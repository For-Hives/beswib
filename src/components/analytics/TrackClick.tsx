import type { ReactNode } from 'react'

import { umamiAttrs } from '@/lib/analytics/attrs'
import type { ClientEventName, PropsArg, PropsField } from '@/lib/analytics/catalog'

type TrackClickProps<N extends ClientEventName> = {
	/** Event of the catalogue sent when anything inside is clicked. */
	readonly name: N
	readonly children: ReactNode
} & PropsField<N>

/**
 * Sends a catalogue event when the link it wraps is clicked. No 'use client': it works in Server
 * and Client Components alike.
 *
 * It renders a <span style="display: contents"> carrying the data-umami-event attributes AROUND
 * the link. The attributes must not sit on a same-tab anchor: the tracker would cancel the
 * navigation and reload the page at the href. On the wrapper, the tracker finds a span, sends the
 * event and leaves the click alone.
 *
 * Use it around every same-tab <a> / next Link and around mailto / tel links in Server Components.
 * For a <button>, a non-anchor element or an <a target="_blank">, spread umamiAttrs() on the
 * element itself instead.
 *
 * The span has no box, but it IS an element of the tree. What follows from that:
 *  - Wrap the link and nothing else. ANY click inside the wrapper sends the event: never wrap a
 *    card, a list or a group of controls.
 *  - Safe when the parent lays its children out with flex / grid + gap, or is a plain block.
 *  - Not safe when the parent styles its children by position or by tag: `space-x-*`,
 *    `space-y-*`, `divide-*`, `first:` / `last:` / `odd:` / `even:`, `[&>a]`, `peer`. The rule
 *    would land on the span and do nothing. There, call track() in the link's onClick (Client
 *    Component), or move the spacing of the parent to `gap-*`.
 *  - Always OUTSIDE an `asChild` parent (Button, Radix Slot, DropdownMenuItem, ...): Slot would
 *    merge its props and its ref onto the span instead of the link.
 *      <TrackClick ...><Button asChild><Link href="/x">...</Link></Button></TrackClick>
 *  - Inside a <li>, <td> or <th>, never around one: a span is not a valid child of <ul>, <ol>,
 *    <tr>, <tbody> or <select>.
 *  - Nested probes: the tracker takes the CLOSEST element carrying data-umami-event, so the
 *    innermost event is the only one sent. Do not put a TrackClick inside another one, nor inside
 *    an element carrying umamiAttrs(), unless that is what is wanted.
 */
export function TrackClick<N extends ClientEventName>({ name, props, children }: TrackClickProps<N>) {
	const args = (props === undefined ? [] : [props]) as unknown as PropsArg<N>
	return (
		<span style={{ display: 'contents' }} {...umamiAttrs(name, ...args)}>
			{children}
		</span>
	)
}
