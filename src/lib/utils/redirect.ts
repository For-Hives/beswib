import { i18n } from '@/lib/i18n/config'

// The query parameter that names the page to come back to after sign-in or sign-up. Clerk writes
// the same one when its middleware sends a signed-out visitor to the sign-in page.
const RETURN_PARAM = 'redirect_url'

// Longer than any address of the app, the token of a private listing included
const MAX_LENGTH = 2048

// None of these has a place in an address of the app, and each is a known way past a check: the
// URL parser drops tabs and line breaks ("/\t/evil.tld" is "//evil.tld"), trims spaces and control
// characters at both ends, and reads "\" as "/"
function hasUnsafeCharacter(value: string): boolean {
	for (let index = 0; index < value.length; index++) {
		const code = value.charCodeAt(index)
		// C0 controls and space, backslash, DEL and C1 controls
		if (code <= 0x20 || code === 0x5c || (code >= 0x7f && code <= 0x9f)) return true
	}
	return false
}

/**
 * The page of the app that a "come back here" value names, as a path (query string and hash
 * kept), or null when it names none: empty, too long, another site, a script, an address written
 * to fool a parser. The value comes from a query string: anybody can write it into a link.
 *
 * An absolute address is accepted when it is on `origin`, because Clerk writes the return address
 * in full. Only its path is ever returned and the path must start with a locale, as every page
 * does and nothing else (API routes, files): whatever the value was, the visitor stays on the
 * site, on a page.
 */
export function safeRedirectPath(value: string | null | undefined, origin: string): string | null {
	if (typeof value !== 'string' || value === '' || value.length > MAX_LENGTH) return null
	if (hasUnsafeCharacter(value)) return null

	let site: string
	let url: URL
	try {
		site = new URL(origin).origin
		url = new URL(value, site)
	} catch {
		return null
	}

	// Judged on what the parser understood, never on how the value was written: "//evil.tld",
	// "https://evil.tld" and "javascript:alert(1)" all have another origin than the site
	if (url.origin !== site) return null
	if (!(i18n.locales as readonly string[]).includes(url.pathname.split('/')[1] ?? '')) return null

	return `${url.pathname}${url.search}${url.hash}`
}

/** The page a query string asks to come back to, under the rules of safeRedirectPath. */
export function returnPathFrom(search: string, origin: string): string | null {
	return safeRedirectPath(new URLSearchParams(search).get(RETURN_PARAM), origin)
}

/** Where a visitor lands once they have a session: the page that sent them to the form, or their dashboard. */
export function afterAuthPath(search: string, origin: string, locale: string): string {
	return returnPathFrom(search, origin) ?? `/${locale}/dashboard`
}

function authPagePath(page: 'sign-in' | 'sign-up', locale: string, returnTo: string | null | undefined): string {
	const path = `/${locale}/auth/${page}`
	return returnTo == null || returnTo === '' ? path : `${path}?${RETURN_PARAM}=${encodeURIComponent(returnTo)}`
}

/** The sign-in page of a locale. `returnTo` is the page the visitor comes back to once signed in. */
export function signInPath(locale: string, returnTo?: string | null): string {
	return authPagePath('sign-in', locale, returnTo)
}

/** The sign-up page of a locale. `returnTo` is the page the visitor comes back to once the account exists. */
export function signUpPath(locale: string, returnTo?: string | null): string {
	return authPagePath('sign-up', locale, returnTo)
}
