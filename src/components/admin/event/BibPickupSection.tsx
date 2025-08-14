import Translations from '@/app/[locale]/admin/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { DateInput } from '@/components/ui/date-input'
import { Input } from '@/components/ui/inputAlt'
import { Label } from '@/components/ui/label'

import { EventSectionProps } from './types'

export default function BibPickupSection({ register, locale, errors }: Readonly<EventSectionProps>) {
	const translations = getTranslations(locale, Translations)

	return (
		<div className="grid grid-cols-1 gap-12 md:grid-cols-3">
			<div>
				<h2 className="text-foreground text-2xl font-semibold">{translations.event.sections.bibPickup.title}</h2>
				<p className="text-muted-foreground mt-2 text-base leading-7">
					{translations.event.sections.bibPickup.description}
				</p>
			</div>
			<div className="sm:max-w-4xl md:col-span-2">
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
					<div className="col-span-full">
						<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="bibPickupLocation">
							{translations.event.fields.bibPickupLocation.label}
						</Label>
						<Input
							id="bibPickupLocation"
							{...register('bibPickupLocation')}
							placeholder={translations.event.fields.bibPickupLocation.placeholder}
							type="text"
						/>
						{errors.bibPickupLocation && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bibPickupLocation.message}</p>
						)}
					</div>
					<div className="col-span-full sm:col-span-3">
						<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="bibPickupWindowBeginDate">
							{translations.event.fields.bibPickupBegin.label} *
						</Label>
						<DateInput id="bibPickupWindowBeginDate" locale={locale} {...register('bibPickupWindowBeginDate')} />
						{errors.bibPickupWindowBeginDate && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bibPickupWindowBeginDate.message}</p>
						)}
					</div>
					<div className="col-span-full sm:col-span-3">
						<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="bibPickupWindowEndDate">
							{translations.event.fields.bibPickupEnd.label} *
						</Label>
						<DateInput id="bibPickupWindowEndDate" locale={locale} {...register('bibPickupWindowEndDate')} />
						{errors.bibPickupWindowEndDate && (
							<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bibPickupWindowEndDate.message}</p>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
