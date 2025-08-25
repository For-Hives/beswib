import { useEffect, useState } from 'react'

import { SelectAnimated, type SelectOption } from '@/components/ui/select-animated'
import { getAllOrganizersAction } from '@/app/[locale]/admin/actions'
import Translations from '@/app/[locale]/admin/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Organizer } from '@/models/organizer.model'
import { Label } from '@/components/ui/label'

import { EventSectionProps } from './types'

export default function OrganizerSection({ setValue, locale, formData, errors }: Readonly<EventSectionProps>) {
	const translations = getTranslations(locale, Translations)

	const [organizers, setOrganizers] = useState<Organizer[]>([])
	const [error, setError] = useState<null | string>(null)

	useEffect(() => {
		const loadOrganizers = async () => {
			try {
				setError(null)
				const result = await getAllOrganizersAction()

				if (result.success && result.data) {
					setOrganizers(result.data)
				} else {
					setError(result.error ?? 'Failed to load organizers')
					setOrganizers([])
				}
			} catch (error) {
				console.error('Error loading organizers:', error)
				setError('Failed to load organizers')
				setOrganizers([])
			}
		}

		void loadOrganizers()
	}, [])

	const organizerOptions: SelectOption[] = organizers.map(organizer => ({
		value: organizer.id,
		label: organizer.name ?? 'Unnamed Organizer',
		icon: organizer.isPartnered ? (
			<span className="bg-primary/10 text-primary rounded px-2 py-0.5 text-xs font-medium">
				{translations.event.fields.organizer.partnered}
			</span>
		) : undefined,
	}))

	return (
		<div className="grid grid-cols-1 gap-12 md:grid-cols-3">
			<div>
				<h2 className="text-foreground text-2xl font-semibold">{translations.event.sections.organizer.title}</h2>
				<p className="text-muted-foreground mt-2 text-base leading-7">
					{translations.event.sections.organizer.description}
				</p>
			</div>
			<div className="sm:max-w-4xl md:col-span-2">
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
					<div className="col-span-3">
						<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="organizer">
							{translations.event.fields.organizer.label} *
						</Label>

						{error != null && error !== '' && (
							<div className="mb-4 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400">
								{error}
							</div>
						)}

						<SelectAnimated
							onValueChange={(value: string) => setValue('organizer', value)}
							options={organizerOptions}
							placeholder={translations.event.fields.organizer.placeholder}
							value={formData.organizer ?? ''}
						/>
						{errors.organizer && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.organizer.message}</p>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
