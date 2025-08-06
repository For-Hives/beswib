'use client'

import { AlertTriangle } from 'lucide-react'
import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { PayPalButtons } from '@paypal/react-paypal-js'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'

import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

import type { User as AppUser } from '@/models/user.model'
import type { Event } from '@/models/event.model'
import type { Organizer } from '@/models/organizer.model'
import type { Bib } from '@/models/bib.model'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { handleSuccessfulPurchase } from '@/app/[locale]/purchase/actions'
import CardMarket, { BibSale } from '@/components/marketplace/CardMarket'
import { capturePayment, createOrder } from '@/services/paypal.services'
import { SlidingPanel } from '@/components/ui/SlidingPanel'
import { formatDateWithLocale } from '@/lib/dateUtils'
import { isUserProfileComplete } from '@/lib/userValidation'
import { Locale } from '@/lib/i18n-config'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import SimplePriceLanyard from '@/components/ui/SimplePriceLanyard'

interface PayPalPurchaseClientProps {
	bib: BibSale
	locale: Locale
	otherBibs?: BibSale[]
	sellerUser: AppUser | null
	user: AppUser | null
	eventData?: Event & { expand?: { organizer: Organizer } }
	organizerData?: Organizer
	bibData?: Bib & { expand?: { eventId: Event; sellerUserId: AppUser } }
}

export default function PayPalPurchaseClient({
	user,
	sellerUser,
	otherBibs = [],
	locale,
	bib,
	eventData,
	organizerData,
}: Readonly<PayPalPurchaseClientProps>) {
	const [errorMessage, setErrorMessage] = useState<null | string>(null)
	const [successMessage, setSuccessMessage] = useState<null | string>(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const { isSignedIn } = useUser()
	const router = useRouter()
	const [isProfileComplete, setIsProfileComplete] = useState(false)

	// Check if current user is the seller of this bib
	const isOwnBib = user?.id === bib.user.id

	useEffect(() => {
		setIsProfileComplete(isUserProfileComplete(user))
	}, [user])

	// Check if user is authenticated when trying to open payment modal
	const handleBuyNowClick = () => {
		if (isSignedIn !== true) {
			router.push(`/${locale}/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)
			return
		}
		if (isOwnBib) {
			// User trying to buy their own bib - do nothing, button should be disabled
			return
		}
		if (isProfileComplete) {
			setIsPanelOpen(true)
		}
	}

	const handleCreateOrder = useCallback(async () => {
		// Get seller's PayPal merchant ID
		const sellerId = sellerUser?.paypalMerchantId

		if (sellerId === null || sellerId === undefined || sellerId === '') {
			const errorMsg = 'Seller PayPal account not configured'
			setErrorMessage(errorMsg)
			throw new Error(errorMsg)
		}

		try {
			setLoading(true)
			setErrorMessage(null)

			const data = await createOrder(sellerId, bib.price.toString())
			if (data.error !== null && data.error !== undefined && data.error !== '') {
				throw new Error(data.error)
			}

			console.info('Order created:', data)
			return data.id ?? ''
		} catch (error: unknown) {
			const errorMsg = 'Error creating order: ' + (error instanceof Error ? error.message : 'Unknown error')
			console.error('Order creation error:', error instanceof Error ? error.message : 'Unknown error')
			setErrorMessage(errorMsg)
			throw new Error(errorMsg)
		} finally {
			setLoading(false)
		}
	}, [sellerUser?.paypalMerchantId, bib.price])

	const onApprove = useCallback(
		async (data: { orderID: string }) => {
			try {
				setLoading(true)
				setErrorMessage(null)

				const res = await capturePayment(data.orderID)
				if (res.error !== null && res.error !== undefined && res.error !== '') {
					throw new Error(res.error)
				}

				setSuccessMessage('Payment captured successfully!')
				console.info('Payment captured:', res)

				// Handle successful purchase
				await handleSuccessfulPurchase(data.orderID, bib.id)
				router.push(`/${locale}/purchase/success`)
			} catch (error: unknown) {
				const errorMsg = 'Error capturing payment: ' + (error instanceof Error ? error.message : 'Unknown error')
				console.error('Capture error:', error instanceof Error ? error.message : 'Unknown error')
				setErrorMessage(errorMsg)
			} finally {
				setLoading(false)
			}
		},
		[bib.id, locale, router]
	)

	const onError = useCallback((err: Record<string, unknown>) => {
		console.error('PayPal Error:', err)
		const message = typeof err.message === 'string' ? err.message : 'An unknown error occurred'
		setErrorMessage('PayPal Error: ' + message)
		setLoading(false)
	}, [])

	const onCancel = useCallback(() => {
		console.info('PayPal payment cancelled')
		setErrorMessage('Payment cancelled by user')
		setLoading(false)
	}, [])

	function bgFromType(type: BibSale['event']['type']) {
		switch (type) {
			case 'cycling':
				return 'bg-cyan-500/15 border-cyan-500/50'
			case 'other':
				return 'bg-gray-500/15 border-gray-500/50'
			case 'running':
				return 'bg-green-500/15 border-green-500/50'
			case 'swimming':
				return 'bg-blue-500/15 border-blue-500/50'
			case 'trail':
				return 'bg-yellow-500/15 border-yellow-500/50'
			case 'triathlon':
				return 'bg-purple-500/15 border-purple-500/50'
		}
	}

	// Filter other bibs for the same event (excluding current bib)
	const samEventBibs = otherBibs.filter(otherBib => otherBib.event.id === bib.event.id && otherBib.id !== bib.id)

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

	// License/Terms data
	const terms = {
		href: '#',
		summary: "By purchasing this bib, you agree to our terms of service and the event organizer's participation rules.",
		content: `
			<h4>Terms of Purchase</h4>
			
			<p>By purchasing this race bib, you agree to the following terms and conditions.</p>
			
			<ul role="list">
			<li>You must provide accurate personal information for bib registration transfer.</li>
			<li>You agree to abide by all event organizer rules and regulations.</li>
			<li>Medical certificates may be required depending on the event requirements.</li>
			</ul>
			
			<h4>What's included</h4>
			
			<ul role="list">
			<li>Official race bib with your name and details.</li>
			<li>All event-specific materials (timing chip, race packet, etc.).</li>
			<li>Support throughout the transfer process.</li>
			</ul>
			
			<h4>Important Notes</h4>
			
			<ul role="list">
			<li>Bib transfers must be completed before the event organizer's deadline.</li>
			<li>Some events may require additional documentation or fees.</li>
			<li>Refunds are subject to the event organizer's cancellation policy.</li>
			</ul>
		`,
	}

	return (
		<div className="relative">
			{/* Interactive Price Lanyard */}
			<SimplePriceLanyard price={bib.price} originalPrice={bib.originalPrice} currency="EUR" className="" />
			<div className="mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
				{/* Product Layout */}
				<div className="lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 lg:gap-y-10 xl:gap-x-16">
					{/* Event Image */}
					<div className="lg:col-span-4 lg:row-end-1">
						<div className="relative">
							<Image
								alt={bib.event.name}
								src={bib.event.image}
								className="bg-card/80 aspect-[4/3] w-full rounded-lg object-cover"
								width={800}
								height={600}
							/>
							{/* Event Type Badge */}
							<div className="absolute top-4 left-4 z-10">
								<span
									className={cn(
										'inline-block rounded-full border px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md',
										bgFromType(bib.event.type)
									)}
								>
									{bib.event.type.charAt(0).toUpperCase() + bib.event.type.slice(1)}
								</span>
							</div>
							{/* Discount Badge */}
							{!!bib.originalPrice && ((bib.originalPrice - bib.price) / bib.originalPrice) * 100 > 10 && (
								<div className="absolute top-4 right-4 z-10">
									<Badge variant="destructive" className="text-white">
										{(-((bib.originalPrice - bib.price) / bib.originalPrice) * 100).toFixed(0)}% OFF
									</Badge>
								</div>
							)}
						</div>
					</div>

					{/* Product Details */}
					<div className="mx-auto mt-14 max-w-2xl sm:mt-16 lg:col-span-3 lg:row-span-2 lg:row-end-2 lg:mt-0 lg:max-w-none">
						<div className="flex flex-col-reverse">
							<div className="mt-4">
								<h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{bib.event.name}</h1>

								<h2 id="information-heading" className="sr-only">
									Bib information
								</h2>
								<p className="text-muted-foreground mt-2 text-sm">
									Event Date: {formatDateWithLocale(bib.event.date, locale)} • {bib.event.location}
								</p>
							</div>

							<div className="space-y-4">
								{/* Race Stats */}
								<div className="text-muted-foreground flex items-center gap-6 text-sm">
									{/* Distance + Elevation */}
									<span>
										{bib.event.distance}
										{bib.event.distanceUnit}
										{(eventData?.elevationGainM ?? 0) > 0 && (
											<span className="text-muted-foreground/70"> (+{eventData?.elevationGainM}m)</span>
										)}
									</span>

									{/* Participants */}
									<span>{bib.event.participantCount.toLocaleString()} runners</span>
								</div>
							</div>
						</div>

						{/* Event Description with Organizer Info */}
						<div className="mt-6">
							{eventData?.description && eventData.description.trim() !== '' ? (
								<div className="border-border/50 bg-card/50 rounded-lg border p-4 backdrop-blur-sm">
									<h3 className="text-primary mb-3 text-sm font-semibold">À propos de cet événement</h3>
									<p className="text-foreground/80 mb-4 text-sm leading-relaxed">{eventData.description}</p>

									{/* Organizer Information */}
									{(organizerData != null || eventData?.expand?.organizer != null) && (
										<div className="border-border/30 border-t pt-4">
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<p className="text-muted-foreground mb-1 text-xs font-medium">Organisé par</p>
													<p className="text-foreground text-sm font-medium">
														{organizerData?.name ?? eventData?.expand?.organizer?.name ?? 'Unknown Organizer'}
													</p>

													{/* Website */}
													{((organizerData?.website != null && organizerData.website.trim() !== '') ||
														(eventData?.expand?.organizer?.website != null &&
															eventData.expand.organizer.website.trim() !== '')) && (
														<a
															href={organizerData?.website ?? eventData?.expand?.organizer?.website ?? '#'}
															target="_blank"
															rel="noopener noreferrer"
															className="text-primary hover:text-primary/80 mt-1 inline-block text-xs font-medium underline"
														>
															{organizerData?.website ?? eventData?.expand?.organizer?.website}
														</a>
													)}
												</div>

												{/* Verified Partner Badge */}
												{(organizerData?.isPartnered === true ||
													eventData?.expand?.organizer?.isPartnered === true) && (
													<div className="ml-3 flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/15 px-2.5 py-1">
														<div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
														<span className="text-xs font-medium text-green-400">Vérifié</span>
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							) : (
								<div className="border-border/50 bg-card/50 rounded-lg border p-4 backdrop-blur-sm">
									<h3 className="text-primary mb-3 text-sm font-semibold">À propos de cet événement</h3>
									<p className="text-foreground/80 mb-4 text-sm leading-relaxed">
										Secure your spot for {bib.event.name}. This race bib includes all official race materials and
										registration transfer to your name.
									</p>

									{/* Organizer Information */}
									{(organizerData != null || eventData?.expand?.organizer != null) && (
										<div className="border-border/30 border-t pt-4">
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<p className="text-muted-foreground mb-1 text-xs font-medium">Organisé par</p>
													<p className="text-foreground text-sm font-medium">
														{organizerData?.name ?? eventData?.expand?.organizer?.name ?? 'Unknown Organizer'}
													</p>

													{/* Website */}
													{((organizerData?.website != null && organizerData.website.trim() !== '') ||
														(eventData?.expand?.organizer?.website != null &&
															eventData.expand.organizer.website.trim() !== '')) && (
														<a
															href={organizerData?.website ?? eventData?.expand?.organizer?.website ?? '#'}
															target="_blank"
															rel="noopener noreferrer"
															className="text-primary hover:text-primary/80 mt-1 inline-block text-xs font-medium underline"
														>
															{organizerData?.website ?? eventData?.expand?.organizer?.website}
														</a>
													)}
												</div>

												{/* Verified Partner Badge */}
												{(organizerData?.isPartnered === true ||
													eventData?.expand?.organizer?.isPartnered === true) && (
													<div className="ml-3 flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/15 px-2.5 py-1">
														<div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
														<span className="text-xs font-medium text-green-400">Vérifié</span>
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							)}
						</div>

						{/* Price */}
						<div className="mt-6">
							<div className="flex items-baseline gap-3">
								<p className="text-foreground text-4xl font-bold tracking-tight">€{bib.price}</p>

								{/* Official Event Price */}
								{(eventData?.officialStandardPrice ?? 0) > 0 &&
									(eventData?.officialStandardPrice ?? 0) !== bib.price && (
										<div className="flex flex-col">
											<p className="text-muted-foreground text-sm">Prix de base</p>
											<p className="text-muted-foreground text-lg line-through">
												€{eventData?.officialStandardPrice ?? 0}
											</p>
										</div>
									)}
							</div>

							{/* Seller's original price discount */}
							{Boolean(bib.originalPrice && bib.originalPrice > bib.price) && (
								<div className="mt-2">
									<p className="text-sm font-medium text-green-400">
										Save €{(bib.originalPrice - bib.price).toFixed(2)} from seller (
										{(((bib.originalPrice - bib.price) / bib.originalPrice) * 100).toFixed(0)}% off)
									</p>
								</div>
							)}

							{/* Show savings vs official price */}
							{(eventData?.officialStandardPrice ?? 0) > 0 &&
								eventData?.officialStandardPrice !== bib.price &&
								(eventData?.officialStandardPrice ?? 0) > bib.price && (
									<div className="mt-2">
										<p className="text-sm font-medium text-green-400">
											Save €{((eventData?.officialStandardPrice ?? 0) - bib.price).toFixed(2)} vs. official price (
											{(
												(((eventData?.officialStandardPrice ?? 0) - bib.price) /
													(eventData?.officialStandardPrice ?? 1)) *
												100
											).toFixed(0)}
											% off)
										</p>
									</div>
								)}
						</div>

						{/* Action Buttons */}
						<div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
							{/* Show alerts for specific cases */}
							{!isProfileComplete && isSignedIn === true && !isOwnBib && (
								<div className="sm:col-span-2">
									<Alert className="mb-4" variant="destructive">
										<AlertTriangle className="h-4 w-4" />
										<AlertTitle>Profile Incomplete</AlertTitle>
										<AlertDescription>
											Please complete your runner profile before purchasing a bib.{' '}
											<Link className="font-bold underline" href={`/${locale}/profile`}>
												Complete Profile
											</Link>
										</AlertDescription>
									</Alert>
								</div>
							)}
							{isOwnBib && isSignedIn === true && (
								<div className="sm:col-span-2">
									<Alert className="mb-4" variant="default">
										<AlertTriangle className="h-4 w-4" />
										<AlertTitle>Your Own Bib</AlertTitle>
										<AlertDescription>
											You cannot purchase your own bib. You can manage it from your{' '}
											<Link className="font-bold underline" href={`/${locale}/dashboard/seller`}>
												seller dashboard
											</Link>
											.
										</AlertDescription>
									</Alert>
								</div>
							)}

							{/* Buy Button */}
							{(isSignedIn !== true || (isSignedIn === true && isProfileComplete && !isOwnBib)) && (
								<button
									type="button"
									onClick={handleBuyNowClick}
									className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary w-full rounded-md px-8 py-3 text-base font-medium transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
									disabled={isOwnBib}
								>
									{isSignedIn !== true ? 'Sign In to Purchase' : 'Purchase Bib'}
								</button>
							)}

							{/* Preview/Info Button - Only show if user can potentially purchase */}
							{(isSignedIn !== true || (isSignedIn === true && isProfileComplete && !isOwnBib)) && (
								<button
									type="button"
									className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-primary w-full rounded-md border px-8 py-3 text-base font-medium transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none"
								>
									Event Details
								</button>
							)}
						</div>
					</div>

					{/* Tabbed Content Section */}
					<div className="mx-auto mt-16 w-full max-w-2xl lg:col-span-4 lg:mt-0 lg:max-w-none">
						<TabGroup>
							<div className="border-border/20 border-b">
								<TabList className="-mb-px flex space-x-8">
									<Tab className="text-muted-foreground hover:border-muted-foreground hover:text-foreground data-[selected]:border-primary data-[selected]:text-primary border-b-2 border-transparent py-6 text-sm font-medium whitespace-nowrap">
										Event Details
									</Tab>
									<Tab className="text-muted-foreground hover:border-muted-foreground hover:text-foreground data-[selected]:border-primary data-[selected]:text-primary border-b-2 border-transparent py-6 text-sm font-medium whitespace-nowrap">
										FAQ
									</Tab>
									<Tab className="text-muted-foreground hover:border-muted-foreground hover:text-foreground data-[selected]:border-primary data-[selected]:text-primary border-b-2 border-transparent py-6 text-sm font-medium whitespace-nowrap">
										Terms
									</Tab>
								</TabList>
							</div>
							<TabPanels as={Fragment}>
								{/* Event Details Panel */}
								<TabPanel className="py-10">
									<h3 className="sr-only">Event Details</h3>
									<div className="space-y-6">
										{/* Essential Event Information */}
										<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
											{/* Key Details */}
											<div className="border-border/50 bg-card/50 rounded-lg border p-6 backdrop-blur-sm">
												<h4 className="text-foreground mb-4 font-semibold">Race Information</h4>
												<div className="space-y-4">
													<div>
														<p className="text-muted-foreground text-sm font-medium">Date</p>
														<p className="text-foreground font-medium">
															{formatDateWithLocale(bib.event.date, locale)}
														</p>
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

											{/* Transfer Deadline - Critical Info */}
											{eventData?.transferDeadline && (
												<div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-6 backdrop-blur-sm">
													<h4 className="mb-3 font-semibold text-yellow-300">Transfer Deadline</h4>
													<p className="mb-2 text-sm text-yellow-200">Last date for bib transfer:</p>
													<p className="text-xl font-bold text-yellow-100">
														{formatDateWithLocale(eventData.transferDeadline, locale)}
													</p>
													<p className="mt-3 text-xs text-yellow-200">
														Complete your purchase before this date to ensure transfer
													</p>
												</div>
											)}
										</div>

										{/* What you get */}
										<div className="border-border/50 bg-card/50 rounded-lg border p-6 backdrop-blur-sm">
											<h4 className="text-foreground mb-4 font-semibold">What you get</h4>
											<div className="text-foreground/80 space-y-2 text-sm">
												<div>• Official race bib transferred to your name</div>
												<div>• All race materials & timing chip</div>
												<div>• Secure transfer process</div>
											</div>
										</div>

										{/* Seller Information */}
										<div className="border-border/50 bg-card/50 rounded-lg border p-6 backdrop-blur-sm">
											<h4 className="text-foreground mb-4 font-semibold">Seller Information</h4>
											<p className="text-muted-foreground text-sm">Sold by {bib.user.firstName ?? 'Anonymous'}.</p>
										</div>

										{/* Terms & Conditions */}
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
												<AccordionContent className="text-muted-foreground text-sm leading-6">
													{faq.answer}
												</AccordionContent>
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
												<p className="mb-4">
													By purchasing this race bib, you agree to the following terms and conditions.
												</p>
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

					{/* Other Bibs Section */}
					{samEventBibs.length > 0 && (
						<div className="mt-12">
							<div className="mb-6 text-center">
								<h2 className="text-foreground text-2xl font-bold tracking-tight">Other bibs for this event</h2>
								<p className="text-muted-foreground mt-1">More bibs available for {bib.event.name}</p>
							</div>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{samEventBibs.map(otherBib => (
									<CardMarket bibSale={otherBib} key={otherBib.id} locale={locale} />
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			<SlidingPanel
				className="z-[100]"
				isOpen={isPanelOpen}
				onClose={() => setIsPanelOpen(false)}
				title="Complete Your Purchase"
				variant="slide"
			>
				<div className="bg-background p-6">
					<div className="mx-auto max-w-4xl">
						<div className="grid gap-8 lg:grid-cols-3">
							{/* Order Summary - Left Side */}
							<div className="space-y-6 lg:col-span-2">
								{/* Event Summary Card */}
								<div className="border-border/50 bg-card/80 rounded-lg border p-6 backdrop-blur-sm">
									<h3 className="text-foreground mb-4 text-sm font-medium">Event Details</h3>
									<div className="flex items-start gap-4">
										<div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
											<Image alt="Event Image" className="object-cover" fill sizes="80px" src={bib.event.image} />
										</div>
										<div className="min-w-0 flex-1">
											<h4 className="text-foreground truncate text-lg font-semibold">{bib.event.name}</h4>
											<p className="text-muted-foreground mt-1 text-sm">
												{formatDateWithLocale(bib.event.date, locale)}
											</p>
											<p className="text-muted-foreground text-sm">{bib.event.location}</p>
											<div className="mt-2 flex items-center gap-2">
												<span
													className={cn(
														'inline-block rounded-full border px-2 py-1 text-xs font-medium text-white/90',
														bgFromType(bib.event.type)
													)}
												>
													{bib.event.type.charAt(0).toUpperCase() + bib.event.type.slice(1)}
												</span>
												<span className="text-muted-foreground text-xs">
													{bib.event.distance}
													{bib.event.distanceUnit}
												</span>
											</div>
										</div>
										<div className="flex-shrink-0 text-right">
											<p className="text-foreground text-2xl font-bold">€{bib.price}</p>
											{Boolean(bib.originalPrice && bib.originalPrice > bib.price) && (
												<p className="text-muted-foreground text-sm line-through">€{bib.originalPrice}</p>
											)}
										</div>
									</div>
								</div>

								{/* Order Summary Details */}
								<div className="border-border/50 bg-card/80 rounded-lg border p-6 backdrop-blur-sm">
									<h3 className="text-foreground mb-4 text-sm font-medium">Order Summary</h3>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-foreground/80">Race bib transfer</span>
											<span className="text-foreground/80">€{bib.price}</span>
										</div>
										{Boolean(bib.originalPrice && bib.originalPrice > bib.price) && (
											<div className="flex items-center justify-between text-green-400">
												<span className="text-sm">Discount applied</span>
												<span className="text-sm">-€{(bib.originalPrice - bib.price).toFixed(2)}</span>
											</div>
										)}
										<div className="border-border/20 border-t pt-3">
											<div className="flex items-center justify-between text-lg font-semibold">
												<span className="text-foreground">Total</span>
												<span className="text-foreground">€{bib.price}</span>
											</div>
										</div>
									</div>
								</div>

								{/* What's Included */}
								<div className="border-border/50 bg-card/80 rounded-lg border p-6 backdrop-blur-sm">
									<h3 className="text-foreground mb-4 text-sm font-medium">What's included</h3>
									<ul className="text-foreground/80 space-y-2 text-sm">
										<li>• Official race bib with your registered details</li>
										<li>• All event materials (timing chip, race packet)</li>
										<li>• Complete registration transfer service</li>
										<li>• 24/7 customer support</li>
									</ul>
								</div>
							</div>

							{/* Payment Section - Right Side */}
							<div className="space-y-6">
								<div className="border-border/50 bg-card/80 rounded-lg border p-6 backdrop-blur-sm">
									<h3 className="text-foreground mb-4 text-sm font-medium">Payment Method</h3>

									{/* Error Messages */}
									{Boolean(errorMessage) && (
										<div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
											{errorMessage}
										</div>
									)}

									{/* Success Messages */}
									{Boolean(successMessage) && (
										<div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-400">
											{successMessage}
										</div>
									)}

									<div className="border-border/20 bg-background rounded-lg border p-4">
										<PayPalButtons
											createOrder={handleCreateOrder}
											disabled={loading ?? !isProfileComplete}
											onApprove={onApprove}
											onCancel={onCancel}
											onError={onError}
											style={{
												shape: 'rect' as const,
												layout: 'vertical' as const,
												label: 'paypal' as const,
												height: 50,
												color: 'blue' as const,
											}}
										/>
									</div>
								</div>

								{/* Security Features */}
								<div className="rounded-lg border border-green-500/40 bg-green-500/10 p-6 backdrop-blur-sm">
									<div className="text-sm">
										<p className="font-medium text-green-300">100% Secure Transaction</p>
										<p className="mt-1 text-green-200">
											Your payment is processed securely through PayPal's trusted platform. We never store your payment
											details.
										</p>
									</div>
								</div>

								{/* Trust Indicators */}
								<div className="space-y-4 text-center">
									<div className="text-muted-foreground flex items-center justify-center gap-6 text-xs">
										<div className="flex items-center gap-1">
											<div className="h-2 w-2 rounded-full bg-green-400"></div>
											<span>256-bit SSL</span>
										</div>
										<div className="flex items-center gap-1">
											<div className="h-2 w-2 rounded-full bg-blue-400"></div>
											<span>PayPal Secured</span>
										</div>
										<div className="flex items-center gap-1">
											<div className="h-2 w-2 rounded-full bg-purple-400"></div>
											<span>PCI Compliant</span>
										</div>
									</div>
									<p className="text-muted-foreground text-xs">Trusted by thousands of athletes worldwide</p>
									<div className="text-muted-foreground flex items-center justify-center gap-4 text-xs">
										<span>Bank-level encryption</span>
										<span>Instant confirmation</span>
										<span>Fraud protection</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</SlidingPanel>
		</div>
	)
}
