// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mockPocketbase, mockPocketbaseCollection } from '@/tests/mocks/pocketbase'

// The locale switcher of every page asks for the slug of an article in another language
// (getArticleTranslatedSlug): an action open to anonymous visitors by design. The slug it is given is
// looked up through a PocketBase filter run with the admin token, and the answer is a slug or nothing:
// a slug that closes the quote would turn each call into a yes/no question about anything appended
// to the filter. The real action and the real article service run here, over a fake PocketBase.

vi.mock('@clerk/nextjs/server', () => ({
	auth: vi.fn(),
}))
vi.mock('@/lib/services/pocketbase', () => ({
	pb: mockPocketbase,
}))

import { getArticleTranslatedSlug } from '@/app/[locale]/actions/locale'
import { fetchArticleBySlug } from '@/services/article.services'

const english = { translationGroup: 'group-1', slug: 'first-trail', locale: 'en', isDraft: false, id: 'article_en' }
const french = { translationGroup: 'group-1', slug: 'premier-trail', locale: 'fr', isDraft: false, id: 'article_fr' }

/** The filters PocketBase was asked, in order. */
function filters(): string[] {
	return mockPocketbaseCollection.getFullList.mock.calls.map(([options]) => (options as { filter: string }).filter)
}

beforeEach(() => {
	vi.clearAllMocks()
	vi.spyOn(console, 'error').mockImplementation(() => {})
	mockPocketbase.collection.mockReturnValue(mockPocketbaseCollection)
	// A PocketBase that holds one article and its translation, and matches a filter only when it is
	// exactly the lookup of that article: anything else is a filter this app never meant to send
	mockPocketbaseCollection.getFullList.mockImplementation(({ filter }: { filter: string }) => {
		if (filter === 'slug = "first-trail"') return Promise.resolve([english])
		if (filter === 'translationGroup = "group-1"') return Promise.resolve([english, french])
		return Promise.resolve([])
	})
})

describe('looking an article up by its slug', () => {
	it('still finds the translation of an article for the locale switcher', async () => {
		expect(await getArticleTranslatedSlug('first-trail', 'fr')).toEqual({ slug: 'premier-trail', success: true })

		expect(filters()).toEqual(['slug = "first-trail"', 'translationGroup = "group-1"'])
	})

	it.each([
		[
			'a quote that closes the string',
			'first-trail" || translationGroup != "',
			String.raw`slug = "first-trail\" || translationGroup != \""`,
		],
		[
			'a condition over another collection',
			'x" || @collection.users.role = "admin',
			String.raw`slug = "x\" || @collection.users.role = \"admin"`,
		],
		['a backslash before the closing quote', String.raw`x\" || id != "`, String.raw`slug = "x\\\" || id != \""`],
	])('keeps %s inside the quoted value, through the action of the locale switcher', async (_label, slug, filter) => {
		expect(await getArticleTranslatedSlug(slug, 'fr')).toEqual({ slug: null, success: true })

		// One lookup, of that slug and nothing else: no translation group was read after it
		expect(filters()).toEqual([filter])
	})

	it('keeps the slug of the address of a blog page inside the quoted value', async () => {
		// What /blog/<slug> and its share image pass on, once Next has decoded the path
		await fetchArticleBySlug('x" || isDraft = true || slug = "', true)

		expect(filters()).toEqual([String.raw`slug = "x\" || isDraft = true || slug = \""`])
	})

	it.each([
		['a list', ['first-trail" || id != "']],
		['an object', { slug: 'first-trail' }],
		['a number', 42],
		['nothing', undefined],
	])('looks nothing up when the action is handed %s instead of a slug', async (_label, slug) => {
		expect(await getArticleTranslatedSlug(slug as unknown as string, 'fr')).toEqual({ slug: null, success: false })

		expect(mockPocketbaseCollection.getFullList).not.toHaveBeenCalled()
	})

	it('escapes whatever reaches the lookup, a list included', async () => {
		// The service is typed for a string; a list is what a hand-made request could carry
		await fetchArticleBySlug(['first-trail" || id != "'] as unknown as string)

		expect(filters()).toEqual([String.raw`slug = "first-trail\" || id != \""`])
	})
})
