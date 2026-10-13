// @vitest-environment node
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { describe, expect, it } from 'vitest'

import { config } from '@/middleware'

// The middleware adds the locale to any path it runs on: a static file it
// matches is redirected to /<locale>/<file> and answered with an HTML page.

const runsOn = (url: string) => unstable_doesMiddlewareMatch({ config, url })

const riveFiles = readdirSync(join(process.cwd(), 'public', 'rive')).map(name => `/rive/${name}`)

describe('middleware matcher', () => {
	it('finds the Rive files this test is about', () => {
		expect(riveFiles.some(file => file.endsWith('.riv'))).toBe(true)
		expect(riveFiles.some(file => file.endsWith('.wasm'))).toBe(true)
	})

	it.each(riveFiles)('leaves %s alone', file => {
		expect(runsOn(file)).toBe(false)
	})

	it.each([
		'/mountain.png',
		'/favicon.ico',
		'/favicon.svg',
		'/site.webmanifest',
		'/landing/how-it-works/search.jpg',
		'/_next/static/chunks/main.js',
	])('leaves %s alone', file => {
		expect(runsOn(file)).toBe(false)
	})

	it.each([
		'/',
		'/en',
		'/fr/marketplace',
		'/en/dashboard/seller',
		'/en/profile',
		'/en/purchase/abcdefghijklmno',
		'/en/admin/event',
		'/api/waitlist/status',
		'/api/validate-private-token',
	])('still runs on %s', path => {
		expect(runsOn(path)).toBe(true)
	})
})
