// @vitest-environment node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

import { describe, expect, it } from 'vitest'

// Next registers every exported async function of a 'use server' module as a server action: an HTTP
// endpoint that anyone may call, signed in or not, with the arguments they choose. The modules of
// src/services read and write PocketBase with the admin token and act on whichever id they are
// given: they are plain server code. What the browser may call lives in the action modules, which
// take the acting user from the Clerk session. Checked on the source of the whole app.

const ROOT = resolve(process.cwd(), 'src')

interface SourceFile {
	path: string
	text: string
}

function listSources(directory: string): SourceFile[] {
	const files: SourceFile[] = []
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const full = join(directory, entry.name)
		if (entry.isDirectory()) {
			files.push(...listSources(full))
		} else if (/\.(ts|tsx)$/.test(entry.name)) {
			const path = relative(ROOT, full).split(sep).join('/')
			if (!path.startsWith('tests/')) files.push({ text: readFileSync(full, 'utf8'), path })
		}
	}
	return files
}

const sources = listSources(ROOT)
const byPath = new Map(sources.map(file => [file.path, file]))

/** The directive a module starts with, after its leading comments. */
function directiveOf(text: string): 'use client' | 'use server' | null {
	// Walked by hand: one regular expression for "any run of comments" backtracks badly
	let index = 0
	for (;;) {
		while (index < text.length && text[index].trim() === '') index++
		const comment = text.startsWith('//', index) ? '\n' : text.startsWith('/*', index) ? '*/' : null
		if (comment == null) break
		const end = text.indexOf(comment, index + 2)
		if (end === -1) return null
		index = end + comment.length
	}
	for (const directive of ['use client', 'use server'] as const) {
		if (text.startsWith(`'${directive}'`, index) || text.startsWith(`"${directive}"`, index)) return directive
	}
	return null
}

/** The modules of the app a file imports at run time: type-only imports are erased by the compiler. */
function runtimeImports(file: SourceFile): string[] {
	const specifiers: string[] = []
	const statements = /(?:import|export)\s+(type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g
	for (const [, typeOnly, clause, specifier] of file.text.matchAll(statements)) {
		const names = clause
			.replace(/[{}]/g, '')
			.split(',')
			.map(name => name.trim())
			.filter(name => name !== '' && !name.startsWith('type '))
		if (typeOnly == null && names.length > 0) specifiers.push(specifier)
	}
	for (const [, specifier] of file.text.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) specifiers.push(specifier)

	const resolved: string[] = []
	for (const specifier of specifiers) {
		let base: string
		if (specifier.startsWith('@/')) base = join(ROOT, specifier.slice(2))
		else if (specifier.startsWith('.')) base = resolve(dirname(join(ROOT, file.path)), specifier)
		else continue
		const found = ['', '.ts', '.tsx', '/index.ts', '/index.tsx']
			.map(extension => base + extension)
			.find(candidate => existsSync(candidate) && statSync(candidate).isFile())
		if (found != null) resolved.push(relative(ROOT, found).split(sep).join('/'))
	}
	return resolved
}

/**
 * The modules that end up in the browser bundle: the 'use client' modules and everything they import
 * at run time (hooks, helpers). A 'use server' module stops the walk: the browser only gets a reference to it.
 */
function browserModules(): Map<string, string> {
	const reachedFrom = new Map<string, string>()
	const queue = sources.filter(file => directiveOf(file.text) === 'use client').map(file => [file.path, file.path])
	while (queue.length > 0) {
		const [path, from] = queue.pop() as [string, string]
		if (reachedFrom.has(path)) continue
		reachedFrom.set(path, from)
		const file = byPath.get(path)
		if (file == null) continue
		for (const imported of runtimeImports(file)) {
			const target = byPath.get(imported)
			if (target != null && directiveOf(target.text) !== 'use server') queue.push([imported, path])
		}
	}
	return reachedFrom
}

/** What a module exports at run time, by name: in a 'use server' module, each one is an endpoint. */
function exportedNames(text: string): string[] {
	const declarations = /^export\s+(?:default\s+)?(?:async\s+)?(?:function\*?|const|let|var|class)\s+(\w+)/gm
	return [...text.matchAll(declarations)].map(([, name]) => name).sort()
}

const services = sources.filter(file => file.path.startsWith('services/'))
const actionModules = sources.filter(file => directiveOf(file.text) === 'use server').map(file => file.path)

describe('what the browser may call on the server', () => {
	it('reads the source files of the app', () => {
		expect(sources.length).toBeGreaterThan(200)
		expect(services.map(file => file.path)).toContain('services/user.services.ts')
		expect(services.length).toBeGreaterThanOrEqual(15)
	})

	it.each(services.map(file => [file.path, file]))("%s is not a 'use server' module", (_path, file) => {
		expect(directiveOf(file.text)).toBeNull()
		expect(file.text).not.toMatch(/^\s*['"]use server['"]/m)
	})

	it.each(services.map(file => [file.path, file]))('%s refuses to be bundled for the browser', (_path, file) => {
		expect(file.text).toMatch(/^import 'server-only'$/m)
	})

	it("keeps the 'use server' directive to the action modules", () => {
		// A new entry here is a new set of public endpoints: each export must identify its caller
		expect(actionModules.sort()).toEqual([
			'app/[locale]/actions/locale.ts',
			'app/[locale]/admin/actions.ts',
			'app/[locale]/admin/article/actions.ts',
			'app/[locale]/contact/actions.ts',
			'app/[locale]/dashboard/seller/edit-bib/[bibId]/actions.ts',
			'app/[locale]/dashboard/seller/request-event/actions.ts',
			'app/[locale]/events/actions.ts',
			'app/[locale]/profile/actions.ts',
			'components/global/adminActions.ts',
		])
	})

	it('keeps the actions of these modules to the ones that were reviewed', () => {
		// Next only registers the exports that something imports, so an export nobody uses is one import
		// away from being an endpoint. A new name here is a new public endpoint: it must identify its
		// caller, and take no id of a person from its arguments
		const exported = Object.fromEntries(
			actionModules.map(path => [path, exportedNames(byPath.get(path)?.text ?? '')] as const)
		)
		expect(exported).toEqual({
			'components/global/adminActions.ts': ['checkIsCurrentUserAdmin'],
			'app/[locale]/profile/actions.ts': [
				'addVerifiedEmail',
				'confirmVerifiedEmail',
				'fetchMyVerifiedEmails',
				'getCurrentUserData',
				'removeVerifiedEmail',
				'resendVerifiedEmailCode',
				'updateUserProfile',
			],
			'app/[locale]/events/actions.ts': ['joinEventWaitlist'],
			'app/[locale]/dashboard/seller/request-event/actions.ts': ['handleCreateEventCreationRequest'],
			'app/[locale]/dashboard/seller/edit-bib/[bibId]/actions.ts': [
				'handleRegeneratePrivateToken',
				'handleToggleListingStatus',
				'handleUpdateBibDetails',
				'handleWithdrawBib',
			],
			'app/[locale]/contact/actions.ts': ['submitContactMessage'],
			'app/[locale]/admin/article/actions.ts': [
				'createArticleAction',
				'deleteArticleAction',
				'generateAllMissingTranslationsAction',
				'generateAltTextAction',
				'generateArticleTranslationAction',
				'generateSEOAction',
				'getAllArticlesAction',
				'getArticleByIdAction',
				'getArticleTranslationsAction',
				'publishAllTranslationsAction',
				'updateArticleAction',
			],
			'app/[locale]/admin/actions.ts': [
				'approveOrganizerAction',
				'createEventAction',
				'createOrganizerAction',
				'deleteEventAction',
				'getAllEventsAction',
				'getAllOrganizersAction',
				'getDashboardStatsAction',
				'getEventByIdAction',
				'getOrganizerByIdAction',
				'getRecentActivityAction',
				'rejectOrganizerAction',
				'updateEventAction',
				'updateOrganizerAction',
			],
			'app/[locale]/actions/locale.ts': [
				'getArticleTranslatedSlug',
				'syncUserLocaleFromCookie',
				'updateUserLocalePreference',
			],
		})
	})

	it.each(actionModules)('%s exports its actions one by one, where the list above can see them', path => {
		// export { a, b } and export * from would add endpoints that the list above does not read
		expect(byPath.get(path)?.text).not.toMatch(/^export\s*(?:\{|\*)/m)
	})

	it("keeps the actions declared inside a page ('use server' in a function body) to the reviewed one", () => {
		const inline = sources.filter(file => /^[ \t]+['"]use server['"]/m.test(file.text)).map(file => file.path)
		// handleJoinWaitlist: it reads the session when it runs and subscribes the session's user
		expect(inline).toEqual(['app/[locale]/events/[id]/page.tsx'])
	})

	it('finds the browser modules, hooks included', () => {
		const browser = browserModules()
		expect(browser.size).toBeGreaterThan(100)
		// Hooks carry no directive: they are in the bundle because a Client Component imports them
		expect(browser.has('hooks/useTheme.ts')).toBe(true)
	})

	it('never imports a service, the admin guard or a route handler from a module of the browser bundle', () => {
		const serverOnly = (path: string) =>
			path.startsWith('services/') || path.startsWith('guard/') || path.startsWith('app/api/')
		const offenders: string[] = []
		for (const [path] of browserModules()) {
			const file = byPath.get(path)
			if (file == null) continue
			for (const imported of runtimeImports(file)) {
				if (serverOnly(imported)) offenders.push(`${path} -> ${imported}`)
			}
		}
		expect(offenders).toEqual([])
	})
})
