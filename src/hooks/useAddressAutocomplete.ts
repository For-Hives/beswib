import { useCallback, useEffect, useRef, useState } from 'react'

import { type NominatimResult, searchAddresses } from '@/lib/utils/nominatim'

interface UseAddressAutocompleteOptions {
	/** Minimum number of characters before triggering search */
	minLength?: number
	/** Minimum number of words before triggering search */
	minWords?: number
	/** Debounce delay in milliseconds */
	debounceMs?: number
	/** Maximum number of results to show */
	maxResults?: number
}

interface UseAddressAutocompleteReturn {
	/** Current search query */
	query: string
	/** Array of address suggestions */
	suggestions: NominatimResult[]
	/** Whether a search is currently in progress */
	isLoading: boolean
	/** Whether the suggestions dropdown should be shown */
	showSuggestions: boolean
	/** Update the search query */
	setQuery: (query: string) => void
	/** Select a suggestion and hide the dropdown */
	selectSuggestion: (suggestion: NominatimResult) => void
	/** Hide the suggestions dropdown */
	hideSuggestions: () => void
	/** Show the suggestions dropdown */
	showSuggestionsDropdown: () => void
	/** Clear all suggestions */
	clearSuggestions: () => void
}

/**
 * Hook for address autocomplete using Nominatim API
 * Includes debouncing and rate limiting to be respectful to the API
 */
export function useAddressAutocomplete(options: UseAddressAutocompleteOptions = {}): UseAddressAutocompleteReturn {
	const { minWords = 3, minLength = 3, maxResults = 5, debounceMs = 1000 } = options

	const [isLoading, setIsLoading] = useState(false)
	const [query, setQuery] = useState('')
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [suggestions, setSuggestions] = useState<NominatimResult[]>([])

	const debounceRef = useRef<NodeJS.Timeout | null>(null)
	const lastRequestRef = useRef<string>('')

	const searchAddressesDebounced = useCallback(
		async (searchQuery: string) => {
			// Avoid duplicate requests
			if (searchQuery === lastRequestRef.current) {
				return
			}

			// Check minimum length (this is also checked in searchAddresses)
			if (searchQuery.trim().length < minLength) {
				setSuggestions([])
				setIsLoading(false)
				return
			}

			// Check if query has the minimum number of words required
			const wordCount = searchQuery.trim().split(/\s+/).length
			if (wordCount < minWords) {
				setSuggestions([])
				setIsLoading(false)
				return
			}

			lastRequestRef.current = searchQuery
			setIsLoading(true)

			try {
				const results = await searchAddresses(searchQuery)

				// Only update if this is still the current query
				if (searchQuery === lastRequestRef.current) {
					setSuggestions(results.slice(0, maxResults))
					setShowSuggestions(results.length > 0)
				}
			} catch (error) {
				console.warn('Address search failed:', error)
				if (searchQuery === lastRequestRef.current) {
					setSuggestions([])
					setShowSuggestions(false)
				}
			} finally {
				if (searchQuery === lastRequestRef.current) {
					setIsLoading(false)
				}
			}
		},
		[maxResults, minLength, minWords]
	)

	// Debounced search effect
	useEffect(() => {
		// Clear existing timeout
		if (debounceRef.current) {
			clearTimeout(debounceRef.current)
		}

		// Set new timeout
		debounceRef.current = setTimeout(() => {
			void searchAddressesDebounced(query)
		}, debounceMs)

		// Cleanup on unmount
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current)
			}
		}
	}, [debounceMs, query, searchAddressesDebounced])

	const selectSuggestion = useCallback((suggestion: NominatimResult) => {
		// This callback can be used by parent components to handle selection
		// Clear the internal state without modifying query (to avoid race conditions)
		setSuggestions([])
		setShowSuggestions(false)
		lastRequestRef.current = ''

		// Note: The actual suggestion handling is done in the AddressInput component
		// This callback is primarily for clearing state
		console.debug('Address suggestion selected:', suggestion.display_name)
	}, [])

	const hideSuggestions = useCallback(() => {
		setShowSuggestions(false)
	}, [])

	const showSuggestionsDropdown = useCallback(() => {
		if (suggestions.length > 0) {
			setShowSuggestions(true)
		}
	}, [suggestions.length])

	const clearSuggestions = useCallback(() => {
		setSuggestions([])
		setShowSuggestions(false)
		lastRequestRef.current = ''
	}, [])

	return {
		suggestions,
		showSuggestionsDropdown,
		showSuggestions,
		setQuery,
		selectSuggestion,
		query,
		isLoading,
		hideSuggestions,
		clearSuggestions,
	}
}
