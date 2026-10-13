import { readFileSync } from 'node:fs'
import { extname, join, sep } from 'node:path'

const MIME_TYPES: Record<string, string> = {
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
}

const cache = new Map<string, string>()

/**
 * A file of public/ as a data URL, for the Open Graph images.
 *
 * They are rendered on the server. Asking the site for its own files over HTTP only worked
 * where its public address was configured (elsewhere the address was localhost, and the image
 * was silently left out), and next/og refuses local addresses since Next 16.4.
 */
export function publicAssetDataUrl(publicPath: string): string {
	const cached = cache.get(publicPath)
	if (cached !== undefined) return cached

	const publicDir = join(process.cwd(), 'public')
	const file = join(publicDir, publicPath)
	if (!file.startsWith(publicDir + sep)) {
		throw new Error(`Not a file of public/: ${publicPath}`)
	}
	const type = MIME_TYPES[extname(file).toLowerCase()]
	if (type === undefined) {
		throw new Error(`Not an image an Open Graph image can embed: ${publicPath}`)
	}

	const dataUrl = `data:${type};base64,${readFileSync(file).toString('base64')}`
	cache.set(publicPath, dataUrl)
	return dataUrl
}
