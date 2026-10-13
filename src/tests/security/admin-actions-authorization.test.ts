// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockPocketbase, mockPocketbaseCollection } from '@/tests/mocks/pocketbase'

// The admin pages redirect whoever is not an admin, but their actions are HTTP endpoints of their
// own: anyone may call them without ever opening a page. Every exported action of the admin area must
// check the role itself, with checkAdminAccess, before it reads or writes anything.

vi.mock('@clerk/nextjs/server', () => ({
	auth: vi.fn(),
}))
vi.mock('next/cache', () => ({
	revalidateTag: vi.fn(),
	revalidatePath: vi.fn(),
}))
vi.mock('@/lib/services/pocketbase', () => ({
	pb: mockPocketbase,
}))
vi.mock('@/services/gemini.services', () => ({
	generateSEOContent: vi.fn(),
	generateArticleTranslation: vi.fn(),
}))
vi.mock('@/services/forvoyez.services', () => ({
	generateImageAltText: vi.fn(),
}))

import { auth } from '@clerk/nextjs/server'
import * as adminActions from '@/app/[locale]/admin/actions'
import * as articleActions from '@/app/[locale]/admin/article/actions'
import { generateImageAltText } from '@/services/forvoyez.services'
import { generateArticleTranslation, generateSEOContent } from '@/services/gemini.services'

type Action = (...args: unknown[]) => Promise<{ success: boolean; error?: string; data?: unknown }>

const actions: [string, Action][] = [
	...Object.entries(adminActions).map(([name, action]): [string, Action] => [`admin/${name}`, action as Action]),
	...Object.entries(articleActions).map(([name, action]): [string, Action] => [
		`admin/article/${name}`,
		action as Action,
	]),
]

/** Arguments a real call could carry: none of them may be looked at before the role is checked. */
function someArguments(): unknown[] {
	const formData = new FormData()
	formData.set('name', 'Trail des Crêtes')
	formData.set('email', 'organizer@example.com')
	formData.set('title', 'A title')
	return ['record_1', formData]
}

function pocketBaseCalls(): number {
	return (
		mockPocketbase.collection.mock.calls.length +
		Object.values(mockPocketbaseCollection).reduce((count, method) => count + method.mock.calls.length, 0)
	)
}

function signInAs(role: 'admin' | 'user' | null) {
	vi.mocked(auth).mockResolvedValue({ userId: role == null ? null : `clerk_${role}` } as Awaited<
		ReturnType<typeof auth>
	>)
	// checkAdminAccess reads the role from the record matched with the Clerk id
	mockPocketbaseCollection.getFirstListItem.mockImplementation((filter: string) =>
		filter === `clerkId = "clerk_${role}"`
			? Promise.resolve({ role, id: `${role}_pb`, email: `${role}@example.com`, created: '', updated: '' })
			: Promise.reject(Object.assign(new Error('Not found'), { status: 404 }))
	)
}

beforeEach(() => {
	vi.clearAllMocks()
	vi.spyOn(console, 'error').mockImplementation(() => {})
	vi.spyOn(console, 'warn').mockImplementation(() => {})
	vi.spyOn(console, 'info').mockImplementation(() => {})
	mockPocketbase.collection.mockReturnValue(mockPocketbaseCollection)
	mockPocketbaseCollection.getFullList.mockResolvedValue([])
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('actions of the admin area', () => {
	it('finds them all', () => {
		expect(actions.map(([name]) => name)).toEqual(
			expect.arrayContaining([
				'admin/getAllEventsAction',
				'admin/getAllOrganizersAction',
				'admin/getDashboardStatsAction',
				'admin/getRecentActivityAction',
				'admin/deleteEventAction',
				'admin/article/generateSEOAction',
				'admin/article/deleteArticleAction',
			])
		)
		expect(actions.length).toBeGreaterThanOrEqual(24)
	})

	describe.each(actions)('%s', (_name, action) => {
		it('answers nothing to a visitor who is not signed in', async () => {
			signInAs(null)

			const result = await action(...someArguments())

			expect(result).toMatchObject({ success: false, error: 'Unauthorized: Admin access required' })
			expect(result.data).toBeUndefined()
			// Not even a query: the visitor has no session to look a role up for
			expect(pocketBaseCalls()).toBe(0)
			expect(generateSEOContent).not.toHaveBeenCalled()
			expect(generateArticleTranslation).not.toHaveBeenCalled()
			expect(generateImageAltText).not.toHaveBeenCalled()
		})

		it('answers nothing to a signed-in user who is not an admin', async () => {
			signInAs('user')

			const result = await action(...someArguments())

			expect(result).toMatchObject({ success: false, error: 'Unauthorized: Admin access required' })
			expect(result.data).toBeUndefined()
			// The role lookup, and nothing after it
			expect(mockPocketbase.collection.mock.calls).toEqual([['users']])
			expect(mockPocketbaseCollection.getFirstListItem).toHaveBeenCalledTimes(1)
			expect(pocketBaseCalls()).toBe(2)
			expect(generateSEOContent).not.toHaveBeenCalled()
			expect(generateArticleTranslation).not.toHaveBeenCalled()
			expect(generateImageAltText).not.toHaveBeenCalled()
		})
	})

	it.each([
		['getAllEventsAction', () => adminActions.getAllEventsAction()],
		['getAllOrganizersAction', () => adminActions.getAllOrganizersAction()],
	])('still answers %s to an admin', async (_name, call) => {
		signInAs('admin')

		expect(await call()).toEqual({ success: true, data: [] })
		expect(mockPocketbaseCollection.getFullList).toHaveBeenCalledTimes(1)
	})
})
