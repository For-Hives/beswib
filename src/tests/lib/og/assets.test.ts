// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { publicAssetDataUrl } from '@/lib/og/assets'
import { getRandomBibPlaceholder } from '@/lib/utils/images'

const PNG_HEADER = 'data:image/png;base64,iVBORw0KGgo'

describe('publicAssetDataUrl', () => {
	it('embeds the mountain of the Open Graph images, byte for byte', () => {
		const dataUrl = publicAssetDataUrl('openGraph/mountain-outlined.png')
		const file = readFileSync(join(process.cwd(), 'public/openGraph/mountain-outlined.png'))

		expect(dataUrl.startsWith(PNG_HEADER)).toBe(true)
		expect(Buffer.from(dataUrl.slice('data:image/png;base64,'.length), 'base64').equals(file)).toBe(true)
	})

	it('embeds every bib placeholder a card can fall back to', () => {
		const placeholders = new Set(Array.from({ length: 40 }, (_, seed) => getRandomBibPlaceholder(String(seed))))

		expect(placeholders.size).toBeGreaterThan(1)
		for (const placeholder of placeholders) {
			expect(placeholder.startsWith('/')).toBe(true)
			expect(publicAssetDataUrl(placeholder.slice(1)).startsWith(PNG_HEADER)).toBe(true)
		}
	})

	it.each(['../package.json', '../.env', 'openGraph/../../package.json'])('refuses %s, outside public/', path => {
		expect(() => publicAssetDataUrl(path)).toThrow('Not a file of public/')
	})

	it('refuses a file that is not an image', () => {
		expect(() => publicAssetDataUrl('site.webmanifest')).toThrow('Not an image')
	})

	it('fails loudly on a missing image', () => {
		expect(() => publicAssetDataUrl('openGraph/does-not-exist.png')).toThrow()
	})
})
