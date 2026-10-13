import type { ClientEventName, PropsArg } from './catalog'
import { sanitizeEvent } from './sanitize'

/** The data attributes read by the tracker on a click. */
export type UmamiAttrs = { readonly [K in `data-umami-event${string}`]?: string }

/**
 * Builds the data-umami-event attributes of one catalogue event, to spread on an element. Pure:
 * usable in Server and Client Components.
 *
 * The tracker listens to every click (capture phase), takes the closest ancestor carrying
 * data-umami-event and sends the event with one property per data-umami-event-<key> attribute.
 * When that element is a same-tab <a href>, it cancels the navigation and reloads the page at
 * the href once the event is sent. So:
 *  - spread these attributes on a <button>, a non-anchor element or an <a target="_blank">;
 *  - NEVER on a same-tab <a> / next Link (nor on a <Button asChild> rendering one), nor on a
 *    mailto / tel link: wrap those in <TrackClick>.
 *
 * Values travel as strings (booleans and integers are read back by the before-send hook). An
 * undefined property is omitted. An invalid event yields no attribute at all, never a partial one.
 */
export function umamiAttrs<N extends ClientEventName>(name: N, ...args: PropsArg<N>): UmamiAttrs {
	const event = sanitizeEvent(name, args[0])
	if (event == null || event.side !== 'client') return {}

	const attrs: Record<string, string> = { 'data-umami-event': event.name }
	for (const key of Object.keys(event.data)) {
		attrs[`data-umami-event-${key}`] = String(event.data[key])
	}
	return attrs
}
