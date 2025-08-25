import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'

import * as v from 'valibot'

import adminTranslations from '@/app/[locale]/admin/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Locale } from '@/lib/i18n/config'

// Validation Schema using Valibot
export const EventCreationSchema = v.pipe(
	v.object({
		typeCourse: v.picklist(['road', 'trail', 'triathlon', 'cycle']),
		transferDeadline: v.optional(v.string()),
		registrationUrl: v.optional(v.union([v.pipe(v.string(), v.url('Must be a valid URL')), v.literal('')])),
		participants: v.pipe(v.number(), v.minValue(1, 'Participant count must be at least 1')),
		parcoursUrl: v.optional(v.union([v.pipe(v.string(), v.url('Must be a valid URL')), v.literal('')])),
		organizer: v.pipe(v.string(), v.minLength(1, 'Organizer is required')),
		options: v.optional(
			v.array(
				v.optional(
					v.object({
						values: v.pipe(v.array(v.string()), v.minLength(1, 'At least one value is required')),
						required: v.boolean(),
						label: v.pipe(v.string(), v.minLength(1, 'Option label is required')),
						key: v.pipe(v.string(), v.minLength(1, 'Option key is required')),
					})
				)
			)
		),
		officialStandardPrice: v.optional(v.pipe(v.number(), v.minValue(0, 'Price must be positive'))),
		name: v.pipe(v.string(), v.minLength(1, 'Event name is required')),
		location: v.pipe(v.string(), v.minLength(1, 'Location is required')),
		isPartnered: v.boolean(),
		eventDate: v.pipe(v.string(), v.minLength(1, 'Event date is required')),
		elevationGainM: v.optional(v.pipe(v.number(), v.minValue(0, 'Elevation gain must be positive'))),
		distanceKm: v.optional(v.pipe(v.number(), v.minValue(0, 'Distance must be positive'))),
		description: v.pipe(v.string(), v.minLength(1, 'Description is required')),
		bibPickupWindowEndDate: v.pipe(v.string(), v.minLength(1, 'Bib pickup end date is required')),
		bibPickupWindowBeginDate: v.pipe(v.string(), v.minLength(1, 'Bib pickup begin date is required')),
		bibPickupLocation: v.optional(v.string()),
	}),
	v.check(data => {
		const eventDate = new Date(data.eventDate)
		const beginDate = new Date(data.bibPickupWindowBeginDate)
		const endDate = new Date(data.bibPickupWindowEndDate)

		if (beginDate >= endDate) {
			return false
		}

		if (data.transferDeadline !== undefined && data.transferDeadline != null && data.transferDeadline !== '') {
			const transferDate = new Date(data.transferDeadline)
			if (transferDate >= eventDate) {
				return false
			}
		}

		return true
	}, 'Invalid date relationships: pickup begin must be before end, and transfer deadline must be before event date')
)

export type EventFormData = v.InferOutput<typeof EventCreationSchema>

export interface EventSectionProps {
	errors: FieldErrors<EventFormData>
	formData: EventFormData
	locale: Locale
	register: UseFormRegister<EventFormData>
	setValue: UseFormSetValue<EventFormData>
}

export type Translations = ReturnType<typeof getTranslations<(typeof adminTranslations)['en'], 'en'>>
