'use client'

import { ArchivedClosedCard } from '@/components/archive/ArchivedClosedCard'
import marketplaceTranslations from '@/components/marketplace/locales.json'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import type { Event } from '@/models/event.model'
import type { BibSale } from '@/models/marketplace.model'
import type { Organizer } from '@/models/organizer.model'
import { ContentTabs, EventDetails, EventImage, PriceDisplay } from './purchase/components'

interface BibDetailClientProps {
	bib: BibSale
	locale: Locale
	eventData?: Event & { expand?: { organizer: Organizer } }
	organizerData?: Organizer
}

/** The page of a bib, now that Beswib is archived: everything about the race, and no way to pay. */
export default function BibDetailClient({ organizerData, locale, eventData, bib }: Readonly<BibDetailClientProps>) {
	const t = getTranslations(locale, marketplaceTranslations)

	return (
		<div className="relative">
			<div className="mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
				<div className="lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 lg:gap-y-10 xl:gap-x-16">
					<div className="lg:col-span-4 lg:row-end-1">
						<EventImage bib={bib} eventData={eventData} locale={locale} />
					</div>

					<div className="mx-auto mt-14 max-w-2xl sm:mt-16 lg:col-span-3 lg:row-span-2 lg:row-end-2 lg:mt-0 lg:max-w-none">
						<div className="flex flex-col-reverse">
							<div className="mt-4">
								<h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{bib.event.name}</h1>
								<h2 id="information-heading" className="sr-only">
									{t.bibInformation ?? 'Bib information'}
								</h2>
								<p className="text-muted-foreground mt-2 text-sm">
									{bib.event.date.toLocaleDateString(locale)} • {bib.event.location}
								</p>
							</div>

							<div className="text-muted-foreground flex items-center gap-6 text-sm">
								<span>
									{bib.event.distance}
									{bib.event.distanceUnit}
									{(eventData?.elevationGainM ?? 0) > 0 && (
										<span className="text-muted-foreground/70"> (+{eventData?.elevationGainM}m)</span>
									)}
								</span>
								<span>
									{bib.event.participantCount.toLocaleString(locale)} {t.participants ?? 'participants'}
								</span>
							</div>
						</div>

						<EventDetails bib={bib} eventData={eventData} organizerData={organizerData} locale={locale} />
						<PriceDisplay bib={bib} eventData={eventData} locale={locale} />

						<div className="mt-10">
							<ArchivedClosedCard locale={locale} flow="purchase" />
						</div>
					</div>
				</div>

				<ContentTabs bib={bib} eventData={eventData} locale={locale} />
			</div>
		</div>
	)
}
