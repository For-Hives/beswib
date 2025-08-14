import { SelectAnimated, type SelectOption } from '@/components/ui/select-animated'
import Translations from '@/app/[locale]/admin/locales.json'
import { Textarea } from '@/components/ui/textareaAlt'
import { DateInput } from '@/components/ui/date-input'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Input } from '@/components/ui/inputAlt'
import { Label } from '@/components/ui/label'

import { EventSectionProps } from './types'

export default function EventInformationSection({
	setValue,
	register,
	locale,
	formData,
	errors,
}: Readonly<EventSectionProps>) {
	const translations = getTranslations(locale, Translations)

	const typeOptions: SelectOption[] = [
		{ value: 'road', label: translations.event.fields.eventType.options.route },
		{ value: 'trail', label: translations.event.fields.eventType.options.trail },
		{ value: 'triathlon', label: translations.event.fields.eventType.options.triathlon },
		{ value: 'cycle', label: translations.event.fields.eventType.options.ultra },
	]

	return (
		<div className="grid grid-cols-1 gap-12 md:grid-cols-3">
			<div>
				<h2 className="text-foreground text-2xl font-semibold">{translations.event.sections.eventInformation.title}</h2>
				<p className="text-muted-foreground mt-2 text-base leading-7">
					{translations.event.sections.eventInformation.description}
				</p>
			</div>
			<div className="sm:max-w-4xl md:col-span-2">
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
					<div className="col-span-full sm:col-span-3">
						<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="name">
							{translations.event.fields.eventName.label} *
						</Label>
						<Input
							id="name"
							{...register('name')}
							placeholder={translations.event.fields.eventName.placeholder}
							type="text"
						/>
						{errors.name && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{String(errors.name.message)}</p>
						)}
					</div>
					<div className="col-span-full sm:col-span-3">
						<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="location">
							{translations.event.fields.location.label} *
						</Label>
						<Input
							id="location"
							{...register('location')}
							placeholder={translations.event.fields.location.placeholder}
							type="text"
						/>
						{errors.location && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{String(errors.location.message)}</p>
						)}
					</div>
					<div className="col-span-full sm:col-span-3">
						<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="eventDate">
							{translations.event.fields.eventDate.label} *
						</Label>
						<DateInput id="eventDate" locale={locale} {...register('eventDate')} />
						{errors.eventDate && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{String(errors.eventDate.message)}</p>
						)}
					</div>
					<div className="col-span-full sm:col-span-3">
						<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="typeCourse">
							{translations.event.fields.eventType.label} *
						</Label>
						<SelectAnimated
							onValueChange={(value: string) =>
								setValue('typeCourse', value as 'road' | 'trail' | 'triathlon' | 'cycle')
							}
							options={typeOptions}
							placeholder={translations.event.fields.eventType.placeholder}
							value={formData.typeCourse ?? 'road'}
						/>
						{errors.typeCourse && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{String(errors.typeCourse.message)}</p>
						)}
					</div>
					<div className="col-span-full">
						<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="description">
							{translations.event.fields.description.label} *
						</Label>
						<Textarea
							id="description"
							{...register('description')}
							placeholder={translations.event.fields.description.placeholder}
							rows={4}
						/>
						{errors.description && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{String(errors.description.message)}</p>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
