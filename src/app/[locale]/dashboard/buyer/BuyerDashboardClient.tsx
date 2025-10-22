'use client'

import {
	Calendar,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Clock,
	HelpCircle,
	MapPinned,
	Package,
	ShoppingCart,
	Tag,
	Users,
	X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { formatDateObjectForDisplay } from '@/lib/utils/date'
import { getOrganizerImageUrl, getRandomBibPlaceholder } from '@/lib/utils/images'
import type { Bib } from '@/models/bib.model'
import type { Event } from '@/models/event.model'
import type { Organizer } from '@/models/organizer.model'
import type { Transaction } from '@/models/transaction.model'
import type { Waitlist } from '@/models/waitlist.model'

import buyerTranslations from './locales.json'

interface SerializedClerkUser {
	emailAddresses: { emailAddress: string; id: string }[]
	firstName: null | string
	id: string
	imageUrl: string
	lastName: null | string
	username: null | string
}

interface BuyerDashboardClientProps {
	clerkUser: SerializedClerkUser
	locale: Locale
	buyerTransactions: (Transaction & {
		expand?: {
			bib_id?: Bib & {
				expand?: {
					eventId: Event & {
						expand?: { organizer: Organizer }
					}
				}
			}
		}
	})[]
	purchaseSuccess: boolean
	successEventName: string
	userWaitlists: (Waitlist & { expand?: { event_id: Event } })[]
	totalSpent: number
}

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

	// Helper function to safely get pagination translations
	const getPaginationText = (key: string, fallback: string): string => {
		try {
			const pagination = t.pagination as Record<string, string> | undefined
			return pagination?.[key] ?? fallback
		} catch {
			return fallback
		}
	}

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 5

	// Delete confirmation state
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [waitlistToDelete, setWaitlistToDelete] = useState<Waitlist | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

	// Helper function to get event image from organizer or placeholder
	const getEventImage = (
		bib: Bib & {
			expand?: { eventId: Event & { expand?: { organizer: Organizer } } }
		}
	) => {
		const organizer = bib.expand?.eventId?.expand?.organizer
		if (organizer != null) {
			return getOrganizerImageUrl(organizer, bib.id)
		}
		return getRandomBibPlaceholder(bib.id)
	}

	const userName = clerkUser?.firstName ?? clerkUser?.emailAddresses?.[0]?.emailAddress ?? 'Buyer'

	// Calculate statistics with safety checks
	const succeededTransactions = buyerTransactions.filter(tx => tx.status === 'succeeded')
	const totalPurchases = succeededTransactions.length

	// Filter waitlist to show only future events
	const futureWaitlists = Array.isArray(userWaitlists)
		? userWaitlists.filter(waitlist => {
				const eventDate = waitlist.expand?.event_id?.eventDate
				if (!eventDate) return true // Keep events without date to be safe
				return new Date(eventDate) > new Date()
			})
		: []
	const waitlistEntries = futureWaitlists.length

	// Pagination calculations
	const totalPages = Math.ceil(futureWaitlists.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const endIndex = startIndex + itemsPerPage
	const currentWaitlists = futureWaitlists.slice(startIndex, endIndex)

	// Handle page change
	const handlePageChange = (page: number) => {
		setCurrentPage(page)
	}

	// Handle delete confirmation
	const handleDeleteClick = (waitlist: Waitlist) => {
		setWaitlistToDelete(waitlist)
		setDeleteDialogOpen(true)
	}

	// Handle delete confirmation
	const handleDeleteConfirm = async () => {
		if (!waitlistToDelete) return

		console.info('🔍 Client: Starting delete confirmation for waitlist:', waitlistToDelete)
		setIsDeleting(true)
		try {
			const requestBody = {
				eventId: waitlistToDelete.event_id,
			}
			console.info('🔍 Client: Sending request with body:', requestBody)

			const response = await fetch('/api/waitlist/remove', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			})

			console.info('🔍 Client: Response status:', response.status)
			console.info('🔍 Client: Response ok:', response.ok)

			if (response.ok) {
				const responseData = (await response.json()) as { success: boolean }
				console.info('🔍 Client: Response data:', responseData)
				console.info('✅ Client: Successfully disabled notifications, reloading page')
				// Reload the page to update the waitlist
				window.location.reload()
			} else {
				const errorData = (await response.json().catch(() => 'No error data')) as unknown
				console.error(
					'❌ Client: Failed to disable waitlist notifications. Status:',
					response.status,
					'Error:',
					errorData
				)
			}
		} catch (error) {
			console.error('❌ Client: Error disabling waitlist notifications:', error)
		} finally {
			setIsDeleting(false)
			setDeleteDialogOpen(false)
			setWaitlistToDelete(null)
		}
	}

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
								<span className="text-muted-foreground text-sm">({clerkUser.emailAddresses[0].emailAddress})</span>
							)}
						</p>
					</div>
					<div className="text-right">
						<div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
							{t.badge ?? 'BUYER'}
						</div>
					</div>
				</div>
			</div>

			{/* Success Message */}
			{purchaseSuccess && (
				<div className="absolute top-24 left-1/2 z-30 mx-4 -translate-x-1/2 rounded-2xl border border-green-200 bg-green-50 p-4 backdrop-blur-sm dark:border-green-800 dark:bg-green-900/20">
					<div className="flex items-center gap-3">
						<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
						<div>
							<p className="font-medium text-green-800 dark:text-green-200">
								{t.purchaseSuccess ?? 'Congratulations! You have successfully purchased the bib for'} {successEventName}
							</p>
							<p className="text-sm text-green-700 dark:text-green-300">
								{t.purchaseSuccessDetails ?? 'Your new bib details are listed below.'}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className="relative pt-32 pb-12">
				<div className="container mx-auto max-w-6xl p-6">
					{/* Stats Cards */}
					<div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardContent className="p-6">
								<div className="flex items-center gap-3">
									<div className="rounded-full bg-blue-500/10 p-3 text-blue-500">
										<ShoppingCart className="h-6 w-6" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm">{t.totalPurchasesLabel ?? 'Total Purchases'}</p>
										<p className="text-2xl font-bold">{totalPurchases}</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardContent className="p-6">
								<div className="flex items-center gap-3">
									<div className="rounded-full bg-yellow-500/10 p-3 text-yellow-500">
										<Clock className="h-6 w-6" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm">{t.waitlistEntriesLabel ?? 'Waitlist Entries'}</p>
										<p className="text-2xl font-bold">{waitlistEntries}</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardContent className="p-6">
								<div className="flex items-center gap-3">
									<div className="rounded-full bg-green-500/10 p-3 text-green-500">
										<Tag className="h-6 w-6" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm">{t.totalSpentLabel ?? 'Total Spent'}</p>
										<p className="text-2xl font-bold">€{totalSpent?.toFixed(2) ?? '0.00'}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Quick Actions */}
					<div className="mb-8">
						<h2 className="text-foreground mb-4 text-xl font-semibold">{t.quickActions ?? 'Quick Actions'}</h2>
						<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
							<Link href="/marketplace">
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
											<ShoppingCart className="h-6 w-6" />
										</div>
										<p className="text-sm font-medium">{t.browseMarketplace ?? 'Browse Marketplace'}</p>
									</CardContent>
								</Card>
							</Link>

							<Link href={`/${locale}/dashboard`}>
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
											<CheckCircle className="h-6 w-6" />
										</div>
										<p className="text-sm font-medium">{t.mainDashboard ?? 'Main Dashboard'}</p>
									</CardContent>
								</Card>
							</Link>

							<Link href={`/${locale}/contact`}>
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
											<HelpCircle className="h-6 w-6" />
										</div>
										<p className="text-sm font-medium">{t.getHelp ?? 'Get Help'}</p>
									</CardContent>
								</Card>
							</Link>
						</div>
					</div>

					{/* Main Content */}
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
									<div
										className={`grid max-h-[100vh] grid-cols-1 gap-6 overflow-y-auto md:grid-cols-2 ${totalPurchases > 6 ? 'pr-4' : ''}`}
									>
										{succeededTransactions.map(tx => {
											if (tx == null) return null
											const bib = tx.expand?.bib_id
											if (!bib || !bib.id) return null
											return (
												<div className="group relative h-full w-full" key={tx.id}>
													<div className="bg-card/80 border-border hover:border-foreground/35 relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md transition-all duration-300">
														{/* Background pattern */}
														<div className="absolute inset-0 -z-20 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px] opacity-50 dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]" />
														<div className="bg-background pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-25 dark:bg-black" />

														{/* Status badge */}
														<div className="absolute top-0 right-0 z-20 m-4">
															<span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-700 dark:text-white">
																{t.purchased ?? 'Purchased'}
															</span>
														</div>

														{/* Event Image */}
														<div className="relative flex justify-center px-4 pt-4">
															<div className="from-green/20 via-emerald/20 to-teal/20 before:from-green before:via-emerald before:to-teal before:to-ring relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br shadow-[inset_0_0_20px_hsl(var(--primary)/0.3),inset_0_0_40px_hsl(var(--accent)/0.2),0_0_30px_hsl(var(--primary)/0.4)] before:absolute before:inset-0 before:-z-10 before:m-[-1px] before:rounded-xl before:bg-gradient-to-br before:p-0.5">
																<Image
																	src={getEventImage(bib)}
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
															<div className="from-green/25 via-emerald/25 to-teal/25 rounded-xl bg-gradient-to-r">
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
																				{bib.expand?.eventId?.eventDate
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

																{bib.expand?.eventId?.location != null &&
																	typeof bib.expand.eventId.location === 'string' &&
																	bib.expand.eventId.location.trim() !== '' && (
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
																	{formatDateObjectForDisplay(new Date(tx.created as string), locale)}
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
										<Link href={`/${locale}/events`}>
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
										{currentWaitlists.map(waitlist => {
											if (!waitlist?.id) return null
											return (
												<div className="rounded-lg border p-4" key={waitlist.id}>
													<div className="mb-2 flex items-start justify-between">
														<h4 className="font-semibold">
															{waitlist.expand?.event_id?.name ?? `Event ID: ${waitlist.event_id}`}
														</h4>
														<div className="flex items-center gap-2">
															<span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
																{t.waiting ?? 'Waiting'}
															</span>
															<button
																onClick={() => handleDeleteClick(waitlist)}
																className="text-muted-foreground hover:text-destructive cursor-pointer rounded-full p-1 transition-colors"
																title={t.removeFromWaitlist ?? 'Remove from waitlist'}
															>
																<X className="h-4 w-4" />
															</button>
														</div>
													</div>
													<div className="text-muted-foreground space-y-1 text-sm">
														<p className="flex items-center gap-2">
															<Calendar className="h-4 w-4" />
															{t.dateOfEvent ?? 'Date of Event'}{' '}
															{waitlist.expand?.event_id?.eventDate
																? formatDateObjectForDisplay(new Date(waitlist.expand.event_id.eventDate), locale)
																: 'N/A'}
														</p>
														<p>
															{t.dateAddedToWaitlist ?? 'Date Added to Waitlist'}{' '}
															{waitlist.added_at != null
																? formatDateObjectForDisplay(new Date(waitlist.added_at), locale)
																: 'N/A'}
														</p>
														<p className="flex items-center gap-2">
															<Users className="h-4 w-4" />
															{t.status ?? 'Status'} {t.waitingForNotification ?? 'Waiting for notification'}
														</p>
														{/* Fallback info if expansion failed */}
														{!waitlist.expand?.event_id && (
															<p className="text-xs text-orange-600 dark:text-orange-400">
																Event ID: {waitlist.event_id} (Event details loading...)
															</p>
														)}
													</div>
												</div>
											)
										})}

										{/* Pagination Controls */}
										{totalPages > 1 && (
											<div className="flex items-center justify-between border-t pt-4">
												<div className="text-muted-foreground text-sm">
													{getPaginationText('showing', 'Showing')} {startIndex + 1} {getPaginationText('to', 'to')}{' '}
													{Math.min(endIndex, futureWaitlists.length)} {getPaginationText('ofTotal', 'of')}{' '}
													{futureWaitlists.length} {getPaginationText('entries', 'entries')}
												</div>
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handlePageChange(currentPage - 1)}
														disabled={currentPage === 1}
													>
														<ChevronLeft className="mr-1 h-4 w-4" />
														{getPaginationText('previous', 'Previous')}
													</Button>
													<span className="text-muted-foreground text-sm">
														{getPaginationText('page', 'Page')} {currentPage} {getPaginationText('of', 'of')}{' '}
														{totalPages}
													</span>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handlePageChange(currentPage + 1)}
														disabled={currentPage === totalPages}
													>
														{getPaginationText('next', 'Next')}
														<ChevronRight className="ml-1 h-4 w-4" />
													</Button>
												</div>
											</div>
										)}
									</div>
								) : (
									<div className="py-8 text-center">
										<Clock className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
										<p className="text-muted-foreground mb-4">
											{t.noWaitlistEntries ?? 'You are not currently on any waitlists.'}
										</p>
										<Link href={`/${locale}/events`}>
											<Button variant="outline">{t.browseEvents}</Button>
										</Link>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			{/* Disable Notifications Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.disableWaitlistNotifications}</AlertDialogTitle>
						<AlertDialogDescription>{t.disableWaitlistConfirm}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>{t.cancel}</AlertDialogCancel>
						<AlertDialogAction
							onClick={void handleDeleteConfirm}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? t.disabling : t.disable}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
