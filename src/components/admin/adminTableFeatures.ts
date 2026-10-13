import {
	columnFilteringFeature,
	columnSizingFeature,
	columnVisibilityFeature,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_datetime,
	tableFeatures,
} from '@tanstack/react-table'

/**
 * What the admin lists (articles, events, organizers) use of the table library. Since version 9 a table only has
 * the APIs of the features registered here: calling another one is a type error, and nothing is bundled for it.
 * One object for the three lists, created once: a table must receive the same reference at every render.
 */
export const adminTableFeatures = tableFeatures({
	columnFilteringFeature,
	columnSizingFeature,
	columnVisibilityFeature,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	filteredRowModel: createFilteredRowModel(),
	sortedRowModel: createSortedRowModel(),
	paginatedRowModel: createPaginatedRowModel(),
	// The comparators a column picks by itself: datetime when it holds Date values, text or alphanumeric when it holds
	// strings, depending on whether one of the first ten rows contains a digit. Both names lead to the natural
	// comparison, so that "Trail 9" comes before "Trail 10" whichever rows come first. A name that is not registered
	// would fall back to the raw comparison (capitals first). Numbers and booleans use the built-in one.
	sortFns: { alphanumeric: sortFn_alphanumeric, datetime: sortFn_datetime, text: sortFn_alphanumeric },
})

export type AdminTableFeatures = typeof adminTableFeatures
