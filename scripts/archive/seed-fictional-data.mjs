#!/usr/bin/env node
/** biome-ignore-all lint/suspicious/noConsole: command-line output */
// DESTRUCTIVE. Deletes the people and the business records of a PocketBase and writes fictional ones.
// See scripts/archive/README.md. Run it only once the base is backed up.
//
// PB_SUPERUSER_TOKEN=… node scripts/archive/seed-fictional-data.mjs --url https://…             (dry run)
// PB_SUPERUSER_TOKEN=… node scripts/archive/seed-fictional-data.mjs --url https://… --apply \
//   --confirm-host <host> (--backup <name in PocketBase> | --backup-file <local .zip>)

import { randomBytes } from 'node:crypto'
import { openSync, readSync, statSync } from 'node:fs'
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

/** What the fictional records must look like on this base: fields it does not have are dropped. */
export function fitToSchema(records, collection) {
	const fields = fieldsOf(collection)
	const known = new Set(fields.map(field => field.name))
	const dropped = new Set()
	const problems = []

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
		if (field.system === true || field.required !== true || AUTOMATIC_FIELD_TYPES.has(field.type)) continue
		if (isAuth && ['password', 'tokenKey'].includes(field.name)) continue
		const empty = fitted.some(record => record[field.name] == null || record[field.name] === '')
		if (empty) problems.push(`${collection.name}.${field.name} is required and the fictional data leaves it empty`)
	}
	for (const field of fields) {
		if (field.type !== 'select' || !Array.isArray(field.values)) continue
		const wrong = fitted.find(record => record[field.name] != null && !field.values.includes(record[field.name]))
		if (wrong != null) problems.push(`${collection.name}.${field.name} has no value "${wrong[field.name]}"`)
	}

	return { records: fitted, dropped: [...dropped], problems, isAuth }
}

/** Proof of a backup, or an error. A flag alone is not enough. */
export async function checkBackup(argv, client, now) {
	const name = flagValue(argv, '--backup')
	const file = flagValue(argv, '--backup-file')
	if (name == null && file == null) {
		throw new Error('--apply needs --backup <name in PocketBase> or --backup-file <local .zip>.')
	}

	if (file != null) {
		const { size } = statSync(file)
		const head = Buffer.alloc(2)
		readSync(openSync(file, 'r'), head, 0, 2, 0)
		if (size === 0 || head.toString() !== 'PK') throw new Error(`${file} is not a PocketBase backup (.zip).`)
		return `local file, ${size} bytes`
	}

	const backups = await client.get('/api/backups')
	const backup = backups.find(candidate => candidate.key === name)
	if (backup == null) throw new Error(`No backup named ${name} on this base.`)
	if (backup.size === 0) throw new Error(`Backup ${name} is empty.`)
	const age = now.getTime() - new Date(backup.modified.replace(' ', 'T')).getTime()
	if (age > BACKUP_MAX_AGE_MS) throw new Error(`Backup ${name} is more than 24 hours old: take a new one.`)
	return `${name}, ${backup.size} bytes`
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

	const built = buildFictionalData(now)
	const fitted = {}
	const problems = []
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
	log(`Backup: ${await checkBackup(argv, client, now)}`)

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
