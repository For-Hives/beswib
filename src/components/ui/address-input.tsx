'use client'

import { forwardRef, useEffect, useRef } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'

import { useAddressAutocomplete } from '@/hooks/useAddressAutocomplete'

import { extractAddressComponents, formatAddressDisplay, type NominatimResult } from '@/lib/utils/nominatim'
import { Input } from '@/components/ui/inputAlt'
import { cn } from '@/lib/utils'

interface AddressInputProps {
	/** The current address value */
	value: string
	/** Callback when address changes */
	onChange: (value: string) => void
	/** Callback when address is selected from suggestions */
	onAddressSelect?: (components: { city: string; country: string; postalCode: string; street: string }) => void
	/** Placeholder text */
	placeholder?: string
	/** Additional CSS classes */
	className?: string
	/** Whether the input has an error */
	hasError?: boolean
	/** Input ID */
	id?: string
	/** Input name */
	name?: string
	/** Current values of other address fields - used to determine if dropdown should auto-close */
	otherFields?: {
		city?: string
		country?: string
		postalCode?: string
	}
}

/**
 * Address input component with autocomplete suggestions from Nominatim API
 * Shows dropdown after 3+ words and 1 second delay
 */
export const AddressInput = forwardRef<HTMLInputElement, AddressInputProps>(
	({ value, placeholder, otherFields, onChange, onAddressSelect, name, id, hasError, className, ...props }, ref) => {
		const containerRef = useRef<HTMLDivElement>(null)
		const {
			suggestions,
			showSuggestionsDropdown,
			showSuggestions,
			setQuery,
			selectSuggestion,
			query,
			isLoading,
			hideSuggestions,
		} = useAddressAutocomplete({
			minWords: 3, // Require at least 3 words for better address matching
			minLength: 3,
			maxResults: 5,
			debounceMs: 1000,
		})

		// Sync with external value - but avoid triggering if we just set it ourselves
		useEffect(() => {
			if (value !== query) {
				setQuery(value)
			}
		}, [value, setQuery]) // Remove query from deps to avoid circular updates

		// Check if other address fields are already completed
		const areOtherFieldsComplete = () => {
			if (!otherFields) return false

			const { postalCode, country, city } = otherFields
			return !!(
				city != null &&
				city.trim() !== '' &&
				country != null &&
				country.trim() !== '' &&
				postalCode != null &&
				postalCode.trim() !== ''
			)
		}

		// Handle clicks outside to close dropdown
		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
					hideSuggestions()
				}
			}

			document.addEventListener('mousedown', handleClickOutside)
			return () => {
				document.removeEventListener('mousedown', handleClickOutside)
			}
		}, [hideSuggestions])

		// Also prevent showing suggestions on focus if other fields are complete
		const shouldShowSuggestions = () => {
			return !areOtherFieldsComplete() && suggestions.length > 0
		}

		// Auto-close dropdown if other fields are already complete
		useEffect(() => {
			if (areOtherFieldsComplete() && showSuggestions) {
				hideSuggestions()
			}
		}, [otherFields, showSuggestions, hideSuggestions])

		const handleInputChange = (newValue: string) => {
			setQuery(newValue)
			onChange(newValue)
		}

		const handleSuggestionSelect = (suggestion: NominatimResult) => {
			const components = extractAddressComponents(suggestion)

			// Use the extracted street address instead of the full display name
			const streetAddress = components.street || formatAddressDisplay(suggestion)

			// Update both query and parent value in a controlled way to avoid race conditions
			setQuery(streetAddress)
			onChange(streetAddress)

			// Notify parent component with structured data
			onAddressSelect?.(components)

			// Hide suggestions
			selectSuggestion(suggestion)
		}

		const handleInputFocus = () => {
			// Only show suggestions if other fields are not already complete
			if (shouldShowSuggestions()) {
				showSuggestionsDropdown()
			}
		}

		const handleKeyDown = (event: React.KeyboardEvent) => {
			if (event.key === 'Escape') {
				hideSuggestions()
			}
		}

		return (
			<div className="relative" ref={containerRef}>
				<div className="relative">
					<Input
						{...props}
						ref={ref}
						className={cn('pr-8', hasError === true && 'border-red-500', isLoading && 'pr-16', className)}
						id={id}
						name={name}
						placeholder={placeholder}
						value={query}
						onChange={e => handleInputChange(e.target.value)}
						onFocus={handleInputFocus}
						onKeyDown={handleKeyDown}
					/>

					{/* Loading indicator */}
					{isLoading && (
						<div className="absolute top-1/2 right-3 -translate-y-1/2">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
						</div>
					)}

					{/* Dropdown indicator */}
					{!isLoading && suggestions.length > 0 && (
						<ChevronDown
							className={cn(
								'pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400 transition-transform',
								showSuggestions && 'rotate-180'
							)}
						/>
					)}
				</div>

				{/* Suggestions dropdown */}
				{shouldShowSuggestions() && showSuggestions && (
					<div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white py-1 shadow-lg dark:bg-gray-800">
						{suggestions.map(suggestion => (
							<button
								key={suggestion.place_id}
								className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
								type="button"
								onClick={() => handleSuggestionSelect(suggestion)}
							>
								<MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
								<div className="min-w-0 flex-1">
									<div className="truncate font-medium text-gray-900 dark:text-gray-100">{suggestion.display_name}</div>
									{suggestion.address.country != null && suggestion.address.country.trim() !== '' && (
										<div className="text-xs text-gray-500 dark:text-gray-400">{suggestion.address.country}</div>
									)}
								</div>
							</button>
						))}
					</div>
				)}
			</div>
		)
	}
)

AddressInput.displayName = 'AddressInput'
