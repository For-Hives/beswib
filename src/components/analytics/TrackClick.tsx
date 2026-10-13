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
 * It renders a <span style="display: contents"> (no box, the layout is unchanged) carrying the
 * data-umami-event attributes AROUND the link. The attributes must not sit on a same-tab anchor:
 * the tracker would cancel the navigation and reload the page at the href. On the wrapper, the
 * tracker finds a span, sends the event and leaves the click alone.
 *
 * Use it around every same-tab <a> / next Link (or the <Button asChild> rendering one) and around
 * mailto / tel links in Server Components. For a <button>, a non-anchor element or an
 * <a target="_blank">, spread umamiAttrs() on the element itself instead.
 */
export function TrackClick<N extends ClientEventName>({ name, props, children }: TrackClickProps<N>) {
	const args = (props === undefined ? [] : [props]) as unknown as PropsArg<N>
	return (
		<span style={{ display: 'contents' }} {...umamiAttrs(name, ...args)}>
			{children}
		</span>
	)
}
