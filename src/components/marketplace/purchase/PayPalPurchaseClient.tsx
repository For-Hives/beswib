'use client'

import {
	AlertTriangle,
	Calendar,
	Clock,
	Globe,
	MapPinned,
	Mountain,
	ShoppingCart,
	TrendingUp,
	User,
	Users,
	ExternalLink,
	Building2,
	CheckCircle2,
	Tag,
	Hash,
	Shield,
	Package,
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { PayPalButtons } from '@paypal/react-paypal-js'

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
import { Button } from '@/components/ui/button'
import { Locale } from '@/lib/i18n-config'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
	organizerData,
	bibData,
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

	function formatParticipantCount(participantCount: number) {
		return participantCount.toLocaleString('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		})
	}

	// Filter other bibs for the same event (excluding current bib)
	const samEventBibs = otherBibs.filter(otherBib => otherBib.event.id === bib.event.id && otherBib.id !== bib.id)

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

			<div className="relative pt-12 pb-12">
				<div className="container mx-auto max-w-6xl p-6">
					{/* Header */}
					<div className="mb-12 space-y-2 text-center">
						<h1 className="text-foreground text-4xl font-bold tracking-tight">Purchase Bib</h1>
						<p className="text-muted-foreground text-lg">
							Complete your purchase to secure your race bib for {bib.event.name}
						</p>
					</div>

					{/* Event Overview Card */}
					<Card className="border-border/50 bg-card/80 mb-8 backdrop-blur-sm">
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
							{/* Event Image */}
							<div className="relative overflow-hidden rounded-lg lg:col-span-2">
								<div className="relative h-64 lg:h-80">
									<Image
										alt="Event Image"
										className="object-cover"
										fill
										sizes="(max-width: 1024px) 100vw, 66vw"
										src={bib.event.image}
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
								<div className="p-6">
									<h2 className="text-foreground text-2xl font-bold">{bib.event.name}</h2>
									<p className="text-muted-foreground mt-1 text-sm italic">
										Sold by {bib.user.firstName ?? 'Anonymous'} {bib.user.lastName ?? ''}
									</p>
								</div>
							</div>

							{/* Price and Purchase Section */}
							<div className="flex flex-col justify-between p-6">
								<div>
									<h3 className="mb-4 text-lg font-semibold">Price</h3>
									<div className="mb-6">
										<p className="text-foreground text-4xl font-bold">{bib.price}€</p>
										{Boolean(bib.originalPrice && bib.originalPrice > bib.price) && (
											<p className="text-muted-foreground text-lg line-through">{bib.originalPrice}€</p>
										)}
										{Boolean(bib.originalPrice && bib.originalPrice > bib.price) && (
											<p className="mt-1 text-sm font-medium text-green-600">
												Save €{(bib.originalPrice - bib.price).toFixed(2)} (
												{(((bib.originalPrice - bib.price) / bib.originalPrice) * 100).toFixed(0)}% off)
											</p>
										)}
									</div>
								</div>

								{/* Show alerts for specific cases */}
								{!isProfileComplete && isSignedIn === true && !isOwnBib && (
									<Alert className="mb-4" variant="destructive">
										<AlertTriangle className="h-4 w-4" />
										<AlertTitle>Profile Incomplete</AlertTitle>
										<AlertDescription>
											Please complete your runner profile before purchasing a bib.{' '}
											<Link className="text-destructive-foreground font-bold" href={`/${locale}/profile`}>
												Complete Profile
											</Link>
										</AlertDescription>
									</Alert>
								)}
								{isOwnBib && isSignedIn === true && (
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
								)}

								{/* Only show buy button if user is signed in, has complete profile, and it's not their own bib */}
								{isSignedIn === true && isProfileComplete && !isOwnBib && (
									<Button
										className="flex items-center justify-center gap-2 text-lg font-medium"
										onClick={handleBuyNowClick}
										size="lg"
									>
										<ShoppingCart className="h-5 w-5" />
										Buy Now
									</Button>
								)}

								{/* Show sign in prompt for non-authenticated users */}
								{isSignedIn !== true && (
									<Button
										className="flex items-center justify-center gap-2 text-lg font-medium"
										onClick={handleBuyNowClick}
										size="lg"
									>
										<ShoppingCart className="h-5 w-5" />
										Buy Now
									</Button>
								)}
							</div>
						</div>
					</Card>

					{/* Bib-Specific Information */}
					{bibData && (
						<div className="mt-8">
							<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Package className="h-5 w-5" />
										Bib Details
									</CardTitle>
									<CardDescription>Specific information for this bib listing</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
										{/* Bib Status & Info */}
										<div className="space-y-4">
											<div className="flex items-center gap-3">
												<div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
													<Tag className="h-5 w-5" />
												</div>
												<div>
													<h4 className="text-foreground font-medium">Status</h4>
													<div className="flex items-center gap-2">
														<Badge
															variant={bibData.status === 'available' ? 'default' : 'secondary'}
															className="capitalize"
														>
															{bibData.status}
														</Badge>
														{bibData.validated ? (
															<Badge variant="default" className="flex items-center gap-1">
																<CheckCircle2 className="h-3 w-3" />
																Validated
															</Badge>
														) : (
															<Badge variant="outline" className="flex items-center gap-1">
																<Shield className="h-3 w-3" />
																Pending Validation
															</Badge>
														)}
													</div>
												</div>
											</div>
											{bibData.registrationNumber && Number(bibData.registrationNumber) > 0 && (
												<div className="flex items-center gap-3">
													<div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
														<Hash className="h-5 w-5" />
													</div>
													<div>
														<h4 className="text-foreground font-medium">Registration Number</h4>
														<p className="text-muted-foreground">#{bibData.registrationNumber}</p>
													</div>
												</div>
											)}
										</div>

										{/* Selected Options */}
										{bibData.optionValues && Object.keys(bibData.optionValues).length > 0 && (
											<div className="space-y-4">
												<div>
													<h4 className="text-foreground mb-3 flex items-center gap-2 font-medium">
														<CheckCircle2 className="h-4 w-4" />
														Selected Options
													</h4>
													<div className="space-y-3">
														{Object.entries(bibData.optionValues).map(([key, value]) => (
															<div key={key} className="border-primary/20 border-l-2 pl-4">
																<div className="flex items-center justify-between">
																	<span className="text-muted-foreground text-sm capitalize">
																		{key.replace(/([A-Z])/g, ' $1').toLowerCase()}
																	</span>
																	<Badge variant="secondary" className="ml-2">
																		{value as string}
																	</Badge>
																</div>
															</div>
														))}
													</div>
												</div>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Comprehensive Event Information */}
					<div className="mt-8 space-y-8">
						{/* Event Description */}
						{eventData?.description && (
							<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Calendar className="h-5 w-5" />
										Event Description
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground leading-relaxed">{eventData.description}</p>
								</CardContent>
							</Card>
						)}

						{/* Event Details Grid */}
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{/* Basic Event Info */}
							<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Calendar className="h-5 w-5" />
										Event Date
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-foreground font-medium">{formatDateWithLocale(bib.event.date, locale)}</p>
								</CardContent>
							</Card>

							{/* Location & Distance */}
							<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<MapPinned className="h-5 w-5" />
										Location & Distance
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<p className="text-foreground font-medium">{bib.event.location}</p>
									<p className="text-muted-foreground">
										{bib.event.distance}
										{bib.event.distanceUnit}
									</p>
									{eventData?.elevationGainM && (
										<div className="text-muted-foreground flex items-center gap-1 text-sm">
											<Mountain className="h-4 w-4" />
											{eventData.elevationGainM}m elevation gain
										</div>
									)}
								</CardContent>
							</Card>

							{/* Participants */}
							<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Users className="h-5 w-5" />
										Participants
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-foreground font-medium">
										{formatParticipantCount(bib.event.participantCount)} registered
									</p>
									{eventData?.officialStandardPrice && (
										<p className="text-muted-foreground text-sm">Official price: €{eventData.officialStandardPrice}</p>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Bib Pickup & Transfer Info */}
						{(eventData?.bibPickupLocation || eventData?.bibPickupWindowBeginDate) && (
							<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Clock className="h-5 w-5" />
										Bib Pickup Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										{eventData.bibPickupLocation && (
											<div>
												<h4 className="text-foreground mb-1 font-medium">Pickup Location</h4>
												<p className="text-muted-foreground text-sm">{eventData.bibPickupLocation}</p>
											</div>
										)}
										{eventData.bibPickupWindowBeginDate && eventData.bibPickupWindowEndDate && (
											<div>
												<h4 className="text-foreground mb-1 font-medium">Pickup Window</h4>
												<p className="text-muted-foreground text-sm">
													{formatDateWithLocale(eventData.bibPickupWindowBeginDate, locale)} -{' '}
													{formatDateWithLocale(eventData.bibPickupWindowEndDate, locale)}
												</p>
											</div>
										)}
										{eventData.transferDeadline && (
											<div className="md:col-span-2">
												<h4 className="text-foreground mb-1 font-medium">Transfer Deadline</h4>
												<p className="text-muted-foreground flex items-center gap-1 text-sm">
													<AlertTriangle className="h-4 w-4" />
													Last date for transfer: {formatDateWithLocale(eventData.transferDeadline, locale)}
												</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Race Options */}
						{eventData?.options && eventData.options.length > 0 && (
							<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
								<CardHeader>
									<CardTitle>Race Options</CardTitle>
									<CardDescription>Available options for this event</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{eventData.options.map((option, index) => (
											<div key={index} className="border-primary/20 border-l-2 pl-4">
												<h4 className="text-foreground font-medium">{option.label}</h4>
												<div className="mt-1 flex flex-wrap gap-2">
													{option.values.map(value => (
														<Badge key={value} variant="secondary" className="text-xs">
															{value}
														</Badge>
													))}
													{option.required && (
														<Badge variant="destructive" className="text-xs">
															Required
														</Badge>
													)}
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Organizer Information */}
						{(eventData?.expand?.organizer || organizerData) && (
							<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Building2 className="h-5 w-5" />
										Event Organizer
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-start gap-4">
										{(eventData?.expand?.organizer?.logo || organizerData?.logo) && (
											<div className="border-border/20 relative h-16 w-16 overflow-hidden rounded-lg border">
												<Image
													alt="Organizer Logo"
													className="object-contain p-2"
													fill
													sizes="64px"
													src={`/api/files/pbc_4261386219/${eventData?.expand?.organizer?.id || organizerData?.id}/${eventData?.expand?.organizer?.logo || organizerData?.logo}`}
												/>
											</div>
										)}
										<div className="flex-1 space-y-2">
											<div className="flex items-center gap-2">
												<h3 className="text-foreground font-semibold">
													{eventData?.expand?.organizer?.name || organizerData?.name}
												</h3>
												{(eventData?.expand?.organizer?.isPartnered || organizerData?.isPartnered) && (
													<Badge variant="default" className="flex items-center gap-1">
														<CheckCircle2 className="h-3 w-3" />
														Partner
													</Badge>
												)}
											</div>
											{(eventData?.expand?.organizer?.website || organizerData?.website) && (
												<Link
													className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm transition-colors"
													href={eventData?.expand?.organizer?.website || organizerData?.website || '#'}
													target="_blank"
													rel="noopener noreferrer"
												>
													<Globe className="h-4 w-4" />
													{eventData?.expand?.organizer?.website || organizerData?.website}
													<ExternalLink className="h-3 w-3" />
												</Link>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* External Links */}
						{(eventData?.registrationUrl || eventData?.parcoursUrl) && (
							<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<ExternalLink className="h-5 w-5" />
										Useful Links
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex flex-col gap-3">
										{eventData.registrationUrl && (
											<Link
												className="text-primary hover:text-primary/80 flex items-center gap-2 transition-colors"
												href={eventData.registrationUrl}
												target="_blank"
												rel="noopener noreferrer"
											>
												<TrendingUp className="h-4 w-4" />
												Official Registration
												<ExternalLink className="h-3 w-3" />
											</Link>
										)}
										{eventData.parcoursUrl && (
											<Link
												className="text-primary hover:text-primary/80 flex items-center gap-2 transition-colors"
												href={eventData.parcoursUrl}
												target="_blank"
												rel="noopener noreferrer"
											>
												<MapPinned className="h-4 w-4" />
												Race Course Map
												<ExternalLink className="h-3 w-3" />
											</Link>
										)}
									</div>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Other Bibs Section */}
					{samEventBibs.length > 0 && (
						<div className="mt-12">
							<div className="mb-6 text-center">
								<h2 className="text-foreground text-2xl font-bold tracking-tight">See other bibs for this event</h2>
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
				title="Secure Payment with PayPal"
				variant="slide"
			>
				<div className="container mx-auto p-6">
					<div className="flex gap-6">
						<div className="flex flex-col gap-6 lg:w-2/3">
							{/* Event Summary Card */}
							<div className="bg-muted/30 border-border/20 rounded-lg border p-6">
								<div className="flex items-start gap-4">
									<div className="relative h-16 w-16 overflow-hidden rounded-lg">
										<Image alt="Event Image" className="object-cover" fill sizes="64px" src={bib.event.image} />
									</div>
									<div className="flex-1">
										<h3 className="font-semibold">{bib.event.name}</h3>
										<p className="text-muted-foreground text-sm">{formatDateWithLocale(bib.event.date, locale)}</p>
										<p className="text-muted-foreground text-sm">{bib.event.location}</p>
									</div>
									<div className="text-right">
										<p className="text-lg font-bold">{bib.price}€</p>
										{Boolean(bib.originalPrice && bib.originalPrice > bib.price) && (
											<p className="text-muted-foreground text-sm line-through">{bib.originalPrice}€</p>
										)}
									</div>
								</div>
							</div>

							{/* Order Summary */}
							<div className="bg-muted/30 border-border/20 rounded-lg border p-4">
								<h3 className="text-muted-foreground mb-3 text-sm font-medium">Order Summary</h3>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm">Race bib</span>
										<span className="text-sm">{bib.price}€</span>
									</div>
									{Boolean(bib.originalPrice && bib.originalPrice > bib.price) && (
										<div className="flex items-center justify-between text-green-600">
											<span className="text-sm">Discount</span>
											<span className="text-sm">-{(bib.originalPrice - bib.price).toFixed(2)}€</span>
										</div>
									)}
									<div className="border-border/20 border-t pt-2">
										<div className="flex items-center justify-between font-semibold">
											<span>Total</span>
											<span>{bib.price}€</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* PayPal Payment Section */}
						<div className="space-y-6 lg:w-1/3">
							<div>
								<h3 className="text-muted-foreground mb-3 text-sm font-medium">Payment Method</h3>
								<div className="bg-background border-border/20 rounded-lg border p-4">
									{/* Error Messages */}
									{Boolean(errorMessage) && (
										<div className="bg-destructive/10 text-destructive border-destructive/20 mb-4 rounded-lg border p-3 text-sm">
											{errorMessage}
										</div>
									)}

									{/* Success Messages */}
									{Boolean(successMessage) && (
										<div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600">
											{successMessage}
										</div>
									)}

									<PayPalButtons
										createOrder={handleCreateOrder}
										disabled={loading || !isProfileComplete}
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

							{/* Enhanced Trust indicators */}
							<div className="space-y-4">
								<div className="border-border/20 border-t pt-4">
									<div className="text-muted-foreground flex items-center justify-center gap-6 text-xs">
										<div className="flex items-center gap-1">
											<svg className="h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
												<path
													clipRule="evenodd"
													d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
													fillRule="evenodd"
												/>
											</svg>
											256-bit SSL
										</div>
										<div className="flex items-center gap-1">
											<svg className="h-3 w-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
												<path
													clipRule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													fillRule="evenodd"
												/>
											</svg>
											PayPal Secured
										</div>
										<div className="flex items-center gap-1">
											<svg className="h-3 w-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
												<path
													clipRule="evenodd"
													d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													fillRule="evenodd"
												/>
											</svg>
											PCI Compliant
										</div>
									</div>
								</div>

								{/* Additional Trust Elements */}
								<div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
									<div className="flex items-start gap-3">
										<svg
											className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												clipRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												fillRule="evenodd"
											/>
										</svg>
										<div className="text-sm">
											<p className="font-medium text-green-800 dark:text-green-300">100% Secure Transaction</p>
											<p className="mt-1 text-green-700 dark:text-green-400">
												Your payment is processed securely through PayPal's trusted platform. We never store your
												payment details.
											</p>
										</div>
									</div>
								</div>

								<div className="space-y-2 text-center">
									<p className="text-muted-foreground text-xs">Trusted by thousands of athletes worldwide</p>
									<div className="text-muted-foreground flex items-center justify-center gap-4 text-xs">
										<span>🔒 Bank-level encryption</span>
										<span>⚡ Instant confirmation</span>
										<span>🛡️ Fraud protection</span>
									</div>
									<p className="text-muted-foreground text-xs">Questions? Contact our support team at any time</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</SlidingPanel>
		</div>
	)
}
