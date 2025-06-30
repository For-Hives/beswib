'use client'

import { useForm } from 'react-hook-form'
import { useState } from 'react'
import * as React from 'react'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'sonner'

import { createEventAction } from '@/app/[locale]/admin/actions'
import Translations from '@/app/[locale]/admin/locales.json'
import { EventOption } from '@/models/eventOption.model'
import { getTranslations } from '@/lib/getDictionary'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Event } from '@/models/event.model'
import { Locale } from '@/lib/i18n-config'

import EventInformationSection from './EventInformationSection'
import { EventCreationSchema, EventFormData } from './types'
import EventDetailsSection from './EventDetailsSection'
import EventOptionsSection from './EventOptionsSection'
import BibPickupSection from './BibPickupSection'
import OrganizerSection from './OrganizerSection'
import FakerButton from './FakerButton'

export interface EventCreationFormProps {
	locale: Locale
	onCancel?: () => void
	onSuccess?: (event: Event) => void
}

export default function EventCreationForm({ onSuccess, onCancel, locale }: Readonly<EventCreationFormProps>) {
	const translations = getTranslations(locale, Translations)

	const [isLoading, setIsLoading] = useState(false)
	const [eventOptions, setEventOptions] = useState<EventOption[]>([])

	const {
		watch,
		setValue,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<EventFormData>({
		resolver: valibotResolver(EventCreationSchema),
		defaultValues: {
			typeCourse: 'route',
			participants: 1,
			options: [],
		},
	})

	const formData = watch()

	const onSubmit = async (data: EventFormData) => {
		setIsLoading(true)

		try {
			// Prepare event data - convert to proper types for PocketBase
			const eventData: Omit<Event, 'id'> = {
				typeCourse: data.typeCourse,
				transferDeadline:
					data.transferDeadline !== null && data.transferDeadline !== undefined && data.transferDeadline !== ''
						? new Date(data.transferDeadline)
						: undefined,
				registrationUrl: data.registrationUrl ?? undefined,
				participants: data.participants,
				parcoursUrl: data.parcoursUrl ?? undefined,
				organizer: data.organizer,
				options:
					data.options !== null && data.options !== undefined && data.options.length > 0
						? (data.options.filter(option => option !== undefined) as EventOption[])
						: null,
				officialStandardPrice: data.officialStandardPrice,
				name: data.name,
				location: data.location,
				eventDate: new Date(data.eventDate),
				elevationGainM: data.elevationGainM,
				distanceKm: data.distanceKm,
				description: data.description,
				bibPickupWindowEndDate: new Date(data.bibPickupWindowEndDate),
				bibPickupWindowBeginDate: new Date(data.bibPickupWindowBeginDate),
				bibPickupLocation: data.bibPickupLocation ?? undefined,
			}

			const result = await createEventAction(eventData)

			if (result.success && result.data) {
				toast.success('Event created successfully!')
				onSuccess?.(result.data)
			} else {
				throw new Error(result.error ?? 'Failed to create event')
			}
		} catch (error) {
			console.error('Error creating event:', error)
			toast.error(error instanceof Error ? error.message : 'Failed to create event')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br pt-24">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
			<div className="relative flex items-center justify-center p-6 md:p-10">
				<form
					className="border-border/50 bg-card/80 relative w-full max-w-7xl rounded-3xl border p-8 shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md md:p-12"
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					onSubmit={handleSubmit(onSubmit)}
				>
					{/* Faker Button - Development only */}
					<FakerButton setEventOptions={setEventOptions} setValue={setValue} />

					<div className="mb-12 text-left">
						<h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">
							{translations.event.title}
						</h1>
						<p className="text-muted-foreground mt-4 text-lg">{translations.event.subtitle}</p>
					</div>

					{/* Global form error */}
					{errors.root && (
						<div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
							{errors.root.message}
						</div>
					)}

					{/* Event Information Section */}
					<EventInformationSection
						errors={errors}
						formData={formData}
						locale={locale}
						register={register}
						setValue={setValue}
					/>

					<Separator className="my-12" />

					{/* Organizer Section */}
					<OrganizerSection
						errors={errors}
						formData={formData}
						locale={locale}
						register={register}
						setValue={setValue}
					/>

					<Separator className="my-12" />

					{/* Event Details Section */}
					<EventDetailsSection
						errors={errors}
						formData={formData}
						locale={locale}
						register={register}
						setValue={setValue}
					/>

					<Separator className="my-12" />

					{/* Bib Pickup Information Section */}
					<BibPickupSection
						errors={errors}
						formData={formData}
						locale={locale}
						register={register}
						setValue={setValue}
					/>

					<Separator className="my-12" />

					{/* Event Options Section */}
					<EventOptionsSection
						errors={errors}
						eventOptions={eventOptions}
						formData={formData}
						locale={locale}
						register={register}
						setEventOptions={setEventOptions}
						setValue={setValue}
					/>

					<Separator className="my-12" />

					{/* Form Actions */}
					<div className="flex items-center justify-end space-x-6 pt-8">
						{onCancel && (
							<Button disabled={isLoading} onClick={onCancel} size="lg" type="button" variant="outline">
								{translations.event.buttons.cancel}
							</Button>
						)}
						<Button disabled={isLoading} size="lg" type="submit">
							{isLoading ? translations.event.buttons.creating : translations.event.buttons.createEvent}
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}
