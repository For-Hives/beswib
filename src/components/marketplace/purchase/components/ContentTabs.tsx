'use client'

import React, { Fragment } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { formatDateWithLocale } from '@/lib/dateUtils'
import type { BibSale } from '@/components/marketplace/CardMarket'
import type { Event } from '@/models/event.model'
import type { Locale } from '@/lib/i18n-config'

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
export default function ContentTabs({ bib, eventData, locale }: ContentTabsProps) {
	// FAQ data
	const faqs = [
		{
			question: 'How does the bib transfer process work?',
			answer:
				"Once you complete your purchase, we'll coordinate with the seller to transfer the bib registration to your name. You'll receive all necessary confirmation details and pickup instructions.",
		},
		{
			question: 'Is my payment secure?',
			answer:
				"Yes! All payments are processed through PayPal's secure platform. We never store your payment information, and all transactions are protected by PayPal's buyer protection policy.",
		},
		{
			question: 'What if the event gets cancelled?',
			answer:
				"In case of event cancellation, you'll be eligible for a full refund according to the event organizer's cancellation policy. We'll handle the refund process on your behalf.",
		},
		{
			question: "Can I resell the bib if I can't participate?",
			answer:
				'Yes, you can list your bib for resale on our platform up until the transfer deadline set by the event organizer. This helps other runners who are looking for last-minute entries.',
		},
	]

	// Terms data
	const terms = {
		href: '#',
		summary: "By purchasing this bib, you agree to our terms of service and the event organizer's participation rules.",
	}

	return (
		<div className="mx-auto mt-16 w-full max-w-2xl lg:col-span-4 lg:mt-0 lg:max-w-none">
			<TabGroup>
				{/* Tab Navigation */}
				<div className="border-border/20 border-b">
					<TabList className="-mb-px flex space-x-8">
						<Tab className="text-muted-foreground hover:border-muted-foreground hover:text-foreground data-[selected]:border-primary data-[selected]:text-primary border-b-2 border-transparent py-6 text-sm font-medium whitespace-nowrap focus:outline-none">
							Event Details
						</Tab>
						<Tab className="text-muted-foreground hover:border-muted-foreground hover:text-foreground data-[selected]:border-primary data-[selected]:text-primary border-b-2 border-transparent py-6 text-sm font-medium whitespace-nowrap focus:outline-none">
							FAQ
						</Tab>
						<Tab className="text-muted-foreground hover:border-muted-foreground hover:text-foreground data-[selected]:border-primary data-[selected]:text-primary border-b-2 border-transparent py-6 text-sm font-medium whitespace-nowrap focus:outline-none">
							Terms
						</Tab>
					</TabList>
				</div>

				{/* Tab Content Panels */}
				<TabPanels as={Fragment}>
					{/* Event Details Panel */}
					<TabPanel className="py-10">
						<h3 className="sr-only">Event Details</h3>
						<div className="space-y-6">
							{/* Essential Event Information Grid */}
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								{/* Key Details Card */}
								<div className="border-border/50 bg-card/50 rounded-lg border p-6 backdrop-blur-sm">
									<h4 className="text-foreground mb-4 font-semibold">Race Information</h4>
									<div className="space-y-4">
										<div>
											<p className="text-muted-foreground text-sm font-medium">Date</p>
											<p className="text-foreground font-medium">{formatDateWithLocale(bib.event.date, locale)}</p>
										</div>
										<div>
											<p className="text-muted-foreground text-sm font-medium">Location</p>
											<p className="text-foreground font-medium">{bib.event.location}</p>
										</div>
										<div>
											<p className="text-muted-foreground text-sm font-medium">Distance</p>
											<p className="text-foreground font-medium">
												{bib.event.distance}
												{bib.event.distanceUnit}
												{(eventData?.elevationGainM ?? 0) > 0 && (
													<span className="text-muted-foreground ml-2 text-sm">
														(+{eventData?.elevationGainM}m elevation)
													</span>
												)}
											</p>
										</div>
									</div>
								</div>

								{/* Transfer Deadline Warning Card */}
								{eventData?.transferDeadline && (
									<div className="rounded-lg border border-yellow-800/50 bg-yellow-500/10 p-6 backdrop-blur-sm dark:border-yellow-500/50 dark:bg-yellow-500/10">
										<h4 className="mb-3 font-semibold text-yellow-900 dark:text-yellow-300">Transfer Deadline</h4>
										<p className="mb-2 text-sm text-yellow-800 dark:text-yellow-200">Last date for bib transfer:</p>
										<p className="text-xl font-bold text-black dark:text-yellow-100">
											{formatDateWithLocale(eventData.transferDeadline, locale)}
										</p>
										<p className="mt-3 text-xs text-yellow-800 dark:text-yellow-200">
											Complete your purchase before this date to ensure transfer
										</p>
									</div>
								)}
							</div>

							{/* What you get Card */}
							<div className="border-border/50 bg-card/50 rounded-lg border p-6 backdrop-blur-sm">
								<h4 className="text-foreground mb-4 font-semibold">What you get</h4>
								<div className="text-foreground/80 space-y-2 text-sm">
									<div>• Official race bib transferred to your name</div>
									<div>• All race materials & timing chip</div>
									<div>• Secure transfer process</div>
								</div>
							</div>

							{/* Seller Information Card */}
							<div className="border-border/50 bg-card/50 rounded-lg border p-6 backdrop-blur-sm">
								<h4 className="text-foreground mb-4 font-semibold">Seller Information</h4>
								<p className="text-muted-foreground text-sm">Sold by {bib.user.firstName ?? 'Anonymous'}.</p>
							</div>

							{/* Terms & Conditions Card */}
							<div className="border-border/50 bg-card/50 rounded-lg border p-6 backdrop-blur-sm">
								<h4 className="text-foreground mb-4 font-semibold">Terms & Conditions</h4>
								<p className="text-muted-foreground text-sm">
									{terms.summary}{' '}
									<a href={terms.href} className="text-primary hover:text-primary/80 font-medium underline">
										Read full terms
									</a>
								</p>
							</div>
						</div>
					</TabPanel>

					{/* FAQ Panel */}
					<TabPanel className="py-10">
						<h3 className="sr-only">Frequently Asked Questions</h3>
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
						<h3 className="sr-only">Detailed Terms & Conditions</h3>
						<Accordion className="w-full" collapsible type="single">
							<AccordionItem value="purchase-terms">
								<AccordionTrigger className="text-foreground text-left">Terms of Purchase</AccordionTrigger>
								<AccordionContent className="text-muted-foreground text-sm leading-6">
									<p className="mb-4">By purchasing this race bib, you agree to the following terms and conditions.</p>
									<ul className="list-disc space-y-1 pl-5">
										<li>You must provide accurate personal information for bib registration transfer.</li>
										<li>You agree to abide by all event organizer rules and regulations.</li>
										<li>Medical certificates may be required depending on the event requirements.</li>
									</ul>
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="whats-included">
								<AccordionTrigger className="text-foreground text-left">What's included</AccordionTrigger>
								<AccordionContent className="text-muted-foreground text-sm leading-6">
									<ul className="list-disc space-y-1 pl-5">
										<li>Official race bib with your name and details.</li>
										<li>All event-specific materials (timing chip, race packet, etc.).</li>
										<li>Support throughout the transfer process.</li>
									</ul>
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="important-notes">
								<AccordionTrigger className="text-foreground text-left">Important Notes</AccordionTrigger>
								<AccordionContent className="text-muted-foreground text-sm leading-6">
									<ul className="list-disc space-y-1 pl-5">
										<li>Bib transfers must be completed before the event organizer's deadline.</li>
										<li>Some events may require additional documentation or fees.</li>
										<li>Refunds are subject to the event organizer's cancellation policy.</li>
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
