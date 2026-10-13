// @vitest-environment node
import type { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ action: vi.fn(), push: vi.fn() }))
vi.mock('@/app/[locale]/admin/actions', () => ({
	getAllOrganizersAction: mocks.action,
	getAllEventsAction: mocks.action,
	deleteEventAction: mocks.action,
}))
vi.mock('@/app/[locale]/admin/article/actions', () => ({
	getAllArticlesAction: mocks.action,
	deleteArticleAction: mocks.action,
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import AdminArticlesPageClient from '@/components/admin/article/AdminArticlesPageClient'
import AdminEventsPageClient from '@/components/admin/event/AdminEventsPageClient'
import AdminOrganizersPageClient from '@/components/admin/organizer/AdminOrganizersPageClient'

import { adminUser } from './tableHarness'

// The admin lists are client components, and Next.js still renders them once on the server for the first HTML.
// The other tests run in jsdom, where `window` exists: this file runs without a DOM, like the server does. The
// records only arrive in an effect, so the server sends the frame of the table and its empty state.

const tagContent = (html: string, tag: string): string[] =>
	[...html.matchAll(new RegExp(`<${tag}\\b[^>]*>(.*?)</${tag}>`, 'gs'))].map(match => match[1])

/** The text of a piece of React's own markup: what stands outside the tags (React escapes < and > in text) */
function textOf(html: string): string {
	let text = ''
	let insideTag = false
	for (const char of html) {
		if (char === '<') insideTag = true
		else if (char === '>') insideTag = false
		else if (!insideTag) text += char
	}
	return text
}

const tagText = (html: string, tag: string): string[] => tagContent(html, tag).map(textOf)

/** The headers that carry the sort arrow, as "header: direction" */
const sortArrows = (html: string): string[] =>
	tagContent(html, 'th').flatMap(content => {
		const arrow = content.match(/lucide-chevron-(up|down)/)
		return arrow ? [`${textOf(content)}: ${arrow[1] === 'up' ? 'asc' : 'desc'}`] : []
	})

const headerWidths = (html: string): string[] =>
	[...html.matchAll(/<th\b[^>]*style="width:(\d+px)"/g)].map(match => match[1])

const lists: [string, ReactElement, string[], string[], string, string][] = [
	[
		'organizers',
		<AdminOrganizersPageClient currentUser={adminUser} key="organizers" locale="en" />,
		['', 'Organizer Name', 'Email', 'Events', 'Partnership', 'Created', 'Open menu'],
		['28px', '200px', '180px', '100px', '120px', '120px', '60px'],
		'No organizers foundGet started by creating your first organizerCreate New Organizer',
		'Organizer Name: asc',
	],
	[
		'events',
		<AdminEventsPageClient currentUser={adminUser} key="events" locale="en" />,
		['', 'Event Name', 'Organizer', 'Date', 'Distance', 'Type', 'Participants', 'Actions'],
		['28px', '200px', '180px', '120px', '120px', '100px', '100px', '60px'],
		'No events foundGet started by creating your first eventCreate Event',
		'Date: asc',
	],
	[
		'articles',
		<AdminArticlesPageClient currentUser={adminUser} key="articles" locale="en" />,
		['', 'Title', 'Slug', 'Status', 'Created', 'Updated', 'Languages', 'Actions'],
		['28px', '300px', '180px', '100px', '120px', '120px', '120px', '60px'],
		'No articles foundGet started by creating your first articleCreate Article',
		'Created: desc',
	],
]

describe('admin lists rendered on the server', () => {
	it.each(lists)(
		'renders the frame of the %s list without a DOM',
		(_name, page, headers, widths, emptyState, initialSort) => {
			expect(typeof window).toBe('undefined')

			const html = renderToString(page)

			expect(tagText(html, 'th')).toEqual(headers)
			expect(headerWidths(html)).toEqual(widths)
			expect(tagText(html, 'td')).toEqual([emptyState])
			expect(sortArrows(html)).toEqual([initialSort])
			expect(tagText(html, 'p')).toContain('1-0 of 0')
			expect(mocks.action).not.toHaveBeenCalled()
		}
	)
})
