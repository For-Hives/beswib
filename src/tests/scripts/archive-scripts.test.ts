// @vitest-environment node
import { mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it, vi } from 'vitest'

import { buildFictionalData } from '../../../scripts/archive/fictional-data.mjs'
import {
	checkBackup,
	checkRelations,
	fitToSchema,
	listZipEntries,
	seedFictionalData,
} from '../../../scripts/archive/seed-fictional-data.mjs'
import { setCollectionRules } from '../../../scripts/archive/set-collection-rules.mjs'

const NOW = new Date('2026-11-01T12:00:00Z')
const ENV = { PB_SUPERUSER_TOKEN: 'test-token' }
const URL_ARGS = ['--url', 'https://base.test']
const silent = () => {}
const DIRECTORY = mkdtempSync(join(tmpdir(), 'beswib-backup-'))

afterAll(() => rmSync(DIRECTORY, { recursive: true, force: true }))

/** A .zip with stored entries, enough for what the check reads: the directory at the end of the file. */
function zipBytes(entries: Record<string, string>): Buffer {
	const locals: Buffer[] = []
	const directory: Buffer[] = []
	let offset = 0
	for (const [name, content] of Object.entries(entries)) {
		const nameBytes = Buffer.from(name)
		const data = Buffer.from(content)
		const local = Buffer.alloc(30)
		local.writeUInt32LE(0x04034b50, 0)
		local.writeUInt32LE(data.length, 18)
		local.writeUInt32LE(data.length, 22)
		local.writeUInt16LE(nameBytes.length, 26)
		const central = Buffer.alloc(46)
		central.writeUInt32LE(0x02014b50, 0)
		central.writeUInt32LE(data.length, 20)
		central.writeUInt32LE(data.length, 24)
		central.writeUInt16LE(nameBytes.length, 28)
		central.writeUInt32LE(offset, 42)
		locals.push(local, nameBytes, data)
		directory.push(central, nameBytes)
		offset += local.length + nameBytes.length + data.length
	}
	const directoryBytes = Buffer.concat(directory)
	const end = Buffer.alloc(22)
	end.writeUInt32LE(0x06054b50, 0)
	end.writeUInt16LE(Object.keys(entries).length, 8)
	end.writeUInt16LE(Object.keys(entries).length, 10)
	end.writeUInt32LE(directoryBytes.length, 12)
	end.writeUInt32LE(offset, 16)
	return Buffer.concat([...locals, directoryBytes, end])
}

function backupFile(name: string, bytes: Buffer, modified = NOW): string {
	const path = join(DIRECTORY, name)
	writeFileSync(path, bytes)
	utimesSync(path, modified, modified)
	return path
}

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

	it('never has a platform fee PocketBase would refuse on a required number', () => {
		for (const transaction of data.transactions) {
			expect(transaction.platform_fee).toBeGreaterThan(0)
			expect(Number.isInteger(transaction.platform_fee)).toBe(true)
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

	it.each([
		['0 on a number', 'number', 0],
		['false on a boolean', 'bool', false],
		['{} on a JSON', 'json', {}],
		['[] on a JSON', 'json', []],
		['null on a JSON', 'json', null],
		['an empty text', 'text', ''],
		['nothing at all', 'text', undefined],
		['an empty relation', 'relation', []],
	])('reports %s as empty when the field is required', (_name, type, value) => {
		const fitted = fitToSchema([{ field: value }], collection([{ name: 'field', required: true, type }]))
		expect(fitted.problems).toEqual(['bibs.field is required and the fictional data leaves it empty'])
	})

	it.each([
		['0 on a number', 'number', 0],
		['false on a boolean', 'bool', false],
		['{} on a JSON', 'json', {}],
	])('accepts %s when the field is optional', (_name, type, value) => {
		expect(fitToSchema([{ field: value }], collection([{ name: 'field', type }])).problems).toEqual([])
	})

	it.each([
		['a text under its minimum', { type: 'text', min: 3 }, 'ab'],
		['a text over its maximum', { type: 'text', max: 3 }, 'abcd'],
		['a text over the default maximum', { type: 'text', max: 0 }, 'a'.repeat(5001)],
		['a text against its pattern', { type: 'text', pattern: '^\\+33[0-9]+$' }, '0612'],
		['a number under its minimum', { type: 'number', min: 2 }, 1],
		['a number over its maximum', { type: 'number', max: 2 }, 3],
		['a decimal where only integers go', { type: 'number', onlyInt: true }, 1.5],
		['a date out of its range', { type: 'date', max: '2026-01-01 00:00:00.000Z' }, '2027-01-01 00:00:00.000Z'],
		['an address out of its domains', { type: 'email', onlyDomains: ['beswib.com'] }, 'a@example.com'],
		['a refused address domain', { type: 'email', exceptDomains: ['example.com'] }, 'a@example.com'],
	])('reports %s', (_name, rules, value) => {
		const fitted = fitToSchema([{ field: value }], collection([{ name: 'field', ...rules }]))
		expect(fitted.problems).toHaveLength(1)
		expect(fitted.problems[0]).toMatch(/^bibs\.field /)
	})

	it.each([
		['a text within its bounds', { type: 'text', min: 2, max: 4, pattern: '^a+$' }, 'aaa'],
		['a number at its bounds', { type: 'number', min: 2, max: 2 }, 2],
		['0 under a minimum, on an optional number', { type: 'number', min: 2 }, 0],
		['an empty text under a minimum, when optional', { type: 'text', min: 2 }, ''],
		['an address on its domains', { type: 'email', onlyDomains: ['example.com'] }, 'a@example.com'],
	])('accepts %s', (_name, rules, value) => {
		expect(fitToSchema([{ field: value }], collection([{ name: 'field', ...rules }])).problems).toEqual([])
	})

	it('reads the rules of the older schema shape, under options', () => {
		const fitted = fitToSchema([{ field: 'ab' }], {
			type: 'base',
			name: 'bibs',
			schema: [{ name: 'field', type: 'text', options: { min: 3 } }],
		})
		expect(fitted.problems).toHaveLength(1)
	})

	it('reports a pattern it cannot compile instead of letting it pass', () => {
		const fitted = fitToSchema([{ field: 'a' }], collection([{ name: 'field', type: 'text', pattern: '(?i)a' }]))
		expect(fitted.problems[0]).toMatch(/cannot check/)
	})

	it('checks the fictional data against a schema with the strictest fields it may meet', () => {
		const { transactions } = buildFictionalData(NOW)
		const fitted = fitToSchema(
			transactions,
			collection([
				{ name: 'platform_fee', type: 'number', required: true, onlyInt: true },
				{ name: 'raw_webhook_payload', type: 'json', required: true },
			])
		)
		expect(fitted.problems).toEqual([])
	})
})

describe('the proof of a backup', () => {
	const backup = (path: string, now = NOW) => checkBackup(['--backup-file', path], now)

	it('accepts an archive that holds the database', () => {
		const path = backupFile('good.zip', zipBytes({ 'storage/a.png': 'x', 'data.db': 'SQLite', 'auxiliary.db': 'y' }))
		expect(listZipEntries(path)?.map((entry: { name: string }) => entry.name)).toContain('data.db')
		expect(backup(path)).toMatch(/data\.db/)
	})

	it.each([
		['an archive without data.db', () => zipBytes({ 'pb_data/data.db': 'x', 'notes.txt': 'y' }), /no data\.db/],
		['an empty data.db', () => zipBytes({ 'data.db': '' }), /no data\.db/],
		['an empty archive', () => zipBytes({}), /no data\.db/],
		['a file that is not a .zip', () => Buffer.from('PK but nothing else'), /not a PocketBase backup/],
		['an empty file', () => Buffer.alloc(0), /not a PocketBase backup/],
	])('refuses %s', (name, bytes, message) => {
		expect(() => backup(backupFile(`${name.replaceAll(' ', '-')}.zip`, bytes()))).toThrow(message)
	})

	it('refuses an archive more than 24 hours old', () => {
		const path = backupFile('old.zip', zipBytes({ 'data.db': 'x' }), new Date('2026-10-01T00:00:00Z'))
		expect(() => backup(path)).toThrow(/24 hours/)
	})

	it('reads a directory that only the 64-bit records can locate', () => {
		const name = Buffer.from('data.db')
		const central = Buffer.alloc(46)
		central.writeUInt32LE(0x02014b50, 0)
		central.writeUInt32LE(0xffffffff, 24)
		central.writeUInt16LE(name.length, 28)
		const directory = Buffer.concat([central, name])
		const record = Buffer.alloc(56)
		record.writeUInt32LE(0x06064b50, 0)
		record.writeBigUInt64LE(BigInt(directory.length), 40)
		record.writeBigUInt64LE(BigInt(0), 48)
		const locator = Buffer.alloc(20)
		locator.writeUInt32LE(0x07064b50, 0)
		locator.writeBigUInt64LE(BigInt(directory.length), 8)
		const end = Buffer.alloc(22)
		end.writeUInt32LE(0x06054b50, 0)
		end.writeUInt32LE(0xffffffff, 12)
		end.writeUInt32LE(0xffffffff, 16)

		const path = backupFile('zip64.zip', Buffer.concat([directory, record, locator, end]))
		expect(backup(path)).toMatch(/data\.db/)
	})

	it('reads an archive that has a comment after its directory', () => {
		const path = backupFile('comment.zip', Buffer.concat([zipBytes({ 'data.db': 'x' }), Buffer.alloc(100)]))
		expect(listZipEntries(path)).toEqual([{ name: 'data.db', size: 1 }])
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
		return respond(200, { type: 'base', name: 'x', fields: [] })
	})

	it('writes nothing in a dry run', async () => {
		baseFetch.mockClear()
		await seedFictionalData(URL_ARGS, ENV, baseFetch, silent, NOW)
		const methods = baseFetch.mock.calls.map(([, init]) => init?.method ?? 'GET')
		expect(new Set(methods)).toEqual(new Set(['GET']))
	})

	it.each([
		['without the host confirmed', ['--apply', '--backup-file', 'b.zip'], /confirm-host/],
		['without a backup', ['--apply', '--confirm-host', 'base.test'], /--backup-file/],
		[
			'with only the name of a backup on the base',
			['--apply', '--confirm-host', 'base.test', '--backup', 'b.zip'],
			/--backup-file/,
		],
		['with the wrong host', ['--apply', '--confirm-host', 'other.test', '--backup-file', 'b.zip'], /confirm-host/],
	])('refuses to run %s, before any write', async (_name, args, message) => {
		baseFetch.mockClear()
		await expect(seedFictionalData([...URL_ARGS, ...args], ENV, baseFetch, silent, NOW)).rejects.toThrow(message)
		const methods = baseFetch.mock.calls.map(([, init]) => init?.method ?? 'GET')
		expect(new Set(methods)).toEqual(new Set(['GET']))
	})

	it('refuses an archive without the database, before any write', async () => {
		const path = backupFile('no-db.zip', zipBytes({ 'notes.txt': 'x' }))
		baseFetch.mockClear()
		await expect(
			seedFictionalData(
				[...URL_ARGS, '--apply', '--confirm-host', 'base.test', '--backup-file', path],
				ENV,
				baseFetch,
				silent,
				NOW
			)
		).rejects.toThrow(/no data\.db/)
		const methods = baseFetch.mock.calls.map(([, init]) => init?.method ?? 'GET')
		expect(new Set(methods)).toEqual(new Set(['GET']))
	})

	it('has no default target and needs the token', async () => {
		await expect(seedFictionalData([], ENV, baseFetch, silent, NOW)).rejects.toThrow(/--url/)
		await expect(seedFictionalData(URL_ARGS, {}, baseFetch, silent, NOW)).rejects.toThrow(/PB_SUPERUSER_TOKEN/)
	})
})

describe('the rules script', () => {
	const ARGS = [...URL_ARGS, '--collection', 'some_collection']

	it('has no default collection', async () => {
		await expect(setCollectionRules(URL_ARGS, ENV, vi.fn(), silent)).rejects.toThrow(/--collection/)
	})

	it('only reads without --apply', async () => {
		const fetchMock = vi.fn(() => respond(200, { listRule: '', viewRule: '' }))
		await setCollectionRules(ARGS, ENV, fetchMock, silent)
		expect(fetchMock).toHaveBeenCalledOnce()
	})

	it('fails when a read without the token still succeeds', async () => {
		const fetchMock = vi.fn((_input: string | URL | Request, init?: RequestInit) => {
			const authenticated = init?.headers != null
			return respond(200, authenticated ? { listRule: null, viewRule: null } : { items: [] })
		})
		await expect(setCollectionRules([...ARGS, '--apply'], ENV, fetchMock, silent)).rejects.toThrow(/still succeeds/)
	})
})
