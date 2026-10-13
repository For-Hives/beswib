import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
	getAllEventsAction: vi.fn(),
	deleteEventAction: vi.fn(),
	push: vi.fn(),
	toastSuccess: vi.fn(),
	toastError: vi.fn(),
}))
vi.mock('@/app/[locale]/admin/actions', () => ({
	getAllEventsAction: mocks.getAllEventsAction,
	deleteEventAction: mocks.deleteEventAction,
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('sonner', () => ({ toast: { success: mocks.toastSuccess, error: mocks.toastError } }))

import AdminEventsPageClient from '@/components/admin/event/AdminEventsPageClient'
import type { Event as AppEvent } from '@/models/event.model'
import type { Organizer } from '@/models/organizer.model'
import type { CourseType } from '@/types/course-types'

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

type EventRow = AppEvent & { expand?: { organizer?: Organizer } }
type EventRecord = [string, string | null, string, number | undefined, CourseType, number | undefined]

// name, organizer (null: the relation is empty), day, distance, type, participants. In no sorted order (the server
// sends the most recently created first). Five events are far in the future, the others are past.
const RECORDS: EventRecord[] = [
	['Marathon de Paris', 'Paris Athlé', '2024-04-07', 42.195, 'road', 540],
	['UTMB Mont-Blanc', 'Alpes Trail', '2024-08-30', 171, 'trail', 230],
	['10 km de Lyon', 'Courir à Lyon', '2024-10-06', 10, 'road', 900],
	['Triathlon de Nice', null, '2024-06-16', 51.5, 'triathlon', 650],
	['SaintéLyon', 'Courir à Lyon', '2024-11-30', 82, 'trail', undefined],
	['Semi de Bordeaux', 'bordeaux Running', '2099-03-15', 21.1, 'road', 480],
	['Étape du Tour', null, '2024-07-07', 138, 'cycle', 160],
	['Trail des Vosges 9', 'Alpes Trail', '2024-05-19', 9, 'trail', 120],
	['Trail des Vosges 10', 'Alpes Trail', '2024-05-18', 10, 'trail', 200],
	['Course des Lumières', 'Courir à Lyon', '2024-12-08', undefined, 'other', 75],
	['Marathon de Nantes', 'Zone 44', '2024-04-21', 42.195, 'road', 520],
	['annecy Lake Run', 'Alpes Trail', '2099-06-01', 15, 'road', 300],
	['Écotrail de Paris', 'Paris Athlé', '2024-03-16', 80, 'trail', 1200],
	['Ironman de Vichy', null, '2024-08-25', 226, 'triathlon', 250],
	['Foulées de Rennes', 'Zone 44', '2024-09-22', 10, 'road', 310],
	['Paris-Roubaix Challenge', 'Paris Athlé', '2099-04-12', 145, 'cycle', 600],
	['Trail des Vosges 100', 'Alpes Trail', '2024-05-17', 100, 'trail', 60],
	['Diagonale des Fous', 'Zone 974', '2024-10-17', 165, 'trail', 280],
	['Semi de Paris', 'Paris Athlé', '2024-03-03', 21.1, 'road', 470],
	['Corrida de Houilles', null, '2099-12-28', 10, 'road', undefined],
	['Marseille-Cassis', 'bordeaux Running', '2024-10-27', 20, 'road', 150],
	['Gravel des Alpes', 'Alpes Trail', '2024-06-29', 120, 'cycle', 90],
	['Swimrun de Bretagne', 'Zone 44', '2099-07-05', 28, 'other', 40],
	['Marathon du Médoc', 'bordeaux Running', '2024-09-07', 42.195, 'road', 850],
	['Lyon Urban Trail', 'Courir à Lyon', '2024-04-01', 35, 'trail', 700],
]

const noon = new Date(Date.UTC(2024, 0, 1, 12))

// As the server action delivers them: raw PocketBase records, dates are strings and an empty relation has no
// `expand`. Midday UTC shows the same day in every time zone.
const events = (records = RECORDS): EventRow[] =>
	records.map(([name, organizerName, day, distanceKm, typeCourse, participants], index) => ({
		id: `evt_${String(index).padStart(2, '0')}`,
		name,
		eventDate: `${day} 12:00:00.000Z` as unknown as Date,
		description: '',
		location: '',
		bibPickupWindowBeginDate: noon,
		bibPickupWindowEndDate: noon,
		distanceKm,
		participants,
		typeCourse,
		options: null,
		organizer: organizerName == null ? '' : `org_${organizerName}`,
		...(organizerName == null
			? {}
			: {
					expand: {
						organizer: {
							id: `org_${organizerName}`,
							name: organizerName,
							email: 'contact@example.org',
							isPartnered: true,
							created: noon,
							updated: noon,
						},
					},
				}),
	}))

const NAME = 'Event Name'
const HEADERS = ['', NAME, 'Organizer', 'Date', 'Distance', 'Type', 'Participants', 'Actions']

describe('AdminEventsPageClient', () => {
	let page: MountedPage
	let container: HTMLElement

	const show = async (rows: EventRow[] = events()) => {
		mocks.getAllEventsAction.mockResolvedValue({ success: true, data: rows })
		page = await mount(<AdminEventsPageClient currentUser={adminUser} locale="en" />)
		container = page.container
	}

	const names = () => columnCells(container, NAME)
	const search = () => labelled(container, 'Search events...') as HTMLInputElement

	beforeEach(() => {
		installDomShims()
		for (const mock of Object.values(mocks)) mock.mockReset()
		// The table library may warn for every record whose relation is empty: expected here, and noisy
		vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => {
		page?.unmount()
		document.body.innerHTML = ''
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
	})

	describe('rows and cells', () => {
		it('shows the first ten events by date, with every cell built from the record', async () => {
			await show()

			expect(headerCells(container)).toEqual(HEADERS)
			expect(names()).toEqual([
				'Semi de Paris',
				'Écotrail de Paris',
				'Lyon Urban Trail',
				'Marathon de Paris',
				'Marathon de Nantes',
				'Trail des Vosges 100',
				'Trail des Vosges 10',
				'Trail des Vosges 9',
				'Triathlon de Nice',
				'Gravel des Alpes',
			])
			expect(cellsOf(rowNamed(container, 'Marathon de Paris'))).toEqual([
				'',
				'Marathon de Paris',
				'Paris Athlé',
				'Apr 7, 2024',
				'42.195km',
				'road',
				'540',
				'Open menu',
			])
			expect(cellsOf(rowNamed(container, 'Écotrail de Paris'))[6]).toBe((1200).toLocaleString())
			expect(sortArrows(container)).toEqual({ Date: 'asc' })
		})

		it('falls back to placeholders for an empty relation and missing figures', async () => {
			await show()
			await choosePageSize(container, 25)

			expect(cellsOf(rowNamed(container, 'Triathlon de Nice'))).toEqual([
				'',
				'Triathlon de Nice',
				'N/A',
				'Jun 16, 2024',
				'51.5km',
				'triathlon',
				'650',
				'Open menu',
			])
			expect(cellsOf(rowNamed(container, 'Course des Lumières'))[4]).toBe('N/A')
			expect(cellsOf(rowNamed(container, 'SaintéLyon'))[6]).toBe('N/A')
		})

		it('gives each column the width of its definition', async () => {
			await show()

			expect(headerWidths(container)).toEqual(['28px', '200px', '180px', '120px', '120px', '100px', '100px', '60px'])
		})

		it('counts the events, upcoming and past, above the table', async () => {
			await show()

			expect(statCard(container, 'Total Events')).toBe('25')
			expect(statCard(container, 'Upcoming Events')).toBe('5')
			expect(statCard(container, 'Past Events')).toBe('20')
		})
	})

	describe('sorting', () => {
		it('offers sorting on every data column, not on selection and actions', async () => {
			await show()

			expect(sortableHeaders(container)).toEqual([NAME, 'Organizer', 'Date', 'Distance', 'Type', 'Participants'])
		})

		it('sorts by name both ways: case is ignored and numbers count as numbers', async () => {
			await show()
			await choosePageSize(container, 25)

			const ascending = [
				'annecy Lake Run',
				'Corrida de Houilles',
				'Course des Lumières',
				'Diagonale des Fous',
				'Foulées de Rennes',
				'Gravel des Alpes',
				'Ironman de Vichy',
				'Lyon Urban Trail',
				'Marathon de Nantes',
				'Marathon de Paris',
				'Marathon du Médoc',
				'Marseille-Cassis',
				'Paris-Roubaix Challenge',
				'SaintéLyon',
				'Semi de Bordeaux',
				'Semi de Paris',
				'Swimrun de Bretagne',
				'Trail des Vosges 9',
				'Trail des Vosges 10',
				'Trail des Vosges 100',
				'Triathlon de Nice',
				'UTMB Mont-Blanc',
				'Écotrail de Paris',
				'Étape du Tour',
				// A name that starts with a number comes after those that start with a letter
				'10 km de Lyon',
			]
			await click(sortButton(container, NAME))
			expect(sortArrows(container)).toEqual({ [NAME]: 'asc' })
			expect(names()).toEqual(ascending)

			await click(sortButton(container, NAME))
			expect(sortArrows(container)).toEqual({ [NAME]: 'desc' })
			expect(names()).toEqual([...ascending].reverse())
		})

		it('sorts by organizer both ways, events without organizer at the end then at the start', async () => {
			await show()
			await choosePageSize(container, 25)

			await click(sortButton(container, 'Organizer'))
			expect(sortArrows(container)).toEqual({ Organizer: 'asc' })
			expect(columnCells(container, 'Organizer')).toEqual([
				...Array(6).fill('Alpes Trail'),
				...Array(3).fill('bordeaux Running'),
				...Array(4).fill('Courir à Lyon'),
				...Array(4).fill('Paris Athlé'),
				...Array(3).fill('Zone 44'),
				'Zone 974',
				...Array(4).fill('N/A'),
			])
			// Equal organizers keep the order received
			expect(names().slice(0, 6)).toEqual([
				'UTMB Mont-Blanc',
				'Trail des Vosges 9',
				'Trail des Vosges 10',
				'annecy Lake Run',
				'Trail des Vosges 100',
				'Gravel des Alpes',
			])

			await click(sortButton(container, 'Organizer'))
			expect(sortArrows(container)).toEqual({ Organizer: 'desc' })
			expect(columnCells(container, 'Organizer')).toEqual([
				...Array(4).fill('N/A'),
				'Zone 974',
				...Array(3).fill('Zone 44'),
				...Array(4).fill('Paris Athlé'),
				...Array(4).fill('Courir à Lyon'),
				...Array(3).fill('bordeaux Running'),
				...Array(6).fill('Alpes Trail'),
			])
			expect(names().slice(0, 4)).toEqual([
				'Triathlon de Nice',
				'Étape du Tour',
				'Ironman de Vichy',
				'Corrida de Houilles',
			])
		})

		it('sorts by date both ways', async () => {
			await show()

			await click(sortButton(container, 'Date'))
			expect(sortArrows(container)).toEqual({ Date: 'desc' })
			expect(columnCells(container, 'Date')).toEqual([
				'Dec 28, 2099',
				'Jul 5, 2099',
				'Jun 1, 2099',
				'Apr 12, 2099',
				'Mar 15, 2099',
				'Dec 8, 2024',
				'Nov 30, 2024',
				'Oct 27, 2024',
				'Oct 17, 2024',
				'Oct 6, 2024',
			])

			await click(sortButton(container, 'Date'))
			expect(sortArrows(container)).toEqual({ Date: 'asc' })
			expect(columnCells(container, 'Date')).toEqual([
				'Mar 3, 2024',
				'Mar 16, 2024',
				'Apr 1, 2024',
				'Apr 7, 2024',
				'Apr 21, 2024',
				'May 17, 2024',
				'May 18, 2024',
				'May 19, 2024',
				'Jun 16, 2024',
				'Jun 29, 2024',
			])
		})

		it('sorts by distance both ways, longest first, events without distance at the start then at the end', async () => {
			await show()
			await choosePageSize(container, 25)

			const longestFirst = [
				'N/A',
				'226km',
				'171km',
				'165km',
				'145km',
				'138km',
				'120km',
				'100km',
				'82km',
				'80km',
				'51.5km',
				'42.195km',
				'42.195km',
				'42.195km',
				'35km',
				'28km',
				'21.1km',
				'21.1km',
				'20km',
				'15km',
				'10km',
				'10km',
				'10km',
				'10km',
				'9km',
			]
			await click(sortButton(container, 'Distance'))
			expect(sortArrows(container)).toEqual({ Distance: 'desc' })
			expect(columnCells(container, 'Distance')).toEqual(longestFirst)
			// The three marathons keep the order received
			expect(names().slice(11, 14)).toEqual(['Marathon de Paris', 'Marathon de Nantes', 'Marathon du Médoc'])

			await click(sortButton(container, 'Distance'))
			expect(sortArrows(container)).toEqual({ Distance: 'asc' })
			expect(columnCells(container, 'Distance')).toEqual([...longestFirst].reverse())
			expect(names().slice(11, 14)).toEqual(['Marathon de Paris', 'Marathon de Nantes', 'Marathon du Médoc'])
		})

		it('sorts by type both ways, equal types in the order received', async () => {
			await show()

			await click(sortButton(container, 'Type'))
			expect(sortArrows(container)).toEqual({ Type: 'asc' })
			expect(columnCells(container, 'Type')).toEqual([
				'cycle',
				'cycle',
				'cycle',
				'other',
				'other',
				'road',
				'road',
				'road',
				'road',
				'road',
			])
			expect(names().slice(0, 5)).toEqual([
				'Étape du Tour',
				'Paris-Roubaix Challenge',
				'Gravel des Alpes',
				'Course des Lumières',
				'Swimrun de Bretagne',
			])

			await click(sortButton(container, 'Type'))
			expect(sortArrows(container)).toEqual({ Type: 'desc' })
			expect(columnCells(container, 'Type')).toEqual([
				'triathlon',
				'triathlon',
				'trail',
				'trail',
				'trail',
				'trail',
				'trail',
				'trail',
				'trail',
				'trail',
			])
			expect(names().slice(0, 3)).toEqual(['Triathlon de Nice', 'Ironman de Vichy', 'UTMB Mont-Blanc'])
		})

		it('sorts by participants both ways, largest first', async () => {
			await show()

			await click(sortButton(container, 'Participants'))
			expect(sortArrows(container)).toEqual({ Participants: 'desc' })
			expect(columnCells(container, 'Participants')).toEqual([
				'N/A',
				'N/A',
				(1200).toLocaleString(),
				'900',
				'850',
				'700',
				'650',
				'600',
				'540',
				'520',
			])

			await click(sortButton(container, 'Participants'))
			expect(sortArrows(container)).toEqual({ Participants: 'asc' })
			expect(columnCells(container, 'Participants')).toEqual([
				'40',
				'60',
				'75',
				'90',
				'120',
				'150',
				'160',
				'200',
				'230',
				'250',
			])
		})

		it('starts ascending on the organizer even when the first event has none', async () => {
			// table-core 8 took the first direction of a column from its first row alone: when that event happened to have
			// no organizer, the first click sorted the names from Z to A instead of A to Z.
			const [first, ...others] = RECORDS
			await show(events([RECORDS[3], first, ...others.filter(record => record !== RECORDS[3])]))

			await click(sortButton(container, 'Organizer'))
			expect(sortArrows(container)).toEqual({ Organizer: 'asc' })
		})

		it('sorts the organizers the same way when the first ten events have none', async () => {
			// What the table samples to choose a comparison and a first direction: nothing to learn from these ten
			const orphans = RECORDS.slice(0, 10).map(([name, , ...rest]): EventRecord => [name, null, ...rest])
			await show(
				events([
					...orphans,
					['Trail de Zeta', 'zeta Sport 10', '2024-01-10', 20, 'trail', 100],
					['Trail de Beta', 'Zeta Sport 9', '2024-01-11', 20, 'trail', 100],
					['Trail d’Alpha', 'Alpha Club', '2024-01-12', 20, 'trail', 100],
				])
			)
			await choosePageSize(container, 25)

			await click(sortButton(container, 'Organizer'))
			expect(sortArrows(container)).toEqual({ Organizer: 'asc' })
			expect(columnCells(container, 'Organizer').slice(0, 3)).toEqual(['Alpha Club', 'Zeta Sport 9', 'zeta Sport 10'])
		})

		it('orders ten rows or fewer like a longer list: case ignored, 9 before 10', async () => {
			// table-core 8 chose the comparison of a column from the rows after the tenth. A search that left ten rows or
			// fewer fell back to raw character codes: capitals first, "10" before "9", unlike the full list.
			await show()

			await typeInto(search(), 'alpes trail')
			await click(sortButton(container, NAME))
			expect(names()).toEqual([
				'annecy Lake Run',
				'Gravel des Alpes',
				'Trail des Vosges 9',
				'Trail des Vosges 10',
				'Trail des Vosges 100',
				'UTMB Mont-Blanc',
			])
		})

		it('sorts from the keyboard as well', async () => {
			await show()

			await pressKey(sortButton(container, NAME), 'Enter')
			expect(sortArrows(container)).toEqual({ [NAME]: 'asc' })
			await pressKey(sortButton(container, NAME), ' ')
			expect(sortArrows(container)).toEqual({ [NAME]: 'desc' })
			await pressKey(sortButton(container, NAME), 'Tab')
			expect(sortArrows(container)).toEqual({ [NAME]: 'desc' })
		})

		it('goes back to the first page when the order changes', async () => {
			await show()
			await click(pager(container).next)
			expect(counter(container)).toBe('11-20 of 25')

			await click(sortButton(container, 'Type'))
			expect(counter(container)).toBe('1-10 of 25')
		})
	})

	describe('search', () => {
		it('filters on the name, whatever the case', async () => {
			await show()

			await typeInto(search(), 'MARATHON')
			expect(names()).toEqual(['Marathon de Paris', 'Marathon de Nantes', 'Marathon du Médoc'])
			expect(counter(container)).toBe('1-3 of 3')
		})

		it('filters on the type, the distance and the organizer as well', async () => {
			await show()

			await typeInto(search(), 'triathlon')
			expect(names()).toEqual(['Triathlon de Nice', 'Ironman de Vichy'])

			await typeInto(search(), '42.195')
			expect(names()).toEqual(['Marathon de Paris', 'Marathon de Nantes', 'Marathon du Médoc'])

			await typeInto(search(), 'zone 974')
			expect(names()).toEqual(['Diagonale des Fous'])
		})

		it('offers to clear the search once there is one, and brings every row back', async () => {
			await show()
			expect(container.querySelector('[aria-label="Clear filter"]')).toBeNull()

			await typeInto(search(), 'zone 44')
			expect(counter(container)).toBe('1-3 of 3')

			await click(labelled(container, 'Clear filter'))
			expect(search().value).toBe('')
			expect(counter(container)).toBe('1-10 of 25')
			expect(container.querySelector('[aria-label="Clear filter"]')).toBeNull()
		})

		it('goes back to the first page when the search changes', async () => {
			await show()
			await click(pager(container).last)
			expect(counter(container)).toBe('21-25 of 25')

			await typeInto(search(), 'road')
			expect(counter(container)).toBe('1-10 of 10')
		})

		it('shows the empty state when nothing matches', async () => {
			await show()

			await typeInto(search(), 'no such event')
			expect(bodyRows(container)).toHaveLength(1)
			expect(bodyRows(container)[0].textContent).toBe(
				'No events foundGet started by creating your first eventCreate Event'
			)
			expect(counter(container)).toBe('1-0 of 0')
		})
	})

	describe('pagination', () => {
		it('walks through the pages and counts the rows shown', async () => {
			await show()
			expect(counter(container)).toBe('1-10 of 25')
			expect(pagerDisabled(container)).toEqual({ first: true, previous: true, next: false, last: false })

			await click(pager(container).next)
			expect(counter(container)).toBe('11-20 of 25')
			expect(names()[0]).toBe('Étape du Tour')
			expect(pagerDisabled(container)).toEqual({ first: false, previous: false, next: false, last: false })

			await click(pager(container).next)
			expect(counter(container)).toBe('21-25 of 25')
			expect(names()).toEqual([
				'Semi de Bordeaux',
				'Paris-Roubaix Challenge',
				'annecy Lake Run',
				'Swimrun de Bretagne',
				'Corrida de Houilles',
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

			await choosePageSize(container, 50)
			expect(bodyRows(container)).toHaveLength(25)
			expect(counter(container)).toBe('1-25 of 25')
			expect(pagerDisabled(container)).toEqual({ first: true, previous: true, next: true, last: true })
		})

		it('keeps the first row on screen when the page size changes', async () => {
			await show()
			await click(pager(container).last)
			expect(names()[0]).toBe('Semi de Bordeaux')

			await choosePageSize(container, 5)
			expect(counter(container)).toBe('21-25 of 25')
			expect(names()[0]).toBe('Semi de Bordeaux')

			await choosePageSize(container, 25)
			expect(counter(container)).toBe('1-25 of 25')
		})
	})

	describe('column visibility', () => {
		it('lists the columns that can be hidden, by their identifier', async () => {
			await show()

			await openMenu(buttonNamed(container, 'Toggle columns'))
			expect(menuEntries().map(entry => [entry.textContent, entry.getAttribute('aria-checked')])).toEqual([
				['expand_organizer_name', 'true'],
				['eventDate', 'true'],
				['distanceKm', 'true'],
				['typeCourse', 'true'],
				['participants', 'true'],
			])
		})

		it('hides a column and shows it again, the menu staying open', async () => {
			await show()
			await openMenu(buttonNamed(container, 'Toggle columns'))

			await click(buttonNamed(document.body, 'expand_organizer_name'))
			await click(buttonNamed(document.body, 'participants'))
			expect(headerCells(container)).toEqual(['', NAME, 'Date', 'Distance', 'Type', 'Actions'])
			expect(cellsOf(rowNamed(container, 'Marathon de Paris'))).toEqual([
				'',
				'Marathon de Paris',
				'Apr 7, 2024',
				'42.195km',
				'road',
				'Open menu',
			])
			expect(buttonNamed(document.body, 'participants').getAttribute('aria-checked')).toBe('false')

			await click(buttonNamed(document.body, 'expand_organizer_name'))
			expect(headerCells(container)).toEqual(['', NAME, 'Organizer', 'Date', 'Distance', 'Type', 'Actions'])
		})

		it('keeps the sort of a column while it is hidden', async () => {
			await show()
			await openMenu(buttonNamed(container, 'Toggle columns'))

			await click(buttonNamed(document.body, 'eventDate'))
			expect(names().slice(0, 3)).toEqual(['Semi de Paris', 'Écotrail de Paris', 'Lyon Urban Trail'])
		})
	})

	describe('selection', () => {
		it('selects rows one by one and reports the header box as partial', async () => {
			await show()
			expect(selectAllBox(container).getAttribute('aria-checked')).toBe('false')

			await click(rowBox(container, 'Semi de Paris'))
			expect(selectedRowNames(container, NAME)).toEqual(['Semi de Paris'])
			expect(selectAllBox(container).getAttribute('aria-checked')).toBe('mixed')
			expect(buttonNamed(container, 'Delete1')).toBeDefined()

			await click(rowBox(container, 'Semi de Paris'))
			expect(selectedRowNames(container, NAME)).toEqual([])
			expect(selectAllBox(container).getAttribute('aria-checked')).toBe('false')
		})

		it('selects the page with the header box, not the other pages', async () => {
			await show()

			await click(selectAllBox(container))
			expect(selectAllBox(container).getAttribute('aria-checked')).toBe('true')
			expect(selectedRowNames(container, NAME)).toHaveLength(10)
			expect(buttonNamed(container, 'Delete10')).toBeDefined()

			await click(pager(container).next)
			expect(selectAllBox(container).getAttribute('aria-checked')).toBe('false')
			expect(selectedRowNames(container, NAME)).toEqual([])
		})

		it('removes the selected rows from the list after confirmation, and recounts', async () => {
			await show()
			await click(rowBox(container, 'Semi de Paris'))
			await click(rowBox(container, 'Lyon Urban Trail'))

			await click(buttonNamed(container, 'Delete2'))
			expect(openDialog().textContent).toContain(
				'This action cannot be undone. This will permanently delete 2 selected events.'
			)

			await click(buttonNamed(openDialog(), 'Delete'))
			expect(dialogIsOpen()).toBe(false)
			expect(names().slice(0, 2)).toEqual(['Écotrail de Paris', 'Marathon de Paris'])
			expect(counter(container)).toBe('1-10 of 23')
			expect(selectedRowNames(container, NAME)).toEqual([])
			expect(statCard(container, 'Total Events')).toBe('23')
			expect(statCard(container, 'Past Events')).toBe('18')
		})
	})

	describe('row actions', () => {
		const openActions = async (name: string) => {
			await openMenu(buttonNamed(rowNamed(container, name), 'Open menu'))
		}

		it('offers edit, a disabled view and delete', async () => {
			await show()

			await openActions('Marathon de Paris')
			expect(menuEntries().map(entry => [entry.textContent, entry.getAttribute('aria-disabled')])).toEqual([
				['Edit', null],
				['View', 'true'],
				['Delete', null],
			])
		})

		it('opens the edit page of the event of that row, also after sorting and paging', async () => {
			await show()

			await openActions('Marathon de Paris')
			await click(buttonNamed(document.body, 'Edit'))
			expect(mocks.push).toHaveBeenLastCalledWith('/admin/event/edit/evt_00')

			await click(sortButton(container, 'Participants'))
			await click(pager(container).last)
			await openActions('Swimrun de Bretagne')
			await click(buttonNamed(document.body, 'Edit'))
			expect(mocks.push).toHaveBeenLastCalledWith('/admin/event/edit/evt_22')
		})

		it('deletes the event on the server after confirmation and removes its row', async () => {
			mocks.deleteEventAction.mockResolvedValue({ success: true })
			await show()

			await openActions('Marathon de Paris')
			await click(buttonNamed(document.body, 'Delete'))
			expect(openDialog().textContent).toContain(
				'This action cannot be undone. This will permanently delete "Marathon de Paris".'
			)

			await click(buttonNamed(openDialog(), 'Delete'))
			expect(mocks.deleteEventAction).toHaveBeenCalledWith('evt_00')
			expect(mocks.toastSuccess).toHaveBeenCalledWith('Event deleted successfully')
			expect(dialogIsOpen()).toBe(false)
			expect(names()).not.toContain('Marathon de Paris')
			expect(counter(container)).toBe('1-10 of 24')
			expect(statCard(container, 'Total Events')).toBe('24')
		})

		it('returns to the first page when an event of another page is deleted', async () => {
			mocks.deleteEventAction.mockResolvedValue({ success: true })
			await show()
			await click(pager(container).last)

			await openActions('Semi de Bordeaux')
			await click(buttonNamed(document.body, 'Delete'))
			await click(buttonNamed(openDialog(), 'Delete'))
			expect(mocks.deleteEventAction).toHaveBeenCalledWith('evt_05')
			expect(counter(container)).toBe('1-10 of 24')
		})

		it('keeps the row when the server refuses the deletion', async () => {
			const error = vi.spyOn(console, 'error').mockImplementation(() => {})
			mocks.deleteEventAction.mockResolvedValue({ success: false, error: 'nope' })
			await show()

			await openActions('Marathon de Paris')
			await click(buttonNamed(document.body, 'Delete'))
			await click(buttonNamed(openDialog(), 'Delete'))
			expect(mocks.toastError).toHaveBeenCalledWith('Failed to delete event')
			expect(error).toHaveBeenCalledWith('Failed to delete event:', 'nope')
			expect(names()).toContain('Marathon de Paris')
			expect(counter(container)).toBe('1-10 of 25')
		})
	})

	describe('empty and failing lists', () => {
		it('shows the empty state when there is no event', async () => {
			await show([])

			expect(bodyRows(container)).toHaveLength(1)
			expect(bodyRows(container)[0].textContent).toBe(
				'No events foundGet started by creating your first eventCreate Event'
			)
			expect(bodyRows(container)[0].querySelector('td')?.getAttribute('colspan')).toBe('8')
			expect(bodyRows(container)[0].querySelector('a')?.getAttribute('href')).toBe('/admin/event/create')
			expect(counter(container)).toBe('1-0 of 0')
			expect(pagerDisabled(container)).toEqual({ first: true, previous: true, next: true, last: true })
			expect(headerCells(container)).toEqual(HEADERS)
		})

		it('shows the empty state when the server action fails', async () => {
			const error = vi.spyOn(console, 'error').mockImplementation(() => {})
			mocks.getAllEventsAction.mockResolvedValue({ success: false, error: 'boom' })
			page = await mount(<AdminEventsPageClient currentUser={adminUser} locale="en" />)

			expect(bodyRows(page.container)[0].textContent).toContain('No events found')
			expect(error).toHaveBeenCalledWith('Error fetching events:', 'boom')
		})

		it('shows the access error instead of the list without a user', async () => {
			mocks.getAllEventsAction.mockResolvedValue({ success: true, data: events() })
			page = await mount(<AdminEventsPageClient currentUser={null} locale="en" />)

			expect(page.container.querySelector('table')).toBeNull()
			expect(page.container.textContent).toContain('Access Error')
			await click(buttonNamed(page.container, 'Sign In'))
			expect(mocks.push).toHaveBeenCalledWith('/auth/sign-in')
		})
	})

	describe('first visit', () => {
		it('takes over the markup of the server without a mismatch, then shows the list', async () => {
			const error = vi.spyOn(console, 'error').mockImplementation(() => {})
			mocks.getAllEventsAction.mockResolvedValue({ success: true, data: events() })
			const hydrated = await mountFromServer(<AdminEventsPageClient currentUser={adminUser} locale="en" />)
			page = hydrated

			expect(hydrated.hydrationErrors).toEqual([])
			expect(error).not.toHaveBeenCalled()
			expect(columnCells(hydrated.container, NAME)[0]).toBe('Semi de Paris')
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
			await click(sortButton(container, 'Type'))
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
			const before = cellNodes(rowNamed(container, 'Semi de Paris'))
			expect(before.every(node => node != null)).toBe(true)

			await click(rowBox(container, 'Lyon Urban Trail'))
			const after = cellNodes(rowNamed(container, 'Semi de Paris'))
			expect(after.map((node, index) => node === before[index])).toEqual(before.map(() => true))
		})

		it('does not go through the records again when only the selection or the order changes', async () => {
			const rows = events()
			const typeReads = countReads(rows, 'typeCourse')
			await show(rows)
			await typeInto(search(), 'trail')
			const afterSearch = typeReads()
			// The search reads the type of every record, shown or not
			expect(afterSearch).toBeGreaterThanOrEqual(25)

			await click(selectAllBox(container))
			await click(rowBox(container, 'SaintéLyon'))
			await click(sortButton(container, 'Participants'))
			expect(typeReads()).toBe(afterSearch)
		})
	})
})
