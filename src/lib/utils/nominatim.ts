import { NOMINATIM_API_URL } from '@/constants/api.constant'

export interface NominatimAddress {
	house_number?: string
	road?: string
	neighbourhood?: string
	suburb?: string
	city?: string
	municipality?: string
	county?: string
	state?: string
	region?: string
	postcode?: string
	country?: string
	country_code?: string
}

export interface NominatimResult {
	place_id: number
	licence: string
	osm_type: string
	osm_id: number
	lat: string
	lon: string
	class: string
	type: string
	place_rank: number
	importance: number
	addresstype: string
	name: string
	display_name: string
	address: NominatimAddress
	boundingbox: [string, string, string, string]
}

/**
 * Search for addresses using the Nominatim API
 *
 * IMPORTANT: This API is rate limited and should be used sparingly
 * - Only triggers for queries with 3+ words
 * - Includes 1 second debounce delay
 * - Limits to 5 results maximum
 * - Includes proper User-Agent header
 * - Gracefully handles errors without breaking the app
 *
 * @param query - The address search query
 * @returns Promise<NominatimResult[]> - Array of address results
 */
export async function searchAddresses(query: string): Promise<NominatimResult[]> {
	if (!query || query.trim().length < 3) {
		return []
	}

	try {
		const encodedQuery = encodeURIComponent(query.trim())
		const response = await fetch(`${NOMINATIM_API_URL}?q=${encodedQuery}&format=json&addressdetails=1&limit=5`, {
			headers: {
				'User-Agent': 'Beswib-App/1.0 (https://beswib.com)',
			},
		})

		if (!response.ok) {
			console.warn('Nominatim API error:', response.status, response.statusText)
			return []
		}

		const data = (await response.json()) as unknown
		return Array.isArray(data) ? (data as NominatimResult[]) : []
	} catch (error) {
		console.warn('Failed to fetch address suggestions:', error)
		return []
	}
}

/**
 * Format a Nominatim result for display
 */
export function formatAddressDisplay(result: NominatimResult): string {
	return result.display_name
}

/**
 * Extract structured address components from a Nominatim result
 */
export function extractAddressComponents(result: NominatimResult) {
	const { address } = result

	// Build the street address from house number and road
	let street = ''
	if (
		address.house_number != null &&
		address.house_number.trim() !== '' &&
		address.road != null &&
		address.road.trim() !== ''
	) {
		street = `${address.house_number} ${address.road}`.trim()
	} else if (address.road != null && address.road.trim() !== '') {
		street = address.road.trim()
	}

	// Use the full display name as fallback for street if no specific road found
	if (street === '' && result.display_name != null && result.display_name.trim() !== '') {
		// Extract the first part of display_name which usually contains the street
		const parts = result.display_name.split(', ')
		if (parts.length > 0) {
			street = parts[0]
		}
	}

	return {
		street,
		postalCode: address.postcode ?? '',
		country: address.country ?? '',
		city: address.city ?? address.municipality ?? address.suburb ?? '',
	}
}
