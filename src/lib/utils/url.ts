// The production site: what a production build announces when its environment names no usable address
const PRODUCTION_BASE_URL = 'https://beswib.com'
// Where `next dev` serves the app
const DEVELOPMENT_BASE_URL = 'http://localhost:3000'

// The machine itself, as the URL parser writes it: localhost and its subdomains, 127.0.0.0/8 (also
// in its IPv6-mapped form), [::1], and the "any address" 0.0.0.0 and [::]. An address of a private
// network (10.x, 192.168.x) is not in the list: somebody chose it, for a preview on that network.
const LOOPBACK_HOSTNAME =
	/^(localhost|.+\.localhost|127(\.\d{1,3}){3}|0\.0\.0\.0|\[::1?\]|\[::ffff:7f[\da-f]{2}:[\da-f]{1,4}\])$/

// Something wrong with the environment is reported once, not on every page: the helper runs for
// each metadata, sitemap and robots request
const reported = new Set<string>()

function reportOnce(key: string, message: string): void {
	if (reported.has(key)) return
	reported.add(key)
	// Names of variables only, never their values: an address may carry credentials
	console.warn(message)
}

function isProductionBuild(): boolean {
	return process.env.NODE_ENV === 'production'
}

/** The origin a value names, or why the site may not announce it; null when the value is empty. */
function readOrigin(value: string | undefined): { origin: string } | { refusal: string } | null {
	const trimmed = value?.trim() ?? ''
	if (trimmed === '') return null

	let url: URL
	try {
		url = new URL(trimmed)
	} catch {
		return { refusal: 'is not a URL' }
	}

	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		return { refusal: 'is not an http(s) URL' }
	}

	// A crawler or a social network can do nothing with an address of the machine that built the
	// page. "localhost." is the same host written as a fully qualified name.
	if (isProductionBuild() && LOOPBACK_HOSTNAME.test(url.hostname.replace(/\.$/, ''))) {
		return { refusal: 'is a local address in a production build' }
	}

	return { origin: url.origin }
}

/**
 * The public address of the site, without a trailing slash: the base of every absolute URL the
 * site announces about itself (metadataBase, canonical and hreflang links, Open Graph, sitemap,
 * robots.txt, JSON-LD).
 *
 * NEXT_PUBLIC_BASE_URL comes first: it is the variable the e-mails and the PayPal return URLs
 * already use. SERVER_URL and NEXT_URL_SERVER_URL are the older names of the same thing, still
 * read so that a deployment that only has those keeps its address.
 *
 * A production build never answers with a loopback address. When no variable gives a usable one
 * it answers with the production site: a deployment that forgot its variable then points search
 * engines and share previews at pages that exist, where http://localhost:3000 (the Next.js
 * default) points at nothing. Staging must therefore name itself.
 *
 * A production build also says, once, when it had to choose: nothing usable was set, or two
 * variables name different addresses. Both are silent mistakes otherwise, every page still
 * renders, on the wrong host.
 */
export function getPublicBaseUrl(): string {
	// Written out one by one: Next.js only replaces process.env.NEXT_PUBLIC_* by its build-time
	// value when the name appears in full, and that is what keeps the prerendered and the dynamic
	// pages of one build on the same address
	const variables = [
		['NEXT_PUBLIC_BASE_URL', process.env.NEXT_PUBLIC_BASE_URL],
		['SERVER_URL', process.env.SERVER_URL],
		['NEXT_URL_SERVER_URL', process.env.NEXT_URL_SERVER_URL],
	] as const

	let chosen: { name: string; origin: string } | null = null
	for (const [name, value] of variables) {
		const read = readOrigin(value)
		if (read === null) continue

		if (chosen === null) {
			if ('origin' in read) chosen = { origin: read.origin, name }
			else reportOnce(name, `${name} ${read.refusal}, it is ignored for the public address of the site`)
		} else if (isProductionBuild() && 'origin' in read && read.origin !== chosen.origin) {
			// What is wrong with an older name no longer matters once a newer one has answered, except
			// this: the pages move to the address of the newer one, and nothing else would show it
			reportOnce(
				`${chosen.name}/${name}`,
				`${chosen.name} and ${name} name different addresses, the site announces the one of ${chosen.name}`
			)
		}
	}

	if (chosen !== null) return chosen.origin
	if (!isProductionBuild()) return DEVELOPMENT_BASE_URL

	reportOnce(
		'fallback',
		`No usable public address in ${variables.map(([name]) => name).join(', ')}: the site announces ${PRODUCTION_BASE_URL}`
	)
	return PRODUCTION_BASE_URL
}
