import { act, Profiler, type ReactElement } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { vi } from 'vitest'

import type { User } from '@/models/user.model'
import { mockUser } from '@/tests/mocks/data'

// What the three admin lists (articles, events, organizers) are driven with in jsdom: the pages sit behind an admin
// session and cannot be opened locally, so these tests are the proof that the table library still does its job.

export const adminUser: User = {
	...mockUser,
	role: 'admin',
	firstName: 'Ada',
	lastName: 'Admin',
	email: 'ada@beswib.com',
}

export interface MountedPage {
	container: HTMLElement
	/** Number of React commits of the page since it was mounted */
	commits: () => number
	unmount: () => void
}

class ResizeObserverStub {
	observe(): void {}
	unobserve(): void {}
	disconnect(): void {}
}

/** jsdom lacks what the Radix menus and their positioning call when they open */
export function installDomShims(): void {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	vi.stubGlobal('ResizeObserver', ResizeObserverStub)
	Element.prototype.scrollIntoView = () => {}
	Element.prototype.hasPointerCapture = () => false
	Element.prototype.releasePointerCapture = () => {}
}

/** Lets the pending promises (the mocked server action, the table's deferred page reset) and their renders finish */
export async function settle(ms = 0): Promise<void> {
	await act(async () => {
		await new Promise(resolve => setTimeout(resolve, ms))
	})
}

export async function mount(page: ReactElement): Promise<MountedPage> {
	const container = document.createElement('div')
	document.body.appendChild(container)
	const root = createRoot(container)
	let commits = 0
	await act(async () => {
		root.render(
			<Profiler
				id="admin-list"
				onRender={() => {
					commits += 1
				}}
			>
				{page}
			</Profiler>
		)
	})
	await settle()
	return {
		container,
		commits: () => commits,
		unmount: () => {
			act(() => root.unmount())
			container.remove()
		},
	}
}

export interface HydratedPage extends MountedPage {
	/** What React could not reuse from the server markup: none when the two renders agree */
	hydrationErrors: unknown[]
}

/** Renders the page as the server does, then lets the browser take over that markup, as on a real first visit */
export async function mountFromServer(page: ReactElement): Promise<HydratedPage> {
	const hydrationErrors: unknown[] = []
	let commits = 0
	const tree = (
		<Profiler
			id="admin-list"
			onRender={() => {
				commits += 1
			}}
		>
			{page}
		</Profiler>
	)
	const container = document.createElement('div')
	container.innerHTML = renderToString(tree)
	document.body.appendChild(container)
	const root = await act(async () =>
		hydrateRoot(container, tree, { onRecoverableError: error => hydrationErrors.push(error) })
	)
	await settle()
	return {
		container,
		commits: () => commits,
		hydrationErrors,
		unmount: () => {
			act(() => root.unmount())
			container.remove()
		},
	}
}

export async function click(element: Element, init: MouseEventInit = {}): Promise<void> {
	await act(async () => {
		element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }))
	})
	await settle()
}

/** Radix menus open on pointer down, not on click */
export async function openMenu(trigger: Element): Promise<void> {
	await act(async () => {
		trigger.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 }))
	})
	await settle()
}

export async function pressKey(element: Element, key: string): Promise<void> {
	await act(async () => {
		element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key }))
	})
	await settle()
}

/** Types in a controlled input: React only sees the change when the native setter is used */
export async function typeInto(input: HTMLInputElement, value: string): Promise<void> {
	const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
	await act(async () => {
		setValue?.call(input, value)
		input.dispatchEvent(new Event('input', { bubbles: true }))
	})
	await settle()
}

export function required<T>(value: T | null | undefined, what: string): T {
	if (value == null) throw new Error(`Not found: ${what}`)
	return value
}

const text = (element: Element | null | undefined): string => element?.textContent ?? ''

export function labelled(root: ParentNode, label: string): HTMLElement {
	return required(root.querySelector<HTMLElement>(`[aria-label="${label}"]`), `element labelled "${label}"`)
}

export function buttonNamed(root: ParentNode, name: string): HTMLElement {
	const buttons = [...root.querySelectorAll<HTMLElement>('button, [role="menuitem"], [role="menuitemcheckbox"]')]
	return required(
		buttons.find(button => text(button).trim() === name),
		`button "${name}"`
	)
}

/** The figure of one of the cards above the table: the card holds its label, an icon and the figure */
export const statCard = (container: HTMLElement, label: string): string => {
	const title = [...container.querySelectorAll('h3')].find(candidate => text(candidate) === label)
	return text(required(title?.parentElement?.parentElement, `card "${label}"`)).slice(label.length)
}

/**
 * Counts how often one field of the records is read. The table caches the values it shows, so the count only
 * grows when it goes through the records again: a way to see recomputations that leave the screen unchanged.
 */
export function countReads<T extends object>(records: T[], key: keyof T & string): () => number {
	let reads = 0
	for (const record of records) {
		const value = record[key]
		Object.defineProperty(record, key, {
			enumerable: true,
			get: () => {
				reads += 1
				return value
			},
		})
	}
	return () => reads
}

export const headerCells = (container: HTMLElement): string[] =>
	[...container.querySelectorAll('thead th')].map(th => text(th))

/** The width each header asks for, from the size of its column */
export const headerWidths = (container: HTMLElement): string[] =>
	[...container.querySelectorAll<HTMLElement>('thead th')].map(th => th.style.width)

export const bodyRows = (container: HTMLElement): HTMLTableRowElement[] => [
	...container.querySelectorAll<HTMLTableRowElement>('tbody tr'),
]

export const cellsOf = (row: HTMLTableRowElement): string[] => [...row.querySelectorAll('td')].map(td => text(td))

/** The text of one column, top to bottom, for the rows on screen */
export const columnCells = (container: HTMLElement, header: string): string[] => {
	const index = headerCells(container).indexOf(header)
	if (index === -1) throw new Error(`Not found: column "${header}"`)
	return bodyRows(container).map(row => text(row.querySelectorAll('td')[index]))
}

export const rowNamed = (container: HTMLElement, name: string): HTMLTableRowElement =>
	required(
		bodyRows(container).find(row => cellsOf(row).includes(name)),
		`row "${name}"`
	)

const sortButtons = (container: HTMLElement): HTMLElement[] => [
	...container.querySelectorAll<HTMLElement>('thead th button:not([role="checkbox"])'),
]

/** The headers that can be clicked to sort */
export const sortableHeaders = (container: HTMLElement): string[] => sortButtons(container).map(button => text(button))

export const sortButton = (container: HTMLElement, header: string): HTMLElement =>
	required(
		sortButtons(container).find(button => text(button) === header),
		`sortable header "${header}"`
	)

/** Which headers carry the sort arrow, and which way it points */
export function sortArrows(container: HTMLElement): Record<string, 'asc' | 'desc'> {
	const arrows: Record<string, 'asc' | 'desc'> = {}
	for (const th of container.querySelectorAll('thead th')) {
		const icon = th.querySelector('svg')
		if (icon?.classList.contains('lucide-chevron-up')) arrows[text(th)] = 'asc'
		if (icon?.classList.contains('lucide-chevron-down')) arrows[text(th)] = 'desc'
	}
	return arrows
}

/** The "11-20 of 25" counter under the table */
export const counter = (container: HTMLElement): string =>
	text(required(container.querySelector('p[aria-live="polite"]'), 'row counter')).replace(/\s+/g, ' ')

export interface Pager {
	first: HTMLButtonElement
	previous: HTMLButtonElement
	next: HTMLButtonElement
	last: HTMLButtonElement
}

export function pager(container: HTMLElement): Pager {
	const button = (label: string) => labelled(container, label) as HTMLButtonElement
	return {
		first: button('Go to first page'),
		previous: button('Go to previous page'),
		next: button('Go to next page'),
		last: button('Go to last page'),
	}
}

export const pagerDisabled = (container: HTMLElement): Record<keyof Pager, boolean> => {
	const { first, previous, next, last } = pager(container)
	return { first: first.disabled, previous: previous.disabled, next: next.disabled, last: last.disabled }
}

const pageSizeTrigger = (container: HTMLElement): HTMLElement => {
	const label = [...container.querySelectorAll('label')].find(candidate => text(candidate) === 'Rows per page')
	return required(label?.parentElement?.querySelector<HTMLElement>('button'), 'page size select')
}

export const pageSize = (container: HTMLElement): string => text(pageSizeTrigger(container))

/** Picks a page size in the animated select; its options are rendered in a portal on document.body */
export async function choosePageSize(container: HTMLElement, size: number): Promise<void> {
	await click(pageSizeTrigger(container))
	const options = [...document.body.querySelectorAll<HTMLElement>('button')].filter(
		button => !container.contains(button) && text(button) === String(size)
	)
	// A list that is still fading out after an earlier choice may remain: the one just opened is the last
	await click(required(options.at(-1), `page size option ${size}`))
}

export const selectAllBox = (container: HTMLElement): HTMLElement => labelled(container, 'Select all')

export const rowBox = (container: HTMLElement, name: string): HTMLElement =>
	labelled(rowNamed(container, name), 'Select row')

export const selectedRowNames = (container: HTMLElement, header: string): string[] => {
	const index = headerCells(container).indexOf(header)
	return bodyRows(container)
		.filter(row => row.getAttribute('data-state') === 'selected')
		.map(row => text(row.querySelectorAll('td')[index]))
}

/** The entries of an open Radix menu (rendered in a portal) */
export const menuEntries = (): HTMLElement[] => [
	...document.body.querySelectorAll<HTMLElement>(
		'[role="menu"] [role="menuitem"], [role="menu"] [role="menuitemcheckbox"]'
	),
]

export const openDialog = (): HTMLElement =>
	required(document.body.querySelector<HTMLElement>('[role="alertdialog"]'), 'confirmation dialog')

export const dialogIsOpen = (): boolean => document.body.querySelector('[role="alertdialog"]') != null
