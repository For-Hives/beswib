/**
 * API Route: Image Conversion Proxy
 * Converts WebP and other formats to PNG for OpenGraph image compatibility
 * Uses sharp (bundled with Next.js) for proper image conversion
 */

import { type NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// The route is public and fetches on behalf of the caller: it only ever reads
// one file of our own PocketBase instances, and only ever answers with a PNG it
// encoded itself, never with the bytes it received.
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

const IMAGE_HEADERS = {
	'Content-Type': 'image/png',
	'Cache-Control': 'public, max-age=31536000, immutable',
	'X-Content-Type-Options': 'nosniff',
	'Content-Security-Policy': "default-src 'none'; sandbox",
}

function refusal(message: string, status: number) {
	return new NextResponse(message, { status, headers: { 'Cache-Control': 'no-store' } })
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

/**
 * GET handler for image conversion
 * Usage: /api/convert-image?url=<encoded-image-url>
 */
export async function GET(request: NextRequest) {
	try {
		const imageUrl = request.nextUrl.searchParams.get('url')

		if (!imageUrl) {
			return refusal('Missing url parameter', 400)
		}

		if (!URL.canParse(imageUrl)) {
			return refusal('Invalid URL', 400)
		}

		// Only files of our own API domains
		const origins = allowedOrigins()
		const url = allowedFileUrl(imageUrl, origins)
		if (url == null) {
			return refusal('Invalid URL domain', 403)
		}

		// One deadline for the redirects and the download together
		const response = await fetchAllowed(url, origins, AbortSignal.timeout(TIMEOUT_MS))

		if (response == null) {
			return refusal('Invalid redirect', 502)
		}

		if (response.status !== 200) {
			await response.body?.cancel()
			return response.status === 404 ? refusal('Image not found', 404) : refusal('Failed to fetch image', 502)
		}

		// The declared type, without its parameters
		const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()

		if (!SOURCE_TYPES.has(contentType)) {
			await response.body?.cancel()
			return refusal('Unsupported media type', 415)
		}

		const buffer = await readLimited(response)
		if (buffer == null) {
			return refusal('Image too large', 413)
		}

		// Decode and encode again: what leaves is a PNG whatever came in, or nothing
		let png: Buffer
		try {
			const sharp = (await import('sharp')).default
			png = await sharp(buffer, { limitInputPixels: MAX_PIXELS }).png().toBuffer()
		} catch (error) {
			console.error('Error converting image to PNG with sharp:', error)
			return refusal('Unsupported image', 415)
		}

		// Convert Buffer to Uint8Array for NextResponse compatibility
		return new NextResponse(new Uint8Array(png), { headers: IMAGE_HEADERS })
	} catch (error) {
		if (error instanceof DOMException && error.name === 'TimeoutError') {
			return refusal('Upstream timeout', 504)
		}
		if (error instanceof TypeError && error.message === 'fetch failed') {
			// the file server could not be reached
			return refusal('Failed to fetch image', 502)
		}
		console.error('Error in image conversion:', error)
		return refusal('Internal server error', 500)
	}
}
