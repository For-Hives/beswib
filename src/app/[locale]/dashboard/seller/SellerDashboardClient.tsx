'use client'

import { List, Plus, Search, Tag, Users } from 'lucide-react'

import Link from 'next/link'
import BibCategoryTabs from '@/components/dashboard/seller/BibCategoryTabs'
import SellerProfileValidation from '@/components/dashboard/seller/SellerProfileValidation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import type { Bib } from '@/models/bib.model'
import type { Event } from '@/models/event.model'
import type { Transaction } from '@/models/transaction.model'
import type { User } from '@/models/user.model'

import sellerTranslations from './locales.json'

interface SellerDashboardClientProps {
	clerkUser: SerializedClerkUser
	locale: Locale
	sellerBibs: (Bib & { expand?: { eventId: Event } })[]
	user: User
	sellerTransactions: (Transaction & { expand?: { bib_id?: Bib & { expand?: { eventId: Event } } } })[]
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
export const getStatusDisplay = (status: string, locale: Locale) => {
	const t = getTranslations(locale, sellerTranslations)

	switch (status) {
		case 'available':
			return {
				label: t.bibStatus.available ?? 'Available',
				color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
			}
		case 'expired':
			return {
				label: t.bibStatus.expired ?? 'Expired',
				color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
			}
		case 'sold':
			return {
				label: t.bibStatus.sold ?? 'Sold',
				color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
			}
		case 'validation_failed':
			return {
				label: t.bibStatus.validationFailed ?? 'Validation Failed',
				color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
			}
		case 'withdrawn':
			return {
				label: t.bibStatus.withdrawn ?? 'Withdrawn',
				color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
			}
		default:
			return { label: status, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' }
	}
}

export default function SellerDashboardClient({
	user,
	sellerTransactions = [],
	sellerBibs = [],
	locale,
	clerkUser,
}: SellerDashboardClientProps) {
	const t = getTranslations(locale, sellerTranslations)

	const userName = clerkUser?.firstName ?? clerkUser?.emailAddresses?.[0]?.emailAddress ?? 'Seller'

	// Calculate statistics with safety checks
	const safeSellerBibs = Array.isArray(sellerBibs) ? sellerBibs.filter(bib => bib.id) : []
	const totalListings = safeSellerBibs.length
	const availableBibs = safeSellerBibs.filter(bib => bib.status === 'available').length
	const soldBibs = safeSellerBibs.filter(bib => bib.status === 'sold').length
	const succeededTransactions = sellerTransactions.filter(tx => tx.status === 'succeeded')

	// Extract PayPal fees from webhook payload when present
	const extractPaypalFee = (raw: unknown): number => {
		if (typeof raw !== 'string' || raw.trim() === '') return 0
		try {
			const parsed = JSON.parse(raw) as { event?: { resource?: unknown } } | { resource?: unknown }
			const resource =
				(parsed as { event?: { resource?: unknown } })?.event?.resource ??
				(parsed as { resource?: unknown })?.resource ??
				null
			if (resource && typeof resource === 'object') {
				const breakdown = (resource as { seller_receivable_breakdown?: { paypal_fee?: { value?: string } } })
					.seller_receivable_breakdown
				const feeStr = breakdown?.paypal_fee?.value
				const fee = feeStr != null ? Number(feeStr) : 0
				return Number.isFinite(fee) ? fee : 0
			}
			return 0
		} catch {
			return 0
		}
	}

	const totals = succeededTransactions.reduce(
		(acc, tx) => {
			const amount = tx.amount ?? 0
			const platform = tx.platform_fee ?? 0
			const paypal = extractPaypalFee(tx.raw_webhook_payload)
			acc.gross += amount
			acc.platform += platform
			acc.paypal += paypal
			acc.net += amount - platform - paypal
			return acc
		},
		{ platform: 0, paypal: 0, net: 0, gross: 0 }
	)

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

			{/* User header */}
			<div className="bg-card/25 border-border/30 absolute top-0 right-0 left-0 z-20 mx-4 mt-12 mb-6 rounded-2xl border p-4 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-muted-foreground text-sm">{t.userHeader?.sellerDashboard ?? 'Seller Dashboard'}</p>
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
								<CardTitle className="text-muted-foreground text-sm">
									{t.stats?.totalListings ?? 'Total Listings'}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalListings}</div>
								<p className="text-muted-foreground text-xs">{t.stats?.totalListingsDesc ?? 'Bibs listed for sale'}</p>
							</CardContent>
						</Card>

						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-muted-foreground text-sm">{t.stats?.available ?? 'Available'}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{availableBibs}</div>
								<p className="text-muted-foreground text-xs">{t.stats?.availableDesc ?? 'Currently for sale'}</p>
							</CardContent>
						</Card>

						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-muted-foreground text-sm">{t.stats?.sold ?? 'Sold'}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{soldBibs}</div>
								<p className="text-muted-foreground text-xs">{t.stats?.soldDesc ?? 'Successfully sold'}</p>
							</CardContent>
						</Card>

						<Tooltip>
							<TooltipTrigger asChild>
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-help border-black/50 backdrop-blur-sm transition-colors">
									<CardHeader className="flex items-center gap-2 pb-2">
										<CardTitle className="text-muted-foreground flex items-center gap-2 text-sm">
											{t.stats?.netRevenue ?? 'Net Revenue'}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">€{totals.net.toFixed(2)}</div>
										<p className="text-muted-foreground text-xs">
											{t.stats?.netRevenueDesc ?? 'After platform and PayPal fees'}
										</p>
										<div className="text-muted-foreground mt-2 space-y-1 text-xs">
											<p>
												{t.stats?.gross ?? 'Gross:'} €{totals.gross.toFixed(2)}
											</p>
											<p>
												{t.stats?.platformFees ?? 'Platform fees:'} −€{totals.platform.toFixed(2)}
											</p>
											<p>
												{t.stats?.paypalFees ?? 'PayPal fees:'} −€{totals.paypal.toFixed(2)}
											</p>
										</div>
									</CardContent>
								</Card>
							</TooltipTrigger>
							<TooltipContent>
								<div className="max-w-xs">
									<p className="font-medium">{t.tooltip?.feesExplanation ?? 'How fees work:'}</p>
									<p className="mt-1 text-sm">
										<strong>{t.tooltip?.netFormula ?? 'Net = Amount − Platform fees − PayPal fees.'}</strong>
									</p>
									<p className="mt-1 text-xs">
										{t.tooltip?.platformFeesInfo ?? 'Platform fees are 10% of the listing price.'}
									</p>
									<p className="mt-1 text-xs">
										{t.tooltip?.paypalFeesInfo ??
											'PayPal fees are provided by PayPal in the capture and may vary by country and payment method.'}
									</p>
								</div>
							</TooltipContent>
						</Tooltip>
					</div>

					{/* Quick Actions */}
					<div className="mb-8">
						<h2 className="text-foreground mb-6 text-xl font-bold">{t.quickActions ?? 'Quick Actions'}</h2>
						<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
							<Link href={`/${locale}/dashboard/seller/sell-bib`}>
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
											<Plus className="h-6 w-6" />
										</div>
										<p className="text-sm font-medium">{t.actions?.sellNewBib ?? 'Sell New Bib'}</p>
									</CardContent>
								</Card>
							</Link>

							<Link href={`/${locale}/dashboard/seller/list-bib`}>
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
											<List className="h-6 w-6" />
										</div>
										<p className="text-sm font-medium">{t.actions?.myListings ?? 'My Listings'}</p>
									</CardContent>
								</Card>
							</Link>

							<Link href={`/${locale}/marketplace`}>
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
											<Search className="h-6 w-6" />
										</div>
										<p className="text-sm font-medium">{t.actions?.viewMarketplace ?? 'View Marketplace'}</p>
									</CardContent>
								</Card>
							</Link>

							<Link href={`/${locale}/dashboard`}>
								<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
											<Users className="h-6 w-6" />
										</div>
										<p className="text-sm font-medium">{t.actions?.mainDashboard ?? 'Main Dashboard'}</p>
									</CardContent>
								</Card>
							</Link>
						</div>
					</div>

					{/* Recent Sales */}
					<div className="mb-8">
						<div className="mb-6 flex items-center gap-2">
							<List className="h-5 w-5" />
							<h2 className="text-foreground text-xl font-bold">{t.recentSales?.title ?? 'Recent Sales'}</h2>
						</div>
						<p className="text-muted-foreground mb-6 text-sm">
							{t.recentSales?.description ?? 'Completed transactions for your bibs'}
						</p>

						{succeededTransactions.length > 0 ? (
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
								{succeededTransactions.map(tx => {
									const bib = tx.expand?.bib_id
									if (!tx?.id || !bib || bib.id === '') return null

									const paypalFee = extractPaypalFee(tx.raw_webhook_payload)
									const net = (tx.amount ?? 0) - (tx.platform_fee ?? 0) - paypalFee

									return (
										<div className="group relative h-full w-full" key={tx.id}>
											<div className="bg-card/80 border-border hover:border-foreground/35 relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md transition-all duration-300">
												{/* Background pattern */}
												<div className="absolute inset-0 -z-20 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px] opacity-50 dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]" />
												<div className="bg-background pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-25 dark:bg-black" />

												{/* Status badge */}
												<div className="absolute top-0 right-0 z-20 m-4">
													<span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
														{t.statusSold ?? 'Sold'}
													</span>
												</div>

												{/* Content */}
												<div className="flex flex-1 flex-col gap-4 p-4">
													{/* Event name and amount */}
													<div className="flex w-full flex-col gap-2">
														<h3 className="text-foreground truncate text-lg font-bold">
															{bib.expand?.eventId?.name ?? `${t.eventId ?? 'Event ID:'} ${bib.eventId}`}
														</h3>
													</div>

													{/* Net earnings highlight */}
													<div className="from-primary/10 via-accent/10 to-secondary/10 rounded-xl bg-gradient-to-r p-3">
														<div className="flex items-center justify-between">
															<div>
																<p className="text-muted-foreground text-xs">{t.stats?.netEarned ?? 'Net Earned'}</p>
																<p className="text-foreground text-lg font-bold">€{net.toFixed(2)}</p>
															</div>
															<div className="text-right">
																<div className="text-muted-foreground space-y-0.5 text-xs">
																	<p>
																		{t.stats?.platformFees ?? 'Platform'}: -€{(tx.platform_fee ?? 0).toFixed(2)}
																	</p>
																	<p>
																		{t.stats?.paypalFees ?? 'PayPal'}: -€{paypalFee.toFixed(2)}
																	</p>
																</div>
															</div>
														</div>
													</div>

													{/* Registration number */}
													<div className="flex items-center gap-2">
														<Tag className="text-muted-foreground h-4 w-4" />
														<p className="text-muted-foreground text-sm">
															{t.registrationNumber ?? 'Registration Number'}: {bib.registrationNumber ?? 'N/A'}
														</p>
													</div>
												</div>
											</div>
										</div>
									)
								})}
							</div>
						) : (
							<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
								<CardContent className="py-12 text-center">
									<List className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
									<h3 className="mb-2 text-lg font-semibold">{t.recentSales?.noSales ?? 'No completed sales yet'}</h3>
									<p className="text-muted-foreground mb-6">
										{t.recentSales?.startSellingMessage ?? 'Start selling your race bibs to see your sales here'}
									</p>
									<Link href={`/${locale}/dashboard/seller/sell-bib`}>
										<Button size="lg">
											<Plus className="mr-2 h-4 w-4" />
											{t.recentSales?.listABib ?? 'List a bib'}
										</Button>
									</Link>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Bib Listings with Categories */}
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
								<BibCategoryTabs bibs={safeSellerBibs} locale={locale} />
							) : (
								<div className="py-12 text-center">
									<Tag className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
									<h3 className="mb-2 text-lg font-semibold">{t?.noBibsListed ?? 'No bibs listed yet'}</h3>
									<p className="text-muted-foreground mb-6">
										{t.startSelling ?? 'Start selling your race bibs to connect with runners'}
									</p>
									<Link href={`/${locale}/dashboard/seller/sell-bib`}>
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
