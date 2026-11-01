// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

// Beswib is archived: nothing in the app may reach a payment provider. The removed code stays in the
// history of the repository (tag v1.2.1 and before), and must not come back by accident.

const SRC = resolve(process.cwd(), 'src')
const APP = join(SRC, 'app')

function listFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
		entry.isDirectory() ? listFiles(join(directory, entry.name)) : [join(directory, entry.name)]
	)
}

const sources = listFiles(SRC)
	.filter(file => /\.tsx?$/.test(file))
	.filter(file => !file.startsWith(join(SRC, 'tests')))

describe('the archived site', () => {
	it.each(['api/webhooks/paypal', 'api/paypal', '[locale]/purchase'])('has no route at %s', route => {
		expect(existsSync(join(APP, route))).toBe(false)
	})

	it('has no code that loads, calls or authenticates against PayPal', () => {
		const offenders = sources
			.filter(file =>
				/@paypal\/|PAYPAL_CLIENT_SECRET|PAYPAL_API_URL|PAYPAL_CLIENT_ID|\/v2\/checkout\/orders/.test(
					readFileSync(file, 'utf8')
				)
			)
			.map(file => relative(SRC, file))

		expect(offenders).toEqual([])
	})

	it('has no server action left for a purchase, a listing or a PayPal onboarding', () => {
		const offenders = sources
			.filter(file => /^(['"])use server\1/m.test(readFileSync(file, 'utf8')))
			.filter(file =>
				/export async function (lockBibForPurchase|checkPurchaseLock|createSale|captureOrder|handleCreateBib|startPayPalOnboarding|disconnectPayPal)\b/.test(
					readFileSync(file, 'utf8')
				)
			)
			.map(file => relative(SRC, file))

		expect(offenders).toEqual([])
	})

	it('says nothing of PayPal to a visitor, in any language or template', () => {
		const texts = listFiles(SRC)
			.filter(file => file.endsWith('.json') || file.endsWith('seo-translations.ts') || file.includes('/emails/'))
			.filter(file => /paypal/i.test(readFileSync(file, 'utf8')))
			.map(file => relative(SRC, file))

		expect(texts).toEqual([])
	})

	it('has no way left to write a real person or a request in the base', () => {
		const offenders = sources
			.filter(file =>
				/\.collection\(['"](users|waitlists|eventCreationRequests)['"]\)\s*\.create\b/.test(readFileSync(file, 'utf8'))
			)
			.map(file => relative(SRC, file))

		expect(offenders).toEqual([])
	})

	it('has no form that signs up', () => {
		const offenders = sources
			.filter(file => /\buseSignUp\b/.test(readFileSync(file, 'utf8')))
			.map(file => relative(SRC, file))

		expect(offenders).toEqual([])
	})
})
