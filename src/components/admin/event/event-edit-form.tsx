'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as React from 'react'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'sonner'

import { updateEventAction } from '@/app/[locale]/admin/actions'
import Translations from '@/app/[locale]/admin/locales.json'
import { formatDateForHTMLInput } from '@/lib/utils/date'
import { EventOption } from '@/models/eventOption.model'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Event } from '@/models/event.model'
import { Locale } from '@/lib/i18n/config'

import EventInformationSection from './EventInformationSection'
import { EventCreationSchema, EventFormData } from './types'
import EventDetailsSection from './EventDetailsSection'
import EventOptionsSection from './EventOptionsSection'
import BibPickupSection from './BibPickupSection'
import OrganizerSection from './OrganizerSection'

export interface EventEditFormProps {
	locale: Locale
	event: Event
	onCancel?: () => void
	onSuccess?: (event: Event) => void
}

export default function EventEditForm({ onSuccess, onCancel, locale, event }: Readonly<EventEditFormProps>) {
	const translations = getTranslations(locale, Translations)

	const [isLoading, setIsLoading] = useState(false)
	const [eventOptions, setEventOptions] = useState<EventOption[]>([])

	const {
		watch,
		setValue,
		reset,
		register,
		formState: { errors },
	} = useForm<EventFormData>({
		resolver: valibotResolver(EventCreationSchema),
		defaultValues: {
			typeCourse: 'road',
			participants: 1,
			options: [],
		},
	})

	// Initialize form with event data
	useEffect(() => {
		if (event != null) {
			// Set form values with existing event data
			reset({
				typeCourse: event.typeCourse ?? 'road',
				transferDeadline: formatDateForHTMLInput(event.transferDeadline),
				registrationUrl: event.registrationUrl ?? '',
				participants: event.participants ?? 1,
				parcoursUrl: event.parcoursUrl ?? '',
				organizer: event.organizer ?? '',
				options: event.options ?? [],
				officialStandardPrice: event.officialStandardPrice ?? 0,
				name: event.name ?? '',
				location: event.location ?? '',
				eventDate: formatDateForHTMLInput(event.eventDate),
				elevationGainM: event.elevationGainM ?? 0,
				distanceKm: event.distanceKm ?? 0,
				description: event.description ?? '',
				bibPickupWindowEndDate: formatDateForHTMLInput(event.bibPickupWindowEndDate),
				bibPickupWindowBeginDate: formatDateForHTMLInput(event.bibPickupWindowBeginDate),
				bibPickupLocation: event.bibPickupLocation ?? '',
			})

			// Set event options if they exist
			if (event.options != null && Array.isArray(event.options)) {
				setEventOptions(event.options)
			}
		}
	}, [event, reset])

	const formData = watch()

	const onSubmit = async (data: EventFormData) => {
		setIsLoading(true)

		try {
			// Prepare event data - convert to proper types for PocketBase
			const eventData: Partial<Event> = {
				typeCourse: data.typeCourse,
				transferDeadline:
					data.transferDeadline != null && data.transferDeadline !== undefined && data.transferDeadline !== ''
						? new Date(data.transferDeadline)
						: undefined,
				registrationUrl: data.registrationUrl ?? undefined,
				participants: data.participants,
				parcoursUrl: data.parcoursUrl ?? undefined,
				organizer: data.organizer,
				options:
					data.options != null && data.options !== undefined && data.options.length > 0
						? (data.options.filter((option: unknown) => option !== undefined) as EventOption[])
						: null,
				officialStandardPrice: data.officialStandardPrice,
				name: data.name,
				location: data.location,
				id: event.id, // Include the ID for update
				eventDate: new Date(data.eventDate),
				elevationGainM: data.elevationGainM,
				distanceKm: data.distanceKm,
				description: data.description,
				bibPickupWindowEndDate: new Date(data.bibPickupWindowEndDate),
				bibPickupWindowBeginDate: new Date(data.bibPickupWindowBeginDate),
				bibPickupLocation: data.bibPickupLocation ?? undefined,
			}

			const result = await updateEventAction(event.id, eventData)

			if (result?.success && result?.data) {
				const updateMessage = getUpdateMessage()
				toast.success(updateMessage.replace('{eventName}', data.name))
				onSuccess?.(result.data)
			} else {
				throw new Error(result?.error ?? 'Failed to update event')
			}
		} catch (error) {
			console.error('Error updating event:', error)
			toast.error(error instanceof Error ? error.message : 'Failed to update event')
		} finally {
			setIsLoading(false)
		}
	}

	// Helper functions to safely access translations with fallbacks
	const getEditTitle = (): string => {
		const eventTranslations = translations.event as Record<string, unknown>
		const editTitle = eventTranslations?.editTitle
		return typeof editTitle === 'string' ? editTitle : "Modifier l'événement"
	}

	const getEditSubtitle = (): string => {
		const eventTranslations = translations.event as Record<string, unknown>
		const editSubtitle = eventTranslations?.editSubtitle
		return typeof editSubtitle === 'string' ? editSubtitle : 'Modifiez les informations de l\'événement "{eventName}"'
	}

	const getUpdateMessage = (): string => {
		const successTranslations = translations.event.success as Record<string, unknown>
		const updateMessage = successTranslations?.updateMessage
		return typeof updateMessage === 'string' ? updateMessage : 'L\'événement "{eventName}" a été modifié avec succès !'
	}

	const getEditingText = (): string => {
		const buttonTranslations = translations.event.buttons as Record<string, unknown>
		const editingText = buttonTranslations?.editing
		return typeof editingText === 'string' ? editingText : 'Modification...'
	}

	const getModifyEventText = (): string => {
		const buttonTranslations = translations.event.buttons as Record<string, unknown>
		const modifyEventText = buttonTranslations?.modifyEvent
		return typeof modifyEventText === 'string' ? modifyEventText : "Modifier l'événement"
	}

	const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const data = Object.fromEntries(formData) as unknown as EventFormData

		onSubmit(data).catch(console.error)
	}

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br pt-24">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
			<div className="relative flex items-center justify-center p-6 md:p-10">
				<form
					className="dark:border-border/50 bg-card/80 relative w-full max-w-7xl rounded-3xl border border-black/50 p-8 shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md md:p-12"
					onSubmit={handleFormSubmit}
				>
					<div className="mb-12 text-left">
						<h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">{getEditTitle()}</h1>
						<p className="text-muted-foreground mt-4 text-lg">{getEditSubtitle().replace('{eventName}', event.name)}</p>
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
							{isLoading ? getEditingText() : getModifyEventText()}
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}
