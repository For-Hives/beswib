// Small PocketBase admin client for the archive scripts. No dependency, Node 24 fetch only.
// The superuser token comes from the environment and is never printed.

export function readTarget(argv, env) {
	const url = flagValue(argv, '--url')
	if (url == null) throw new Error('--url is required: there is no default target.')
	const token = env.PB_SUPERUSER_TOKEN
	if (token == null || token === '') throw new Error('PB_SUPERUSER_TOKEN is not set in the environment.')
	return { url: new URL(url).origin, token, host: new URL(url).host }
}

export function flagValue(argv, flag) {
	const index = argv.indexOf(flag)
	return index === -1 ? null : (argv[index + 1] ?? null)
}

export function createClient({ url, token }, fetchImpl = fetch) {
	async function request(method, path, body) {
		const response = await fetchImpl(`${url}${path}`, {
			method,
			headers: { 'Content-Type': 'application/json', Authorization: token },
			body: body === undefined ? undefined : JSON.stringify(body),
		})
		const text = await response.text()
		if (!response.ok) {
			// The body of an error names fields and rules, not record values
			throw new Error(`${method} ${path.split('?')[0]} answered ${response.status}: ${text.slice(0, 400)}`)
		}
		return text === '' ? null : JSON.parse(text)
	}

	return {
		get: path => request('GET', path),
		post: (path, body) => request('POST', path, body),
		patch: (path, body) => request('PATCH', path, body),
		delete: path => request('DELETE', path),
		count: async collection =>
			(await request('GET', `/api/collections/${collection}/records?perPage=1&fields=id`)).totalItems,
	}
}
