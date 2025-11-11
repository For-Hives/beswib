/**
 * Determines the absolute base URL for the application.
 * Prioritizes environment variables over dynamic header detection.
 * 
 * @returns Object with protocol and host separated, or full baseUrl
 */
export function getAbsoluteUrl(): { protocol: string; host: string; baseUrl: string } {
	// Priority 1: Use environment variable if defined
	const serverUrl = process.env.SERVER_URL || process.env.NEXT_URL_SERVER_URL

	if (serverUrl) {
		try {
			const url = new URL(serverUrl)
			return {
				protocol: url.protocol.replace(':', ''),
				host: url.host,
				baseUrl: `${url.protocol}//${url.host}`,
			}
		} catch (error) {
			console.warn('Invalid SERVER_URL or NEXT_URL_SERVER_URL format:', serverUrl)
			// Continue to fallback
		}
	}

	// Priority 2: Fallback to localhost for development
	// This is mainly for local development when env vars are not set
	return {
		protocol: 'http',
		host: 'localhost:3000',
		baseUrl: 'http://localhost:3000',
	}
}

/**
 * Determines the absolute base URL using Next.js headers (async version).
 * This is used in server components where headers() is available.
 * Still prioritizes environment variables over header detection.
 * 
 * @param requestHeaders - Optional headers object from next/headers
 * @returns Object with protocol and host separated, or full baseUrl
 */
export async function getAbsoluteUrlFromHeaders(
	requestHeaders?: Awaited<ReturnType<typeof import('next/headers').headers>>
): Promise<{ protocol: string; host: string; baseUrl: string }> {
	// Priority 1: Always check environment variables first
	const serverUrl = process.env.SERVER_URL || process.env.NEXT_URL_SERVER_URL

	if (serverUrl) {
		try {
			const url = new URL(serverUrl)
			return {
				protocol: url.protocol.replace(':', ''),
				host: url.host,
				baseUrl: `${url.protocol}//${url.host}`,
			}
		} catch (error) {
			console.warn('Invalid SERVER_URL or NEXT_URL_SERVER_URL format:', serverUrl)
			// Continue to fallback
		}
	}

	// Priority 2: If headers provided, use them as fallback
	if (requestHeaders) {
		const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000'
		const xfProto = requestHeaders.get('x-forwarded-proto')
		const isLocal = host?.startsWith('localhost') || host?.startsWith('127.0.0.1')
		const protocol = xfProto ?? (isLocal ? 'http' : 'https')

		return {
			protocol,
			host,
			baseUrl: `${protocol}://${host}`,
		}
	}

	// Priority 3: Final fallback
	return {
		protocol: 'http',
		host: 'localhost:3000',
		baseUrl: 'http://localhost:3000',
	}
}

