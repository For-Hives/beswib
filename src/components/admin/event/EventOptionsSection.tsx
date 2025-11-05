/** biome-ignore-all lint/suspicious/noArrayIndexKey: <the usage is ok, we know that the index is stable.> */
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { EventOption } from '@/models/eventOption.model'

import EventOptionCard from './EventOptionCard'
import type { EventSectionProps } from './types'

interface EventOptionsSectionProps extends EventSectionProps {
	eventOptions: EventOption[]
	setEventOptions: (options: EventOption[]) => void
}

import Translations from '@/app/[locale]/admin/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'

export default function EventOptionsSection({
	setValue,
	setEventOptions,
	locale,
	eventOptions,
}: Readonly<EventOptionsSectionProps>) {
	const translations = getTranslations(locale, Translations)

	const addEventOption = () => {
		const newOption: EventOption = {
			values: [''],
			required: false,
			label: '',
			// Do not generate a weird key by default; let user define it
			key: '',
		}
		setEventOptions([...eventOptions, newOption])
	}

	const updateEventOption = (index: number, field: keyof EventOption, value: boolean | string | string[]) => {
		const updated = eventOptions.map((option, i) => (i === index ? { ...option, [field]: value } : option))
		setValue('options', updated)
		setEventOptions(updated)
	}

	const removeEventOption = (index: number) => {
		const updated = eventOptions.filter((_, i) => i !== index)
		setValue('options', updated)
		setEventOptions(updated)
	}

	const addOptionValue = (optionIndex: number) => {
		const updated = eventOptions.map((option, i) =>
			i === optionIndex ? { ...option, values: [...option.values, ''] } : option
		)
		setValue('options', updated)
		setEventOptions(updated)
	}

	const updateOptionValue = (optionIndex: number, valueIndex: number, value: string) => {
		const updated = eventOptions.map((option, i) =>
			i === optionIndex
				? {
						...option,
						values: option.values.map((v, j) => (j === valueIndex ? value : v)),
					}
				: option
		)
		setValue('options', updated)
		setEventOptions(updated)
	}

	const removeOptionValue = (optionIndex: number, valueIndex: number) => {
		const updated = eventOptions.map((option, i) =>
			i === optionIndex ? { ...option, values: option.values.filter((_, j) => j !== valueIndex) } : option
		)
		setValue('options', updated)
		setEventOptions(updated)
	}

	return (
		<div className="grid grid-cols-1 gap-12 md:grid-cols-3">
			<div>
				<h2 className="text-foreground text-2xl font-semibold">{translations.event.sections.eventOptions.title}</h2>
				<p className="text-muted-foreground mt-2 text-base leading-7">
					{translations.event.sections.eventOptions.description}
				</p>
			</div>
			<div className="sm:max-w-4xl md:col-span-2">
				<div className="space-y-8">
					{eventOptions.map((option, optionIndex) => (
						<EventOptionCard
							// Use a stable key that doesn't depend on the editable "key" field
							key={`option-${optionIndex}`}
							locale={locale}
							onAddValue={addOptionValue}
							onRemove={removeEventOption}
							onRemoveValue={removeOptionValue}
							onUpdate={updateEventOption}
							onUpdateValue={updateOptionValue}
							option={option}
							optionIndex={optionIndex}
						/>
					))}

					<Button className="w-full" onClick={addEventOption} type="button" variant="outline">
						<Plus className="mr-2 size-4" />
						{translations.event.eventOptions.addOption}
					</Button>
				</div>
			</div>
		</div>
	)
}
