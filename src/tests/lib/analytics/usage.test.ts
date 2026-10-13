// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

import { describe, expect, it } from 'vitest'

// Guards of the instrumentation, checked on the source of the whole app. TypeScript cannot refuse
// these: a direct call to the tracker compiles, a cast builds an id out of anything, a hand-written
// attribute is a plain string. The before-send hook still filters what leaves the browser, but an
// event written this way is silently lost or, for an id, silently wrong.

const ROOT = resolve(process.cwd(), 'src')
// The analytics modules themselves and the tests are the only places allowed to do these things
const EXEMPT = ['lib/analytics/', 'components/analytics/', 'tests/', 'types/umami-globals.d.ts']

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
			if (!EXEMPT.some(prefix => path.startsWith(prefix))) files.push({ text: readFileSync(full, 'utf8'), path })
		}
	}
	return files
}

const sources = listSources(ROOT)

function offenders(pattern: RegExp): string[] {
	return sources.filter(file => pattern.test(file.text)).map(file => file.path)
}

describe('instrumentation of the app', () => {
	it('reads the source files of the app', () => {
		expect(sources.length).toBeGreaterThan(200)
		expect(sources.map(file => file.path)).toContain('app/[locale]/layout.tsx')
	})

	it('never calls the tracker directly: track / trackView / umamiAttrs / TrackClick / TrackView only', () => {
		expect(offenders(/\bumami\s*\??\.\s*(track|identify)\b|window\.umami\b/)).toEqual([])
	})

	it('never writes a data-umami-event attribute by hand: umamiAttrs() or <TrackClick>', () => {
		expect(offenders(/data-umami-event/)).toEqual([])
	})

	it('never casts to an analytics id: the helpers of ids.ts are the only way to build one', () => {
		expect(offenders(/\bas\s+(BibId|EventId|ArticleId)\b/)).toEqual([])
	})

	it("never imports the server sender from a 'use client' file", () => {
		const clientFiles = sources.filter(file => /^(\s|\/\/[^\n]*\n)*['"]use client['"]/.test(file.text))
		expect(clientFiles.length).toBeGreaterThan(50)
		const importing = clientFiles.filter(file => /from\s+['"]@\/lib\/analytics\/server['"]/.test(file.text))
		expect(importing.map(file => file.path)).toEqual([])
	})
})
