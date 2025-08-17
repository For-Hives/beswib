'use client'

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import React, { Fragment } from 'react'

import Link from 'next/link'

import type { BibSale } from '@/models/marketplace.model'
import type { Event } from '@/models/event.model'
import type { Locale } from '@/lib/i18n/config'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import marketplaceTranslations from '@/components/marketplace/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { formatDateWithLocale } from '@/lib/utils/date'

interface ContentTabsProps {
	/** The bib sale data */
	bib: BibSale
	/** Optional event data with additional details */
	eventData?: Event
	/** Locale for date formatting */
	locale: Locale
}

/**
 * Component that displays tabbed content including event details, FAQ, and terms
 * Organizes information in an easy-to-navigate tab structure
 */
export default function ContentTabs({ locale, eventData, bib }: Readonly<ContentTabsProps>) {
	const t = getTranslations(locale, marketplaceTranslations)
	// FAQ data
	const faqs = [
		{
			question: t.faqQ1 ?? 'How does the bib transfer process work?',
			answer:
				t.faqA1 ??
				"Once you complete your purchase, we'll coordinate with the seller to transfer the bib registration to your name. You'll receive all necessary confirmation details and pickup instructions.",
		},
		{
			question: t.faqQ2 ?? 'Is my payment secure?',
			answer:
				t.faqA2 ??
				"Yes! All payments are processed through PayPal's secure platform. We never store your payment information, and all transactions are protected by PayPal's buyer protection policy.",
		},
		{
			question: t.faqQ3 ?? 'What if the event gets cancelled?',
			answer:
				t.faqA3 ??
				"In case of event cancellation, you'll be eligible for a full refund according to the event organizer's cancellation policy. We'll handle the refund process on your behalf.",
		},
		{
			question: t.faqQ4 ?? "Can I resell the bib if I can't participate?",
			answer:
				t.faqA4 ??
				'Yes, you can list your bib for resale on our platform up until the transfer deadline set by the event organizer. This helps other runners who are looking for last-minute entries.',
		},
	]

	// Terms data
	const terms = {
		summary:
			t.termsSummary ??
			"By purchasing this bib, you agree to our terms of service and the event organizer's participation rules.",
		href: '/legals/terms/',
	}

	return (
		<div className="mx-auto mt-16 w-full max-w-2xl lg:col-span-4 lg:mt-0 lg:max-w-none">
			<TabGroup>
				{/* Tab Navigation */}
				<div className="border-border/20 border-b">
					<TabList className="-mb-px flex space-x-8">
						<Tab className="text-muted-foreground hover:border-muted-foreground hover:text-foreground data-[selected]:border-primary data-[selected]:text-primary cursor-pointer border-b-2 border-transparent py-6 text-sm font-medium whitespace-nowrap focus:outline-none">
							{t.tabEventDetails ?? 'Event Details'}
						</Tab>
						<Tab className="text-muted-foreground hover:border-muted-foreground hover:text-foreground data-[selected]:border-primary data-[selected]:text-primary cursor-pointer border-b-2 border-transparent py-6 text-sm font-medium whitespace-nowrap focus:outline-none">
							{t.tabFAQ ?? 'FAQ'}
						</Tab>
						<Tab className="text-muted-foreground hover:border-muted-foreground hover:text-foreground data-[selected]:border-primary data-[selected]:text-primary cursor-pointer border-b-2 border-transparent py-6 text-sm font-medium whitespace-nowrap focus:outline-none">
							{t.tabTerms ?? 'Terms'}
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
										<p className="mt-3 text-xs text-yellow-800 dark:text-yellow-200">
											{t.completeBeforeDate ?? 'Complete your purchase before this date to ensure transfer'}
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
									{(t.soldBy ?? 'Sold by') + ' '}
									{bib.user.firstName ?? 'Anonymous'}.
								</p>
							</div>

							{/* Terms & Conditions Card */}
							<div className="dark:border-border/50 bg-card/50 rounded-lg border border-black/50 p-6 backdrop-blur-sm">
								<h4 className="text-foreground mb-4 font-semibold">{t.termsAndConditions ?? 'Terms & Conditions'}</h4>
								<p className="text-muted-foreground text-sm">
									{terms.summary}{' '}
									<Link href={terms.href} className="text-primary hover:text-primary/80 font-medium underline">
										{t.readFullTerms ?? 'Read full terms'}
									</Link>
								</p>
							</div>
						</div>
					</TabPanel>

					{/* FAQ Panel */}
					<TabPanel className="py-10">
						<h3 className="sr-only">{t.tabFAQ ?? 'Frequently Asked Questions'}</h3>
						<Accordion className="w-full" collapsible type="single">
							{faqs.map(faq => (
								<AccordionItem key={faq.question} value={faq.question}>
									<AccordionTrigger className="text-foreground text-left">{faq.question}</AccordionTrigger>
									<AccordionContent className="text-muted-foreground text-sm leading-6">{faq.answer}</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</TabPanel>

					{/* Terms Panel */}
					<TabPanel className="py-10">
						<h3 className="sr-only">{t.tabTerms ?? 'Detailed Terms & Conditions'}</h3>
						<Accordion className="w-full" collapsible type="single">
							<AccordionItem value="purchase-terms">
								<AccordionTrigger className="text-foreground text-left">
									{t.termsOfPurchase ?? 'Terms of Purchase'}
								</AccordionTrigger>
								<AccordionContent className="text-muted-foreground text-sm leading-6">
									<p className="mb-4">
										{t.termsIntro ?? 'By purchasing this race bib, you agree to the following terms and conditions.'}
									</p>
									<ul className="list-disc space-y-1 pl-5">
										<li>
											{t.termsItem1 ?? 'You must provide accurate personal information for bib registration transfer.'}
										</li>
										<li>{t.termsItem2 ?? 'You agree to abide by all event organizer rules and regulations.'}</li>
										<li>
											{t.termsItem3 ?? 'Medical certificates may be required depending on the event requirements.'}
										</li>
									</ul>
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="whats-included">
								<AccordionTrigger className="text-foreground text-left">
									{t.whatYouGet ?? "What's included"}
								</AccordionTrigger>
								<AccordionContent className="text-muted-foreground text-sm leading-6">
									<ul className="list-disc space-y-1 pl-5">
										<li>{t.whatInc1 ?? 'Official race bib with your name and details.'}</li>
										<li>{t.whatInc2 ?? 'All event-specific materials (timing chip, race packet, etc.).'}</li>
										<li>{t.whatInc3 ?? 'Support throughout the transfer process.'}</li>
									</ul>
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="important-notes">
								<AccordionTrigger className="text-foreground text-left">
									{t.importantNotes ?? 'Important Notes'}
								</AccordionTrigger>
								<AccordionContent className="text-muted-foreground text-sm leading-6">
									<ul className="list-disc space-y-1 pl-5">
										<li>{t.note1 ?? "Bib transfers must be completed before the event organizer's deadline."}</li>
										<li>{t.note2 ?? 'Some events may require additional documentation or fees.'}</li>
										<li>{t.note3 ?? "Refunds are subject to the event organizer's cancellation policy."}</li>
									</ul>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</TabPanel>
				</TabPanels>
			</TabGroup>
		</div>
	)
}
