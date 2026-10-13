// The production site: what a production build announces when its environment names no usable address
const PRODUCTION_BASE_URL = 'https://beswib.com'
// Where `next dev` serves the app
const DEVELOPMENT_BASE_URL = 'http://localhost:3000'

const LOCAL_HOSTNAME = /^(localhost|.+\.localhost|127(\.\d{1,3}){3}|0\.0\.0\.0|\[::1\])$/

// A variable that cannot be used is reported once, not on every page: the helper runs for each
// metadata, sitemap and robots request
const reported = new Set<string>()

function reportOnce(name: string, reason: string): void {
	if (reported.has(name)) return
	reported.add(name)
	// The name only: an address may carry credentials
	console.warn(`${name} ${reason}, it is ignored for the public address of the site`)
}

function isProductionBuild(): boolean {
	return process.env.NODE_ENV === 'production'
}

/** The origin a variable names, or null when it names none that the site may announce. */
function usableOrigin(name: string, value: string | undefined): string | null {
	const trimmed = value?.trim() ?? ''
	if (trimmed === '') return null

	let url: URL
	try {
		url = new URL(trimmed)
	} catch {
		reportOnce(name, 'is not a URL')
		return null
	}

	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		reportOnce(name, 'is not an http(s) URL')
		return null
	}

	// A crawler or a social network can do nothing with an address of the machine that built the page
	if (isProductionBuild() && LOCAL_HOSTNAME.test(url.hostname)) {
		reportOnce(name, 'is a local address in a production build')
		return null
	}

	return url.origin
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
 * A production build never answers with a local address. When no variable gives a usable one it
 * answers with the production site: a deployment that forgot its variable then points search
 * engines and share previews at pages that exist, where http://localhost:3000 (the Next.js
 * default) points at nothing. Staging must therefore name itself.
 */
export function getPublicBaseUrl(): string {
	return (
		usableOrigin('NEXT_PUBLIC_BASE_URL', process.env.NEXT_PUBLIC_BASE_URL) ??
		usableOrigin('SERVER_URL', process.env.SERVER_URL) ??
		usableOrigin('NEXT_URL_SERVER_URL', process.env.NEXT_URL_SERVER_URL) ??
		(isProductionBuild() ? PRODUCTION_BASE_URL : DEVELOPMENT_BASE_URL)
	)
}
