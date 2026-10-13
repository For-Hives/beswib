import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import type { ReactElement } from 'react'

import OGImage from '@/components/OG/ogImage.component'

import { rendered } from './render'

const FONTS_DIR = 'src/components/OG/typos'

function customFonts() {
	return [
		{
			weight: 400 as const,
			style: 'normal' as const,
			name: 'BowlbyOneSC',
			data: readFileSync(join(process.cwd(), FONTS_DIR, 'BowlbyOneSC-Regular.ttf')),
		},
		{
			weight: 400 as const,
			style: 'normal' as const,
			name: 'Geist',
			data: readFileSync(join(process.cwd(), FONTS_DIR, 'Geist-Regular.ttf')),
		},
	]
}

/**
 * The Open Graph image of a page that shows a record (an event, a bib, an article): its card,
 * drawn with the custom fonts, or the generic Beswib image when the card cannot be drawn.
 *
 * Both are drawn here, before answering: an ImageResponse draws while its body is sent, where a
 * failure cuts the response instead of reaching a catch.
 */
export async function renderCardOrGeneric(
	card: ReactElement,
	generic: { title: string; secondary: string },
	size: { width: number; height: number }
): Promise<Response> {
	try {
		return await rendered(new ImageResponse(card, { ...size, fonts: customFonts() }))
	} catch (error) {
		// A font that cannot be read, or a card that cannot be drawn
		console.error('Error rendering the Open Graph image, falling back to the generic one:', error)
		return await rendered(
			new ImageResponse(<OGImage title={generic.title} secondary={generic.secondary} size={size} />, size)
		)
	}
}
