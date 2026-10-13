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
			console.error('Error validating URL:', error)
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
