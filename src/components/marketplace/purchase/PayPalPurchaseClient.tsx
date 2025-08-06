'use client'

import {
	AlertTriangle,
	Calendar,
	Mountain,
	CheckCircle2,
	Shield,
	Star,
	Info,
	CreditCard,
	MapPinned,
} from 'lucide-react'
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
import { handleSuccessfulPurchase } from '@/app/[locale]/purchase/actions'
import CardMarket, { BibSale } from '@/components/marketplace/CardMarket'
import { capturePayment, createOrder } from '@/services/paypal.services'
import { SlidingPanel } from '@/components/ui/SlidingPanel'
import { formatDateWithLocale } from '@/lib/dateUtils'
import { isUserProfileComplete } from '@/lib/userValidation'
import { Locale } from '@/lib/i18n-config'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

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

	// Mock reviews data for demonstration
	const reviews = {
		average: 4.8,
		totalCount: 127,
		featured: [
			{
				id: 1,
				rating: 5,
				content:
					'Amazing experience! The bib transfer was seamless and I saved so much compared to the official price. Highly recommend Beswib!',
				date: 'December 15, 2024',
				datetime: '2024-12-15',
				author: 'Sarah M.',
				avatarSrc: `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=256&h=256&q=80&fit=crop&crop=face`,
			},
			{
				id: 2,
				rating: 5,
				content:
					"Perfect service! Got my bib for the marathon I thought I'd missed. The seller was very responsive and everything went smoothly.",
				date: 'December 10, 2024',
				datetime: '2024-12-10',
				author: 'Mike R.',
				avatarSrc: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&q=80&fit=crop&crop=face`,
			},
			{
				id: 3,
				rating: 4,
				content:
					'Great platform for finding race bibs. The process is straightforward and secure. Will definitely use again!',
				date: 'December 5, 2024',
				datetime: '2024-12-05',
				author: 'Emma L.',
				avatarSrc: `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&h=256&q=80&fit=crop&crop=face`,
			},
		],
	}

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

	function classNames(...classes: (string | boolean | undefined)[]): string {
		return classes.filter(Boolean).join(' ')
	}

	return (
		<div className="min-h-screen" style={{ backgroundColor: '#0F0F23' }}>
			<div className="mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
				{/* Product Layout */}
				<div className="lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 lg:gap-y-10 xl:gap-x-16">
					{/* Event Image */}
					<div className="lg:col-span-4 lg:row-end-1">
						<div className="relative">
							<Image
								alt={bib.event.name}
								src={bib.event.image}
								className="aspect-[4/3] w-full rounded-lg object-cover"
								style={{ backgroundColor: 'rgba(22, 33, 62, 0.8)' }}
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
								<h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: '#FFFFFF' }}>
									{bib.event.name}
								</h1>

								<h2 id="information-heading" className="sr-only">
									Bib information
								</h2>
								<p className="mt-2 text-sm" style={{ color: '#9CA3AF' }}>
									Event Date: {formatDateWithLocale(bib.event.date, locale)} • {bib.event.location}
								</p>
							</div>

							<div className="space-y-4">
								{/* Reviews */}
								<div>
									<h3 className="sr-only">Reviews</h3>
									<div className="flex items-center">
										{[0, 1, 2, 3, 4].map(rating => (
											<Star
												key={rating}
												aria-hidden="true"
												className={classNames(
													reviews.average > rating ? 'text-yellow-400' : 'text-gray-600',
													'h-5 w-5 flex-shrink-0'
												)}
												fill="currentColor"
											/>
										))}
									</div>
									<p className="sr-only">{reviews.average} out of 5 stars</p>
									<p className="mt-1 text-sm" style={{ color: '#9CA3AF' }}>
										{reviews.average} out of 5 stars ({reviews.totalCount} reviews)
									</p>
								</div>

								{/* Race Stats */}
								<div className="flex items-center gap-6 text-sm">
									{/* Distance + Elevation */}
									<div className="flex items-center gap-2">
										<Mountain className="h-4 w-4" style={{ color: '#3B82F6' }} />
										<span style={{ color: '#E5E7EB' }}>
											{bib.event.distance}
											{bib.event.distanceUnit}
											{(eventData?.elevationGainM ?? 0) > 0 && (
												<span style={{ color: '#9CA3AF' }}> (+{eventData?.elevationGainM}m)</span>
											)}
										</span>
									</div>

									{/* Participants */}
									<div className="flex items-center gap-2">
										<svg className="h-4 w-4" style={{ color: '#3B82F6' }} fill="currentColor" viewBox="0 0 20 20">
											<path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
										</svg>
										<span style={{ color: '#E5E7EB' }}>{bib.event.participantCount.toLocaleString()} runners</span>
									</div>
								</div>
							</div>
						</div>

						{/* Event Description */}
						<div className="mt-6">
							{eventData?.description && eventData.description.trim() !== '' ? (
								<div
									className="rounded-lg border p-4"
									style={{
										backgroundColor: 'rgba(22, 33, 62, 0.4)',
										borderColor: 'rgba(156, 163, 175, 0.2)',
									}}
								>
									<h3 className="mb-2 text-sm font-semibold" style={{ color: '#3B82F6' }}>
										🏃 À propos de cet événement
									</h3>
									<p className="text-sm leading-relaxed" style={{ color: '#E5E7EB' }}>
										{eventData.description}
									</p>
								</div>
							) : (
								<p style={{ color: '#9CA3AF' }}>
									Secure your spot for {bib.event.name}. This race bib includes all official race materials and
									registration transfer to your name.
								</p>
							)}
						</div>

						{/* Transfer Deadline Warning - Critical */}
						{eventData?.transferDeadline && (
							<div
								className="mt-6 rounded-lg border p-4"
								style={{
									backgroundColor: 'rgba(245, 158, 11, 0.1)',
									borderColor: 'rgba(245, 158, 11, 0.5)',
								}}
							>
								<div className="flex items-center gap-2">
									<AlertTriangle className="h-4 w-4 text-yellow-400" />
									<p className="text-sm font-medium text-yellow-300">
										⏰ Transfer deadline: {formatDateWithLocale(eventData.transferDeadline, locale)}
									</p>
								</div>
							</div>
						)}

						{/* Price */}
						<div className="mt-6">
							<div className="flex items-baseline gap-3">
								<p className="text-4xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>
									€{bib.price}
								</p>

								{/* Official Event Price */}
								{(eventData?.officialStandardPrice ?? 0) > 0 &&
									(eventData?.officialStandardPrice ?? 0) !== bib.price && (
										<div className="flex flex-col">
											<p className="text-sm" style={{ color: '#9CA3AF' }}>
												Prix de base
											</p>
											<p className="text-lg line-through" style={{ color: '#6B7280' }}>
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
											💰 Save €{((eventData?.officialStandardPrice ?? 0) - bib.price).toFixed(2)} vs. official price (
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
									className="flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white transition-all hover:scale-[1.02] focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-none"
									style={{
										backgroundColor: '#3B82F6',
										boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
									}}
									onMouseEnter={e => {
										e.currentTarget.style.backgroundColor = '#2563EB'
										e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)'
									}}
									onMouseLeave={e => {
										e.currentTarget.style.backgroundColor = '#3B82F6'
										e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)'
									}}
									disabled={isOwnBib}
								>
									<CreditCard className="mr-2 h-5 w-5" />
									{isSignedIn !== true ? 'Sign In to Purchase' : 'Purchase Bib'}
								</button>
							)}

							{/* Preview/Info Button */}
							<button
								type="button"
								className="flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-none"
								style={{
									backgroundColor: 'transparent',
									color: '#FFFFFF',
									border: '1px solid rgba(255, 255, 255, 0.2)',
								}}
								onMouseEnter={e => {
									e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
									e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
								}}
								onMouseLeave={e => {
									e.currentTarget.style.backgroundColor = 'transparent'
									e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
								}}
							>
								<Info className="mr-2 h-5 w-5" />
								Event Details
							</button>
						</div>

						{/* Highlights - Focused on Value */}
						<div className="mt-10 border-t pt-10" style={{ borderColor: 'rgba(156, 163, 175, 0.2)' }}>
							<h3 className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
								✅ What you get
							</h3>
							<div className="mt-4 space-y-2">
								<div className="flex items-center gap-2">
									<CheckCircle2 className="h-4 w-4 text-green-400" />
									<span className="text-sm" style={{ color: '#E5E7EB' }}>
										Official race bib transferred to your name
									</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle2 className="h-4 w-4 text-green-400" />
									<span className="text-sm" style={{ color: '#E5E7EB' }}>
										All race materials & timing chip
									</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle2 className="h-4 w-4 text-green-400" />
									<span className="text-sm" style={{ color: '#E5E7EB' }}>
										Secure transfer process
									</span>
								</div>
							</div>
						</div>

						{/* Seller Info */}
						<div className="mt-10 border-t pt-10" style={{ borderColor: 'rgba(156, 163, 175, 0.2)' }}>
							<h3 className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
								Seller Information
							</h3>
							<p className="mt-4 text-sm" style={{ color: '#9CA3AF' }}>
								Sold by {bib.user.firstName ?? 'Anonymous'} {bib.user.lastName ?? ''}.{' '}
								<Link href="#" className="font-medium underline" style={{ color: '#3B82F6' }}>
									View seller profile
								</Link>
							</p>
						</div>

						{/* Terms */}
						<div className="mt-10 border-t pt-10" style={{ borderColor: 'rgba(156, 163, 175, 0.2)' }}>
							<h3 className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
								Terms & Conditions
							</h3>
							<p className="mt-4 text-sm" style={{ color: '#9CA3AF' }}>
								{terms.summary}{' '}
								<a href={terms.href} className="font-medium underline" style={{ color: '#3B82F6' }}>
									Read full terms
								</a>
							</p>
						</div>
					</div>

					{/* Tabbed Content Section */}
					<div className="mx-auto mt-16 w-full max-w-2xl lg:col-span-4 lg:mt-0 lg:max-w-none">
						<TabGroup>
							<div className="border-b" style={{ borderColor: 'rgba(156, 163, 175, 0.2)' }}>
								<TabList className="-mb-px flex space-x-8">
									<Tab className="border-b-2 border-transparent py-6 text-sm font-medium whitespace-nowrap text-gray-300 hover:border-gray-400 hover:text-gray-200 data-[selected]:border-blue-500 data-[selected]:text-blue-400">
										Event Details
									</Tab>
									<Tab className="border-b-2 border-transparent py-6 text-sm font-medium whitespace-nowrap text-gray-300 hover:border-gray-400 hover:text-gray-200 data-[selected]:border-blue-500 data-[selected]:text-blue-400">
										Reviews
									</Tab>
									<Tab className="border-b-2 border-transparent py-6 text-sm font-medium whitespace-nowrap text-gray-300 hover:border-gray-400 hover:text-gray-200 data-[selected]:border-blue-500 data-[selected]:text-blue-400">
										FAQ
									</Tab>
									<Tab className="border-b-2 border-transparent py-6 text-sm font-medium whitespace-nowrap text-gray-300 hover:border-gray-400 hover:text-gray-200 data-[selected]:border-blue-500 data-[selected]:text-blue-400">
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
											<div
												className="rounded-lg border p-6"
												style={{
													backgroundColor: 'rgba(22, 33, 62, 0.8)',
													borderColor: 'rgba(156, 163, 175, 0.2)',
												}}
											>
												<h4 className="mb-4 font-semibold" style={{ color: '#FFFFFF' }}>
													📍 Race Information
												</h4>
												<div className="space-y-4">
													<div className="flex items-start gap-3">
														<Calendar className="mt-0.5 h-5 w-5" style={{ color: '#3B82F6' }} />
														<div>
															<p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>
																Date
															</p>
															<p className="font-medium" style={{ color: '#E5E7EB' }}>
																{formatDateWithLocale(bib.event.date, locale)}
															</p>
														</div>
													</div>
													<div className="flex items-start gap-3">
														<MapPinned className="mt-0.5 h-5 w-5" style={{ color: '#3B82F6' }} />
														<div>
															<p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>
																Location
															</p>
															<p className="font-medium" style={{ color: '#E5E7EB' }}>
																{bib.event.location}
															</p>
														</div>
													</div>
													<div className="flex items-start gap-3">
														<Mountain className="mt-0.5 h-5 w-5" style={{ color: '#3B82F6' }} />
														<div>
															<p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>
																Distance
															</p>
															<p className="font-medium" style={{ color: '#E5E7EB' }}>
																{bib.event.distance}
																{bib.event.distanceUnit}
																{(eventData?.elevationGainM ?? 0) > 0 && (
																	<span className="ml-2 text-sm" style={{ color: '#9CA3AF' }}>
																		(+{eventData?.elevationGainM}m elevation)
																	</span>
																)}
															</p>
														</div>
													</div>
												</div>
											</div>

											{/* Transfer Deadline - Critical Info */}
											{eventData?.transferDeadline && (
												<div
													className="rounded-lg border p-6"
													style={{
														backgroundColor: 'rgba(245, 158, 11, 0.15)',
														borderColor: 'rgba(245, 158, 11, 0.6)',
													}}
												>
													<h4 className="mb-3 font-semibold text-yellow-300">⚠️ Transfer Deadline</h4>
													<p className="mb-2 text-sm text-yellow-200">Last date for bib transfer:</p>
													<p className="text-xl font-bold text-yellow-100">
														{formatDateWithLocale(eventData.transferDeadline, locale)}
													</p>
													<p className="mt-3 text-xs text-yellow-200">
														⏰ Complete your purchase before this date to ensure transfer
													</p>
												</div>
											)}
										</div>

										{/* Optional: Verified Organizer Badge */}
										{eventData?.expand?.organizer?.isPartnered === true && (
											<div
												className="rounded-lg border p-4"
												style={{
													backgroundColor: 'rgba(16, 185, 129, 0.1)',
													borderColor: 'rgba(16, 185, 129, 0.4)',
												}}
											>
												<div className="flex items-center gap-3">
													<CheckCircle2 className="h-5 w-5 text-green-400" />
													<div>
														<h4 className="font-medium text-green-300">✅ Verified Partner Organizer</h4>
														<p className="text-sm text-green-200">
															{eventData?.expand?.organizer?.name} • Trusted Partner
														</p>
													</div>
												</div>
											</div>
										)}
									</div>
								</TabPanel>

								{/* Reviews Panel */}
								<TabPanel className="-mb-10 py-10">
									<h3 className="sr-only">Customer Reviews</h3>
									{reviews.featured.map((review, reviewIdx) => (
										<div key={review.id} className="flex space-x-4 text-sm" style={{ color: '#9CA3AF' }}>
											<div className="flex-none py-10">
												<Image
													alt=""
													src={review.avatarSrc}
													className="h-10 w-10 rounded-full"
													style={{ backgroundColor: 'rgba(22, 33, 62, 0.8)' }}
													width={40}
													height={40}
												/>
											</div>
											<div className={classNames(reviewIdx === 0 ? '' : 'border-t border-gray-600', 'py-10')}>
												<h3 className="font-medium" style={{ color: '#FFFFFF' }}>
													{review.author}
												</h3>
												<p>
													<time dateTime={review.datetime}>{review.date}</time>
												</p>

												<div className="mt-4 flex items-center">
													{[0, 1, 2, 3, 4].map(rating => (
														<Star
															key={rating}
															aria-hidden="true"
															className={classNames(
																review.rating > rating ? 'text-yellow-400' : 'text-gray-600',
																'h-5 w-5 flex-shrink-0'
															)}
															fill="currentColor"
														/>
													))}
												</div>
												<p className="sr-only">{review.rating} out of 5 stars</p>

												<div className="mt-4 text-sm leading-6" style={{ color: '#9CA3AF' }}>
													<p>{review.content}</p>
												</div>
											</div>
										</div>
									))}
								</TabPanel>

								{/* FAQ Panel */}
								<TabPanel className="py-10 text-sm" style={{ color: '#9CA3AF' }}>
									<h3 className="sr-only">Frequently Asked Questions</h3>
									<dl>
										{faqs.map(faq => (
											<Fragment key={faq.question}>
												<dt className="mt-10 font-medium" style={{ color: '#FFFFFF' }}>
													{faq.question}
												</dt>
												<dd className="mt-2 text-sm leading-6" style={{ color: '#9CA3AF' }}>
													<p>{faq.answer}</p>
												</dd>
											</Fragment>
										))}
									</dl>
								</TabPanel>

								{/* Terms Panel */}
								<TabPanel className="pt-10">
									<h3 className="sr-only">Terms & Conditions</h3>
									<div
										dangerouslySetInnerHTML={{ __html: terms.content }}
										className="text-sm [&_h4]:mt-5 [&_h4]:font-medium [&_h4]:text-white [&_li]:pl-2 [&_li::marker]:text-gray-400 [&_p]:my-2 [&_p]:text-sm [&_p]:leading-6 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:text-sm [&_ul]:leading-6 [&>:first-child]:mt-0"
										style={{ color: '#9CA3AF' }}
									/>
								</TabPanel>
							</TabPanels>
						</TabGroup>
					</div>

					{/* Other Bibs Section */}
					{samEventBibs.length > 0 && (
						<div className="mt-12">
							<div className="mb-6 text-center">
								<h2 className="text-2xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>
									Other bibs for this event
								</h2>
								<p className="mt-1" style={{ color: '#9CA3AF' }}>
									More bibs available for {bib.event.name}
								</p>
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
				<div className="p-6" style={{ backgroundColor: '#0F0F23' }}>
					<div className="mx-auto max-w-4xl">
						<div className="grid gap-8 lg:grid-cols-3">
							{/* Order Summary - Left Side */}
							<div className="space-y-6 lg:col-span-2">
								{/* Event Summary Card */}
								<div
									className="rounded-lg border p-6"
									style={{ backgroundColor: 'rgba(22, 33, 62, 0.8)', borderColor: 'rgba(156, 163, 175, 0.2)' }}
								>
									<h3 className="mb-4 text-sm font-medium" style={{ color: '#FFFFFF' }}>
										Event Details
									</h3>
									<div className="flex items-start gap-4">
										<div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
											<Image alt="Event Image" className="object-cover" fill sizes="80px" src={bib.event.image} />
										</div>
										<div className="min-w-0 flex-1">
											<h4 className="truncate text-lg font-semibold" style={{ color: '#FFFFFF' }}>
												{bib.event.name}
											</h4>
											<p className="mt-1 text-sm" style={{ color: '#9CA3AF' }}>
												{formatDateWithLocale(bib.event.date, locale)}
											</p>
											<p className="text-sm" style={{ color: '#9CA3AF' }}>
												{bib.event.location}
											</p>
											<div className="mt-2 flex items-center gap-2">
												<span
													className={cn(
														'inline-block rounded-full border px-2 py-1 text-xs font-medium text-white/90',
														bgFromType(bib.event.type)
													)}
												>
													{bib.event.type.charAt(0).toUpperCase() + bib.event.type.slice(1)}
												</span>
												<span className="text-xs" style={{ color: '#9CA3AF' }}>
													{bib.event.distance}
													{bib.event.distanceUnit}
												</span>
											</div>
										</div>
										<div className="flex-shrink-0 text-right">
											<p className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
												€{bib.price}
											</p>
											{Boolean(bib.originalPrice && bib.originalPrice > bib.price) && (
												<p className="text-sm line-through" style={{ color: '#6B7280' }}>
													€{bib.originalPrice}
												</p>
											)}
										</div>
									</div>
								</div>

								{/* Order Summary Details */}
								<div
									className="rounded-lg border p-6"
									style={{ backgroundColor: 'rgba(22, 33, 62, 0.8)', borderColor: 'rgba(156, 163, 175, 0.2)' }}
								>
									<h3 className="mb-4 text-sm font-medium" style={{ color: '#FFFFFF' }}>
										Order Summary
									</h3>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span style={{ color: '#E5E7EB' }}>Race bib transfer</span>
											<span style={{ color: '#E5E7EB' }}>€{bib.price}</span>
										</div>
										{Boolean(bib.originalPrice && bib.originalPrice > bib.price) && (
											<div className="flex items-center justify-between text-green-400">
												<span className="text-sm">Discount applied</span>
												<span className="text-sm">-€{(bib.originalPrice - bib.price).toFixed(2)}</span>
											</div>
										)}
										<div className="border-t pt-3" style={{ borderColor: 'rgba(156, 163, 175, 0.2)' }}>
											<div className="flex items-center justify-between text-lg font-semibold">
												<span style={{ color: '#FFFFFF' }}>Total</span>
												<span style={{ color: '#FFFFFF' }}>€{bib.price}</span>
											</div>
										</div>
									</div>
								</div>

								{/* What's Included */}
								<div
									className="rounded-lg border p-6"
									style={{ backgroundColor: 'rgba(22, 33, 62, 0.8)', borderColor: 'rgba(156, 163, 175, 0.2)' }}
								>
									<h3 className="mb-4 text-sm font-medium" style={{ color: '#FFFFFF' }}>
										What's included
									</h3>
									<ul className="space-y-2">
										<li className="flex items-center gap-3">
											<CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-400" />
											<span className="text-sm" style={{ color: '#E5E7EB' }}>
												Official race bib with your registered details
											</span>
										</li>
										<li className="flex items-center gap-3">
											<CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-400" />
											<span className="text-sm" style={{ color: '#E5E7EB' }}>
												All event materials (timing chip, race packet)
											</span>
										</li>
										<li className="flex items-center gap-3">
											<CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-400" />
											<span className="text-sm" style={{ color: '#E5E7EB' }}>
												Complete registration transfer service
											</span>
										</li>
										<li className="flex items-center gap-3">
											<CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-400" />
											<span className="text-sm" style={{ color: '#E5E7EB' }}>
												24/7 customer support
											</span>
										</li>
									</ul>
								</div>
							</div>

							{/* Payment Section - Right Side */}
							<div className="space-y-6">
								<div
									className="rounded-lg border p-6"
									style={{ backgroundColor: 'rgba(22, 33, 62, 0.8)', borderColor: 'rgba(156, 163, 175, 0.2)' }}
								>
									<h3 className="mb-4 text-sm font-medium" style={{ color: '#FFFFFF' }}>
										Payment Method
									</h3>

									{/* Error Messages */}
									{Boolean(errorMessage) && (
										<div
											className="mb-4 rounded-lg border p-3 text-sm"
											style={{
												backgroundColor: 'rgba(239, 68, 68, 0.1)',
												borderColor: 'rgba(239, 68, 68, 0.5)',
												color: '#EF4444',
											}}
										>
											{errorMessage}
										</div>
									)}

									{/* Success Messages */}
									{Boolean(successMessage) && (
										<div
											className="mb-4 rounded-lg border p-3 text-sm"
											style={{
												backgroundColor: 'rgba(16, 185, 129, 0.1)',
												borderColor: 'rgba(16, 185, 129, 0.5)',
												color: '#10B981',
											}}
										>
											{successMessage}
										</div>
									)}

									<div
										className="rounded-lg border p-4"
										style={{ backgroundColor: '#0F0F23', borderColor: 'rgba(156, 163, 175, 0.2)' }}
									>
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
								<div
									className="rounded-lg border p-6"
									style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.5)' }}
								>
									<div className="flex items-start gap-3">
										<Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
										<div className="text-sm">
											<p className="font-medium text-green-300">100% Secure Transaction</p>
											<p className="mt-1 text-green-200">
												Your payment is processed securely through PayPal's trusted platform. We never store your
												payment details.
											</p>
										</div>
									</div>
								</div>

								{/* Trust Indicators */}
								<div className="space-y-4 text-center">
									<div className="flex items-center justify-center gap-6 text-xs" style={{ color: '#9CA3AF' }}>
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
									<p className="text-xs" style={{ color: '#9CA3AF' }}>
										Trusted by thousands of athletes worldwide
									</p>
									<div className="flex items-center justify-center gap-4 text-xs" style={{ color: '#9CA3AF' }}>
										<span>🔒 Bank-level encryption</span>
										<span>⚡ Instant confirmation</span>
										<span>🛡️ Fraud protection</span>
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
