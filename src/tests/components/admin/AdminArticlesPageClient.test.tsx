import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
	getAllArticlesAction: vi.fn(),
	deleteArticleAction: vi.fn(),
	push: vi.fn(),
	toastSuccess: vi.fn(),
	toastError: vi.fn(),
}))
vi.mock('@/app/[locale]/admin/article/actions', () => ({
	getAllArticlesAction: mocks.getAllArticlesAction,
	deleteArticleAction: mocks.deleteArticleAction,
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('sonner', () => ({ toast: { success: mocks.toastSuccess, error: mocks.toastError } }))

import AdminArticlesPageClient from '@/components/admin/article/AdminArticlesPageClient'
import type { Locale } from '@/lib/i18n/config'
import type { Article } from '@/models/article.model'

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
	dialogTexts,
	headerCells,
	headerWidths,
	heldBack,
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

type ArticleRow = Article & { translationCount?: number; publishedCount?: number }
type ArticleRecord = [string, string, boolean, string, string, Locale, number | undefined, number | undefined, string]

// title, slug, draft, created, updated (month-day of 2025), language, translations, published translations,
// description. In no sorted order; titles mix cases, accents and numbers, and no column shares its order with another.
const RECORDS: ArticleRecord[] = [
	['Top 10 des trails en France', 'top-10-trails-france', false, '03-12', '06-01', 'fr', 9, 9, 'Classement'],
	['Acheter un dossard', 'acheter-un-dossard-en-securite-sur-beswib', false, '01-20', '09-15', 'fr', 9, 7, 'Achat'],
	['revendre son dossard', 'revendre-son-dossard', true, '05-02', '05-03', 'fr', 3, 0, 'Vente'],
	['Zoom sur le Marathon de Paris', 'zoom-marathon-paris', false, '02-14', '02-20', 'fr', 9, 9, 'Course'],
	['Top 9 des marathons', 'top-9-marathons', false, '04-01', '04-02', 'fr', 5, 5, 'Classement'],
	['How to buy a bib', 'how-to-buy-a-bib', false, '01-21', '03-30', 'en', 9, 7, 'Buying guide'],
	['Blessures : reprendre la course', 'blessures-reprendre-la-course', true, '06-18', '06-19', 'fr', 1, 0, 'Santé'],
	['Calendrier des courses 2026', 'calendrier-des-courses-2026', false, '10-05', '10-06', 'fr', 9, 9, 'Agenda'],
	['Débuter le trail', 'debuter-le-trail', false, '07-07', '08-08', 'fr', 2, 1, 'Conseils'],
	['Équipement en ultra', 'equipement-obligatoire-en-ultra-trail', true, '08-22', '08-23', 'fr', 4, 0, 'Matériel'],
	['Frais et commissions', 'frais-et-commissions', false, '01-05', '11-11', 'fr', 9, 9, 'Tarifs'],
	['Guía para vender tu dorsal', 'guia-para-vender-tu-dorsal', false, '05-04', '05-05', 'es', 3, 2, 'Guía'],
	['Hydratation en course', 'hydratation-en-course', false, '09-09', '09-10', 'fr', 9, 8, 'Santé'],
	[
		'inscription : mode d’emploi',
		'inscription-mode-d-emploi',
		true,
		'11-02',
		'11-03',
		'fr',
		undefined,
		undefined,
		'Aide',
	],
	['Jours de repos', 'jours-de-repos', false, '04-15', '07-01', 'fr', 6, 6, 'Entraînement'],
	['Kilomètre vertical', 'kilometre-vertical', false, '06-01', '06-02', 'fr', 9, 9, 'Discipline'],
	['Top 100 des courses mythiques', 'top-100-courses-mythiques', false, '12-01', '12-02', 'fr', 9, 9, 'Classement'],
	['Licence ou certificat médical', 'licence-ou-certificat-medical', false, '02-01', '10-20', 'fr', 9, 9, 'Règles'],
	['Marathon : le mur du 30e', 'marathon-le-mur-du-30e-kilometre', true, '08-01', '08-02', 'fr', 2, 0, 'Course'],
	['Nutrition avant un semi', 'nutrition-avant-un-semi', false, '03-01', '03-02', 'fr', 9, 9, 'Santé'],
	['Wie man eine Startnummer kauft', 'startnummer-kaufen', false, '01-22', '01-23', 'de', 9, 7, 'Kaufratgeber'],
	['Objectif 10 km', 'objectif-10-km', false, '07-20', '07-21', 'fr', 7, 7, 'Entraînement'],
	['Préparer son premier trail', 'preparer-son-premier-trail', false, '05-20', '12-24', 'fr', 9, 9, 'Conseils'],
	['Quand transférer son dossard', 'quand-transferer-son-dossard', false, '10-30', '10-31', 'fr', 9, 9, 'Vente'],
	['Récupération après un ultra', 'recuperation-apres-un-ultra', true, '09-25', '09-26', 'fr', 1, 0, 'Santé'],
]

// As the server action delivers them: raw PocketBase records, dates are strings. Midday UTC shows the same day in
// every time zone.
const articles = (records = RECORDS): ArticleRow[] =>
	records.map(
		([title, slug, isDraft, created, updated, locale, translationCount, publishedCount, description], index) => ({
			id: `art_${String(index).padStart(2, '0')}`,
			title,
			description,
			slug,
			locale,
			image: 'img_1',
			extract: '',
			content: '',
			isDraft,
			created: `2025-${created} 12:00:00.000Z` as unknown as Date,
			updated: `2025-${updated} 12:00:00.000Z` as unknown as Date,
			translationCount,
			publishedCount,
		})
	)

const HEADERS = ['', 'Title', 'Slug', 'Status', 'Created', 'Updated', 'Languages', 'Actions']

describe('AdminArticlesPageClient', () => {
	let page: MountedPage
	let container: HTMLElement

	const show = async (rows: ArticleRow[] = articles()) => {
		mocks.getAllArticlesAction.mockResolvedValue({ success: true, data: rows })
		page = await mount(<AdminArticlesPageClient currentUser={adminUser} locale="en" />)
		container = page.container
	}

	const titles = () => columnCells(container, 'Title')
	const search = () => labelled(container, 'Search articles...') as HTMLInputElement

	beforeEach(() => {
		installDomShims()
		for (const mock of Object.values(mocks)) mock.mockReset()
	})

	afterEach(() => {
		page?.unmount()
		document.body.innerHTML = ''
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
	})

	describe('rows and cells', () => {
		it('shows the ten most recent articles, with every cell built from the record', async () => {
			await show()

			expect(mocks.getAllArticlesAction).toHaveBeenCalledWith(false)
			expect(headerCells(container)).toEqual(HEADERS)
			expect(titles()).toEqual([
				'Top 100 des courses mythiques',
				'inscription : mode d’emploi',
				'Quand transférer son dossard',
				'Calendrier des courses 2026',
				'Récupération après un ultra',
				'Hydratation en course',
				'Équipement en ultra',
				'Marathon : le mur du 30e',
				'Objectif 10 km',
				'Débuter le trail',
			])
			expect(cellsOf(rowNamed(container, 'Hydratation en course'))).toEqual([
				'',
				'Hydratation en course',
				'hydratation-en-course',
				'Published',
				'Sep 9, 2025',
				'Sep 10, 2025',
				'🇫🇷9/98/9',
				'Open menu',
			])
			expect(sortArrows(container)).toEqual({ Created: 'desc' })
		})

		it('shortens a long slug, marks drafts and defaults the translation figures', async () => {
			await show()

			expect(cellsOf(rowNamed(container, 'Équipement en ultra'))).toEqual([
				'',
				'Équipement en ultra',
				'equipement-obligatoire-en-ultr...',
				'Draft',
				'Aug 22, 2025',
				'Aug 23, 2025',
				'🇫🇷4/90/4',
				'Open menu',
			])
			// Without figures from the server: one language, published or not as the article is
			expect(cellsOf(rowNamed(container, 'inscription : mode d’emploi'))[6]).toBe('🇫🇷1/90/1')
		})

		it('gives each column the width of its definition', async () => {
			await show()

			expect(headerWidths(container)).toEqual(['28px', '300px', '180px', '100px', '120px', '120px', '120px', '60px'])
		})

		it('counts the articles, published and drafts, above the table', async () => {
			await show()

			expect(statCard(container, 'Total Articles')).toBe('25')
			expect(statCard(container, 'Published Articles')).toBe('19')
			expect(statCard(container, 'Draft Articles')).toBe('6')
		})
	})

	describe('sorting', () => {
		it('offers sorting on every data column, not on selection and actions', async () => {
			await show()

			expect(sortableHeaders(container)).toEqual(['Title', 'Slug', 'Status', 'Created', 'Updated', 'Languages'])
		})

		it('sorts by title both ways: case is ignored and numbers count as numbers', async () => {
			await show()
			await choosePageSize(container, 25)

			const ascending = [
				'Acheter un dossard',
				'Blessures : reprendre la course',
				'Calendrier des courses 2026',
				'Débuter le trail',
				'Frais et commissions',
				'Guía para vender tu dorsal',
				'How to buy a bib',
				'Hydratation en course',
				'inscription : mode d’emploi',
				'Jours de repos',
				'Kilomètre vertical',
				'Licence ou certificat médical',
				'Marathon : le mur du 30e',
				'Nutrition avant un semi',
				'Objectif 10 km',
				'Préparer son premier trail',
				'Quand transférer son dossard',
				'revendre son dossard',
				'Récupération après un ultra',
				'Top 9 des marathons',
				'Top 10 des trails en France',
				'Top 100 des courses mythiques',
				'Wie man eine Startnummer kauft',
				'Zoom sur le Marathon de Paris',
				'Équipement en ultra',
			]
			await click(sortButton(container, 'Title'))
			expect(sortArrows(container)).toEqual({ Title: 'asc' })
			expect(titles()).toEqual(ascending)

			await click(sortButton(container, 'Title'))
			expect(sortArrows(container)).toEqual({ Title: 'desc' })
			expect(titles()).toEqual([...ascending].reverse())
		})

		it('sorts by slug both ways', async () => {
			await show()

			await click(sortButton(container, 'Slug'))
			expect(sortArrows(container)).toEqual({ Slug: 'asc' })
			expect(columnCells(container, 'Slug')).toEqual([
				'acheter-un-dossard-en-securite...',
				'blessures-reprendre-la-course',
				'calendrier-des-courses-2026',
				'debuter-le-trail',
				'equipement-obligatoire-en-ultr...',
				'frais-et-commissions',
				'guia-para-vender-tu-dorsal',
				'how-to-buy-a-bib',
				'hydratation-en-course',
				'inscription-mode-d-emploi',
			])

			await click(sortButton(container, 'Slug'))
			expect(sortArrows(container)).toEqual({ Slug: 'desc' })
			expect(columnCells(container, 'Slug')).toEqual([
				'zoom-marathon-paris',
				'top-100-courses-mythiques',
				'top-10-trails-france',
				'top-9-marathons',
				'startnummer-kaufen',
				'revendre-son-dossard',
				'recuperation-apres-un-ultra',
				'quand-transferer-son-dossard',
				'preparer-son-premier-trail',
				'objectif-10-km',
			])
		})

		it('sorts by status both ways, drafts first, equal statuses in the order received', async () => {
			await show()

			await click(sortButton(container, 'Status'))
			expect(sortArrows(container)).toEqual({ Status: 'desc' })
			expect(columnCells(container, 'Status')).toEqual([...Array(6).fill('Draft'), ...Array(4).fill('Published')])
			expect(titles()).toEqual([
				'revendre son dossard',
				'Blessures : reprendre la course',
				'Équipement en ultra',
				'inscription : mode d’emploi',
				'Marathon : le mur du 30e',
				'Récupération après un ultra',
				'Top 10 des trails en France',
				'Acheter un dossard',
				'Zoom sur le Marathon de Paris',
				'Top 9 des marathons',
			])

			await click(sortButton(container, 'Status'))
			expect(sortArrows(container)).toEqual({ Status: 'asc' })
			expect(columnCells(container, 'Status')).toEqual(Array(10).fill('Published'))
			expect(titles().slice(0, 3)).toEqual([
				'Top 10 des trails en France',
				'Acheter un dossard',
				'Zoom sur le Marathon de Paris',
			])
		})

		it('sorts by creation date both ways', async () => {
			await show()

			await click(sortButton(container, 'Created'))
			expect(sortArrows(container)).toEqual({ Created: 'asc' })
			expect(columnCells(container, 'Created')).toEqual([
				'Jan 5, 2025',
				'Jan 20, 2025',
				'Jan 21, 2025',
				'Jan 22, 2025',
				'Feb 1, 2025',
				'Feb 14, 2025',
				'Mar 1, 2025',
				'Mar 12, 2025',
				'Apr 1, 2025',
				'Apr 15, 2025',
			])

			await click(sortButton(container, 'Created'))
			expect(sortArrows(container)).toEqual({ Created: 'desc' })
			expect(columnCells(container, 'Created')).toEqual([
				'Dec 1, 2025',
				'Nov 2, 2025',
				'Oct 30, 2025',
				'Oct 5, 2025',
				'Sep 25, 2025',
				'Sep 9, 2025',
				'Aug 22, 2025',
				'Aug 1, 2025',
				'Jul 20, 2025',
				'Jul 7, 2025',
			])
		})

		it('sorts by update date both ways, oldest first', async () => {
			await show()

			await click(sortButton(container, 'Updated'))
			expect(sortArrows(container)).toEqual({ Updated: 'asc' })
			expect(columnCells(container, 'Updated')).toEqual([
				'Jan 23, 2025',
				'Feb 20, 2025',
				'Mar 2, 2025',
				'Mar 30, 2025',
				'Apr 2, 2025',
				'May 3, 2025',
				'May 5, 2025',
				'Jun 1, 2025',
				'Jun 2, 2025',
				'Jun 19, 2025',
			])

			await click(sortButton(container, 'Updated'))
			expect(sortArrows(container)).toEqual({ Updated: 'desc' })
			expect(columnCells(container, 'Updated')).toEqual([
				'Dec 24, 2025',
				'Dec 2, 2025',
				'Nov 11, 2025',
				'Nov 3, 2025',
				'Oct 31, 2025',
				'Oct 20, 2025',
				'Oct 6, 2025',
				'Sep 26, 2025',
				'Sep 15, 2025',
				'Sep 10, 2025',
			])
		})

		it('sorts by language both ways, equal languages in the order received', async () => {
			await show()

			await click(sortButton(container, 'Languages'))
			expect(sortArrows(container)).toEqual({ Languages: 'asc' })
			expect(titles().slice(0, 5)).toEqual([
				'Wie man eine Startnummer kauft',
				'How to buy a bib',
				'Guía para vender tu dorsal',
				'Top 10 des trails en France',
				'Acheter un dossard',
			])

			await click(sortButton(container, 'Languages'))
			expect(sortArrows(container)).toEqual({ Languages: 'desc' })
			expect(titles().slice(0, 2)).toEqual(['Top 10 des trails en France', 'Acheter un dossard'])
			await click(pager(container).last)
			expect(titles().slice(-3)).toEqual([
				'Guía para vender tu dorsal',
				'How to buy a bib',
				'Wie man eine Startnummer kauft',
			])
		})

		it('orders ten rows or fewer like a longer list: case ignored, 9 before 10', async () => {
			// table-core 8 chose the comparison of a column from the rows after the tenth. A search that left ten rows or
			// fewer fell back to raw character codes: capitals first, "10" before "9", unlike the full list.
			await show()

			await typeInto(search(), 'top')
			await click(sortButton(container, 'Title'))
			expect(titles()).toEqual(['Top 9 des marathons', 'Top 10 des trails en France', 'Top 100 des courses mythiques'])

			await typeInto(search(), 'tion')
			expect(titles()).toEqual([
				'Hydratation en course',
				'inscription : mode d’emploi',
				'Nutrition avant un semi',
				'Récupération après un ultra',
			])
		})

		it('sorts from the keyboard as well', async () => {
			await show()

			await pressKey(sortButton(container, 'Title'), 'Enter')
			expect(sortArrows(container)).toEqual({ Title: 'asc' })
			await pressKey(sortButton(container, 'Title'), ' ')
			expect(sortArrows(container)).toEqual({ Title: 'desc' })
		})

		it('goes back to the first page when the order changes', async () => {
			await show()
			await click(pager(container).next)
			expect(counter(container)).toBe('11-20 of 25')

			await click(sortButton(container, 'Slug'))
			expect(counter(container)).toBe('1-10 of 25')
		})
	})

	describe('search and language filter', () => {
		it('filters on the title, whatever the case', async () => {
			await show()

			await typeInto(search(), 'PREMIER')
			expect(titles()).toEqual(['Préparer son premier trail'])
			expect(counter(container)).toBe('1-1 of 1')
		})

		it('filters on the slug and the description as well', async () => {
			await show()

			await typeInto(search(), 'securite-sur-beswib')
			expect(titles()).toEqual(['Acheter un dossard'])

			// "trail" is in three titles and in one slug
			await typeInto(search(), 'trail')
			expect([...titles()].sort()).toEqual(
				['Débuter le trail', 'Préparer son premier trail', 'Top 10 des trails en France', 'Équipement en ultra'].sort()
			)

			await typeInto(search(), 'kaufratgeber')
			expect(titles()).toEqual(['Wie man eine Startnummer kauft'])
		})

		it('offers to clear the search once there is one, and brings every row back', async () => {
			await show()
			expect(container.querySelector('[aria-label="Clear filter"]')).toBeNull()

			await typeInto(search(), 'classement')
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

			await typeInto(search(), 'santé')
			expect(counter(container)).toBe('1-4 of 4')
		})

		it('shows the empty state when nothing matches', async () => {
			await show()

			await typeInto(search(), 'no such article')
			expect(bodyRows(container)).toHaveLength(1)
			expect(bodyRows(container)[0].textContent).toBe(
				'No articles foundGet started by creating your first articleCreate Article'
			)
			expect(counter(container)).toBe('1-0 of 0')
		})

		it('asks the server for every language, shows what comes back and returns to the first page', async () => {
			await show()
			await click(pager(container).last)
			mocks.getAllArticlesAction.mockResolvedValue({ success: true, data: articles(RECORDS.slice(0, 12)) })

			await click(buttonNamed(container, 'Show all languages'))
			expect(mocks.getAllArticlesAction).toHaveBeenLastCalledWith(true)
			expect(counter(container)).toBe('1-10 of 12')
			expect(statCard(container, 'Total Articles')).toBe('12')

			mocks.getAllArticlesAction.mockResolvedValue({ success: true, data: articles() })
			await click(buttonNamed(container, 'Show French only'))
			expect(mocks.getAllArticlesAction).toHaveBeenLastCalledWith(false)
			expect(counter(container)).toBe('1-10 of 25')
		})
	})

	describe('pagination', () => {
		it('walks through the pages and counts the rows shown', async () => {
			await show()
			expect(counter(container)).toBe('1-10 of 25')
			expect(pagerDisabled(container)).toEqual({ first: true, previous: true, next: false, last: false })

			await click(pager(container).next)
			expect(counter(container)).toBe('11-20 of 25')
			expect(titles()[0]).toBe('Blessures : reprendre la course')
			expect(pagerDisabled(container)).toEqual({ first: false, previous: false, next: false, last: false })

			await click(pager(container).next)
			expect(counter(container)).toBe('21-25 of 25')
			expect(titles()).toEqual([
				'Licence ou certificat médical',
				'Wie man eine Startnummer kauft',
				'How to buy a bib',
				'Acheter un dossard',
				'Frais et commissions',
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
			await click(pager(container).next)
			expect(titles()[0]).toBe('Blessures : reprendre la course')

			await choosePageSize(container, 5)
			expect(counter(container)).toBe('11-15 of 25')
			expect(titles()[0]).toBe('Blessures : reprendre la course')
		})
	})

	describe('column visibility', () => {
		it('lists the columns that can be hidden, by their identifier', async () => {
			await show()

			await openMenu(buttonNamed(container, 'Toggle columns'))
			expect(menuEntries().map(entry => [entry.textContent, entry.getAttribute('aria-checked')])).toEqual([
				['slug', 'true'],
				['isDraft', 'true'],
				['created', 'true'],
				['updated', 'true'],
				['translations', 'true'],
			])
		})

		it('hides a column and shows it again, the menu staying open', async () => {
			await show()
			await openMenu(buttonNamed(container, 'Toggle columns'))

			await click(buttonNamed(document.body, 'slug'))
			await click(buttonNamed(document.body, 'translations'))
			expect(headerCells(container)).toEqual(['', 'Title', 'Status', 'Created', 'Updated', 'Actions'])
			expect(cellsOf(rowNamed(container, 'Hydratation en course'))).toEqual([
				'',
				'Hydratation en course',
				'Published',
				'Sep 9, 2025',
				'Sep 10, 2025',
				'Open menu',
			])
			expect(buttonNamed(document.body, 'slug').getAttribute('aria-checked')).toBe('false')

			await click(buttonNamed(document.body, 'slug'))
			expect(headerCells(container)).toEqual(['', 'Title', 'Slug', 'Status', 'Created', 'Updated', 'Actions'])
		})

		it('keeps the sort of a column while it is hidden', async () => {
			await show()
			await openMenu(buttonNamed(container, 'Toggle columns'))

			await click(buttonNamed(document.body, 'created'))
			expect(titles().slice(0, 2)).toEqual(['Top 100 des courses mythiques', 'inscription : mode d’emploi'])
		})
	})

	describe('selection', () => {
		it('selects rows one by one and reports the header box as partial', async () => {
			await show()
			expect(selectAllBox(container).getAttribute('aria-checked')).toBe('false')

			await click(rowBox(container, 'Objectif 10 km'))
			expect(selectedRowNames(container, 'Title')).toEqual(['Objectif 10 km'])
			expect(selectAllBox(container).getAttribute('aria-checked')).toBe('mixed')
			expect(buttonNamed(container, 'Delete1')).toBeDefined()

			await click(rowBox(container, 'Objectif 10 km'))
			expect(selectedRowNames(container, 'Title')).toEqual([])
			expect(selectAllBox(container).getAttribute('aria-checked')).toBe('false')
		})

		it('selects the page with the header box, not the other pages', async () => {
			await show()

			await click(selectAllBox(container))
			expect(selectAllBox(container).getAttribute('aria-checked')).toBe('true')
			expect(selectedRowNames(container, 'Title')).toHaveLength(10)
			expect(buttonNamed(container, 'Delete10')).toBeDefined()

			await click(pager(container).next)
			expect(selectAllBox(container).getAttribute('aria-checked')).toBe('false')
			expect(selectedRowNames(container, 'Title')).toEqual([])
		})

		it('removes the selected rows from the list after confirmation, and recounts', async () => {
			await show()
			await click(rowBox(container, 'Top 100 des courses mythiques'))
			await click(rowBox(container, 'Équipement en ultra'))

			await click(buttonNamed(container, 'Delete2'))
			expect(openDialog().textContent).toContain(
				'This action cannot be undone. This will permanently delete 2 selected articles.'
			)

			await click(buttonNamed(openDialog(), 'Delete'))
			expect(dialogIsOpen()).toBe(false)
			expect(titles().slice(0, 2)).toEqual(['inscription : mode d’emploi', 'Quand transférer son dossard'])
			expect(counter(container)).toBe('1-10 of 23')
			expect(selectedRowNames(container, 'Title')).toEqual([])
			expect(statCard(container, 'Total Articles')).toBe('23')
			expect(statCard(container, 'Draft Articles')).toBe('5')
		})
	})

	describe('row actions', () => {
		const openActions = async (title: string) => {
			await openMenu(buttonNamed(rowNamed(container, title), 'Open menu'))
		}

		it('offers edit, a disabled view and delete', async () => {
			await show()

			await openActions('Objectif 10 km')
			expect(menuEntries().map(entry => [entry.textContent, entry.getAttribute('aria-disabled')])).toEqual([
				['Edit', null],
				['View', 'true'],
				['Delete', null],
			])
		})

		it('opens the edit page of the article of that row, also after sorting and paging', async () => {
			await show()

			await openActions('Objectif 10 km')
			await click(buttonNamed(document.body, 'Edit'))
			expect(mocks.push).toHaveBeenLastCalledWith('/admin/article/edit/art_21')

			await click(sortButton(container, 'Slug'))
			await click(pager(container).last)
			await openActions('Zoom sur le Marathon de Paris')
			await click(buttonNamed(document.body, 'Edit'))
			expect(mocks.push).toHaveBeenLastCalledWith('/admin/article/edit/art_03')
		})

		it('deletes the article on the server after confirmation and removes its row', async () => {
			mocks.deleteArticleAction.mockResolvedValue({ success: true })
			await show()

			await openActions('Objectif 10 km')
			await click(buttonNamed(document.body, 'Delete'))
			expect(openDialog().textContent).toContain(
				'This action cannot be undone. This will permanently delete "Objectif 10 km".'
			)

			await click(buttonNamed(openDialog(), 'Delete'))
			expect(mocks.deleteArticleAction).toHaveBeenCalledWith('art_21')
			expect(mocks.toastSuccess).toHaveBeenCalledWith('Article deleted successfully')
			expect(dialogIsOpen()).toBe(false)
			expect(titles()).not.toContain('Objectif 10 km')
			expect(counter(container)).toBe('1-10 of 24')
			expect(statCard(container, 'Published Articles')).toBe('18')
		})

		it('keeps the row when the server refuses the deletion', async () => {
			const error = vi.spyOn(console, 'error').mockImplementation(() => {})
			mocks.deleteArticleAction.mockResolvedValue({ success: false, error: 'nope' })
			await show()

			await openActions('Objectif 10 km')
			await click(buttonNamed(document.body, 'Delete'))
			await click(buttonNamed(openDialog(), 'Delete'))
			expect(mocks.toastError).toHaveBeenCalledWith('Failed to delete article')
			expect(error).toHaveBeenCalledWith('Failed to delete article:', 'nope')
			expect(titles()).toContain('Objectif 10 km')
			expect(counter(container)).toBe('1-10 of 25')
		})

		// A row is its position in the list received, and its cells stay in place from one render to the next. Once
		// "Calendrier des courses 2026" is gone, the row of "Débuter le trail" holds "Équipement en ultra": whatever was
		// left open on that row must not carry over to the article that takes its place.
		it('closes the dialog of a row when a deletion still on its way puts another article under it', async () => {
			const deletion = heldBack<{ success: boolean }>()
			mocks.deleteArticleAction.mockReturnValue(deletion.promise)
			await show()
			await openActions('Calendrier des courses 2026')
			await click(buttonNamed(document.body, 'Delete'))
			await click(buttonNamed(openDialog(), 'Delete'))

			await openActions('Débuter le trail')
			await click(buttonNamed(document.body, 'Delete'))
			expect(openDialog().textContent).toContain('This will permanently delete "Débuter le trail".')

			await deletion.answer({ success: true })
			expect(titles()).not.toContain('Calendrier des courses 2026')
			expect(titles()).toContain('Équipement en ultra')
			// Left open, it would name "Équipement en ultra" and its button would delete that article
			expect(dialogTexts()).toEqual([])
		})

		it('closes the dialog of a row when the list of every language arrives under it', async () => {
			// The translations come in between the French articles: in the complete list, the position "Débuter le trail"
			// has in the French one belongs to "Calendrier des courses 2026"
			const everyLanguage = articles()
			await show(everyLanguage.filter(article => article.locale === 'fr'))
			const complete = heldBack<{ success: boolean; data: ArticleRow[] }>()
			mocks.getAllArticlesAction.mockReturnValue(complete.promise)
			await click(buttonNamed(container, 'Show all languages'))

			await openActions('Débuter le trail')
			await click(buttonNamed(document.body, 'Delete'))
			expect(openDialog().textContent).toContain('This will permanently delete "Débuter le trail".')

			await complete.answer({ success: true, data: everyLanguage })
			expect(counter(container)).toBe('1-10 of 25')
			expect(titles()).toContain('Calendrier des courses 2026')
			expect(dialogTexts()).toEqual([])
		})
	})

	describe('empty and failing lists', () => {
		it('shows the empty state when there is no article', async () => {
			await show([])

			expect(bodyRows(container)).toHaveLength(1)
			expect(bodyRows(container)[0].textContent).toBe(
				'No articles foundGet started by creating your first articleCreate Article'
			)
			expect(bodyRows(container)[0].querySelector('td')?.getAttribute('colspan')).toBe('8')
			expect(bodyRows(container)[0].querySelector('a')?.getAttribute('href')).toBe('/admin/article/create')
			expect(counter(container)).toBe('1-0 of 0')
			expect(pagerDisabled(container)).toEqual({ first: true, previous: true, next: true, last: true })
			expect(headerCells(container)).toEqual(HEADERS)
		})

		it('shows the empty state when the server action fails', async () => {
			const error = vi.spyOn(console, 'error').mockImplementation(() => {})
			mocks.getAllArticlesAction.mockResolvedValue({ success: false, error: 'boom' })
			page = await mount(<AdminArticlesPageClient currentUser={adminUser} locale="en" />)

			expect(bodyRows(page.container)[0].textContent).toContain('No articles found')
			expect(error).toHaveBeenCalledWith('Error fetching articles:', 'boom')
		})

		it('shows the access error instead of the list without a user', async () => {
			mocks.getAllArticlesAction.mockResolvedValue({ success: true, data: articles() })
			page = await mount(<AdminArticlesPageClient currentUser={null} locale="en" />)

			expect(page.container.querySelector('table')).toBeNull()
			expect(page.container.textContent).toContain('Access Error')
			await click(buttonNamed(page.container, 'Sign In'))
			expect(mocks.push).toHaveBeenCalledWith('/auth/sign-in')
		})
	})

	describe('first visit', () => {
		it('takes over the markup of the server without a mismatch, then shows the list', async () => {
			const error = vi.spyOn(console, 'error').mockImplementation(() => {})
			mocks.getAllArticlesAction.mockResolvedValue({ success: true, data: articles() })
			const hydrated = await mountFromServer(<AdminArticlesPageClient currentUser={adminUser} locale="en" />)
			page = hydrated

			expect(hydrated.hydrationErrors).toEqual([])
			expect(error).not.toHaveBeenCalled()
			expect(columnCells(hydrated.container, 'Title')[0]).toBe('Top 100 des courses mythiques')
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
			await click(sortButton(container, 'Slug'))
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
			const before = cellNodes(rowNamed(container, 'Hydratation en course'))
			expect(before.every(node => node != null)).toBe(true)

			await click(rowBox(container, 'Objectif 10 km'))
			const after = cellNodes(rowNamed(container, 'Hydratation en course'))
			expect(after.map((node, index) => node === before[index])).toEqual(before.map(() => true))
		})

		it('does not go through the records again when only the selection or the order changes', async () => {
			const rows = articles()
			const descriptionReads = countReads(rows, 'description')
			await show(rows)
			await typeInto(search(), 'trail')
			const afterSearch = descriptionReads()
			// The search reads the description of every record, shown or not
			expect(afterSearch).toBeGreaterThanOrEqual(25)

			await click(selectAllBox(container))
			await click(rowBox(container, 'Débuter le trail'))
			await click(sortButton(container, 'Status'))
			expect(descriptionReads()).toBe(afterSearch)
		})
	})
})
