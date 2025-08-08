'use client'

import { Calendar, CheckCircle, Clock, Package, ShoppingCart, Users } from 'lucide-react'

import Link from 'next/link'

import type { Waitlist } from '@/models/waitlist.model'
import type { Event } from '@/models/event.model'
import type { Bib } from '@/models/bib.model'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getTranslations } from '@/lib/getDictionary'
import { Button } from '@/components/ui/button'
import { formatDateObjectForDisplay } from '@/lib/dateUtils'

interface BuyerDashboardClientProps {
	clerkUser: SerializedClerkUser
	locale: Locale
	purchasedBibs: (Bib & { expand?: { eventId: Event } })[]
	purchaseSuccess: boolean
	successEventName: string
	userWaitlists: (Waitlist & { expand?: { eventId: Event } })[]
}

interface SerializedClerkUser {
	emailAddresses: { emailAddress: string; id: string }[]
	firstName: null | string
	id: string
	imageUrl: string
	lastName: null | string
	username: null | string
}

import { Locale } from '@/lib/i18n-config'

import buyerTranslations from './locales.json'

export default function BuyerDashboardClient({
	userWaitlists = [],
	successEventName,
	purchaseSuccess,
	purchasedBibs = [],
	locale,
	clerkUser,
}: BuyerDashboardClientProps) {
	const t = getTranslations(locale, buyerTranslations)

	const userName = clerkUser?.firstName ?? clerkUser?.emailAddresses?.[0]?.emailAddress ?? 'Buyer'

	// Calculate statistics with safety checks
	const totalPurchases = Array.isArray(purchasedBibs) ? purchasedBibs.length : 0
	const totalSpent = Array.isArray(purchasedBibs) ? purchasedBibs.reduce((sum, bib) => sum + (bib?.price || 0), 0) : 0
	const waitlistEntries = Array.isArray(userWaitlists) ? userWaitlists.length : 0

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

			{/* User header */}
			<div className="bg-card/25 border-border/30 absolute top-0 right-0 left-0 z-20 mx-4 mt-12 mb-6 rounded-2xl border p-4 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-muted-foreground text-sm">Buyer Dashboard</p>
						<p className="text-foreground flex items-center gap-2 font-medium">
							<ShoppingCart className="h-4 w-4" />
							{userName}
							{clerkUser?.emailAddresses?.[0] !== undefined && (
								<span className="text-muted-foreground ml-2 text-sm">({clerkUser.emailAddresses[0].emailAddress})</span>
							)}
						</p>
					</div>
					<div className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-500">BUYER</div>
				</div>
			</div>

			<div className="relative pt-32 pb-12">
				<div className="container mx-auto max-w-6xl p-6">
					{/* Success Message */}
					{purchaseSuccess && successEventName && (
						<div className="mb-8 rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-900/20">
							<div className="flex items-center gap-3">
								<CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
								<div>
									<p className="font-medium text-green-800 dark:text-green-200">
										{t.purchaseSuccess ?? 'Congratulations! You have successfully purchased the bib for'}{' '}
										<strong>{successEventName}</strong>
									</p>
									<p className="text-sm text-green-700 dark:text-green-300">
										{t.purchaseSuccessDetails ?? 'Your new bib details are listed below.'}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Statistics Cards */}
					<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-muted-foreground text-sm">Total Purchases</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalPurchases}</div>
							</CardContent>
						</Card>

						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-muted-foreground text-sm">Waitlist Entries</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{waitlistEntries}</div>
							</CardContent>
						</Card>

						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-muted-foreground text-sm">Total Spent</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">€{totalSpent.toFixed(2)}</div>
							</CardContent>
						</Card>
					</div>

					{/* Main Content */}
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
						{/* Purchase History */}
						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ShoppingCart className="h-5 w-5" />
									{t.myPurchases ?? 'My Purchases'}
								</CardTitle>
								<CardDescription>Track your race bib purchases and transfers</CardDescription>
							</CardHeader>
							<CardContent>
								{totalPurchases > 0 ? (
									<div className="space-y-4">
										{purchasedBibs.map(bib => {
											if (!bib?.id) return null
											return (
												<div className="rounded-lg border p-4" key={bib.id}>
													<div className="mb-2 flex items-start justify-between">
														<h4 className="font-semibold">
															{t.bibForLabel ?? 'Bib for'} {bib.expand?.eventId?.name ?? `Event ID: ${bib.eventId}`}
														</h4>
														<span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
															Purchased
														</span>
													</div>
													<div className="text-muted-foreground space-y-1 text-sm">
														<p className="flex items-center gap-2">
															<Calendar className="h-4 w-4" />
															{t.dateOfEvent ?? 'Date of Event'}:{' '}
															{bib.expand?.eventId
																? formatDateObjectForDisplay(new Date(bib.expand.eventId.eventDate), locale)
																: 'N/A'}
														</p>
														<p>
															{t.registrationNumber ?? 'Registration Number'}: {bib.registrationNumber}
														</p>
														<p>
															{t.pricePaid ?? 'Price Paid'}: €{bib.price?.toFixed(2) ?? 'N/A'}
														</p>
													</div>
													<p className="text-muted-foreground mt-2 text-xs">
														{t.keepRecords ?? '(Keep this for your records)'}
													</p>
												</div>
											)
										})}
									</div>
								) : (
									<div className="py-8 text-center">
										<Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
										<p className="text-muted-foreground mb-4">
											{t.noPurchases ?? "You haven't made any purchases yet"}
										</p>
										<Link href="/events">
											<Button>Browse Events</Button>
										</Link>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Waitlist */}
						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Clock className="h-5 w-5" />
									{t.waitlistEntries ?? 'Your Waitlist Entries'}
								</CardTitle>
								<CardDescription>
									Events you're waiting for bibs to become available
									<br />
									<Link className="text-primary hover:underline" href="/events">
										{t.browseEventsWaitlist ?? 'Browse events'}
									</Link>{' '}
									{t.waitlistJoinText ?? 'to join a waitlist if no bibs are available.'}
								</CardDescription>
							</CardHeader>
							<CardContent>
								{waitlistEntries > 0 ? (
									<div className="space-y-4">
										{userWaitlists.map(waitlist => {
											if (!waitlist?.id) return null
											return (
												<div className="rounded-lg border p-4" key={waitlist.id}>
													<div className="mb-2 flex items-start justify-between">
														<h4 className="font-semibold">
															{waitlist.expand?.eventId?.name ?? `Event ID: ${waitlist.eventId}`}
														</h4>
														<span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
															Waiting
														</span>
													</div>
													<div className="text-muted-foreground space-y-1 text-sm">
														<p className="flex items-center gap-2">
															<Calendar className="h-4 w-4" />
															{t.dateOfEvent ?? 'Date of Event'}:{' '}
															{waitlist.expand?.eventId
																? formatDateObjectForDisplay(new Date(waitlist.expand.eventId.eventDate), locale)
																: 'N/A'}
														</p>
														<p>
															{t.dateAddedToWaitlist ?? 'Date Added to Waitlist'}:{' '}
															{formatDateObjectForDisplay(new Date(waitlist.addedAt), locale)}
														</p>
														<p className="flex items-center gap-2">
															<Users className="h-4 w-4" />
															{t.status ?? 'Status'}: {t.waitingForNotification ?? 'Waiting for notification'}
														</p>
													</div>
												</div>
											)
										})}
									</div>
								) : (
									<div className="py-8 text-center">
										<Clock className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
										<p className="text-muted-foreground mb-4">
											{t.noWaitlistEntries ?? 'You are not currently on any waitlists.'}
										</p>
										<Link href="/events">
											<Button variant="outline">Browse Events</Button>
										</Link>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Quick Actions */}
					<div className="mt-8">
						<h2 className="text-foreground mb-6 text-xl font-bold">Quick Actions</h2>
						<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
							<Link href="/marketplace">
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<ShoppingCart className="text-primary mb-2 h-8 w-8" />
										<p className="text-sm font-medium">Browse Marketplace</p>
									</CardContent>
								</Card>
							</Link>

							<Link href="/events">
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<Calendar className="text-primary mb-2 h-8 w-8" />
										<p className="text-sm font-medium">Browse Events</p>
									</CardContent>
								</Card>
							</Link>

							<Link href="/dashboard">
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<Users className="text-primary mb-2 h-8 w-8" />
										<p className="text-sm font-medium">Main Dashboard</p>
									</CardContent>
								</Card>
							</Link>

							<Link href="/contact">
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<Clock className="text-primary mb-2 h-8 w-8" />
										<p className="text-sm font-medium">Get Help</p>
									</CardContent>
								</Card>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
