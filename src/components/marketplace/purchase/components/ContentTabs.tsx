'use client'

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Fragment } from 'react'
import marketplaceTranslations from '@/components/marketplace/locales.json'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { formatDateWithLocale } from '@/lib/utils/date'
import type { Event } from '@/models/event.model'
import type { BibSale } from '@/models/marketplace.model'

interface ContentTabsProps {
	/** The bib sale data */
	bib: BibSale
	/** Optional event data with additional details */
	eventData?: Event
	/** Locale for date formatting */
	locale: Locale
}

/**
 * Component that displays the details of the event. Beswib is archived: the FAQ and the terms of
 * purchase that used to sit in other tabs are gone with the payments they described.
 */
export default function ContentTabs({ locale, eventData, bib }: Readonly<ContentTabsProps>) {
	const t = getTranslations(locale, marketplaceTranslations)
	return (
		<div className="mx-auto mt-16 w-full max-w-2xl lg:col-span-4 lg:mt-0 lg:max-w-none">
			<TabGroup>
				{/* Tab Navigation */}
				<div className="border-border/20 border-b">
					<TabList className="-mb-px flex space-x-8">
						<Tab className="text-muted-foreground hover:border-muted-foreground hover:text-foreground data-[selected]:border-primary data-[selected]:text-primary cursor-pointer border-b-2 border-transparent py-6 text-sm font-medium whitespace-nowrap focus:outline-none">
							{t.tabEventDetails ?? 'Event Details'}
						</Tab>
					</TabList>
				</div>

				{/* Tab Content Panels */}
				<TabPanels as={Fragment}>
					{/* Event Details Panel */}
					<TabPanel className="py-10">
						<h3 className="sr-only">{t.tabEventDetails ?? 'Event Details'}</h3>
						<div className="space-y-6">
							{/* Essential Event Information Grid */}
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								{/* Key Details Card */}
								<div className="dark:border-border/50 bg-card/50 rounded-lg border border-black/50 p-6 backdrop-blur-sm">
									<h4 className="text-foreground mb-4 font-semibold">{t.raceInformation ?? 'Race Information'}</h4>
									<div className="space-y-4">
										<div>
											<p className="text-muted-foreground text-sm font-medium">{t.date ?? 'Date'}</p>
											<p className="text-foreground font-medium">{formatDateWithLocale(bib.event.date, locale)}</p>
										</div>
										<div>
											<p className="text-muted-foreground text-sm font-medium">{t.region ?? 'Location'}</p>
											<p className="text-foreground font-medium">{bib.event.location}</p>
										</div>
										<div>
											<p className="text-muted-foreground text-sm font-medium">{t.distance ?? 'Distance'}</p>
											<p className="text-foreground font-medium">
												{bib.event.distance}
												{bib.event.distanceUnit}
												{(eventData?.elevationGainM ?? 0) > 0 && (
													<span className="text-muted-foreground ml-2 text-sm">
														({t.elevation ?? 'elevation'} +{eventData?.elevationGainM}m)
													</span>
												)}
											</p>
										</div>
									</div>
								</div>

								{/* Transfer Deadline Warning Card */}
								{eventData?.transferDeadline && (
									<div className="rounded-lg border border-yellow-800/50 bg-yellow-500/10 p-6 backdrop-blur-sm dark:border-yellow-500/50 dark:bg-yellow-500/10">
										<h4 className="mb-3 font-semibold text-yellow-900 dark:text-yellow-300">
											{t.transferDeadline ?? 'Transfer Deadline'}
										</h4>
										<p className="mb-2 text-sm text-yellow-800 dark:text-yellow-200">
											{t.lastTransferDate ?? 'Last date for bib transfer:'}
										</p>
										<p className="text-xl font-bold text-black dark:text-yellow-100">
											{formatDateWithLocale(eventData.transferDeadline, locale)}
										</p>
									</div>
								)}
							</div>

							{/* What you get Card */}
							<div className="dark:border-border/50 bg-card/50 rounded-lg border border-black/50 p-6 backdrop-blur-sm">
								<h4 className="text-foreground mb-4 font-semibold">{t.whatYouGet ?? 'What you get'}</h4>
								<div className="text-foreground/80 space-y-2 text-sm">
									<div>• {t.whatGet1 ?? 'Official race bib transferred to your name'}</div>
									<div>• {t.whatGet2 ?? 'All race materials & timing chip'}</div>
									<div>• {t.whatGet3 ?? 'Secure transfer process'}</div>
								</div>
							</div>

							{/* Seller Information Card */}
							<div className="dark:border-border/50 bg-card/50 rounded-lg border border-black/50 p-6 backdrop-blur-sm">
								<h4 className="text-foreground mb-4 font-semibold">{t.sellerInformation ?? 'Seller Information'}</h4>
								<p className="text-muted-foreground text-sm">
									{`${t.soldBy ?? 'Sold by'} `}
									{bib.user.firstName ?? 'Anonymous'}.
								</p>
							</div>
						</div>
					</TabPanel>
				</TabPanels>
			</TabGroup>
		</div>
	)
}
