// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import { buildFictionalData } from '../../../scripts/archive/fictional-data.mjs'
import { lockVerifiedEmails } from '../../../scripts/archive/lock-verified-emails.mjs'
import { checkRelations, fitToSchema, seedFictionalData } from '../../../scripts/archive/seed-fictional-data.mjs'

const NOW = new Date('2026-11-01T12:00:00Z')
const ENV = { PB_SUPERUSER_TOKEN: 'test-token' }
const URL_ARGS = ['--url', 'https://base.test']
const silent = () => {}

function respond(status: number, body: unknown = {}) {
	return Promise.resolve(new Response(JSON.stringify(body), { status }))
}

describe('the fictional data', () => {
	const data = buildFictionalData(NOW)

	it('only has addresses on example.com', () => {
		const addresses = [
			...data.users.map(user => user.email),
			...data.organizer.map(organizer => organizer.email),
			...data.transactions.map(transaction => transaction.payer_email),
			...data.waitlists.map(entry => entry.email),
			...data.verifiedEmails.map(entry => entry.email),
		]
		expect(addresses.length).toBeGreaterThan(20)
		for (const address of addresses) expect(address).toMatch(/^[a-z0-9.-]+@example\.com$/)
	})

	it('has unique ids of the shape PocketBase expects', () => {
		const ids = Object.values(data).flatMap(records => records.map(record => record.id))
		expect(new Set(ids).size).toBe(ids.length)
		for (const id of ids) expect(id).toMatch(/^[a-z0-9]{15}$/)
	})

	it('has relations that all lead to a record', () => {
		const has = (records: { id: string }[], id: string) => records.some(record => record.id === id)
		for (const event of data.events) expect(has(data.organizer, event.organizer)).toBe(true)
		for (const bib of data.bibs) {
			expect(has(data.events, bib.eventId)).toBe(true)
			expect(has(data.users, bib.sellerUserId)).toBe(true)
			expect(has(data.verifiedEmails, bib.linkedEmailId)).toBe(true)
		}
		for (const transaction of data.transactions) {
			const bib = data.bibs.find(candidate => candidate.id === transaction.bib_id)
			expect(bib?.status).toBe('sold')
			expect(bib?.buyerUserId).toBe(transaction.buyer_user_id)
			expect(bib?.sellerUserId).toBe(transaction.seller_user_id)
			expect(transaction.amount).toBe(bib?.price)
		}
	})

	it('keeps the listings on sale long after the run', () => {
		const inOneYear = new Date('2027-10-30T00:00:00Z')
		for (const event of data.events) {
			expect(new Date(event.transferDeadline.replace(' ', 'T')).getTime()).toBeGreaterThan(
				inOneYear.getTime() - 40 * 864e5
			)
			expect(new Date(event.eventDate.replace(' ', 'T')).getTime()).toBeGreaterThan(
				new Date(event.transferDeadline.replace(' ', 'T')).getTime()
			)
		}
		expect(data.bibs.filter(bib => bib.status === 'available').length).toBeGreaterThan(20)
		expect(data.transactions.length).toBeGreaterThan(0)
	})
})

describe('fitting the data to the schema of the base', () => {
	const collection = (fields: object[]) => ({ type: 'base', name: 'bibs', fields })

	it('drops the fields the base does not have', () => {
		const fitted = fitToSchema([{ id: 'a', ghost: 1 }], collection([{ name: 'id', system: true }]))
		expect(fitted.records).toEqual([{ id: 'a' }])
		expect(fitted.dropped).toEqual(['ghost'])
		expect(fitted.problems).toEqual([])
	})

	it('reports a required field the data leaves empty, and a value a select refuses', () => {
		const fitted = fitToSchema(
			[{ status: 'nope' }],
			collection([
				{ name: 'price', required: true, type: 'number' },
				{ name: 'status', type: 'select', values: ['available'] },
			])
		)
		expect(fitted.problems).toHaveLength(2)
	})
})

describe('the relations of the base', () => {
	const ORDER = ['bibs', 'users', 'events']
	const relation = (target: string, extra: object = {}) => ({
		type: 'relation',
		name: 'link',
		collectionId: target,
		...extra,
	})
	const base = (id: string, fields: object[] = []) => ({ id, name: id, fields })

	it('accepts dependents deleted before what they point to', () => {
		const result = checkRelations([base('bibs', [relation('users', { required: true })]), base('users')], ORDER)
		expect(result).toEqual({ problems: [], notes: [] })
	})

	it('refuses a required relation whose target is deleted first', () => {
		const result = checkRelations([base('users'), base('events', [relation('users', { required: true })])], ORDER)
		expect(result.problems).toHaveLength(1)
	})

	it.each([
		['a cascade', { cascadeDelete: true }],
		['a required relation', { required: true }],
	])('refuses %s from a collection that stays', (_name, extra) => {
		const result = checkRelations([base('users'), base('articles', [relation('users', extra)])], ORDER)
		expect(result.problems).toHaveLength(1)
	})

	it('only notes an optional link from a collection that stays', () => {
		const result = checkRelations([base('users'), base('articles', [relation('users')])], ORDER)
		expect(result.problems).toEqual([])
		expect(result.notes).toHaveLength(1)
	})
})

describe('the seed script', () => {
	const baseFetch = vi.fn((input: string | URL | Request, init?: RequestInit) => {
		const url = String(input)
		if ((init?.method ?? 'GET') !== 'GET') return respond(500)
		if (url.includes('/records')) return respond(200, { totalItems: 3, items: [] })
		if (url.endsWith('/api/backups')) return respond(200, [])
		return respond(200, { type: 'base', name: 'x', fields: [] })
	})

	it('writes nothing in a dry run', async () => {
		baseFetch.mockClear()
		await seedFictionalData(URL_ARGS, ENV, baseFetch, silent, NOW)
		const methods = baseFetch.mock.calls.map(([, init]) => init?.method ?? 'GET')
		expect(new Set(methods)).toEqual(new Set(['GET']))
	})

	it.each([
		['without the host confirmed', ['--apply', '--backup', 'b.zip'], /confirm-host/],
		['without a backup', ['--apply', '--confirm-host', 'base.test'], /--backup/],
		[
			'with a backup the base does not have',
			['--apply', '--confirm-host', 'base.test', '--backup', 'b.zip'],
			/No backup/,
		],
		['with the wrong host', ['--apply', '--confirm-host', 'other.test', '--backup', 'b.zip'], /confirm-host/],
	])('refuses to run %s, before any write', async (_name, args, message) => {
		baseFetch.mockClear()
		await expect(seedFictionalData([...URL_ARGS, ...args], ENV, baseFetch, silent, NOW)).rejects.toThrow(message)
		const methods = baseFetch.mock.calls.map(([, init]) => init?.method ?? 'GET')
		expect(new Set(methods)).toEqual(new Set(['GET']))
	})

	it('refuses a backup that is too old', async () => {
		const oldBackup = vi.fn((input: string | URL | Request, init?: RequestInit) =>
			String(input).endsWith('/api/backups')
				? respond(200, [{ key: 'b.zip', size: 10, modified: '2026-10-01 00:00:00.000Z' }])
				: baseFetch(input, init)
		)
		await expect(
			seedFictionalData(
				[...URL_ARGS, '--apply', '--confirm-host', 'base.test', '--backup', 'b.zip'],
				ENV,
				oldBackup,
				silent,
				NOW
			)
		).rejects.toThrow(/24 hours/)
	})

	it('has no default target and needs the token', async () => {
		await expect(seedFictionalData([], ENV, baseFetch, silent, NOW)).rejects.toThrow(/--url/)
		await expect(seedFictionalData(URL_ARGS, {}, baseFetch, silent, NOW)).rejects.toThrow(/PB_SUPERUSER_TOKEN/)
	})
})

describe('the rules script', () => {
	it('only reads without --apply', async () => {
		const fetchMock = vi.fn(() => respond(200, { listRule: '', viewRule: '' }))
		await lockVerifiedEmails(URL_ARGS, ENV, fetchMock, silent)
		expect(fetchMock).toHaveBeenCalledOnce()
	})

	it('fails when a read without the token still succeeds', async () => {
		const fetchMock = vi.fn((_input: string | URL | Request, init?: RequestInit) => {
			const authenticated = init?.headers != null
			return respond(200, authenticated ? { listRule: null, viewRule: null } : { items: [] })
		})
		await expect(lockVerifiedEmails([...URL_ARGS, '--apply'], ENV, fetchMock, silent)).rejects.toThrow(/still succeeds/)
	})
})
