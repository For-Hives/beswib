'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'

import Fuse from 'fuse.js'

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { SelectAnimated, type SelectOption } from '@/components/ui/select-animated'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badgeAlt'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import locales from './locales.json'

interface SearchbarProps {
	readonly locale?: keyof typeof locales
	readonly maxPrice?: number
	readonly onAdvancedFiltersChange?: (filters: SelectedFilters) => void
	readonly onDistanceChange: (distance: null | string) => void
	readonly onSearch: (value: string) => void
	readonly onSportChange: (sport: null | string) => void
	readonly regions?: string[]
}

// Type for the filters that can be applied 🧐
type SelectedFilters = {
	dateEnd?: string
	dateStart?: string
	geography: string[]
	price: number[]
}

// Main searchbar component that handles filtering and searching functionality 🔍
// Switches from a stacked layout on mobile to a horizontal layout on desktop (>1280px) 📱💻
export default function Searchbar({
	regions = [],
	onSportChange,
	onSearch,
	onDistanceChange,
	onAdvancedFiltersChange,
	maxPrice = 2000,
	locale,
}: SearchbarProps) {
	// --- State for the search input value ⌨️
	const [searchTerm, setSearchTerm] = useState('') // Stores the current search input value 💾
	// --- State for advanced filters dropdown visibility 👀
	const [isDropdownOpen, setIsDropdownOpen] = useState(false) // Controls the visibility of the filter dropdown 👁️‍🗨️
	// --- State for the price range filter (not directly used in UI, but for sync) 💰
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [priceRange, setPriceRange] = useState([0, 200])
	// --- Main state for all currently applied filters (used for badges and filtering) 🏷️
	const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
		price: [0, maxPrice],
		geography: [],
		dateStart: undefined,
		dateEnd: undefined,
	})
	// --- Temporary states for the filter dropdown (applied only on 'Apply') ⏳
	const [tempPrice, setTempPrice] = useState<[number, number]>([0, maxPrice])
	const [tempRegion, setTempRegion] = useState<string[]>([])
	const [tempDateStart, setTempDateStart] = useState<string | undefined>(undefined)
	const [tempDateEnd, setTempDateEnd] = useState<string | undefined>(undefined)
	// --- State for the region search input in the advanced filters 🗺️
	const [regionSearch, setRegionSearch] = useState('') // Stores the current value of the region search input 💾
	// State for the selected region 📍 (Translated from French)
	const [selectedRegion, setSelectedRegion] = useState(tempRegion[0] || '')
	// State for the region popover 💬 (Translated from French)
	const [isRegionOpen, setIsRegionOpen] = useState(false)
	// State for selected sport and distance
	const [selectedSport, setSelectedSport] = useState<string | null>(null)
	const [selectedDistance, setSelectedDistance] = useState<string | null>(null)

	// Toggle function for the filter dropdown 🔄
	const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)

	// --- Handler for search input changes ⌨️
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value)
		onSearch(e.target.value)
	}

	// --- Handler to remove a selected region filter 🗺️❌
	const handleRemoveGeography = (location: string) => {
		setSelectedFilters(prev => ({
			...prev,
			geography: prev.geography.filter((item: string) => item !== location),
		}))
	}

	// --- Handler to reset the price filter 💰❌
	const handleResetPrice = () => {
		setSelectedFilters(prev => {
			const updated = { ...prev, price: [0, maxPrice] }
			setPriceRange([0, maxPrice])
			setTempPrice([0, maxPrice])
			return updated
		})
	}

	// --- Handler to remove the start date filter 📅❌
	const handleRemoveDateStart = () => {
		setSelectedFilters(prev => ({ ...prev, dateStart: undefined }))
	}

	// --- Handler to remove the end date filter 📅❌
	const handleRemoveDateEnd = () => {
		setSelectedFilters(prev => ({ ...prev, dateEnd: undefined }))
	}

	// --- Sync price filters with maxPrice when it changes 💰🔄
	useEffect(() => {
		setSelectedFilters(prev => ({ ...prev, price: [0, maxPrice] }))
		setTempPrice([0, maxPrice])
		setPriceRange([0, maxPrice])
	}, [maxPrice])

	// --- Notify parent when selectedFilters changes 📢
	useEffect(() => {
		if (onAdvancedFiltersChange) onAdvancedFiltersChange(selectedFilters)
	}, [selectedFilters, onAdvancedFiltersChange])

	// --- Fuzzy search for regions using Fuse.js ✨
	const fuse = useMemo(() => new Fuse(regions, { threshold: 0.4 }), [regions]) // Fuse instance for fuzzy search 🔍
	const filteredRegions: string[] = regionSearch ? fuse.search(regionSearch).map(result => result.item) : regions // Filtered regions based on fuzzy search 🗺️

	// Use filteredRegions for fuzzy search (Fuse.js) ✨ (Translated from French)
	const regionOptions = filteredRegions.map(region => ({
		value: region.toLowerCase(),
		label: region,
	}))

	const lang = locale ?? 'en'
	const t = locales[lang] ?? locales['en']

	// Sport options for SelectAnimated
	const sportOptions: SelectOption[] = [
		{ value: 'all', label: t.allSports },
		{ value: 'running', label: 'Running' },
		{ value: 'trail', label: 'Trail' },
		{ value: 'triathlon', label: 'Triathlon' },
		{ value: 'cycling', label: t.cycling },
		{ value: 'swimming', label: t.swimming },
	]

	// Distance options for SelectAnimated
	const distanceOptions: SelectOption[] = [
		{ value: 'all', label: t.allDistances },
		{ value: '5', label: '5km' },
		{ value: '10', label: '10km' },
		{ value: '21', label: 'Semi-Marathon' },
		{ value: '42', label: 'Marathon' },
		{ value: '80', label: 'Ultra (+80km)' },
		{ value: 'tri-s', label: 'Triathlon S' },
		{ value: 'tri-m', label: 'Triathlon M' },
		{ value: 'tri-l', label: 'Triathlon L' },
	]

	return (
		// Main container with responsive padding and shadow 容器
		<div className="bg-card/80 border-border relative flex flex-col rounded-2xl border p-2 shadow-md backdrop-blur-md xl:p-4">
			{/* Main content wrapper - switches from column to row layout on desktop 📱💻 */}
			<div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:gap-4">
				{/* Search input section - takes 3/4 of the width on desktop ⌨️ */}
				<div className="relative flex w-full items-center rounded-lg px-2 py-2 xl:w-3/4 xl:px-4">
					<input
						className="border-border bg-card/60 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent block w-full rounded-lg border p-2.5 pr-10 text-sm"
						id="search_input"
						onChange={handleInputChange}
						placeholder={t.searchPlaceholder}
						required
						type="text"
						value={searchTerm}
					/>
				</div>

				{/* Filters section - takes 1/4 of the width on desktop 🎛️ */}
				<div className="flex w-full items-center gap-2 xl:w-1/4 xl:gap-4">
					{/* Sport dropdown - takes 1/3 of the filters section 🏅 */}
					<div className="w-1/3">
						<SelectAnimated
							onValueChange={value => {
								const sport = value === 'all' ? null : value
								setSelectedSport(sport)
								onSportChange(sport)
							}}
							options={sportOptions}
							placeholder={t.sport}
							value={selectedSport ?? 'all'}
						/>
					</div>

					{/* Distance dropdown - takes 1/3 of the filters section 📏 */}
					<div className="w-1/3">
						<SelectAnimated
							onValueChange={value => {
								const distance = value === 'all' ? null : value
								setSelectedDistance(distance)
								onDistanceChange(distance)
							}}
							options={distanceOptions}
							placeholder={t.distance}
							value={selectedDistance ?? 'all'}
						/>
					</div>

					{/* Filter button with dropdown - takes 1/3 of the filters section ⚙️ */}
					<div className="relative w-1/3 overflow-visible">
						<Button
							className="border-border bg-card text-foreground hover:bg-card/80 h-9 w-full border px-3 py-0"
							onClick={toggleDropdown}
						>
							{t.filters}
						</Button>
						{/* Advanced filters dropdown - appears when clicking the Filters button 👀 */}
						{isDropdownOpen && (
							<div className="border-border bg-card text-foreground absolute right-0 z-30 mt-2 w-full min-w-[220px] rounded-lg border p-4 shadow-lg xl:w-64">
								{/* Price range slider 💰 */}
								<div className="mb-4">
									<label className="mb-2 font-semibold" htmlFor="price-range-slider">
										{t.priceRange}
									</label>
									<input
										className="bg-accent/30 h-2 w-full appearance-none rounded-full"
										id="price-range-slider"
										max={maxPrice}
										min={0}
										onChange={e => setTempPrice([0, +e.target.value])}
										style={{
											background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((tempPrice[1] / maxPrice) * 100).toFixed(0)}%, #E5E7EB ${((tempPrice[1] / maxPrice) * 100).toFixed(0)}%, #E5E7EB 100%)`,
										}}
										type="range"
										value={tempPrice[1]}
									/>
									<div className="mt-1 flex justify-between text-sm">
										<span>0€</span>
										<span>{tempPrice[1]}€</span>
									</div>
								</div>

								{/* Date range inputs 📅 */}
								<div className="flex flex-col justify-between text-sm">
									<label className="text-muted-foreground mb-2 block text-lg font-medium" htmlFor="date-start">
										{t.date}
									</label>
									<div className="w-full flex-col space-y-2">
										<input
											className="border-border bg-card/60 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent h-10 w-full rounded border px-3 text-center"
											id="date-start"
											onChange={e => setTempDateStart(e.target.value)}
											type="date"
											value={tempDateStart ?? ''}
										/>
										<input
											className="border-border bg-card/60 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent h-10 w-full rounded border px-3 text-center"
											id="date-end"
											onChange={e => setTempDateEnd(e.target.value)}
											
											type="date"
											value={tempDateEnd ?? ''}
										/>
									</div>
								</div>

								{/* Region selector 🗺️ */}
								<div>
									<label className="text-muted-foreground mb-2 block text-lg font-medium" htmlFor="region-select">
										{t.region}
									</label>
									<Popover onOpenChange={setIsRegionOpen} open={isRegionOpen}>
										<PopoverTrigger asChild>
											<Button
												className="w-full justify-between"
												onClick={() => setIsRegionOpen(true)}
												variant="outline"
											>
												{selectedRegion
													? regionOptions.find(r => r.value === selectedRegion)?.label
													: t.selectRegion || 'Rechercher une ville'}
												<ChevronsUpDown className="opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="z-[9999] w-full p-0">
											<Command>
												<CommandInput
													className="h-9"
													onValueChange={setRegionSearch}
													placeholder={t.selectRegion || 'Rechercher une ville'}
													value={regionSearch}
												/>
												<CommandList className="max-h-60 overflow-y-auto">
													<CommandEmpty>{t.noRegion}</CommandEmpty>
													<CommandGroup>
														{regionOptions.map(region => (
															<CommandItem
																key={region.value}
																onSelect={currentValue => {
																	setSelectedRegion(currentValue === selectedRegion ? '' : currentValue)
																	setTempRegion(currentValue ? [currentValue] : [])
																	setIsRegionOpen(false)
																}}
																value={region.value}
															>
																{region.label}
																<Check
																	className={cn(
																		'ml-auto',
																		selectedRegion === region.value ? 'opacity-100' : 'opacity-0'
																	)}
																/>
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								</div>

								{/* Apply button - updates the main filters state with temporary values ✅ */}
								<div className="mt-4">
									<Button
										className="border-border bg-accent/20 text-accent-foreground hover:bg-accent/30 w-full border"
										onClick={() => {
											const newFilters = {
												price: tempPrice,
												geography: tempRegion,
												dateStart: tempDateStart,
												dateEnd: tempDateEnd,
											}
											setSelectedFilters(newFilters)
											setPriceRange(tempPrice)
											setIsDropdownOpen(false)
											if (onAdvancedFiltersChange) {
												onAdvancedFiltersChange(newFilters)
											}
										}}
									>
										{t.apply}
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Divider between search/filters and filter badges ↔️ */}
			<hr className="my-2 border-gray-400" />

			{/* Filter badges section - shows currently applied filters 🏷️ */}
			<div className="mt-4 flex flex-wrap gap-2 xl:mt-0 xl:gap-4">
				{/* Region filter badges 🗺️ */}
				{selectedFilters.geography.map(location => (
					<Badge
						className="max-w-[100px] overflow-hidden bg-blue-400 text-ellipsis whitespace-nowrap text-white"
						key={location}
						variant="secondary"
					>
						{location}
						<button
							aria-label="Remove geography filter"
							className="ml-1 flex h-3 w-3 cursor-pointer items-center justify-center"
							onClick={() => handleRemoveGeography(location)}
							type="button"
						>
							<X />
						</button>
					</Badge>
				))}
				{/* Price filter badge 💰 */}
				<Badge className="bg-background text-white" key="price" variant="secondary">
					{selectedFilters.price[0] === 0 && selectedFilters.price[1] === maxPrice
						? t.allPrices
						: `${t.priceRange}: ${selectedFilters.price[0]}€ - ${selectedFilters.price[1]}€`}
					<button
						aria-label="Reset price filter"
						className="ml-1 flex h-3 w-3 cursor-pointer items-center justify-center"
						onClick={handleResetPrice}
						type="button"
					>
						<X />
					</button>
				</Badge>
				{/* Start date filter badge 📅 */}
				{selectedFilters.dateStart != null && selectedFilters.dateStart !== '' && (
					<Badge className="bg-background text-white" key="dateStart" variant="secondary">
						{`${t.start}: ${selectedFilters.dateStart}`}
						<button
							aria-label="Remove start date filter"
							className="ml-1 flex h-3 w-3 cursor-pointer items-center justify-center"
							onClick={handleRemoveDateStart}
							type="button"
						>
							<X />
						</button>
					</Badge>
				)}
				{/* End date filter badge 📅 */}
				{selectedFilters.dateEnd != null && selectedFilters.dateEnd !== '' && (
					<Badge className="bg-background text-white" key="dateEnd" variant="secondary">
						{`${t.end}: ${selectedFilters.dateEnd}`}
						<button
							aria-label="Remove end date filter"
							className="ml-1 flex h-3 w-3 cursor-pointer items-center justify-center"
							onClick={handleRemoveDateEnd}
							type="button"
						>
							<X />
						</button>
					</Badge>
				)}
			</div>
		</div>
	)
}
