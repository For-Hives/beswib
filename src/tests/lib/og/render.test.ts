// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { rendered } from '@/lib/og/render'

describe('rendered', () => {
	it('gives the drawn image with the status and headers it was built with', async () => {
		const image = new Response(new Uint8Array([1, 2, 3]), {
			status: 200,
			headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=60' },
		})

		const response = await rendered(image)

		expect(response.status).toBe(200)
		expect(response.headers.get('content-type')).toBe('image/png')
		expect(response.headers.get('cache-control')).toBe('public, max-age=60')
		expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([1, 2, 3])
	})

	it('fails when the image cannot be drawn, so that the route can serve its fallback', async () => {
		const failing = new Response(
			new ReadableStream({
				start(controller) {
					controller.error(new Error('Image source resolves to a blocked address'))
				},
			})
		)

		await expect(rendered(failing)).rejects.toThrow('blocked address')
	})
})
