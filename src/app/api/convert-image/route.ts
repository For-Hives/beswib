/**
 * API Route: Image Conversion Proxy
 * Converts WebP and other formats to PNG for OpenGraph image compatibility
 * Uses sharp (bundled with Next.js) for proper image conversion
 */

import { type NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * GET handler for image conversion
 * Usage: /api/convert-image?url=<encoded-image-url>
 */
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const imageUrl = searchParams.get('url')

		if (!imageUrl) {
			return new NextResponse('Missing url parameter', { status: 400 })
		}

		// Validate URL to prevent SSRF attacks
		try {
			const url = new URL(imageUrl)
			// Only allow our own API domains
			const allowedHosts = ['api.staging.beswib.com', 'api.beswib.com', 'localhost']
			if (!allowedHosts.some(host => url.hostname.includes(host))) {
				return new NextResponse('Invalid URL domain', { status: 403 })
			}
		} catch (error) {
			console.error('Error validating URL:', error)
			return new NextResponse('Invalid URL', { status: 400 })
		}

		// Fetch the original image
		const response = await fetch(imageUrl, {
			headers: {
				Accept: 'image/webp,image/png,image/jpeg,image/*',
			},
		})

		if (!response.ok) {
			return new NextResponse(`Failed to fetch image: ${response.status}`, {
				status: response.status,
			})
		}

		// Get the content type
		const contentType = response.headers.get('content-type') || 'image/png'

		// Get the image as an array buffer
		const arrayBuffer = await response.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)

		// If it's WebP, we need to convert it to PNG
		if (contentType === 'image/webp') {
			try {
				// Try to use sharp if available (it's bundled with Next.js)
				const sharp = (await import('sharp')).default

				// Convert WebP to PNG
				const pngBuffer = await sharp(buffer).png().toBuffer()

				// Convert Buffer to Uint8Array for NextResponse compatibility
				return new NextResponse(new Uint8Array(pngBuffer), {
					headers: {
						'Content-Type': 'image/png',
						'Cache-Control': 'public, max-age=31536000, immutable',
					},
				})
			} catch (error) {
				console.error('Error converting WebP to PNG with sharp:', error)
				// Fallback: return original buffer (may not work with OG, but better than failing)
				return new NextResponse(new Uint8Array(buffer), {
					headers: {
						'Content-Type': contentType,
						'Cache-Control': 'public, max-age=31536000, immutable',
					},
				})
			}
		}

		// For other formats, return as-is
		return new NextResponse(new Uint8Array(buffer), {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=31536000, immutable',
			},
		})
	} catch (error) {
		console.error('Error in image conversion:', error)
		return new NextResponse('Internal server error', { status: 500 })
	}
}
