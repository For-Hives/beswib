'use client'

import { Edit3, List, Plus, Search, Tag, Users } from 'lucide-react'

import Link from 'next/link'

import type { Event } from '@/models/event.model'
import type { Bib } from '@/models/bib.model'
import type { User } from '@/models/user.model'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SellerProfileValidation from '@/components/dashboard/seller/SellerProfileValidation'
import { getTranslations } from '@/lib/getDictionary'
import { Button } from '@/components/ui/button'
import { formatDateObjectForDisplay } from '@/lib/dateUtils'

interface SellerDashboardClientProps {
	clerkUser: SerializedClerkUser
	locale: Locale
	sellerBibs: (Bib & { expand?: { eventId: Event } })[]
	user: User
}

interface SerializedClerkUser {
	emailAddresses: { emailAddress: string; id: string }[]
	firstName: null | string
	id: string
	imageUrl: string
	lastName: null | string
	username: null | string
}

// Status display mapping
const getStatusDisplay = (status: string) => {
	switch (status) {
		case 'available':
			return { label: 'Available', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' }
		case 'expired':
			return { label: 'Expired', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' }
		case 'sold':
			return { label: 'Sold', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' }
		case 'validation_failed':
			return { label: 'Validation Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' }
		case 'withdrawn':
			return { label: 'Withdrawn', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' }
		default:
			return { label: status, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' }
	}
}

import { Locale } from '@/lib/i18n-config'

import sellerTranslations from './locales.json'

export default function SellerDashboardClient({
	sellerBibs = [],
	locale,
	clerkUser,
	user,
}: SellerDashboardClientProps) {
	const t = getTranslations(locale, sellerTranslations)

	const userName = clerkUser?.firstName ?? clerkUser?.emailAddresses?.[0]?.emailAddress ?? 'Seller'

	// Calculate statistics with safety checks
	const totalListings = Array.isArray(sellerBibs) ? sellerBibs.length : 0
	const availableBibs = Array.isArray(sellerBibs) ? sellerBibs.filter(bib => bib.status === 'available').length : 0
	const soldBibs = Array.isArray(sellerBibs) ? sellerBibs.filter(bib => bib.status === 'sold').length : 0
	const totalRevenue = Array.isArray(sellerBibs)
		? sellerBibs.filter(bib => bib?.status === 'sold').reduce((sum, bib) => sum + (bib?.price || 0), 0)
		: 0

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

			{/* User header */}
			<div className="bg-card/25 border-border/30 absolute top-0 right-0 left-0 z-20 mx-4 mt-12 mb-6 rounded-2xl border p-4 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-muted-foreground text-sm">Seller Dashboard</p>
						<p className="text-foreground flex items-center gap-2 font-medium">
							<Tag className="h-4 w-4" />
							{userName}
							{clerkUser?.emailAddresses?.[0] !== undefined && (
								<span className="text-muted-foreground ml-2 text-sm">({clerkUser.emailAddresses[0].emailAddress})</span>
							)}
						</p>
					</div>
					<div className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
						{t.badge ?? 'SELLER'}
					</div>
				</div>
			</div>

			<div className="relative pt-32 pb-12">
				<div className="container mx-auto max-w-6xl p-6">
					{/* Header */}
					<div className="mb-12 space-y-2 text-center">
						<h1 className="text-foreground text-4xl font-bold tracking-tight">{t.title ?? 'Seller Dashboard'}</h1>
						<p className="text-muted-foreground text-lg">
							{t.welcome ?? 'Welcome to your seller dashboard'}, {userName}!
						</p>
					</div>

					{/* Seller Profile Validation */}
					<div className="mb-8">
						<SellerProfileValidation user={user} locale={locale} />
					</div>

					{/* Statistics Cards */}
					<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-muted-foreground text-sm">Total Listings</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalListings}</div>
								<p className="text-muted-foreground text-xs">Bibs listed for sale</p>
							</CardContent>
						</Card>

						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-muted-foreground text-sm">Available</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{availableBibs}</div>
								<p className="text-muted-foreground text-xs">Currently for sale</p>
							</CardContent>
						</Card>

						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-muted-foreground text-sm">Sold</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{soldBibs}</div>
								<p className="text-muted-foreground text-xs">Successfully sold</p>
							</CardContent>
						</Card>

						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-muted-foreground text-sm">Revenue</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
								<p className="text-muted-foreground text-xs">Total earned</p>
							</CardContent>
						</Card>
					</div>

					{/* Quick Actions */}
					<div className="mb-8">
						<h2 className="text-foreground mb-6 text-xl font-bold">Quick Actions</h2>
						<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
							<Link href="/dashboard/seller/sell-bib">
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
											<Plus className="h-6 w-6" />
										</div>
										<p className="text-sm font-medium">{t?.sellBib ?? 'Sell New Bib'}</p>
									</CardContent>
								</Card>
							</Link>

							<Link href="/dashboard/seller/list-bib">
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
											<List className="h-6 w-6" />
										</div>
										<p className="text-sm font-medium">My Listings</p>
									</CardContent>
								</Card>
							</Link>

							<Link href="/marketplace">
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
											<Search className="h-6 w-6" />
										</div>
										<p className="text-sm font-medium">View Marketplace</p>
									</CardContent>
								</Card>
							</Link>

							<Link href="/dashboard">
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
											<Users className="h-6 w-6" />
										</div>
										<p className="text-sm font-medium">Main Dashboard</p>
									</CardContent>
								</Card>
							</Link>
						</div>
					</div>

					{/* Bib Listings */}
					<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Tag className="h-5 w-5" />
								{t?.yourListedBibs ?? 'Your Listed Bibs'}
							</CardTitle>
							<CardDescription>
								{t?.manageBibListings ?? 'Manage your race bib listings and track performance'}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{totalListings > 0 ? (
								<div className="space-y-4">
									{sellerBibs.map(bib => {
										if (!bib?.id) return null

										const statusDisplay = getStatusDisplay(bib.status ?? 'unknown')
										return (
											<div className="rounded-lg border p-4" key={bib.id}>
												<div className="mb-3 flex items-start justify-between">
													<div>
														<h4 className="font-semibold">
															{t?.bibFor ?? 'Bib for'}{' '}
															{bib.expand?.eventId?.name ?? `Event ID: ${bib.eventId ?? 'Unknown'}`}
														</h4>
														<p className="text-muted-foreground text-sm">
															{t?.registrationNumber ?? 'Registration Number'}: {bib.registrationNumber ?? 'N/A'}
														</p>
													</div>
													<span className={`rounded-full px-3 py-1 text-xs font-medium ${statusDisplay.color}`}>
														{statusDisplay.label}
													</span>
												</div>

												<div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
													<div>
														<p className="text-muted-foreground">{t?.price ?? 'Price'}</p>
														<p className="font-medium">€{bib.price?.toFixed(2) ?? '0.00'}</p>
													</div>
													<div>
														<p className="text-muted-foreground">{t?.size ?? 'Size'}</p>
														<p className="font-medium">{bib.optionValues?.size ?? 'N/A'}</p>
													</div>
													<div>
														<p className="text-muted-foreground">{t?.gender ?? 'Gender'}</p>
														<p className="font-medium">{bib.optionValues?.gender ?? 'N/A'}</p>
													</div>
													<div>
														<p className="text-muted-foreground">Event Date</p>
														<p className="font-medium">
															{bib.expand?.eventId?.eventDate
																? formatDateObjectForDisplay(new Date(bib.expand.eventId.eventDate), locale)
																: 'N/A'}
														</p>
													</div>
												</div>

												{/* Edit button - only show for certain statuses */}
												{(bib.status === 'available' || bib.status === 'validation_failed') && (
													<div className="mt-3 flex justify-end">
														<Link href={`/dashboard/seller/edit-bib/${bib.id}`}>
															<Button size="sm" variant="outline">
																<Edit3 className="mr-2 h-4 w-4" />
																{t?.editBib ?? 'Edit Bib'}
															</Button>
														</Link>
													</div>
												)}
											</div>
										)
									})}
								</div>
							) : (
								<div className="py-12 text-center">
									<Tag className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
									<h3 className="mb-2 text-lg font-semibold">{t?.noBibsListed ?? 'No bibs listed yet'}</h3>
									<p className="text-muted-foreground mb-6">
										{t.startSelling ?? 'Start selling your race bibs to connect with runners'}
									</p>
									<Link href="/dashboard/seller/sell-bib">
										<Button size="lg">
											<Plus className="mr-2 h-4 w-4" />
											{t?.sellBib ?? 'List Your First Bib'}
										</Button>
									</Link>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
