// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { dataCollection } from '../../../sentry.data-collection'

// Since Sentry 11 every category of `dataCollection` is collected unless it is switched off, and nothing fails
// when a line disappears: the SDK just starts sending more. These tests are the alarm.

const INIT_FILES = ['sentry.server.config.ts', 'sentry.edge.config.ts', 'instrumentation-client.ts']

const denyList = (behavior: unknown): string[] => {
	expect(behavior).toHaveProperty('deny')
	return (behavior as { deny: string[] }).deny
}

describe('Sentry data collection policy', () => {
	it('collects nothing personal on its own', () => {
		expect(dataCollection.userInfo).toBe(false)
		expect(dataCollection.cookies).toBe(false)
		expect(dataCollection.httpBodies).toEqual([])
		expect(dataCollection.genAI).toEqual({ inputs: false, outputs: false })
		expect(dataCollection.graphQL).toEqual({ document: false, variables: false })
		expect(dataCollection.databaseQueryData).toBe(false)
		expect(dataCollection.queues).toBe(false)
		expect(dataCollection.stackFrameVariables).toBe(false)
	})

	it('masks the headers that carry an address, an identity or the URL copied by Clerk', () => {
		const { request, response } = dataCollection.httpHeaders as { request: unknown; response: unknown }
		expect(denyList(request)).toEqual(
			expect.arrayContaining(['forwarded', '-ip', 'remote-', 'via', '-user', 'x-clerk'])
		)
		expect(denyList(response)).toEqual(expect.arrayContaining(['forwarded', '-ip', 'remote-', 'via', '-user']))
	})

	it('masks the query parameters that open a private listing or a session', () => {
		expect(denyList(dataCollection.urlQueryParams)).toEqual(
			expect.arrayContaining(['forwarded', '-ip', 'remote-', 'via', '-user', 'tkn', '__clerk', 'redirect'])
		)
	})

	it.each(INIT_FILES)('%s hands the policy to Sentry.init', file => {
		const source = readFileSync(join(process.cwd(), file), 'utf8')
		const init = source.slice(source.indexOf('Sentry.init({'))
		expect(init).toMatch(/^\tdataCollection,$/m)
		// A second policy written next to the shared one would win over it without anyone noticing
		expect(source).not.toMatch(/dataCollection\s*:/)
	})
})
