import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ getAllOrganizersAction: vi.fn(), push: vi.fn() }))
vi.mock('@/app/[locale]/admin/actions', () => ({ getAllOrganizersAction: mocks.getAllOrganizersAction }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))

import AdminOrganizersPageClient from '@/components/admin/organizer/AdminOrganizersPageClient'
import type { Organizer } from '@/models/organizer.model'

import {
	adminUser,
	bodyRows,
	buttonNamed,
	cellNodes,
	cellsOf,
	choosePageSize,
	click,
	columnCells,
	counter,
	countReads,
	dialogIsOpen,
	headerCells,
	headerWidths,
	installDomShims,
	labelled,
	type MountedPage,
	menuEntries,
	mount,
	mountFromServer,
	openDialog,
	openMenu,
	pager,
	pagerDisabled,
	pageSize,
	pressKey,
	rowBox,
	rowNamed,
	selectAllBox,
	selectedRowNames,
	settle,
	sortArrows,
	sortableHeaders,
	sortButton,
	statCard,
	typeInto,
} from './tableHarness'

type OrganizerRow = Organizer & { eventsCount: number }

// name, e-mail local part, number of events, partner. Deliberately not in any sorted order: the server sorts by
// name, the table must not depend on it. Names mix cases, accents and numbers; counts and partnership have ties.
const RECORDS: [string, string, number, boolean][] = [
	['Trail 10 Vosges', 'yann', 3, false],
	['Alpes Trail', 'xavier', 0, true],
	['annecy Running', 'wendy', 12, false],
	['Zermatt Ultra', 'victor', 7, false],
	['Trail 9 Vosges', 'ugo', 0, true],
	['Bordeaux Marathon', 'theo', 1, true],
	['Courir à Lyon', 'sarah', 25, false],
	['Dijon Run', 'romain', 4, false],
	['École de Trail', 'quentin', 2, true],
	['Foulées Nantaises', 'paul', 0, false],
	['Grenoble Vertical', 'oceane', 9, false],
	['Hendaye Côte Basque', 'nina', 5, true],
	['ile de Ré Triathlon', 'marc', 5, false],
	['Jura Trail', 'lea', 31, true],
	['Kilomètre Vertical', 'kevin', 6, false],
	['Lille Métropole', 'julie', 8, false],
	['Trail 100 Vosges', 'ines', 0, true],
	['Marseille-Cassis', 'hugo', 14, false],
	['Nice Côte d’Azur', 'gael', 2, false],
	['Orléans Running', 'fanny', 11, false],
	['Paris Athlé', 'emma', 1, true],
	['Quimper Trail', 'david', 3, false],
	['Rennes Urban', 'chloe', 40, true],
	['Strasbourg Europe', 'bruno', 10, false],
	['Toulouse Métropole', 'alice', 7, false],
]

// As the server action delivers them: `created` is a real Date. Midday UTC shows the same day in every time zone.
// The days are scattered (7 and 25 are coprime) so that no column shares its order with another.
const organizers = (records = RECORDS): OrganizerRow[] =>
	records.map(([name, mailbox, eventsCount, isPartnered], index) => {
		const created = new Date(Date.UTC(2024, 0, ((index * 7) % 25) + 1, 12))
		return {
			id: `org_${String(index).padStart(2, '0')}`,
			name,
			email: `${mailbox}@example.org`,
			eventsCount,
			isPartnered,
			created,
			updated: created,
		}
	})

const NAME = 'Organizer Name'

describe('AdminOrganizersPageClient', () => {
	let page: MountedPage
	let container: HTMLElement

	const show = async (rows: OrganizerRow[] = organizers()) => {
		mocks.getAllOrganizersAction.mockResolvedValue({ success: true, data: rows })
		page = await mount(<AdminOrganizersPageClient currentUser={adminUser} locale="en" />)
		container = page.container
	}

	const names = () => columnCells(container, NAME)
	const search = () => labelled(container, 'Search organizers...') as HTMLInputElement

	beforeEach(() => {
		installDomShims()
		mocks.getAllOrganizersAction.mockReset()
		mocks.push.mockReset()
	})

	afterEach(() => {
		page?.unmount()
		document.body.innerHTML = ''
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
	})

	describe('rows and cells', () => {
		it('shows the first ten organizers by name, with every cell built from the record', async () => {
			await show()

			expect(headerCells(container)).toEqual(['', NAME, 'Email', 'Events', 'Partnership', 'Created', 'Open menu'])
			expect(names()).toEqual([
				'Alpes Trail',
				'annecy Running',
				'Bordeaux Marathon',
				'Courir à Lyon',
				'Dijon Run',
				'Foulées Nantaises',
				'Grenoble Vertical',
				'Hendaye Côte Basque',
				'ile de Ré Triathlon',
				'Jura Trail',
			])
			expect(cellsOf(rowNamed(container, 'Alpes Trail'))).toEqual([
				'',
				'Alpes Trail',
				'xavier@example.org',
				'0',
				'Partner',
				'Jan 8, 2024',
				'Open menu',
			])
			expect(cellsOf(rowNamed(container, 'annecy Running'))).toEqual([
				'',
				'annecy Running',
				'wendy@example.org',
				'12',
				'Standard',
				'Jan 15, 2024',
				'Open menu',
			])
			expect(sortArrows(container)).toEqual({ [NAME]: 'asc' })
		})

		it('gives each column the width of its definition', async () => {
			await show()

			expect(headerWidths(container)).toEqual(['28px', '200px', '180px', '100px', '120px', '120px', '60px'])
		})

		it('counts the organizers and the partners above the table', async () => {
			await show()

			expect(statCard(container, 'Total Organizers')).toBe('25')
			expect(statCard(container, 'Bib Resale Enabled')).toBe('9')
		})

		it('falls back to placeholders for a record with missing values', async () => {
			const [first] = organizers()
			await show([
				{ ...first, name: 'No Mail', email: '', created: '' as unknown as Date },
				{ ...first, id: 'org_x', name: 'No Count', eventsCount: undefined as unknown as number },
			])

			expect(cellsOf(rowNamed(container, 'No Mail'))).toEqual([
				'',
				'No Mail',
				'N/A',
				'3',
				'Standard',
				'N/A',
				'Open menu',
			])
			expect(cellsOf(rowNamed(container, 'No Count'))[3]).toBe('0')
		})
	})

	describe('sorting', () => {
		it('sorts by name both ways: case is ignored and numbers count as numbers', async () => {
			await show()
			await choosePageSize(container, 25)

			const ascending = [
				'Alpes Trail',
				'annecy Running',
				'Bordeaux Marathon',
				'Courir à Lyon',
				'Dijon Run',
				'Foulées Nantaises',
				'Grenoble Vertical',
				'Hendaye Côte Basque',
				'ile de Ré Triathlon',
				'Jura Trail',
				'Kilomètre Vertical',
				'Lille Métropole',
				'Marseille-Cassis',
				'Nice Côte d’Azur',
				'Orléans Running',
				'Paris Athlé',
				'Quimper Trail',
				'Rennes Urban',
				'Strasbourg Europe',
				'Toulouse Métropole',
				'Trail 9 Vosges',
				'Trail 10 Vosges',
				'Trail 100 Vosges',
				'Zermatt Ultra',
				'École de Trail',
			]
			expect(names()).toEqual(ascending)

			await click(sortButton(container, NAME))
			expect(names()).toEqual([...ascending].reverse())
			expect(sortArrows(container)).toEqual({ [NAME]: 'desc' })

			// Sorting cannot be removed: a third click goes back to ascending
			await click(sortButton(container, NAME))
			expect(names()).toEqual(ascending)
			expect(sortArrows(container)).toEqual({ [NAME]: 'asc' })
		})

		it('sorts by e-mail both ways, ascending first', async () => {
			await show()

			await click(sortButton(container, 'Email'))
			expect(sortArrows(container)).toEqual({ Email: 'asc' })
			expect(columnCells(container, 'Email')).toEqual(
				['alice', 'bruno', 'chloe', 'david', 'emma', 'fanny', 'gael', 'hugo', 'ines', 'julie'].map(
					mailbox => `${mailbox}@example.org`
				)
			)

			await click(sortButton(container, 'Email'))
			expect(sortArrows(container)).toEqual({ Email: 'desc' })
			expect(columnCells(container, 'Email')).toEqual(
				['yann', 'xavier', 'wendy', 'victor', 'ugo', 'theo', 'sarah', 'romain', 'quentin', 'paul'].map(
					mailbox => `${mailbox}@example.org`
				)
			)
		})

		it('sorts by number of events both ways, largest first, equal counts in the order received', async () => {
			await show()

			await click(sortButton(container, 'Events'))
			expect(sortArrows(container)).toEqual({ Events: 'desc' })
			expect(columnCells(container, 'Events')).toEqual(['40', '31', '25', '14', '12', '11', '10', '9', '8', '7'])
			await click(pager(container).next)
			// Zermatt Ultra and Toulouse Métropole both have 7 events: Zermatt Ultra comes first in the data
			expect(names().slice(0, 2)).toEqual(['Toulouse Métropole', 'Kilomètre Vertical'])
			await click(pager(container).previous)
			expect(names().at(-1)).toBe('Zermatt Ultra')

			await click(sortButton(container, 'Events'))
			expect(sortArrows(container)).toEqual({ Events: 'asc' })
			expect(columnCells(container, 'Events')).toEqual(['0', '0', '0', '0', '1', '1', '2', '2', '3', '3'])
			expect(names()).toEqual([
				'Alpes Trail',
				'Trail 9 Vosges',
				'Foulées Nantaises',
				'Trail 100 Vosges',
				'Bordeaux Marathon',
				'Paris Athlé',
				'École de Trail',
				'Nice Côte d’Azur',
				'Trail 10 Vosges',
				'Quimper Trail',
			])
		})

		it('sorts by partnership both ways, partners first', async () => {
			await show()

			await click(sortButton(container, 'Partnership'))
			expect(sortArrows(container)).toEqual({ Partnership: 'desc' })
			expect(columnCells(container, 'Partnership')).toEqual([...Array(9).fill('Partner'), 'Standard'])
			expect(names()).toEqual([
				'Alpes Trail',
				'Trail 9 Vosges',
				'Bordeaux Marathon',
				'École de Trail',
				'Hendaye Côte Basque',
				'Jura Trail',
				'Trail 100 Vosges',
				'Paris Athlé',
				'Rennes Urban',
				'Trail 10 Vosges',
			])

			await click(sortButton(container, 'Partnership'))
			expect(sortArrows(container)).toEqual({ Partnership: 'asc' })
			expect(columnCells(container, 'Partnership')).toEqual(Array(10).fill('Standard'))
			expect(names()).toEqual([
				'Trail 10 Vosges',
				'annecy Running',
				'Zermatt Ultra',
				'Courir à Lyon',
				'Dijon Run',
				'Foulées Nantaises',
				'Grenoble Vertical',
				'ile de Ré Triathlon',
				'Kilomètre Vertical',
				'Lille Métropole',
			])
		})

		it('sorts by creation date both ways, newest first', async () => {
			await show()

			await click(sortButton(container, 'Created'))
			expect(sortArrows(container)).toEqual({ Created: 'desc' })
			expect(columnCells(container, 'Created')).toEqual(
				[25, 24, 23, 22, 21, 20, 19, 18, 17, 16].map(day => `Jan ${day}, 2024`)
			)

			await click(sortButton(container, 'Created'))
			expect(sortArrows(container)).toEqual({ Created: 'asc' })
			expect(columnCells(container, 'Created')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(day => `Jan ${day}, 2024`))
		})

		it('adds a second sort with shift, and a plain click on another column starts over', async () => {
			await show()

			await click(sortButton(container, 'Partnership'))
			await click(sortButton(container, 'Events'), { shiftKey: true })
			expect(sortArrows(container)).toEqual({ Partnership: 'desc', Events: 'desc' })
			// Partners first, and among them the busiest first
			expect(names().slice(0, 4)).toEqual(['Rennes Urban', 'Jura Trail', 'Hendaye Côte Basque', 'École de Trail'])

			await click(sortButton(container, 'Email'))
			expect(sortArrows(container)).toEqual({ Email: 'asc' })
		})

		it('goes back to a single sort on a plain click, whichever column of a double sort is clicked', async () => {
			// table-core 8 made an exception for the column added last: a plain click flipped it and kept the other one,
			// while the same click on the other column replaced the whole sort. Without shift, a click now means one sort.
			await show()
			await click(sortButton(container, 'Partnership'))
			await click(sortButton(container, 'Events'), { shiftKey: true })

			await click(sortButton(container, 'Events'))
			expect(sortArrows(container)).toEqual({ Events: 'asc' })

			await click(sortButton(container, 'Partnership'), { shiftKey: true })
			expect(sortArrows(container)).toEqual({ Events: 'asc', Partnership: 'desc' })
			await click(sortButton(container, 'Events'))
			expect(sortArrows(container)).toEqual({ Events: 'desc' })
		})

		it('orders ten rows or fewer like a longer list: case ignored, 9 before 10', async () => {
			// table-core 8 chose the comparison of a column from the rows after the tenth. A list this short had none, and
			// fell back to raw character codes: capitals first, "10" before "9", unlike the same list once it grew.
			await show(organizers(RECORDS.slice(0, 5)))

			expect(names()).toEqual(['Alpes Trail', 'annecy Running', 'Trail 9 Vosges', 'Trail 10 Vosges', 'Zermatt Ultra'])
		})

		it('keeps the order of the full list in the result of a search', async () => {
			// Same cause: on table-core 8 a search that left ten rows or fewer reordered them ("Trail 9" after "Trail 100")
			await show()

			await typeInto(search(), 'trail')
			expect(names()).toEqual([
				'Alpes Trail',
				'Jura Trail',
				'Quimper Trail',
				'Trail 9 Vosges',
				'Trail 10 Vosges',
				'Trail 100 Vosges',
				'École de Trail',
			])
		})

		it('does not offer sorting on the selection and action columns', async () => {
			await show()

			expect(sortableHeaders(container)).toEqual([NAME, 'Email', 'Events', 'Partnership', 'Created'])
		})

		it('goes back to the first page when the order changes', async () => {
			await show()
			await click(pager(container).next)
			expect(counter(container)).toBe('11-20 of 25')

			await click(sortButton(container, 'Email'))
			expect(counter(container)).toBe('1-10 of 25')
		})
	})

	describe('search', () => {
		it('filters on the name, whatever the case', async () => {
			await show()

			await typeInto(search(), 'TRAIL')
			expect([...names()].sort()).toEqual(
				[
					'Alpes Trail',
					'Jura Trail',
					'Quimper Trail',
					'Trail 10 Vosges',
					'Trail 100 Vosges',
					'Trail 9 Vosges',
					'École de Trail',
				].sort()
			)
			expect(counter(container)).toBe('1-7 of 7')
			expect(search().value).toBe('TRAIL')
		})

		it('filters on the e-mail as well', async () => {
			await show()

			await typeInto(search(), 'wendy@')
			expect(names()).toEqual(['annecy Running'])
			expect(counter(container)).toBe('1-1 of 1')
		})

		it('offers to clear the search once there is one, and brings every row back', async () => {
			await show()
			expect(container.querySelector('[aria-label="Clear filter"]')).toBeNull()

			await typeInto(search(), 'vertical')
			expect(names()).toEqual(['Grenoble Vertical', 'Kilomètre Vertical'])

			await click(labelled(container, 'Clear filter'))
			expect(search().value).toBe('')
			expect(counter(container)).toBe('1-10 of 25')
			expect(container.querySelector('[aria-label="Clear filter"]')).toBeNull()
		})

		it('goes back to the first page when the search changes', async () => {
			await show()
			await click(pager(container).last)
			expect(counter(container)).toBe('21-25 of 25')

			await typeInto(search(), 'o')
			expect(counter(container).startsWith('1-10 of ')).toBe(true)
		})

		it('shows the empty state when nothing matches', async () => {
			await show()

			await typeInto(search(), 'no such organizer')
			expect(bodyRows(container)).toHaveLength(1)
			expect(bodyRows(container)[0].textContent).toBe(
				'No organizers foundGet started by creating your first organizerCreate New Organizer'
			)
			expect(counter(container)).toBe('1-0 of 0')
		})

		it('keeps the sort of the full list while searching', async () => {
			await show()
			await click(sortButton(container, 'Events'))

			await typeInto(search(), 'running')
			expect(sortArrows(container)).toEqual({ Events: 'desc' })
			expect(names()).toEqual(['annecy Running', 'Orléans Running'])
		})
	})

	describe('pagination', () => {
		it('walks through the pages and counts the rows shown', async () => {
			await show()
			expect(counter(container)).toBe('1-10 of 25')
			expect(pagerDisabled(container)).toEqual({ first: true, previous: true, next: false, last: false })

			await click(pager(container).next)
			expect(counter(container)).toBe('11-20 of 25')
			expect(names()[0]).toBe('Kilomètre Vertical')
			expect(pagerDisabled(container)).toEqual({ first: false, previous: false, next: false, last: false })

			await click(pager(container).next)
			expect(counter(container)).toBe('21-25 of 25')
			expect(names()).toEqual([
				'Trail 9 Vosges',
				'Trail 10 Vosges',
				'Trail 100 Vosges',
				'Zermatt Ultra',
				'École de Trail',
			])
			expect(pagerDisabled(container)).toEqual({ first: false, previous: false, next: true, last: true })

			await click(pager(container).previous)
			expect(counter(container)).toBe('11-20 of 25')

			await click(pager(container).first)
			expect(counter(container)).toBe('1-10 of 25')

			await click(pager(container).last)
			expect(counter(container)).toBe('21-25 of 25')
		})

		it('changes the number of rows per page', async () => {
			await show()
			expect(pageSize(container)).toBe('10')

			await choosePageSize(container, 5)
			expect(pageSize(container)).toBe('5')
			expect(bodyRows(container)).toHaveLength(5)
			expect(counter(container)).toBe('1-5 of 25')

			await choosePageSize(container, 25)
			expect(bodyRows(container)).toHaveLength(25)
			expect(counter(container)).toBe('1-25 of 25')
			expect(pagerDisabled(container)).toEqual({ first: true, previous: true, next: true, last: true })

			await choosePageSize(container, 50)
			expect(bodyRows(container)).toHaveLength(25)
			expect(counter(container)).toBe('1-25 of 25')
		})

		it('keeps the first row on screen when the page size changes', async () => {
			await show()
			await click(pager(container).next)
			expect(names()[0]).toBe('Kilomètre Vertical')

			await choosePageSize(container, 5)
			expect(counter(container)).toBe('11-15 of 25')
			expect(names()[0]).toBe('Kilomètre Vertical')
		})
	})

	describe('column visibility', () => {
		it('lists the columns that can be hidden, by their identifier', async () => {
			await show()

			await openMenu(buttonNamed(container, 'Toggle columns'))
			expect(menuEntries().map(entry => [entry.textContent, entry.getAttribute('aria-checked')])).toEqual([
				['email', 'true'],
				['eventsCount', 'true'],
				['isPartnered', 'true'],
				['created', 'true'],
			])
		})

		it('hides a column and shows it again, the menu staying open', async () => {
			await show()
			await openMenu(buttonNamed(container, 'Toggle columns'))

			await click(buttonNamed(document.body, 'email'))
			expect(headerCells(container)).toEqual(['', NAME, 'Events', 'Partnership', 'Created', 'Open menu'])
			expect(cellsOf(rowNamed(container, 'Alpes Trail'))).toEqual([
				'',
				'Alpes Trail',
				'0',
				'Partner',
				'Jan 8, 2024',
				'Open menu',
			])
			expect(buttonNamed(document.body, 'email').getAttribute('aria-checked')).toBe('false')

			await click(buttonNamed(document.body, 'created'))
			expect(headerCells(container)).toEqual(['', NAME, 'Events', 'Partnership', 'Open menu'])

			await click(buttonNamed(document.body, 'email'))
			expect(headerCells(container)).toEqual(['', NAME, 'Email', 'Events', 'Partnership', 'Open menu'])
			expect(buttonNamed(document.body, 'email').getAttribute('aria-checked')).toBe('true')
		})
	})

	describe('selection', () => {
		it('selects rows one by one and reports the header box as partial', async () => {
			await show()
			expect(selectAllBox(container).getAttribute('aria-checked')).toBe('false')
			expect(container.textContent).not.toContain('Delete Selected')

			await click(rowBox(container, 'Bordeaux Marathon'))
			expect(rowBox(container, 'Bordeaux Marathon').getAttribute('aria-checked')).toBe('true')
			expect(selectedRowNames(container, NAME)).toEqual(['Bordeaux Marathon'])
			expect(selectAllBox(container).getAttribute('aria-checked')).toBe('mixed')
			expect(buttonNamed(container, 'Delete Selected1')).toBeDefined()

			await click(rowBox(container, 'Bordeaux Marathon'))
			expect(selectedRowNames(container, NAME)).toEqual([])
			expect(selectAllBox(container).getAttribute('aria-checked')).toBe('false')
			expect(container.textContent).not.toContain('Delete Selected')
		})

		it('selects the page with the header box, not the other pages', async () => {
			await show()

			await click(selectAllBox(container))
			expect(selectAllBox(container).getAttribute('aria-checked')).toBe('true')
			expect(selectedRowNames(container, NAME)).toHaveLength(10)
			expect(buttonNamed(container, 'Delete Selected10')).toBeDefined()

			await click(pager(container).next)
			expect(selectAllBox(container).getAttribute('aria-checked')).toBe('false')
			expect(selectedRowNames(container, NAME)).toEqual([])
			expect(buttonNamed(container, 'Delete Selected10')).toBeDefined()

			await click(pager(container).previous)
			await click(selectAllBox(container))
			expect(selectedRowNames(container, NAME)).toEqual([])
			expect(container.textContent).not.toContain('Delete Selected')
		})

		it('keeps a row selected through sorting and searching', async () => {
			await show()
			await click(rowBox(container, 'Jura Trail'))

			await click(sortButton(container, 'Events'))
			expect(selectedRowNames(container, NAME)).toEqual(['Jura Trail'])

			await typeInto(search(), 'jura')
			expect(selectedRowNames(container, NAME)).toEqual(['Jura Trail'])
			expect(selectAllBox(container).getAttribute('aria-checked')).toBe('true')
		})

		it('removes the selected rows from the list after confirmation', async () => {
			await show()
			await click(rowBox(container, 'Alpes Trail'))
			await click(rowBox(container, 'Bordeaux Marathon'))

			await click(buttonNamed(container, 'Delete Selected2'))
			expect(openDialog().textContent).toContain('Are you absolutely sure?')
			expect(openDialog().textContent).toContain(
				'This action cannot be undone. This will permanently delete 2 organizers.'
			)

			await click(buttonNamed(openDialog(), 'Delete Selected'))
			expect(dialogIsOpen()).toBe(false)
			expect(names().slice(0, 2)).toEqual(['annecy Running', 'Courir à Lyon'])
			expect(counter(container)).toBe('1-10 of 23')
			expect(selectedRowNames(container, NAME)).toEqual([])
			expect(container.textContent).not.toContain('Delete Selected')
		})

		it('returns to the first page when rows are removed from another page', async () => {
			await show()
			await click(pager(container).next)
			await click(rowBox(container, 'Kilomètre Vertical'))

			await click(buttonNamed(container, 'Delete Selected1'))
			await click(buttonNamed(openDialog(), 'Delete Selected'))
			expect(counter(container)).toBe('1-10 of 24')
			expect(names()[0]).toBe('Alpes Trail')
		})

		it('leaves the list alone when the removal is cancelled', async () => {
			await show()
			await click(rowBox(container, 'Alpes Trail'))

			await click(buttonNamed(container, 'Delete Selected1'))
			expect(openDialog().textContent).toContain('This will permanently delete 1 organizer.')

			await click(buttonNamed(openDialog(), 'Cancel'))
			expect(dialogIsOpen()).toBe(false)
			expect(counter(container)).toBe('1-10 of 25')
			expect(selectedRowNames(container, NAME)).toEqual(['Alpes Trail'])
		})
	})

	describe('row actions', () => {
		const openActions = async (name: string) => {
			await openMenu(buttonNamed(rowNamed(container, name), 'Open menu'))
		}

		it('offers edit, a disabled view and delete', async () => {
			await show()

			await openActions('Dijon Run')
			expect(menuEntries().map(entry => [entry.textContent, entry.getAttribute('aria-disabled')])).toEqual([
				['Edit', null],
				['View', 'true'],
				['Delete', null],
			])
		})

		it('opens the edit page of the organizer of that row', async () => {
			await show()

			await openActions('Dijon Run')
			await click(buttonNamed(document.body, 'Edit'))
			expect(mocks.push).toHaveBeenCalledWith('/admin/organizer/edit/org_07')
		})

		it('still targets the right organizer after sorting and paging', async () => {
			await show()
			await click(sortButton(container, 'Created'))
			await click(pager(container).next)

			await openActions(names()[0])
			await click(buttonNamed(document.body, 'Edit'))
			// Newest first, eleventh row: created on January 15
			expect(mocks.push).toHaveBeenCalledWith('/admin/organizer/edit/org_02')
		})

		it('asks for confirmation before deleting, naming the organizer', async () => {
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
			await show()

			await openActions('Dijon Run')
			await click(buttonNamed(document.body, 'Delete'))
			expect(openDialog().textContent).toContain(
				'This action cannot be undone. This will permanently delete "Dijon Run"'
			)

			// Deleting one organizer is not wired to the server yet: the row stays
			await click(buttonNamed(openDialog(), 'Delete'))
			expect(warn).toHaveBeenCalledWith('Delete organizer:', 'org_07')
			expect(dialogIsOpen()).toBe(false)
			expect(counter(container)).toBe('1-10 of 25')
		})
	})

	describe('empty and failing lists', () => {
		it('shows the empty state when there is no organizer', async () => {
			await show([])

			expect(bodyRows(container)).toHaveLength(1)
			expect(bodyRows(container)[0].textContent).toBe(
				'No organizers foundGet started by creating your first organizerCreate New Organizer'
			)
			expect(bodyRows(container)[0].querySelector('td')?.getAttribute('colspan')).toBe('7')
			expect(bodyRows(container)[0].querySelector('a')?.getAttribute('href')).toBe('/admin/organizer/create')
			expect(counter(container)).toBe('1-0 of 0')
			expect(pagerDisabled(container)).toEqual({ first: true, previous: true, next: true, last: true })
			expect(headerCells(container)).toHaveLength(7)
		})

		it('shows the empty state when the server action fails', async () => {
			const error = vi.spyOn(console, 'error').mockImplementation(() => {})
			mocks.getAllOrganizersAction.mockResolvedValue({ success: false, error: 'boom' })
			page = await mount(<AdminOrganizersPageClient currentUser={adminUser} locale="en" />)

			expect(bodyRows(page.container)[0].textContent).toContain('No organizers found')
			expect(error).toHaveBeenCalledWith('Error fetching organizers:', 'boom')
		})

		it('shows the access error instead of the list without a user', async () => {
			mocks.getAllOrganizersAction.mockResolvedValue({ success: true, data: organizers() })
			page = await mount(<AdminOrganizersPageClient currentUser={null} locale="en" />)

			expect(page.container.querySelector('table')).toBeNull()
			expect(page.container.textContent).toContain('Access Error')
			await click(buttonNamed(page.container, 'Sign In'))
			expect(mocks.push).toHaveBeenCalledWith('/auth/sign-in')
		})
	})

	describe('translations', () => {
		it('renders the headers and controls in the locale of the page', async () => {
			mocks.getAllOrganizersAction.mockResolvedValue({ success: true, data: organizers() })
			page = await mount(<AdminOrganizersPageClient currentUser={adminUser} locale="fr" />)

			expect(headerCells(page.container).slice(1, 3)).toEqual(["Nom de l'organisateur", 'E-mail'])
		})
	})

	describe('first visit', () => {
		it('takes over the markup of the server without a mismatch, then shows the list', async () => {
			const error = vi.spyOn(console, 'error').mockImplementation(() => {})
			mocks.getAllOrganizersAction.mockResolvedValue({ success: true, data: organizers() })
			const hydrated = await mountFromServer(<AdminOrganizersPageClient currentUser={adminUser} locale="en" />)
			page = hydrated

			expect(hydrated.hydrationErrors).toEqual([])
			expect(error).not.toHaveBeenCalled()
			expect(columnCells(hydrated.container, NAME)[0]).toBe('Alpes Trail')
			expect(counter(hydrated.container)).toBe('1-10 of 25')
		})
	})

	describe('stability', () => {
		it('is at rest once the list is on screen', async () => {
			await show()
			const before = page.commits()

			await settle(150)
			expect(page.commits()).toBe(before)
		})

		it('is at rest again after sorting, searching, paging and selecting', async () => {
			await show()
			await click(sortButton(container, 'Email'))
			await typeInto(search(), 'a')
			await click(pager(container).next)
			await click(selectAllBox(container))
			const before = page.commits()

			await settle(150)
			expect(page.commits()).toBe(before)
		})

		it('keeps the cells of a row in place when another row is selected', async () => {
			// The columns used to be a new array at every render: React then threw every cell away and built it again
			await show()
			const before = cellNodes(rowNamed(container, 'Alpes Trail'))
			expect(before.every(node => node != null)).toBe(true)

			await click(rowBox(container, 'Bordeaux Marathon'))
			const after = cellNodes(rowNamed(container, 'Alpes Trail'))
			expect(after.map((node, index) => node === before[index])).toEqual(before.map(() => true))
		})

		it('does not go through the records again when only the selection or the order changes', async () => {
			const rows = organizers()
			const emailReads = countReads(rows, 'email')
			await show(rows)
			await typeInto(search(), 'trail')
			const afterSearch = emailReads()
			// The search reads the e-mail of every record, shown or not
			expect(afterSearch).toBeGreaterThanOrEqual(25)

			await click(selectAllBox(container))
			await click(rowBox(container, 'Jura Trail'))
			await click(sortButton(container, 'Events'))
			expect(emailReads()).toBe(afterSearch)
		})

		it('behaves the same when React renders everything twice, as it does in development', async () => {
			mocks.getAllOrganizersAction.mockResolvedValue({ success: true, data: organizers() })
			page = await mount(
				<StrictMode>
					<AdminOrganizersPageClient currentUser={adminUser} locale="en" />
				</StrictMode>
			)
			container = page.container
			expect(counter(container)).toBe('1-10 of 25')

			await click(sortButton(container, 'Events'))
			expect(columnCells(container, 'Events')).toEqual(['40', '31', '25', '14', '12', '11', '10', '9', '8', '7'])
			await click(pager(container).next)
			expect(counter(container)).toBe('11-20 of 25')
			await click(selectAllBox(container))
			expect(buttonNamed(container, 'Delete Selected10')).toBeDefined()
			await typeInto(search(), 'running')
			expect(names()).toEqual(['annecy Running', 'Orléans Running'])
			expect(counter(container)).toBe('1-2 of 2')

			const before = page.commits()
			await settle(150)
			expect(page.commits()).toBe(before)
		})

		it('keyboard on a header does not sort this list', async () => {
			await show()

			await pressKey(sortButton(container, 'Email'), 'Enter')
			expect(sortArrows(container)).toEqual({ [NAME]: 'asc' })
		})
	})
})
