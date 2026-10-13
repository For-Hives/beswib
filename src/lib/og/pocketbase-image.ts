// An image file of our own PocketBase instances, fetched and encoded again as PNG.
//
// Used by the public /api/convert-image route and by the Open Graph images, which embed the
// result as a data URL. It only ever reads one file of our PocketBase instances, and only ever
// hands out a PNG it encoded itself, never the bytes it received.

const KNOWN_API_ORIGINS = ['https://api.beswib.com', 'https://api.staging.beswib.com']
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]'])
// /api/files/<collection>/<record id>/<file name>, the names PocketBase generates
const FILE_PATH = /^\/api\/files\/[\w-]+\/[\w-]+\/[\w.-]+$/
const SOURCE_TYPES = new Set(['image/webp', 'image/png', 'image/jpeg', 'image/gif', 'image/avif'])
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])
const MAX_REDIRECTS = 3
const MAX_BYTES = 15 * 1024 * 1024
// A few bytes can declare a 16383 x 16383 image: decoding stops well before that
const MAX_PIXELS = 50_000_000
const TIMEOUT_MS = 10_000

export type PocketBaseImage =
	| { ok: true; png: Buffer }
	| { ok: false; status: 400 | 403 | 404 | 413 | 415 | 502 | 504; message: string }

function refused(status: Exclude<PocketBaseImage, { ok: true }>['status'], message: string): PocketBaseImage {
	return { ok: false, status, message }
}

/** The two production API hosts, plus the PocketBase this deployment is configured for. */
function allowedOrigins(): Set<string> {
	const origins = new Set(KNOWN_API_ORIGINS)
	try {
		const configured = new URL(process.env.NEXT_PUBLIC_POCKETBASE_URL ?? '')
		const local = configured.protocol === 'http:' && LOCAL_HOSTNAMES.has(configured.hostname)
		if (configured.protocol === 'https:' || local) origins.add(configured.origin)
	} catch {
		// not set, or not a URL: the known origins are enough
	}
	return origins
}

/**
 * The file to fetch, or null. The comparison is on the whole origin (scheme,
 * host and port), never on a part of the host name; the path must be exactly a
 * PocketBase file; of the query only the thumbnail size is kept.
 */
function allowedFileUrl(raw: string, origins: Set<string>, base?: URL): URL | null {
	let url: URL
	try {
		url = new URL(raw, base)
	} catch {
		return null
	}
	if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
	if (url.username !== '' || url.password !== '') return null
	if (!origins.has(url.origin)) return null
	if (!FILE_PATH.test(url.pathname)) return null

	const file = new URL(url.pathname, url.origin)
	const thumb = url.searchParams.get('thumb')
	if (thumb != null) file.searchParams.set('thumb', thumb)
	return file
}

/**
 * Fetches the file without ever leaving the allowed origins: a redirect is
 * followed by hand and its target goes through the same check. Null when a
 * redirect is refused.
 */
async function fetchAllowed(url: URL, origins: Set<string>, signal: AbortSignal): Promise<Response | null> {
	let current = url
	for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
		const response = await fetch(current, {
			headers: { Accept: 'image/webp,image/png,image/jpeg,image/*' },
			redirect: 'manual',
			signal,
		})
		if (!REDIRECT_STATUSES.has(response.status)) return response

		await response.body?.cancel()
		const location = response.headers.get('location')
		const next = location == null ? null : allowedFileUrl(location, origins, current)
		if (next == null) return null
		current = next
	}
	return null
}

/** The body, or null once it goes over the limit. */
async function readLimited(response: Response): Promise<Buffer | null> {
	const declared = Number(response.headers.get('content-length'))
	if (response.body == null) return Buffer.alloc(0)
	if (Number.isFinite(declared) && declared > MAX_BYTES) {
		await response.body.cancel()
		return null
	}

	const chunks: Uint8Array[] = []
	let total = 0
	const reader = response.body.getReader()
	for (;;) {
		const { done, value } = await reader.read()
		if (done) break
		total += value.byteLength
		if (total > MAX_BYTES) {
			await reader.cancel()
			return null
		}
		chunks.push(value)
	}
	return Buffer.concat(chunks)
}

async function fetchAsPng(rawUrl: string): Promise<PocketBaseImage> {
	if (!URL.canParse(rawUrl)) return refused(400, 'Invalid URL')

	// Only files of our own API domains
	const origins = allowedOrigins()
	const url = allowedFileUrl(rawUrl, origins)
	if (url == null) return refused(403, 'Invalid URL domain')

	// One deadline for the redirects and the download together
	const response = await fetchAllowed(url, origins, AbortSignal.timeout(TIMEOUT_MS))
	if (response == null) return refused(502, 'Invalid redirect')

	if (response.status !== 200) {
		await response.body?.cancel()
		return response.status === 404 ? refused(404, 'Image not found') : refused(502, 'Failed to fetch image')
	}

	// The declared type, without its parameters
	const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
	if (!SOURCE_TYPES.has(contentType)) {
		await response.body?.cancel()
		return refused(415, 'Unsupported media type')
	}

	const buffer = await readLimited(response)
	if (buffer == null) return refused(413, 'Image too large')

	// Decode and encode again: what leaves is a PNG whatever came in, or nothing
	try {
		const sharp = (await import('sharp')).default
		return { ok: true, png: await sharp(buffer, { limitInputPixels: MAX_PIXELS }).png().toBuffer() }
	} catch (error) {
		console.error('Error converting image to PNG with sharp:', error)
		return refused(415, 'Unsupported image')
	}
}

/**
 * The image behind a PocketBase file URL, as a PNG, or the reason it is refused (with the HTTP
 * status the public route answers). Only an unexpected failure throws.
 */
export async function fetchPocketBaseImageAsPng(rawUrl: string): Promise<PocketBaseImage> {
	try {
		return await fetchAsPng(rawUrl)
	} catch (error) {
		if (error instanceof DOMException && error.name === 'TimeoutError') return refused(504, 'Upstream timeout')
		// the file server could not be reached
		if (error instanceof TypeError && error.message === 'fetch failed') return refused(502, 'Failed to fetch image')
		throw error
	}
}

/**
 * The same image as a data URL, for an Open Graph image, or null when there is none to show:
 * no URL, a refused or missing file, a failure. Never throws: the image is then drawn without it.
 */
export async function pocketBaseImageDataUrl(rawUrl: string | null | undefined): Promise<string | null> {
	if (rawUrl == null || rawUrl === '') return null
	try {
		const image = await fetchPocketBaseImageAsPng(rawUrl)
		return image.ok ? `data:image/png;base64,${image.png.toString('base64')}` : null
	} catch (error) {
		console.error('Error loading an image for an Open Graph image:', error)
		return null
	}
}
