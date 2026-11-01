#!/usr/bin/env node
/** biome-ignore-all lint/suspicious/noConsole: command-line output */
// DESTRUCTIVE. Deletes the people and the business records of a PocketBase and writes fictional ones.
// See scripts/archive/README.md. Run it only once the base is backed up.
//
// PB_SUPERUSER_TOKEN=… node scripts/archive/seed-fictional-data.mjs --url https://…             (dry run)
// PB_SUPERUSER_TOKEN=… node scripts/archive/seed-fictional-data.mjs --url https://… --apply \
//   --confirm-host <host> --backup-file <downloaded .zip>

import { randomBytes } from 'node:crypto'
import { closeSync, fstatSync, openSync, readSync, statSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

import { buildFictionalData } from './fictional-data.mjs'
import { createClient, flagValue, readTarget } from './pocketbase-admin.mjs'

// Dependents first. articles, seo and image_with_alt are editorial content and stay.
export const DELETE_ORDER = [
	'transactions',
	'waitlists',
	'bibs',
	'verifiedEmails',
	'paypalAPI',
	'eventCreationRequests',
	'users',
	'events',
	'organizer',
]
const CREATE_ORDER = ['organizer', 'events', 'users', 'verifiedEmails', 'bibs', 'transactions', 'waitlists']
const EMAIL_FIELDS = { users: ['email'], organizer: ['email'], transactions: ['payer_email'], waitlists: ['email'] }
const BACKUP_MAX_AGE_MS = 24 * 3600 * 1000
const AUTOMATIC_FIELD_TYPES = new Set(['autodate'])

function fieldsOf(collection) {
	return collection.fields ?? collection.schema ?? []
}

// Before PocketBase 0.23 the rules of a field are under `options`, since then on the field itself
function rulesOf(field) {
	return { ...field.options, ...field }
}

const BLANK_JSON = new Set(['null', '""', '{}', '[]'])

/** PocketBase's own idea of an empty value, the one a required field refuses: 0, false and {} are empty. */
function isBlank(type, value) {
	if (value == null || value === '') return true
	if (type === 'number') return value === 0
	if (type === 'bool') return value !== true
	if (type === 'json') return BLANK_JSON.has(JSON.stringify(value))
	return Array.isArray(value) && value.length === 0
}

function rangeProblem(amount, min, max, unit = '') {
	if (min != null && amount < min) return `is ${amount}${unit}, under the minimum ${min}`
	if (max != null && amount > max) return `is ${amount}${unit}, over the maximum ${max}`
	return null
}

function textProblem(rules, value) {
	// 0 means "not set" for these two, and PocketBase then caps a text at 5000 characters
	const problem = rangeProblem([...String(value)].length, rules.min || null, rules.max || 5000, ' characters')
	if (problem != null || !rules.pattern) return problem
	try {
		return new RegExp(rules.pattern).test(String(value)) ? null : `does not match the pattern ${rules.pattern}`
	} catch {
		return `has a pattern this script cannot check (${rules.pattern}): check it by hand and adjust it`
	}
}

function domainProblem(rules, value) {
	const domain = String(value).split('@').pop().toLowerCase()
	if (rules.onlyDomains?.length > 0 && !rules.onlyDomains.includes(domain)) return `is not on ${rules.onlyDomains}`
	if (rules.exceptDomains?.includes(domain)) return `is on the refused domain ${domain}`
	return null
}

function dateProblem(rules, value) {
	const time = date => (date ? new Date(String(date).replace(' ', 'T')).getTime() : null)
	return rangeProblem(time(value), time(rules.min), time(rules.max)) == null
		? null
		: `is out of the range ${rules.min || '…'} to ${rules.max || '…'}`
}

/** What PocketBase would refuse in a value that is not empty. */
function valueProblem(rules, value) {
	switch (rules.type) {
		case 'number':
			if (rules.onlyInt === true && !Number.isInteger(value)) return `is ${value}, and only an integer is allowed`
			return rangeProblem(value, rules.min, rules.max)
		case 'text':
			return textProblem(rules, value)
		case 'email':
		case 'url':
			return domainProblem(rules, value)
		case 'date':
			return dateProblem(rules, value)
		case 'select': {
			const wrong = [value].flat().find(item => !rules.values?.includes(item))
			return wrong === undefined ? null : `has no value "${wrong}"`
		}
		default:
			return null
	}
}

/**
 * What the fictional records must look like on this base: fields it does not have are dropped, and
 * anything PocketBase would refuse is reported, because a refusal during the run comes after the delete.
 */
export function fitToSchema(records, collection) {
	const fields = fieldsOf(collection)
	const known = new Set(fields.map(field => field.name))
	const dropped = new Set()
	const problems = new Set()

	const fitted = records.map(record => {
		const kept = {}
		for (const [key, value] of Object.entries(record)) {
			if (known.has(key)) kept[key] = value
			else dropped.add(key)
		}
		return kept
	})

	const isAuth = collection.type === 'auth'
	for (const field of fields) {
		const rules = rulesOf(field)
		const skipRequired =
			field.system === true ||
			AUTOMATIC_FIELD_TYPES.has(field.type) ||
			(isAuth && ['password', 'tokenKey'].includes(field.name))

		for (const record of fitted) {
			const value = record[field.name]
			if (isBlank(field.type, value)) {
				if (field.required === true && !skipRequired) {
					problems.add(`${collection.name}.${field.name} is required and the fictional data leaves it empty`)
				}
			} else {
				const problem = valueProblem(rules, value)
				if (problem != null) problems.add(`${collection.name}.${field.name} ${problem}`)
			}
		}
	}

	return { records: fitted, dropped: [...dropped], problems: [...problems], isAuth }
}

/**
 * Deleting a record reaches into the collections that point to it: PocketBase deletes the referencing
 * records of a cascade relation, and refuses when a required relation would be left empty. Both must
 * be known before the first delete. Returns { problems, notes }.
 */
export function checkRelations(allCollections, deleteOrder) {
	const byId = new Map(allCollections.map(collection => [collection.id, collection.name]))
	const position = name => deleteOrder.indexOf(name)
	const problems = []
	const notes = []

	for (const collection of allCollections) {
		for (const field of fieldsOf(collection)) {
			if (field.type !== 'relation') continue
			const target = byId.get(field.collectionId)
			if (target == null || target === collection.name || position(target) === -1) continue
			const label = `${collection.name}.${field.name} points to ${target}`

			if (position(collection.name) === -1) {
				if (field.cascadeDelete === true) problems.push(`${label}: its records would be deleted with it`)
				else if (field.required === true) problems.push(`${label}: required, the delete would be refused`)
				else notes.push(`${label}: the link is emptied`)
			} else if (position(collection.name) > position(target) && field.required === true && !field.cascadeDelete) {
				problems.push(`${label}: required, and ${target} is deleted first`)
			}
		}
	}
	return { problems, notes }
}

const END_OF_DIRECTORY = 0x06054b50
const ZIP64_LOCATOR = 0x07064b50
const DIRECTORY_ENTRY = 0x02014b50
const MAX_32 = 0xffffffff

/** The names and sizes in the directory of a .zip, read without unpacking it. Null when it is not one. */
export function listZipEntries(file) {
	const fd = openSync(file, 'r')
	try {
		const { size } = fstatSync(fd)
		const read = (position, length) => {
			const buffer = Buffer.alloc(length)
			return buffer.subarray(0, readSync(fd, buffer, 0, length, position))
		}

		// The end record is the last thing in the file, followed at most by a comment of 65535 bytes
		const tailLength = Math.min(size, 22 + 0xffff)
		const tailStart = size - tailLength
		const tail = read(tailStart, tailLength)
		let end = tail.length - 22
		while (end >= 0 && tail.readUInt32LE(end) !== END_OF_DIRECTORY) end--
		if (end < 0) return null

		let directorySize = tail.readUInt32LE(end + 12)
		let directoryStart = tail.readUInt32LE(end + 16)
		if (directorySize === MAX_32 || directoryStart === MAX_32) {
			const locator = read(tailStart + end - 20, 20)
			if (locator.length < 20 || locator.readUInt32LE(0) !== ZIP64_LOCATOR) return null
			const record = read(Number(locator.readBigUInt64LE(8)), 56)
			if (record.length < 56) return null
			directorySize = Number(record.readBigUInt64LE(40))
			directoryStart = Number(record.readBigUInt64LE(48))
		}

		const directory = read(directoryStart, directorySize)
		const entries = []
		let offset = 0
		while (offset + 46 <= directory.length && directory.readUInt32LE(offset) === DIRECTORY_ENTRY) {
			const nameLength = directory.readUInt16LE(offset + 28)
			entries.push({
				name: directory.toString('utf8', offset + 46, offset + 46 + nameLength),
				size: directory.readUInt32LE(offset + 24),
			})
			offset += 46 + nameLength + directory.readUInt16LE(offset + 30) + directory.readUInt16LE(offset + 32)
		}
		return entries
	} finally {
		closeSync(fd)
	}
}

/**
 * Proof of a backup, or an error. A flag alone is not enough, and a backup that stays on the server
 * cannot be opened from here: the proof is the downloaded archive, which holds the database. Nothing
 * in it says which base it came from.
 */
export function checkBackup(argv, now) {
	const file = flagValue(argv, '--backup-file')
	if (file == null) throw new Error('--apply needs --backup-file <the downloaded backup .zip>.')

	const entries = listZipEntries(file)
	if (entries == null) throw new Error(`${file} is not a PocketBase backup (.zip).`)
	const database = entries.find(entry => entry.name === 'data.db')
	if (database == null || database.size === 0) throw new Error(`${file} holds no data.db: not a PocketBase backup.`)

	const { size, mtime } = statSync(file)
	if (now.getTime() - mtime.getTime() > BACKUP_MAX_AGE_MS) {
		throw new Error(`${file} is more than 24 hours old: take a new one.`)
	}
	return `local file, ${size} bytes, with data.db`
}

async function deleteAll(client, collection, log) {
	let deleted = 0
	for (;;) {
		const page = await client.get(`/api/collections/${collection}/records?page=1&perPage=200&fields=id`)
		if (page.items.length === 0) break
		for (const { id } of page.items) {
			await client.delete(`/api/collections/${collection}/records/${id}`)
			deleted++
		}
	}
	log(`  ${collection}: ${deleted} deleted`)
}

async function verify(client, data) {
	for (const [collection, fields] of Object.entries(EMAIL_FIELDS)) {
		const { items, totalItems } = await client.get(
			`/api/collections/${collection}/records?perPage=500&fields=${fields.join(',')}`
		)
		if (totalItems !== data[collection].length) {
			throw new Error(`${collection} holds ${totalItems} records, ${data[collection].length} expected.`)
		}
		for (const item of items) {
			for (const field of fields) {
				if (item[field] && !item[field].endsWith('@example.com')) {
					throw new Error(`${collection}.${field} holds an address outside example.com.`)
				}
			}
		}
	}
}

export async function seedFictionalData(argv, env, fetchImpl = fetch, log = console.log, now = new Date()) {
	const target = readTarget(argv, env)
	const client = createClient(target, fetchImpl)
	const apply = argv.includes('--apply')

	// Nothing is written before all of this has passed
	const collections = {}
	const missing = []
	for (const name of DELETE_ORDER) {
		try {
			collections[name] = await client.get(`/api/collections/${name}`)
		} catch (error) {
			if (!String(error.message).includes('answered 404')) throw error
			missing.push(name)
		}
	}
	const absentRequired = CREATE_ORDER.filter(name => missing.includes(name))
	if (absentRequired.length > 0) throw new Error(`Collections not found: ${absentRequired.join(', ')}`)

	const relations = checkRelations((await client.get('/api/collections?perPage=200')).items ?? [], DELETE_ORDER)
	for (const note of relations.notes) log(`Note: ${note}.`)

	const built = buildFictionalData(now)
	const fitted = {}
	const problems = [...relations.problems]
	for (const name of CREATE_ORDER) {
		fitted[name] = fitToSchema(built[name], collections[name])
		problems.push(...fitted[name].problems)
		if (fitted[name].dropped.length > 0) {
			log(`Note: ${name} has no field ${fitted[name].dropped.join(', ')} on this base: left out.`)
		}
	}
	if (problems.length > 0) throw new Error(`The fictional data does not fit this base:\n- ${problems.join('\n- ')}`)

	log(`Target: ${target.host}`)
	for (const name of DELETE_ORDER.filter(candidate => !missing.includes(candidate))) {
		log(`  ${name}: ${await client.count(name)} now, ${built[name]?.length ?? 0} after`)
	}

	if (!apply) {
		log('Dry run: nothing changed.')
		return { applied: false }
	}

	if (flagValue(argv, '--confirm-host') !== target.host) {
		throw new Error(`--apply needs --confirm-host ${target.host}.`)
	}
	log(`Backup: ${checkBackup(argv, now)}`)

	log('Deleting…')
	for (const name of DELETE_ORDER) {
		if (!missing.includes(name)) await deleteAll(client, name, log)
	}

	log('Creating…')
	for (const name of CREATE_ORDER) {
		for (const record of fitted[name].records) {
			const body = { ...record }
			if (fitted[name].isAuth) {
				// Nobody signs in with these: Clerk handles sign-in, and this password is thrown away
				const password = randomBytes(24).toString('hex')
				body.password = password
				body.passwordConfirm = password
			}
			await client.post(`/api/collections/${name}/records`, body)
		}
		log(`  ${name}: ${fitted[name].records.length} created`)
	}

	await verify(client, built)
	log('Done: counts and addresses checked. Now read "After the run" in scripts/archive/README.md.')
	return { applied: true }
}

if (process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href) {
	seedFictionalData(process.argv.slice(2), process.env).catch(error => {
		console.error(error.message)
		process.exitCode = 1
	})
}
