import React from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
			<p className="text-sm text-gray-400">{countLabel}</p>
			{/* Dropdown to select the sort order 🔄 */}
			<Select onValueChange={onSortChange} value={sortValue}>
				<SelectTrigger className="border-border text-foreground bg-card data-[placeholder]:!text-muted-foreground focus:border-accent focus:ring-accent placeholder:text-muted-foreground w-full border sm:w-48">
					<SelectValue placeholder={t.sortBy} />
				</SelectTrigger>
				<SelectContent className="border-border bg-card text-foreground">
					<SelectItem className="focus:bg-slate-300 focus:text-gray-400" value="date">
						{t.sortByDate}
					</SelectItem>
					<SelectItem className="focus:bg-slate-300 focus:text-gray-400" value="price-asc">
						{t.sortByPriceAsc}
					</SelectItem>
					<SelectItem className="focus:bg-slate-300 focus:text-gray-400" value="price-desc">
						{t.sortByPriceDesc}
					</SelectItem>
					<SelectItem className="focus:bg-slate-300 focus:text-gray-400" value="distance">
						{t.sortByDistance}
					</SelectItem>
				</SelectContent>
			</Select>
		</div>
	)
}
