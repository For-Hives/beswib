import React from 'react'

import { SelectAnimated, type SelectOption } from '@/components/ui/select-animated'

import locales from './locales.json'

// Props for OfferCounter: count of bibs, current sort value, and sort change handler 🔢
interface OfferCounterProps {
	readonly count: number
	readonly locale?: string // optional, fallback to 'en'  fallback to 'en' 🌐
	readonly onSortChange: (value: string) => void
	readonly sortValue: string
}

// OfferCounter displays the number of available bibs and a sort dropdown 🔢
export default function OfferCounter({ sortValue, onSortChange, locale, count }: OfferCounterProps) {
	const lang = locale ?? 'en'
	const t = locales[lang as keyof typeof locales] ?? locales['en']

	// Sort options for SelectAnimated
	const sortOptions: SelectOption[] = [
		{ value: 'date', label: t.sortByDate },
		{ value: 'price-asc', label: t.sortByPriceAsc },
		{ value: 'price-desc', label: t.sortByPriceDesc },
		{ value: 'distance', label: t.sortByDistance },
	]

	let countLabel = ''
	if (count === 0) {
		countLabel = t.noBibs
	} else if (count === 1) {
		countLabel = t.oneBib
	} else {
		countLabel = t.manyBibs.replace('{count}', count.toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR'))
	}
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			{/* Display the number of available bibs, with pluralization 🧮 */}
			<p className="text-muted-foreground text-sm">{countLabel}</p>
			{/* Dropdown to select the sort order 🔄 */}
			<SelectAnimated
				className="w-full sm:w-48"
				onValueChange={onSortChange}
				options={sortOptions}
				placeholder={t.sortBy}
				value={sortValue}
			/>
		</div>
	)
}
