'use client'

import { useEffect } from 'react'

import type { ClientEventName, PropsArg, PropsField } from '@/lib/analytics/catalog'
import { trackView } from '@/lib/analytics/client'

type TrackViewProps<N extends ClientEventName> = {
	/** Event of the catalogue sent once when this component mounts. */
	readonly name: N
} & PropsField<N>

/**
 * Sends one catalogue event when it mounts and renders nothing. For Server Components (and JSX
 * branches) that cannot run an effect themselves: its props are plain serialisable values.
 * The event goes through trackView(), so a double mount sends it once.
 */
export function TrackView<N extends ClientEventName>({ name, props }: TrackViewProps<N>) {
	// No dependency on purpose: a view is sent once per mount, not per render
	useEffect(() => {
		const args = (props === undefined ? [] : [props]) as unknown as PropsArg<N>
		trackView(name, ...args)
	}, [])

	return null
}
