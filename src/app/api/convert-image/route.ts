/**
 * API Route: Image Conversion Proxy
 * Converts WebP and other formats to PNG for OpenGraph image compatibility
 * Uses sharp (bundled with Next.js) for proper image conversion
 */

import { type NextRequest, NextResponse } from 'next/server'

import { fetchPocketBaseImageAsPng } from '@/lib/og/pocketbase-image'

export const runtime = 'nodejs'

// The route is public and fetches on behalf of the caller: what it accepts and
// what it answers is decided in src/lib/og/pocketbase-image.ts.
const IMAGE_HEADERS = {
	'Content-Type': 'image/png',
	'Cache-Control': 'public, max-age=31536000, immutable',
	'X-Content-Type-Options': 'nosniff',
	'Content-Security-Policy': "default-src 'none'; sandbox",
}

function refusal(message: string, status: number) {
	return new NextResponse(message, { status, headers: { 'Cache-Control': 'no-store' } })
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

		const image = await fetchPocketBaseImageAsPng(imageUrl)
		if (!image.ok) {
			return refusal(image.message, image.status)
		}

		// Convert Buffer to Uint8Array for NextResponse compatibility
		return new NextResponse(new Uint8Array(image.png), { headers: IMAGE_HEADERS })
	} catch (error) {
		console.error('Error in image conversion:', error)
		return refusal('Internal server error', 500)
	}
}
