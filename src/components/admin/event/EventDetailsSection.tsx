import Translations from '@/app/[locale]/admin/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { DateInput } from '@/components/ui/date-input'
import { Input } from '@/components/ui/inputAlt'
import { Label } from '@/components/ui/label'

import { EventSectionProps } from './types'

export default function EventDetailsSection({ register, locale, errors }: Readonly<EventSectionProps>) {
	const translations = getTranslations(locale, Translations)

	return (
		<div className="grid grid-cols-1 gap-12 md:grid-cols-3">
			<div>
				<h2 className="text-foreground text-2xl font-semibold">{translations.event.sections.eventDetails.title}</h2>
				<p className="text-muted-foreground mt-2 text-base leading-7">
					{translations.event.sections.eventDetails.description}
				</p>
			</div>
			<div className="sm:max-w-4xl md:col-span-2">
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
					<div className="col-span-full sm:col-span-3">
						<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="distanceKm">
							{translations.event.fields.distance.label}
						</Label>
						<Input
							id="distanceKm"
							{...register('distanceKm', { valueAsNumber: true })}
							placeholder={translations.event.fields.distance.placeholder}
							step="0.001"
							type="number"
						/>
						{errors.distanceKm && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.distanceKm.message}</p>
						)}
					</div>
					<div className="col-span-full sm:col-span-3">
						<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="elevationGainM">
							{translations.event.fields.elevationGain.label}
						</Label>
						<Input
							id="elevationGainM"
							{...register('elevationGainM', { valueAsNumber: true })}
							placeholder={translations.event.fields.elevationGain.placeholder}
							type="number"
						/>
						{errors.elevationGainM && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.elevationGainM.message}</p>
						)}
					</div>
					<div className="col-span-full sm:col-span-3">
						<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="officialStandardPrice">
							{translations.event.fields.officialPrice.label}
						</Label>
						<Input
							id="officialStandardPrice"
							{...register('officialStandardPrice', { valueAsNumber: true })}
							placeholder={translations.event.fields.officialPrice.placeholder}
							step="0.01"
							type="number"
						/>
						{errors.officialStandardPrice && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.officialStandardPrice.message}</p>
						)}
					</div>
					<div className="col-span-full sm:col-span-3">
						<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="participants">
							{translations.event.fields.participantCount.label} *
						</Label>
						<Input
							id="participants"
							{...register('participants', { valueAsNumber: true })}
							placeholder={translations.event.fields.participantCount.placeholder}
							type="number"
						/>
						{errors.participants && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.participants.message}</p>
						)}
					</div>
					<div className="col-span-full sm:col-span-3">
						<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="transferDeadline">
							{translations.event.fields.transferDeadline.label}
						</Label>
						<DateInput id="transferDeadline" locale={locale} {...register('transferDeadline')} />
						{errors.transferDeadline && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.transferDeadline.message}</p>
						)}
					</div>
					<div className="col-span-full sm:col-span-3">
						<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="parcoursUrl">
							{translations.event.fields.parcoursUrl.label}
						</Label>
						<Input
							id="parcoursUrl"
							{...register('parcoursUrl')}
							placeholder={translations.event.fields.parcoursUrl.placeholder}
							type="url"
						/>
						{errors.parcoursUrl && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.parcoursUrl.message}</p>
						)}
					</div>
					<div className="col-span-full">
						<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="registrationUrl">
							{translations.event.fields.registrationUrl.label}
						</Label>
						<Input
							id="registrationUrl"
							{...register('registrationUrl')}
							placeholder={translations.event.fields.registrationUrl.placeholder}
							type="url"
						/>
						{errors.registrationUrl && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.registrationUrl.message}</p>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
