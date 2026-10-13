'use client'

import { useEffect, useRef } from 'react'

import type { LandingSection } from '@/lib/analytics/catalog'
import { trackView } from '@/lib/analytics/client'

interface SectionViewTrackerProps {
	/** Landing section this sentinel stands for. */
	section: LandingSection
}

/**
 * Viewport variant of <TrackView>: a zero-size sentinel that sends section_view once, the first
 * time it enters the viewport. Render it as the first child of the section to measure, which must
 * be a plain block: the sentinel is an in-flow element, so in a flex / grid / space-y parent it
 * would count as one more item.
 */
export function SectionViewTracker({ section }: Readonly<SectionViewTrackerProps>) {
	const sentinelRef = useRef<HTMLSpanElement>(null)

	useEffect(() => {
		const sentinel = sentinelRef.current
		if (sentinel == null || typeof IntersectionObserver === 'undefined') return

		const observer = new IntersectionObserver(entries => {
			if (entries.some(entry => entry.isIntersecting)) {
				observer.disconnect()
				trackView('section_view', { landing_section: section })
			}
		})
		observer.observe(sentinel)

		return () => observer.disconnect()
	}, [section])

	return <span ref={sentinelRef} aria-hidden="true" style={{ display: 'block', width: 0, height: 0 }} />
}
