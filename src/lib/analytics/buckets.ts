import type {
	CountBucket,
	DaysToEventBucket,
	ElapsedBucket,
	LeadTimeBucket,
	PriceBucket,
	ReadTimeBucket,
} from './catalog'

// Pure range mappers. An exact amount, count, date or duration never leaves the browser: only the
// name of the range it falls in. Every function has a default branch, so an unusable input (NaN,
// an invalid date) still yields a member of the closed list, documented on each function.

const DAY_MS = 86_400_000

type DateInput = Date | string | number

function toTime(value: DateInput | null | undefined): number {
	if (value == null) return Number.NaN
	const time = value instanceof Date ? value.getTime() : new Date(value).getTime()
	return Number.isFinite(time) ? time : Number.NaN
}

/** Price in euros. Unusable input falls in the lowest range. */
export function priceBucket(price: number): PriceBucket {
	if (price >= 500) return '500_plus'
	if (price >= 200) return '200_499'
	if (price >= 100) return '100_199'
	if (price >= 50) return '50_99'
	if (price >= 25) return '25_49'
	return 'lt_25'
}

/** A number of items (results, bibs, listings...). Unusable or negative input counts as 0. */
export function countBucket(count: number): CountBucket {
	if (count >= 21) return '21_plus'
	if (count >= 6) return '6_20'
	if (count >= 2) return '2_5'
	if (count >= 1) return '1'
	return '0'
}

/** Whole days between now and the event. An event already started, or an unusable date, is 'past'. */
export function daysToEventBucket(
	eventDate: DateInput | null | undefined,
	now: DateInput = Date.now()
): DaysToEventBucket {
	const days = Math.floor((toTime(eventDate) - toTime(now)) / DAY_MS)
	if (days >= 91) return '91_plus'
	if (days >= 31) return '31_90'
	if (days >= 8) return '8_30'
	if (days >= 0) return '0_7'
	return 'past'
}

/** Whole days between now and a requested event date. A past or unusable date falls in '0_30'. */
export function leadTimeBucket(eventDate: DateInput | null | undefined, now: DateInput = Date.now()): LeadTimeBucket {
	const days = Math.floor((toTime(eventDate) - toTime(now)) / DAY_MS)
	if (days >= 181) return '181_plus'
	if (days >= 91) return '91_180'
	if (days >= 31) return '31_90'
	return '0_30'
}

/** A duration in milliseconds. Unusable input falls in the shortest range. */
export function elapsedBucket(milliseconds: number): ElapsedBucket {
	if (milliseconds > 600_000) return 'gt_10m'
	if (milliseconds >= 180_000) return '3_10m'
	if (milliseconds >= 60_000) return '1_3m'
	if (milliseconds >= 15_000) return '15_60s'
	return 'lt_15s'
}

/** An estimated reading time in minutes. Unusable input falls in the shortest range. */
export function readTimeBucket(minutes: number): ReadTimeBucket {
	if (minutes > 10) return 'gt_10'
	if (minutes >= 6) return '6_10'
	if (minutes >= 3) return '3_5'
	return '1_2'
}
