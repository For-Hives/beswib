'use client'

import { Calendar, List, MapPin, Plus, Search, ShoppingBag, ShoppingCart, Tag, TrendingUp, Zap } from 'lucide-react'

import Link from 'next/link'

import type { User } from '@/models/user.model'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Button } from '@/components/ui/button'

interface DashboardClientProps {
	clerkUser: SerializedClerkUser
	locale: Locale
	user: null | User
}

interface SerializedClerkUser {
	emailAddresses: { emailAddress: string; id: string }[]
	firstName: null | string
	id: string
	imageUrl: string
	lastName: null | string
	username: null | string
}

import UserHeader from '@/components/dashboard/user-header'
import { Locale } from '@/lib/i18n/config'

import dashboardTranslations from './locales.json'

export default function DashboardClient({ user, locale, clerkUser }: DashboardClientProps) {
	const t = getTranslations(locale, dashboardTranslations)

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
			<UserHeader clerkUser={clerkUser} user={user} locale={locale} />

			<div className="relative pt-40 pb-12">
				<div className="container mx-auto max-w-6xl p-6">
					{/* Header */}
					<div className="mb-12 space-y-2 text-center">
						<h1 className="text-foreground text-4xl font-bold tracking-tight">{t.dashboard.title}</h1>
						<p className="text-muted-foreground text-lg">
							{t.dashboard.chooseHowToUse ?? 'Choose how you want to use Beswib'}
						</p>
					</div>

					{/* Main Dashboard Cards - Only Buyer and Seller */}
					<div className="mx-auto mb-12 grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2">
						{/* Buyer Dashboard */}
						<Card className="dark:border-border/50 bg-card/80 flex h-full flex-col justify-between border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
							<CardHeader className="text-center">
								<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 transition-colors group-hover:bg-blue-500/20">
									<ShoppingCart className="h-10 w-10" />
								</div>
								<CardTitle className="text-2xl">{t.dashboard.buyer.title}</CardTitle>
								<CardDescription className="text-base">{t.dashboard.buyer.description}</CardDescription>
							</CardHeader>
							<CardContent className="flex justify-center gap-4 text-center">
								<Link href="/dashboard/buyer" className="cursor-pointer">
									<Button className="w-full cursor-pointer" size="lg">
										<ShoppingBag className="mr-2 h-5 w-5" />
										<span className="text-xs">{t.dashboard.buyCta ?? 'I want to buy a bib'}</span>
									</Button>
								</Link>
								<Link href="/dashboard/buyer" className="cursor-pointer">
									<Button className="w-full cursor-pointer" size="lg" variant="outline">
										<ShoppingCart className="mr-2 h-5 w-5" />
										<span className="text-xs">{t.dashboard.accessBuyer ?? 'Access my Buyer Dashboard'}</span>
									</Button>
								</Link>
							</CardContent>
						</Card>

						{/* Seller Dashboard */}
						<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 group flex h-full flex-col justify-between border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
							<CardHeader className="text-center">
								<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500 transition-colors group-hover:bg-green-500/20">
									<Tag className="h-10 w-10" />
								</div>
								<CardTitle className="text-2xl">{t.dashboard.seller.title}</CardTitle>
								<CardDescription className="text-base">{t.dashboard.seller.description}</CardDescription>
							</CardHeader>
							<CardContent className="text-center">
								<div className="flex h-full w-full flex-col items-center justify-end">
									<div className="flex justify-between gap-4">
										<Link className="w-full cursor-pointer" href="/dashboard/seller/sell-bib">
											<Button className="w-full cursor-pointer" size="lg">
												<Tag className="mr-2 h-5 w-5" />
												<span className="text-xs">{t.dashboard.sellCta ?? 'I want to sell a bib'}</span>
											</Button>
										</Link>
										<Link className="w-full cursor-pointer" href="/dashboard/seller">
											<Button className="w-full cursor-pointer" size="lg" variant="outline">
												<Tag className="mr-2 h-5 w-5" />
												<span className="text-xs">{t.dashboard.accessSeller ?? 'Access my Seller Dashboard'}</span>
											</Button>
										</Link>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Quick Actions Grid */}
					<div className="mb-12">
						<h2 className="text-foreground mb-8 text-center text-2xl font-bold">
							{t.dashboard.quickActions ?? 'Quick Actions'}
						</h2>
						<div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
							{/* Sell Bib */}
							<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
								<Link href="/dashboard/seller/sell-bib">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
											<Plus className="h-6 w-6" />
										</div>
										<p className="text-sm font-medium">{t.dashboard.sellBib ?? 'Sell Bib'}</p>
									</CardContent>
								</Link>
							</Card>

							{/* Browse Events */}
							<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
								<Link href="/events">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
											<Calendar className="h-6 w-6" />
										</div>
										<p className="text-sm font-medium">{t.dashboard.browseEvents ?? 'Browse Events'}</p>
									</CardContent>
								</Link>
							</Card>

							{/* Marketplace */}
							<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
								<Link href="/marketplace">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
											<Search className="h-6 w-6" />
										</div>
										<p className="text-sm font-medium">{t.dashboard.marketplace ?? 'Marketplace'}</p>
									</CardContent>
								</Link>
							</Card>

							{/* My Listings */}
							<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
								<Link href="/dashboard/seller/request-event">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
											<List className="h-6 w-6" />
										</div>
										<p className="text-sm font-medium">{t.dashboard.cantFindEvent ?? "I don't find my event"}</p>
									</CardContent>
								</Link>
							</Card>

							{/* Contact */}
							<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 cursor-pointer border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
								<Link href="/contact">
									<CardContent className="flex flex-col items-center p-4 text-center">
										<div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
											<MapPin className="h-6 w-6" />
										</div>
										<p className="text-sm font-medium">{t.dashboard.contact ?? 'Contact'}</p>
									</CardContent>
								</Link>
							</Card>
						</div>
					</div>

					{/* Featured Section */}
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
						{/* Getting Started */}
						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Zap className="h-5 w-5" />
									{t.dashboard.gettingStarted ?? 'Getting Started'}
								</CardTitle>
								<CardDescription>
									{t.dashboard.gettingStartedDesc ?? "New to Beswib? Here's how to get started quickly."}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center gap-3">
									<div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
										1
									</div>
									<p className="text-sm">{t.dashboard.stepBrowse ?? 'Browse available race bibs in our marketplace'}</p>
								</div>
								<div className="flex items-center gap-3">
									<div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
										2
									</div>
									<p className="text-sm">{t.dashboard.stepList ?? 'List your own bibs for sale when plans change'}</p>
								</div>
								<div className="flex items-center gap-3">
									<div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
										3
									</div>
									<p className="text-sm">{t.dashboard.stepConnect ?? 'Connect with the running community'}</p>
								</div>
							</CardContent>
						</Card>

						{/* Platform Stats */}
						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<TrendingUp className="h-5 w-5" />
									{t.dashboard.platformActivity ?? 'Platform Activity'}
								</CardTitle>
								<CardDescription>
									{t.dashboard.platformActivityDesc ?? "See what's happening on Beswib today."}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm">{t.dashboard.activeListings ?? 'Active Listings'}</span>
									<span className="text-primary font-semibold">{t.dashboard.comingSoon ?? 'Coming Soon'}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">{t.dashboard.recentTransfers ?? 'Recent Transfers'}</span>
									<span className="text-primary font-semibold">{t.dashboard.comingSoon ?? 'Coming Soon'}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">{t.dashboard.communityMembers ?? 'Community Members'}</span>
									<span className="text-primary font-semibold">{t.dashboard.growingDaily ?? 'Growing Daily'}</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
