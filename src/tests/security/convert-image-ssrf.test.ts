// @vitest-environment node
import { NextRequest } from 'next/server'
import sharp from 'sharp'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from '@/app/api/convert-image/route'
import { getArticleImageUrl } from '@/lib/utils/imageUrl'

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47]
const FILE = '/api/files/pbc_123/abcdefghijklmno/photo_x1.webp'
const IMMUTABLE = 'public, max-age=31536000, immutable'

const fetchMock = vi.fn<typeof fetch>()

function call(target?: string) {
	const query = target === undefined ? '' : `?url=${encodeURIComponent(target)}`
	return GET(new NextRequest(`https://beswib.com/api/convert-image${query}`))
}

function pixels(format: 'webp' | 'png' | 'jpeg', width = 2, height = 2) {
	return sharp({ create: { width, height, channels: 3, background: '#00ff00' } })
		.toFormat(format)
		.toBuffer()
}

function answer(type: string, body: Uint8Array<ArrayBuffer> | string = 'x', headers: Record<string, string> = {}) {
	return new Response(body, { status: 200, headers: { 'content-type': type, ...headers } })
}

async function image(format: 'webp' | 'png' | 'jpeg' = 'webp', type = `image/${format}`) {
	return answer(type, new Uint8Array(await pixels(format)))
}

function redirect(location: string, status = 302) {
	return new Response(null, { status, headers: { location } })
}

function fetchedUrl(callIndex = 0) {
	return String(fetchMock.mock.calls[callIndex][0])
}

async function isPng(response: Response) {
	return [...new Uint8Array(await response.arrayBuffer()).slice(0, 4)].join() === PNG_SIGNATURE.join()
}

describe('GET /api/convert-image', () => {
	beforeEach(() => {
		fetchMock.mockReset()
		vi.stubGlobal('fetch', fetchMock)
		vi.stubEnv('NEXT_PUBLIC_POCKETBASE_URL', 'https://api.beswib.com')
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
		vi.unstubAllEnvs()
	})

	it('asks for a url', async () => {
		expect((await call()).status).toBe(400)
		expect((await call('not a url')).status).toBe(400)
		expect(fetchMock).not.toHaveBeenCalled()
	})

	describe('what it refuses to fetch', () => {
		it.each([
			['a host that only contains an allowed one', `https://api.beswib.com.attacker.tld${FILE}`],
			['a host that only starts with localhost', `https://localhost.attacker.tld${FILE}`],
			['an allowed host in the user part', `https://api.beswib.com@attacker.tld${FILE}`],
			['an allowed host in the query', `https://attacker.tld${FILE}?host=api.beswib.com`],
			['a user name', `https://user@api.beswib.com${FILE}`],
			['a user name and a password', `https://user:secret@api.beswib.com${FILE}`],
			['plain http on a production host', `http://api.beswib.com${FILE}`],
			['another port', `https://api.beswib.com:8443${FILE}`],
			['localhost', `http://localhost:8090${FILE}`],
			['the loopback address', `http://127.0.0.1:8090${FILE}`],
			['the cloud metadata address', 'http://169.254.169.254/latest/meta-data/'],
			['a file url', `file://${FILE}`],
			['a data url', `data:${FILE};base64,AAAA`],
			['another PocketBase endpoint', 'https://api.beswib.com/api/collections/users/records'],
			['the file token endpoint', 'https://api.beswib.com/api/files/token'],
			['a path that climbs out of the files', 'https://api.beswib.com/api/files/../collections/users/records'],
			['an encoded climb out of the files', 'https://api.beswib.com/api/files/%2e%2e/collections/users/records'],
			['an encoded slash in a segment', 'https://api.beswib.com/api/files/..%2f..%2fcollections/users/records'],
			['a path parameter', 'https://api.beswib.com/api/files/..;/collections/users/records'],
			['an empty segment', 'https://api.beswib.com/api/files//abcdefghijklmno/photo.webp'],
			['a deeper path', `https://api.beswib.com${FILE}/more`],
			['the root of the host', 'https://api.beswib.com/'],
		])('%s', async (_label, target) => {
			const response = await call(target)

			expect(response.status).toBe(403)
			expect(fetchMock).not.toHaveBeenCalled()
		})
	})

	describe('what it fetches', () => {
		it.each([
			['the configured PocketBase', `https://api.beswib.com${FILE}`],
			['the staging PocketBase', `https://api.staging.beswib.com${FILE}`],
			['a thumbnail of a file', `https://api.beswib.com${FILE}?thumb=100x100`],
		])('%s', async (_label, target) => {
			fetchMock.mockResolvedValue(await image())

			const response = await call(target)

			expect(response.status).toBe(200)
			expect(fetchMock).toHaveBeenCalledTimes(1)
			expect(fetchedUrl()).toBe(target)
		})

		it('drops every query parameter but the thumbnail size', async () => {
			fetchMock.mockResolvedValue(await image())

			await call(`https://api.beswib.com${FILE}?token=secret&thumb=100x100&download=1`)

			expect(fetchedUrl()).toBe(`https://api.beswib.com${FILE}?thumb=100x100`)
		})

		it('never lets fetch follow a redirect by itself, and sets a deadline', async () => {
			fetchMock.mockResolvedValue(await image())

			await call(`https://api.beswib.com${FILE}`)

			const options = fetchMock.mock.calls[0][1]
			expect(options?.redirect).toBe('manual')
			expect(options?.signal).toBeInstanceOf(AbortSignal)
		})

		it.each(['https://api.beswib.com', 'https://api.beswib.com/'])(
			'the URL the app builds for an article image, with %s as PocketBase URL',
			async base => {
				vi.stubEnv('NEXT_PUBLIC_POCKETBASE_URL', base)
				fetchMock.mockResolvedValue(await image())
				const record = { id: 'abcdefghijklmno', collectionId: 'pbc_123', image: 'photo_x1.webp', alt: '' }
				const article = { expand: { image: { ...record, created: new Date(), updated: new Date() } } }

				const proxied = getArticleImageUrl(article, true, 'beswib.com', 'https')
				const response = await GET(new NextRequest(String(proxied)))

				expect(response.status).toBe(200)
				expect(fetchedUrl()).toBe(`https://api.beswib.com${FILE}`)
			}
		)
	})

	describe('the PocketBase of the deployment', () => {
		it('accepts a local one only when the app is configured for it', async () => {
			vi.stubEnv('NEXT_PUBLIC_POCKETBASE_URL', 'http://localhost:8090')
			fetchMock.mockImplementation(() => image())

			expect((await call(`http://localhost:8090${FILE}`)).status).toBe(200)
			expect((await call(`http://localhost:9999${FILE}`)).status).toBe(403)
			expect((await call('http://localhost:8090/api/collections/users/records')).status).toBe(403)
			expect(fetchMock).toHaveBeenCalledTimes(1)
		})

		it.each([
			['plain http on another machine', 'http://pb.internal:8090', `http://pb.internal:8090${FILE}`],
			['a value without scheme', 'localhost:8090', `file://${FILE}`],
			['a value without scheme', 'localhost:8090', `x://attacker.tld${FILE}`],
			['a file url', 'file:///srv/pb', `file://${FILE}`],
			['nothing', '', `http://localhost:8090${FILE}`],
		])('does not widen the list with %s', async (_label, configured, target) => {
			vi.stubEnv('NEXT_PUBLIC_POCKETBASE_URL', configured)

			expect((await call(target)).status).toBe(403)
			expect(fetchMock).not.toHaveBeenCalled()
		})
	})

	describe('redirects', () => {
		it.each([301, 302, 303, 307, 308])('does not follow a %i that leaves the allowed hosts', async status => {
			fetchMock.mockResolvedValueOnce(redirect('http://169.254.169.254/latest/meta-data/', status))

			const response = await call(`https://api.beswib.com${FILE}`)

			expect(response.status).toBe(502)
			expect(fetchMock).toHaveBeenCalledTimes(1)
		})

		it('does not follow one to another endpoint of an allowed host', async () => {
			fetchMock.mockResolvedValueOnce(redirect('/api/collections/users/records'))

			expect((await call(`https://api.beswib.com${FILE}`)).status).toBe(502)
			expect(fetchMock).toHaveBeenCalledTimes(1)
		})

		it('follows one that stays on the files of an allowed host, under the same deadline', async () => {
			fetchMock
				.mockResolvedValueOnce(redirect('/api/files/pbc_123/abcdefghijklmno/photo_v2.png', 301))
				.mockResolvedValueOnce(await image('png'))

			const response = await call(`https://api.beswib.com${FILE}`)

			expect(response.status).toBe(200)
			expect(fetchedUrl(1)).toBe('https://api.beswib.com/api/files/pbc_123/abcdefghijklmno/photo_v2.png')
			expect(fetchMock.mock.calls[1][1]?.signal).toBe(fetchMock.mock.calls[0][1]?.signal)
		})

		it('gives up on a loop', async () => {
			fetchMock.mockImplementation(() => Promise.resolve(redirect(FILE)))

			expect((await call(`https://api.beswib.com${FILE}`)).status).toBe(502)
			expect(fetchMock).toHaveBeenCalledTimes(4)
		})
	})

	describe('what it answers', () => {
		it.each([
			['a WebP', 'webp', 'image/webp'],
			['a PNG', 'png', 'image/png'],
			['a JPEG', 'jpeg', 'image/jpeg'],
			['a type with a parameter', 'png', 'image/png; charset=binary'],
			['a type in upper case', 'png', 'IMAGE/PNG'],
		] as const)('a PNG it encoded itself for %s, cacheable and inert', async (_label, format, type) => {
			fetchMock.mockResolvedValue(await image(format, type))

			const response = await call(`https://api.beswib.com${FILE}`)

			expect(response.status).toBe(200)
			expect(response.headers.get('content-type')).toBe('image/png')
			expect(response.headers.get('cache-control')).toBe(IMMUTABLE)
			expect(response.headers.get('x-content-type-options')).toBe('nosniff')
			expect(response.headers.get('content-security-policy')).toContain('sandbox')
			expect(await isPng(response)).toBe(true)
		})

		it.each([
			'text/html',
			'application/json',
			'text/plain; charset=utf-8',
			'image/svg+xml',
			'image/png, text/html',
			'',
		])('nothing of a "%s" response, whose download it drops', async type => {
			const cancelled = vi.fn()
			const body = new ReadableStream<Uint8Array>({
				start: controller => controller.enqueue(new TextEncoder().encode('<script>alert(1)</script>')),
				cancel: cancelled,
			})
			fetchMock.mockResolvedValue(
				new Response(body, { status: 200, headers: type === '' ? {} : { 'content-type': type } })
			)

			const response = await call(`https://api.beswib.com${FILE}`)

			expect(response.status).toBe(415)
			expect(response.headers.get('cache-control')).toBe('no-store')
			expect(await response.text()).not.toContain('script')
			expect(cancelled).toHaveBeenCalled()
		})

		it.each(['image/webp', 'image/png', 'image/gif'])(
			'nothing of bytes that are not the %s they claim to be',
			async type => {
				fetchMock.mockResolvedValue(answer(type, '<html><script>alert(document.domain)</script></html>'))

				const response = await call(`https://api.beswib.com${FILE}`)

				expect(response.status).toBe(415)
				expect(response.headers.get('cache-control')).toBe('no-store')
				expect(await response.text()).not.toContain('script')
			}
		)

		it('nothing of an image that would decode to more pixels than the limit', async () => {
			const huge = await pixels('png', 8000, 7000)
			fetchMock.mockResolvedValue(answer('image/png', new Uint8Array(huge)))

			const response = await call(`https://api.beswib.com${FILE}`)

			expect(huge.byteLength).toBeLessThan(15 * 1024 * 1024)
			expect(response.status).toBe(415)
		})

		it('413 for a file announced as too large', async () => {
			fetchMock.mockResolvedValue(answer('image/png', 'x', { 'content-length': String(16 * 1024 * 1024) }))

			expect((await call(`https://api.beswib.com${FILE}`)).status).toBe(413)
		})

		it('413 for a file that turns out too large, without reading it to the end', async () => {
			const megabyte = new Uint8Array(1024 * 1024)
			let sent = 0
			const cancelled = vi.fn()
			const body = new ReadableStream<Uint8Array>({
				pull(controller) {
					sent++
					controller.enqueue(megabyte)
				},
				cancel: cancelled,
			})
			fetchMock.mockResolvedValue(new Response(body, { status: 200, headers: { 'content-type': 'image/png' } }))

			expect((await call(`https://api.beswib.com${FILE}`)).status).toBe(413)
			expect(sent).toBeLessThan(20)
			expect(cancelled).toHaveBeenCalled()
		})

		it('404 when the file does not exist', async () => {
			fetchMock.mockResolvedValue(new Response('nope', { status: 404 }))

			expect((await call(`https://api.beswib.com${FILE}`)).status).toBe(404)
		})

		it.each([204, 206, 304, 401, 418, 500])('502 for an upstream %i, never its own status', async status => {
			const body = [204, 304].includes(status) ? null : 'x'
			fetchMock.mockResolvedValue(new Response(body, { status, headers: { 'content-type': 'image/png' } }))

			const response = await call(`https://api.beswib.com${FILE}`)

			expect(response.status).toBe(502)
			expect(response.headers.get('cache-control')).toBe('no-store')
		})

		it('502 when the file server cannot be reached', async () => {
			fetchMock.mockRejectedValue(new TypeError('fetch failed'))

			expect((await call(`https://api.beswib.com${FILE}`)).status).toBe(502)
		})

		it('504 when the file server does not answer in time', async () => {
			fetchMock.mockRejectedValue(new DOMException('The operation was aborted due to timeout', 'TimeoutError'))

			expect((await call(`https://api.beswib.com${FILE}`)).status).toBe(504)
		})
	})
})
