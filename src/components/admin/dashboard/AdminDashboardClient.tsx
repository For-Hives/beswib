'use client'

import {
	Building,
	Calendar,
	CheckCircle,
	Clock,
	CreditCard,
	Eye,
	FileText,
	Plus,
	TrendingUp,
	Users,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

import type { User } from '@/models/user.model'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDashboardStatsAction } from '@/app/[locale]/admin/actions'
import { type DashboardStats } from '@/models/dashboard.model'
import { Button } from '@/components/ui/button'

interface AdminDashboardClientProps {
	currentUser: null | User
	locale: Locale
}

import translations from '@/app/[locale]/admin/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Locale } from '@/lib/i18n/config'

export default function AdminDashboardClient({ locale, currentUser }: Readonly<AdminDashboardClientProps>) {
	const t = getTranslations(locale, translations)

	const router = useRouter()
	const [stats, setStats] = useState<DashboardStats | null>(null)

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				const statsResult = await getDashboardStatsAction()

				if (statsResult.success && statsResult.data) {
					setStats(statsResult.data)
				} else {
					console.error('Error fetching stats:', statsResult.error)
					// Set fallback stats in case of error
					setStats({
						totalUsers: 0,
						totalTransactions: 0,
						totalEvents: 0,
						totalBibs: 0,
						todaysTransactions: 0,
						todaysRevenue: 0,
						soldBibs: 0,
						pendingEvents: 0,
						pendingBibs: 0,
						eventCreationRequests: {
							waiting: 0,
							total: 0,
							rejected: 0,
							accepted: 0,
						},
						availableBibs: 0,
					})
				}
			} catch (error) {
				console.error('Error fetching dashboard data:', error)
				// Set fallback data in case of error
				setStats({
					totalUsers: 0,
					totalTransactions: 0,
					totalEvents: 0,
					totalBibs: 0,
					todaysTransactions: 0,
					todaysRevenue: 0,
					soldBibs: 0,
					pendingEvents: 0,
					pendingBibs: 0,
					eventCreationRequests: {
						waiting: 0,
						total: 0,
						rejected: 0,
						accepted: 0,
					},
					availableBibs: 0,
				})
			}
		}

		void fetchDashboardData()
	}, [])

	// Safety check - if currentUser is null, show error
	if (!currentUser) {
		return (
			<div className="from-background via-destructive/5 to-background relative min-h-screen bg-gradient-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-black/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--destructive)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--destructive)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl text-red-600 dark:text-red-400">⚠</div>
						<h1 className="text-foreground mb-4 text-3xl font-bold">{t.dashboard.errors.accessError}</h1>
						<p className="text-muted-foreground mb-6 text-lg">{t.dashboard.errors.accessErrorMessage}</p>
						<button
							className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white"
							onClick={() => router.push('/sign-in')}
						>
							{t.dashboard.ui.signIn}
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

			{/* Admin header with user info */}
			<div className="bg-card/25 border-border/30 absolute top-0 right-0 left-0 z-20 mx-4 mt-12 mb-6 rounded-2xl border p-4 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-muted-foreground text-sm">{t.dashboard.ui.connectedAs}</p>
						<p className="text-foreground font-medium">
							{currentUser.firstName ?? 'Anonymous'} {currentUser.lastName ?? ''} ({currentUser.email})
						</p>
					</div>
					<div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
						{currentUser.role.toUpperCase()}
					</div>
				</div>
			</div>

			{/* Main content */}
			<div className="relative pt-40 pb-12">
				<div className="container mx-auto max-w-6xl p-6">
					<div className="space-y-8">
						{/* Header */}
						<div className="space-y-2 text-center">
							<h1 className="text-foreground text-4xl font-bold">{t.dashboard.title}</h1>
							<p className="text-muted-foreground text-lg">{t.dashboard.subtitle}</p>
						</div>

						{/* Stats Grid */}
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
							<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">{t.dashboard.stats.totalEvents}</CardTitle>
									<Calendar className="text-muted-foreground h-4 w-4" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats?.totalEvents ?? 0}</div>
									<p className="text-muted-foreground text-xs">
										{stats?.pendingEvents ?? 0} {t.dashboard.stats.pendingEvents.toLowerCase()}
									</p>
								</CardContent>
							</Card>

							<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">{t.dashboard.stats.totalBibs}</CardTitle>
									<FileText className="text-muted-foreground h-4 w-4" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats?.totalBibs ?? 0}</div>
									<p className="text-muted-foreground text-xs">
										{stats?.pendingBibs ?? 0} {t.dashboard.stats.pendingBibs.toLowerCase()}
									</p>
								</CardContent>
							</Card>

							<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">{t.dashboard.stats.totalUsers}</CardTitle>
									<Users className="text-muted-foreground h-4 w-4" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
									<p className="text-muted-foreground text-xs">
										<TrendingUp className="inline h-3 w-3" /> {t.dashboard.stats.platformGrowth}
									</p>
								</CardContent>
							</Card>

							<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">{t.dashboard.stats.todaysTransactions}</CardTitle>
									<CreditCard className="text-muted-foreground h-4 w-4" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats?.todaysTransactions ?? 0}</div>
									<p className="text-muted-foreground text-xs">
										€{stats?.todaysRevenue ?? 0} {t.dashboard.stats.revenueToday}
									</p>
								</CardContent>
							</Card>
						</div>

						{/* Dashboard Cards Grid */}
						<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
							{/* Create Event Card */}
							<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 group border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
								<CardHeader className="text-center">
									<div className="bg-primary/10 text-primary group-hover:bg-primary/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors">
										<Plus className="h-8 w-8" />
									</div>
									<CardTitle className="text-xl">{t.dashboard.actions.createEvent}</CardTitle>
									<CardDescription>{t.dashboard.actions.createEventDescription}</CardDescription>
								</CardHeader>
								<CardContent className="text-center">
									<Link href="/admin/event/create">
										<Button className="w-full">
											<Plus className="mr-2 h-4 w-4" />
											{t.dashboard.actions.createEvent}
										</Button>
									</Link>
								</CardContent>
							</Card>

							{/* View Events Card */}
							<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 group border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
								<CardHeader className="text-center">
									<div className="bg-primary/10 text-primary group-hover:bg-primary/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors">
										<Eye className="h-8 w-8" />
									</div>
									<CardTitle className="text-xl">{t.dashboard.actions.viewEvents}</CardTitle>
									<CardDescription>{t.dashboard.actions.viewEventsDescription}</CardDescription>
								</CardHeader>
								<CardContent className="text-center">
									<Link href="/admin/event">
										<Button className="w-full">
											<Eye className="mr-2 h-4 w-4" />
											{t.dashboard.actions.viewEvents}
										</Button>
									</Link>
								</CardContent>
							</Card>

							{/* Create Organizer Card */}
							<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 group border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
								<CardHeader className="text-center">
									<div className="bg-primary/10 text-primary group-hover:bg-primary/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors">
										<Building className="h-8 w-8" />
									</div>
									<CardTitle className="text-xl">{t.dashboard.actions.createOrganizer}</CardTitle>
									<CardDescription>{t.dashboard.actions.createOrganizerDescription}</CardDescription>
								</CardHeader>
								<CardContent className="text-center">
									<Link href="/admin/organizer/create">
										<Button className="w-full">
											<Building className="mr-2 h-4 w-4" />
											{t.dashboard.actions.createOrganizer}
										</Button>
									</Link>
								</CardContent>
							</Card>

							{/* View Organizers Card */}
							<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 group border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
								<CardHeader className="text-center">
									<div className="bg-primary/10 text-primary group-hover:bg-primary/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors">
										<Users className="h-8 w-8" />
									</div>
									<CardTitle className="text-xl">{t.dashboard.actions.viewOrganizers}</CardTitle>
									<CardDescription>{t.dashboard.actions.viewOrganizersDescription}</CardDescription>
								</CardHeader>
								<CardContent className="text-center">
									<Link href="/admin/organizer">
										<Button className="w-full">
											<Users className="mr-2 h-4 w-4" />
											{t.dashboard.actions.viewOrganizers}
										</Button>
									</Link>
								</CardContent>
							</Card>

							{/* Validate Organizer Card - Disabled for now */}
							<Card className="dark:border-border/50 bg-card/60 cursor-not-allowed border-black/50 opacity-60 backdrop-blur-sm">
								<CardHeader className="text-center">
									<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-500/10 text-gray-500">
										<CheckCircle className="h-8 w-8" />
									</div>
									<CardTitle className="text-xl text-gray-500">{t.dashboard.actions.validateOrganizer}</CardTitle>
									<CardDescription className="text-gray-400">
										{t.dashboard.actions.validateOrganizerDescription}
									</CardDescription>
								</CardHeader>
								<CardContent className="text-center">
									<Button className="w-full" disabled variant="outline">
										<Clock className="mr-2 h-4 w-4" />
										{t.dashboard.ui.comingSoon}
									</Button>
								</CardContent>
							</Card>
						</div>

						{/* Recent Activity - Disabled for now */}
						<Card className="dark:border-border/50 bg-card/60 cursor-not-allowed border-black/50 opacity-60 backdrop-blur-sm">
							<CardHeader className="text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-500/10 text-gray-500">
									<Clock className="h-8 w-8" />
								</div>
								<CardTitle className="text-xl text-gray-500">{t.dashboard.recentActivity.title}</CardTitle>
								<CardDescription className="text-gray-400">{t.dashboard.recentActivity.description}</CardDescription>
							</CardHeader>
							<CardContent className="text-center">
								<Button className="w-full" disabled variant="outline">
									<Clock className="mr-2 h-4 w-4" />
									{t.dashboard.ui.comingSoon}
								</Button>
							</CardContent>
						</Card>

						{/* Transactions Card (Coming Soon) */}
						<Card className="dark:border-border/50 bg-card/60 cursor-not-allowed border-black/50 opacity-60 backdrop-blur-sm">
							<CardHeader className="text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-500/10 text-gray-500">
									<CreditCard className="h-8 w-8" />
								</div>
								<CardTitle className="text-xl text-gray-500">{t.dashboard.sections.transactions.title}</CardTitle>
								<CardDescription className="text-gray-400">
									{t.dashboard.sections.transactions.description}
								</CardDescription>
							</CardHeader>
							<CardContent className="text-center">
								<Button className="w-full" disabled>
									<Clock className="mr-2 h-4 w-4" />
									{t.dashboard.ui.comingSoon}
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
