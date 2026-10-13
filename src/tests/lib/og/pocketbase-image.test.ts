// @vitest-environment node
import sharp from 'sharp'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { pocketBaseImageDataUrl } from '@/lib/og/pocketbase-image'

// The refusals themselves are covered through the public route, in
// src/tests/security/convert-image-ssrf.test.ts: here, what an Open Graph image gets.

const FILE = 'https://api.beswib.com/api/files/pbc_123/abcdefghijklmno/photo_x1.webp'
const PNG_DATA_URL = 'data:image/png;base64,iVBORw0KGgo'

const fetchMock = vi.fn<typeof fetch>()

async function webp() {
	const pixels = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#00ff00' } })
		.webp()
		.toBuffer()
	return new Response(new Uint8Array(pixels), { status: 200, headers: { 'content-type': 'image/webp' } })
}

describe('pocketBaseImageDataUrl', () => {
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

	it('gives a PocketBase WebP as a PNG data URL', async () => {
		fetchMock.mockResolvedValue(await webp())

		const dataUrl = await pocketBaseImageDataUrl(FILE)

		expect(dataUrl?.startsWith(PNG_DATA_URL)).toBe(true)
		expect(String(fetchMock.mock.calls[0][0])).toBe(FILE)
	})

	it('reads a local PocketBase when the app is configured for it', async () => {
		vi.stubEnv('NEXT_PUBLIC_POCKETBASE_URL', 'http://127.0.0.1:8090')
		fetchMock.mockResolvedValue(await webp())

		const dataUrl = await pocketBaseImageDataUrl('http://127.0.0.1:8090/api/files/organizer/abcdefghijklmno/logo.webp')

		expect(dataUrl?.startsWith(PNG_DATA_URL)).toBe(true)
	})

	it('reduces a large photo to what a card shows, well under what the renderer accepts', async () => {
		const photo = await sharp({
			create: {
				width: 3000,
				height: 2000,
				channels: 3,
				background: '#336699',
				noise: { type: 'gaussian', mean: 128, sigma: 40 },
			},
		})
			.jpeg()
			.toBuffer()
		fetchMock.mockResolvedValue(new Response(new Uint8Array(photo), { headers: { 'content-type': 'image/jpeg' } }))

		const dataUrl = await pocketBaseImageDataUrl(FILE.replace('.webp', '.jpg'))

		expect(dataUrl?.startsWith(PNG_DATA_URL)).toBe(true)
		expect(dataUrl?.length).toBeLessThan(1_500_000)
		const { width, height } = await sharp(
			Buffer.from(String(dataUrl).slice('data:image/png;base64,'.length), 'base64')
		).metadata()
		expect([width, height]).toEqual([600, 400])
	})

	it('does not enlarge a small picture', async () => {
		fetchMock.mockResolvedValue(await webp())

		const dataUrl = await pocketBaseImageDataUrl(FILE)

		const { width, height } = await sharp(
			Buffer.from(String(dataUrl).slice('data:image/png;base64,'.length), 'base64')
		).metadata()
		expect([width, height]).toEqual([2, 2])
	})

	it('draws an SVG logo', async () => {
		const svg =
			'<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20" fill="#f00"/></svg>'
		fetchMock.mockResolvedValue(new Response(svg, { headers: { 'content-type': 'image/svg+xml' } }))

		const dataUrl = await pocketBaseImageDataUrl('https://api.beswib.com/api/files/organizer/abcdefghijklmno/logo.svg')

		expect(dataUrl?.startsWith(PNG_DATA_URL)).toBe(true)
		const { width, height } = await sharp(
			Buffer.from(String(dataUrl).slice('data:image/png;base64,'.length), 'base64')
		).metadata()
		// drawn larger than its 40 x 20 points, so that it stays sharp in the card
		expect(Number(width) / Number(height)).toBeCloseTo(2, 1)
		expect(Number(width)).toBeGreaterThan(100)
		expect(Number(width)).toBeLessThanOrEqual(600)
	})

	it.each([null, undefined, ''])('gives null without a URL (%s)', async url => {
		expect(await pocketBaseImageDataUrl(url)).toBeNull()
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it.each([
		['another host', 'https://attacker.tld/api/files/a/b/c.webp'],
		['a local address the app is not configured for', 'http://localhost:3000/api/convert-image?url=x'],
		['a placeholder path of public/', '/bib-blue.png'],
	])('gives null for %s, without fetching it', async (_label, url) => {
		expect(await pocketBaseImageDataUrl(url)).toBeNull()
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it.each([
		['a missing file', () => Promise.resolve(new Response('nope', { status: 404 }))],
		[
			'a page instead of an image',
			() => Promise.resolve(new Response('<html>', { headers: { 'content-type': 'text/html' } })),
		],
		[
			'bytes that are not an image',
			() => Promise.resolve(new Response('junk', { headers: { 'content-type': 'image/webp' } })),
		],
		['a file server that cannot be reached', () => Promise.reject(new TypeError('fetch failed'))],
		['a file server that does not answer in time', () => Promise.reject(new DOMException('timeout', 'TimeoutError'))],
		['an unexpected failure', () => Promise.reject(new Error('boom'))],
	])('gives null for %s, and never throws', async (_label, answer) => {
		fetchMock.mockImplementation(answer)

		await expect(pocketBaseImageDataUrl(FILE)).resolves.toBeNull()
	})
})
