import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'

import { COURSE_TYPES } from '@/types/course-types'
import * as v from 'valibot'

import adminTranslations from '@/app/[locale]/admin/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Locale } from '@/lib/i18n/config'

// Validation Schema using Valibot
export const EventCreationSchema = v.pipe(
	v.object({
		typeCourse: v.picklist(COURSE_TYPES),
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
	}),
	v.refine(
		data => {
			const beginDate = new Date(data.bibPickupWindowBeginDate)
			const endDate = new Date(data.bibPickupWindowEndDate)
			return beginDate < endDate
		},
		{
			path: ['bibPickupWindowBeginDate'],
			message: 'Bib pickup begin date must be before end date',
		}
	)
)

export type EventCreationFormData = v.Output<typeof EventCreationSchema>

export interface EventSectionProps {
	register: UseFormRegister<EventCreationFormData>
	setValue: UseFormSetValue<EventCreationFormData>
	locale: Locale
	formData: EventCreationFormData
	errors: FieldErrors<EventCreationFormData>
}

export type Translations = ReturnType<typeof getTranslations<(typeof adminTranslations)['en'], 'en'>>
