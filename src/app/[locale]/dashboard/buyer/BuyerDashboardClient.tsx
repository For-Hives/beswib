'use client'

import { Calendar, CheckCircle, Clock, MapPinned, Package, ShoppingCart, Tag, Users } from 'lucide-react'

import Image from 'next/image'
import Link from 'next/link'

import type { Transaction } from '@/models/transaction.model'
import type { Waitlist } from '@/models/waitlist.model'
import type { Event } from '@/models/event.model'
import type { Bib } from '@/models/bib.model'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateObjectForDisplay } from '@/lib/utils/date'
import { getTranslations } from '@/lib/i18n/dictionary'
import { getBibImageUrl } from '@/lib/utils/images'
import { Button } from '@/components/ui/button'

interface BuyerDashboardClientProps {
	clerkUser: SerializedClerkUser
	locale: Locale
	buyerTransactions: (Transaction & { expand?: { bib_id?: Bib & { expand?: { eventId: Event } } } })[]
	purchaseSuccess: boolean
	successEventName: string
	userWaitlists: (Waitlist & { expand?: { event_id: Event } })[]
	totalSpent: number
}

interface SerializedClerkUser {
	emailAddresses: { emailAddress: string; id: string }[]
	firstName: null | string
	id: string
	imageUrl: string
	lastName: null | string
	username: null | string
}

import { Locale } from '@/lib/i18n/config'

import buyerTranslations from './locales.json'

export default function BuyerDashboardClient({
	userWaitlists = [],
	totalSpent,
	successEventName,
	purchaseSuccess,
	locale,
	clerkUser,
	buyerTransactions = [],
}: BuyerDashboardClientProps) {
	const t = getTranslations(locale, buyerTranslations)

	const userName = clerkUser?.firstName ?? clerkUser?.emailAddresses?.[0]?.emailAddress ?? 'Buyer'

	// Calculate statistics with safety checks
	const succeededTransactions = buyerTransactions.filter(tx => tx.status === 'succeeded')
	const totalPurchases = succeededTransactions.length
	const waitlistEntries = Array.isArray(userWaitlists) ? userWaitlists.length : 0

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

			{/* User header */}
			<div className="bg-card/25 border-border/30 absolute top-0 right-0 left-0 z-20 mx-4 mt-12 mb-6 rounded-2xl border p-4 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-muted-foreground text-sm">{t.title}</p>
						<p className="text-foreground flex items-center gap-2 font-medium">
							<ShoppingCart className="h-4 w-4" />
							{userName}
							{clerkUser?.emailAddresses?.[0] !== undefined && (
								<span className="text-muted-foreground ml-2 text-sm">({clerkUser.emailAddresses[0].emailAddress})</span>
							)}
						</p>
					</div>
					<div className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-500">
						{t.badge ?? 'BUYER'}
					</div>
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
								<CardTitle className="text-muted-foreground text-sm">
									{t.totalPurchasesLabel ?? 'Total Purchases'}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalPurchases}</div>
							</CardContent>
						</Card>

						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-muted-foreground text-sm">
									{t.waitlistEntriesLabel ?? 'Waitlist Entries'}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{waitlistEntries}</div>
							</CardContent>
						</Card>

						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-muted-foreground text-sm">{t.totalSpentLabel ?? 'Total Spent'}</CardTitle>
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
								<CardDescription>{t.trackPurchases ?? 'Track your race bib purchases and transfers'}</CardDescription>
							</CardHeader>
							<CardContent>
								{totalPurchases > 0 ? (
									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
										{succeededTransactions.map(tx => {
											const bib = tx.expand?.bib_id
											if (!tx?.id || !bib || !bib.id) return null
											return (
												<div className="group relative h-full w-full" key={tx.id}>
													<div className="bg-card/80 border-border hover:border-foreground/35 relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md transition-all duration-300">
														{/* Background pattern */}
														<div className="absolute inset-0 -z-20 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px] opacity-50 dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]" />
														<div className="bg-background pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-25 dark:bg-black" />

														{/* Status badge */}
														<div className="absolute top-0 right-0 z-20 m-4">
															<span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
																{t.purchased ?? 'Purchased'}
															</span>
														</div>

														{/* Event Image */}
														<div className="relative flex justify-center px-4 pt-4">
															<div className="from-green/20 via-emerald/20 to-teal/20 before:from-green before:via-emerald before:to-teal before:to-ring relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br shadow-[inset_0_0_20px_hsl(var(--primary)/0.3),inset_0_0_40px_hsl(var(--accent)/0.2),0_0_30px_hsl(var(--primary)/0.4)] before:absolute before:inset-0 before:-z-10 before:m-[-1px] before:rounded-xl before:bg-gradient-to-br before:p-0.5">
																<Image
																	src={getBibImageUrl(bib)}
																	alt={bib.expand?.eventId?.name ?? 'Event'}
																	fill
																	className="object-cover"
																	sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
																/>
															</div>
														</div>

														{/* Content */}
														<div className="flex flex-1 flex-col gap-4 p-4">
															{/* Event name */}
															<div className="flex w-full flex-col gap-2">
																<h3 className="text-foreground truncate text-lg font-bold">
																	{bib.expand?.eventId?.name ?? `${t.eventId ?? 'Event ID:'} ${bib.eventId}`}
																</h3>
															</div>

															{/* Price paid highlight */}
															<div className="from-green/10 via-emerald/10 to-teal/10 rounded-xl bg-gradient-to-r p-3">
																<div className="flex items-center justify-between">
																	<div>
																		<p className="text-muted-foreground text-xs">{t.pricePaid ?? 'Price Paid'}</p>
																		<p className="text-foreground text-lg font-bold">
																			€{tx.amount?.toFixed(2) ?? 'N/A'}
																		</p>
																	</div>
																	<div className="text-right">
																		<div className="text-muted-foreground space-y-0.5 text-xs">
																			<p className="flex items-center gap-1">
																				<Calendar className="h-3 w-3" />
																				{bib.expand?.eventId
																					? formatDateObjectForDisplay(new Date(bib.expand.eventId.eventDate), locale)
																					: 'N/A'}
																			</p>
																		</div>
																	</div>
																</div>
															</div>

															{/* Registration details */}
															<div className="space-y-2">
																<div className="flex items-center gap-2">
																	<Tag className="text-muted-foreground h-4 w-4" />
																	<p className="text-muted-foreground text-sm">
																		{t.registrationNumber ?? 'Registration Number'}: {bib.registrationNumber ?? 'N/A'}
																	</p>
																</div>

																{bib.expand?.eventId?.location && (
																	<div className="flex items-center gap-2">
																		<MapPinned className="text-muted-foreground h-4 w-4" />
																		<p className="text-muted-foreground truncate text-sm">
																			{bib.expand.eventId.location}
																		</p>
																	</div>
																)}
															</div>

															{/* Purchase date */}
															<div className="border-border/50 mt-auto border-t pt-2">
																<p className="text-muted-foreground text-xs">
																	{t.purchaseDate ?? 'Purchased on'}:{' '}
																	{formatDateObjectForDisplay(new Date(tx.created), locale)}
																</p>
															</div>
														</div>
													</div>
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
											<Button className="cursor-pointer">{t.browseEvents}</Button>
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
									{t.waitlistIntro ?? "Events you're waiting for bibs to become available"}
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
															{waitlist.expand?.event_id?.name ?? `Event ID: ${waitlist.event_id}`}
														</h4>
														<span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
															{t.waiting ?? 'Waiting'}
														</span>
													</div>
													<div className="text-muted-foreground space-y-1 text-sm">
														<p className="flex items-center gap-2">
															<Calendar className="h-4 w-4" />
															{t.dateOfEvent ?? 'Date of Event'}:{' '}
															{waitlist.expand?.event_id
																? formatDateObjectForDisplay(new Date(waitlist.expand.event_id.eventDate), locale)
																: 'N/A'}
														</p>
														<p>
															{t.dateAddedToWaitlist ?? 'Date Added to Waitlist'}:{' '}
															{formatDateObjectForDisplay(new Date(waitlist.added_at), locale)}
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
											<Button variant="outline">{t.browseEvents}</Button>
										</Link>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Quick Actions */}
					<div className="mt-8">
						<h2 className="text-foreground mb-6 text-xl font-bold">{t.quickActions}</h2>
						<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
							<Link href="/marketplace">
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<ShoppingCart className="text-primary mb-2 h-8 w-8" />
										<p className="text-sm font-medium">{t.browseMarketplace}</p>
									</CardContent>
								</Card>
							</Link>

							<Link href="/events">
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<Calendar className="text-primary mb-2 h-8 w-8" />
										<p className="text-sm font-medium">{t.browseEvents}</p>
									</CardContent>
								</Card>
							</Link>

							<Link href="/dashboard">
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<Users className="text-primary mb-2 h-8 w-8" />
										<p className="text-sm font-medium">{t.mainDashboard}</p>
									</CardContent>
								</Card>
							</Link>

							<Link href="/contact">
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<Clock className="text-primary mb-2 h-8 w-8" />
										<p className="text-sm font-medium">{t.getHelp}</p>
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
