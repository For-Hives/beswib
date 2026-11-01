#!/usr/bin/env node
/** biome-ignore-all lint/suspicious/noConsole: command-line output */
// Prints the API rules of one PocketBase collection and, with --apply, sets them to superuser only.
// The app reaches PocketBase from the server, with the superuser token.
//
// PB_SUPERUSER_TOKEN=… node scripts/archive/set-collection-rules.mjs --url https://… --collection <name> [--apply] [--all-rules]
//
// Without --apply it only prints the current rules. --all-rules also covers create, update and delete.

import { pathToFileURL } from 'node:url'

import { createClient, flagValue, readTarget } from './pocketbase-admin.mjs'

const READ_RULES = ['listRule', 'viewRule']
const WRITE_RULES = ['createRule', 'updateRule', 'deleteRule']

export async function setCollectionRules(argv, env, fetchImpl = fetch, log = console.log) {
	const target = readTarget(argv, env)
	const collection = flagValue(argv, '--collection')
	if (collection == null) throw new Error('--collection is required: there is no default.')
	const client = createClient(target, fetchImpl)
	const apply = argv.includes('--apply')
	const rules = argv.includes('--all-rules') ? [...READ_RULES, ...WRITE_RULES] : READ_RULES

	const path = `/api/collections/${encodeURIComponent(collection)}`
	const current = await client.get(path)
	for (const rule of [...READ_RULES, ...WRITE_RULES]) log(`${rule}: ${JSON.stringify(current[rule])}`)

	if (!apply) {
		log(`Dry run on ${target.host}: nothing changed. Add --apply to set ${rules.join(', ')} to superuser only.`)
		return { applied: false }
	}

	await client.patch(path, Object.fromEntries(rules.map(rule => [rule, null])))
	const after = await client.get(path)
	const notSet = rules.filter(rule => after[rule] !== null)
	if (notSet.length > 0) throw new Error(`Not superuser only after the update: ${notSet.join(', ')}`)

	// The same read without the token. Only the status is used.
	const anonymous = await fetchImpl(`${target.url}${path}/records?perPage=1&fields=id`)
	log(`Updated ${rules.join(', ')} on ${target.host}. A read without the token answers ${anonymous.status}.`)
	if (anonymous.status < 400) throw new Error('A read without the token still succeeds.')
	return { applied: true, anonymousStatus: anonymous.status }
}

if (process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href) {
	setCollectionRules(process.argv.slice(2), process.env).catch(error => {
		console.error(error.message)
		process.exitCode = 1
	})
}
