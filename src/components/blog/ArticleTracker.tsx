'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

import { elapsedBucket, readTimeBucket } from '@/lib/analytics/buckets'
import { articleLinkTarget } from '@/lib/analytics/classify'
import { track, trackView } from '@/lib/analytics/client'
import type { ArticleId } from '@/lib/analytics/ids'

interface ArticleTrackerProps {
	articleId: ArticleId
	children: ReactNode
	readTime: number
}

const DEPTHS = ['25', '50', '75', '100'] as const

/**
 * Analytics only: wraps the article body, sends article_read when the reader reaches 25 / 50 /
 * 75 / 100 % of it, and article_link_click for the links of the editorial HTML (which cannot
 * carry a probe of their own).
 */
export function ArticleTracker({ articleId, children, readTime }: ArticleTrackerProps) {
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const container = containerRef.current
		if (!container || typeof IntersectionObserver === 'undefined') return

		const startedAt = Date.now()
		const sentinels = Array.from(container.querySelectorAll(':scope > [data-depth]'))
		const sent = new Set<string>()
		const observer = new IntersectionObserver(entries => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue
				// A jump (End key, anchor, restored scroll) can pass over a sentinel without it ever
				// intersecting: reaching a depth also sends the earlier ones not sent yet
				const reached = DEPTHS.slice(0, sentinels.indexOf(entry.target) + 1)
				for (const depth of reached) {
					// Each milestone is sent once per mount
					if (sent.has(depth)) continue
					sent.add(depth)
					trackView('article_read', {
						depth,
						elapsed: elapsedBucket(Date.now() - startedAt),
						read_time: readTimeBucket(readTime),
						article_id: articleId,
					})
				}
			}
			for (const sentinel of sentinels) {
				if (sent.has(sentinel.getAttribute('data-depth') ?? '')) observer.unobserve(sentinel)
			}
		})
		for (const sentinel of sentinels) observer.observe(sentinel)

		return () => observer.disconnect()
	}, [articleId, readTime])

	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		// One delegated listener: the links of the editorial HTML are not React elements
		const handleClick = (event: MouseEvent) => {
			if (!(event.target instanceof Element)) return
			const anchor = event.target.closest('a[href]')
			if (!anchor || !container.contains(anchor)) return
			// An in-page jump does not leave the article, and would be classified as a link to the home page
			if (anchor.getAttribute('href')?.trim().startsWith('#')) return
			track('article_link_click', {
				target: articleLinkTarget(anchor.getAttribute('href') ?? undefined),
				article_id: articleId,
			})
		}
		container.addEventListener('click', handleClick)

		return () => container.removeEventListener('click', handleClick)
	}, [articleId])

	return (
		<div ref={containerRef} style={{ position: 'relative' }}>
			{children}
			{DEPTHS.map(depth => (
				<span
					key={depth}
					aria-hidden="true"
					data-depth={depth}
					style={{
						position: 'absolute',
						top: `calc(${depth}% - 1px)`,
						left: 0,
						width: 1,
						height: 1,
						pointerEvents: 'none',
					}}
				/>
			))}
		</div>
	)
}
