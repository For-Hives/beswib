/** biome-ignore-all lint/suspicious/noArrayIndexKey: <the usage is ok, we know that the index is stable.> */
'use client'

import { Building, CheckCircle, Clock, Eye, Users, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Organizer } from '@/models/organizer.model'
import type { User } from '@/models/user.model'
import { fetchAllOrganizers } from '@/services/organizer.services'

interface AdminOrganizerValidatePageClientProps {
	currentUser: null | User
	locale: Locale
}

interface ValidationStats {
	pendingOrganizers: number
	totalOrganizers: number
}

import organizerTranslations from '@/app/[locale]/admin/organizer/locales.json'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { formatDateObjectForDisplay } from '@/lib/utils/date'
export default function AdminOrganizerValidatePageClient({
	locale,
	currentUser,
}: Readonly<AdminOrganizerValidatePageClientProps>) {
	const translations = getTranslations(locale, organizerTranslations)

	const router = useRouter()

	const [organizers, setOrganizers] = useState<Organizer[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [stats, setStats] = useState<null | ValidationStats>(null)

	useEffect(() => {
		const fetchOrganizers = async () => {
			try {
				setIsLoading(true)
				const organizersData = await fetchAllOrganizers()
				setOrganizers(organizersData)

				// Calculate stats
				const statsData: ValidationStats = {
					totalOrganizers: organizersData.length,
					pendingOrganizers: organizersData.filter((organizer: Organizer) => !organizer.isPartnered).length,
				}
				setStats(statsData)
			} catch (error) {
				console.error('Error fetching organizers:', error)
				setOrganizers([])
				setStats({
					totalOrganizers: 0,
					pendingOrganizers: 0,
				})
			} finally {
				setIsLoading(false)
			}
		}

		void fetchOrganizers()
	}, [])

	const handleApproveOrganizer = async (organizerId: string) => {
		try {
			const { approveOrganizerAction } = await import('@/app/[locale]/admin/actions')
			const res = await approveOrganizerAction(organizerId)
			if (res.success) {
				toast.success(translations.organizers.validate.messages.approveSuccess)
				setOrganizers(prev => prev.map(org => (org.id === organizerId ? { ...org, isPartnered: true } : org)))
			} else {
				toast.error(res.error ?? translations.organizers.validate.messages.approveError)
			}
		} catch (error) {
			console.error('Error approving organizer:', error)
			toast.error(translations.organizers.validate.messages.approveError)
		}
	}

	const handleRejectOrganizer = async (organizerId: string) => {
		try {
			const { rejectOrganizerAction } = await import('@/app/[locale]/admin/actions')
			const res = await rejectOrganizerAction(organizerId)
			if (res.success) {
				toast.success(translations.organizers.validate.messages.rejectSuccess)
				setOrganizers(prev => prev.filter(org => org.id !== organizerId))
			} else {
				toast.error(res.error ?? translations.organizers.validate.messages.rejectError)
			}
		} catch (error) {
			console.error('Error rejecting organizer:', error)
			toast.error(translations.organizers.validate.messages.rejectError)
		}
	}

	// Keep stats in sync when organizers change
	useEffect(() => {
		setStats({
			totalOrganizers: organizers.length,
			pendingOrganizers: organizers.filter(org => !org.isPartnered).length,
		})
	}, [organizers])

	// Safety check - if currentUser is null, show error
	if (!currentUser) {
		return (
			<div className="from-background via-destructive/5 to-background relative min-h-screen bg-linear-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size:[24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-black/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--destructive)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--destructive)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl text-red-600 dark:text-red-400">⚠</div>
						<h1 className="text-foreground mb-4 text-3xl font-bold">Access Error</h1>
						<p className="text-muted-foreground mb-6 text-lg">
							Unable to verify admin access. Please try logging in again.
						</p>
						<button
							type="button"
							className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white"
							onClick={() => router.push('/auth/sign-in')}
						>
							Sign In
						</button>
					</div>
				</div>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="from-background via-primary/5 to-background relative min-h-screen bg-linear-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size:[24px_24px]"></div>
				<div className="relative pt-32 pb-12">
					<div className="container mx-auto max-w-7xl p-6">
						<div className="space-y-8">
							<div className="space-y-2 text-center">
								<div className="mx-auto h-12 w-96 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
								<div className="mx-auto h-6 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
							</div>
							<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
								{Array.from({ length: 3 }).map((_, i) => (
									<div
										className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
										key={`skeleton-${i}`}
									></div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	// Filter organizers that need validation (non-partnered ones)
	const pendingOrganizers = organizers.filter(organizer => !organizer.isPartnered)

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-linear-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size:[24px_24px]"></div>

			{/* Admin header with user info */}
			<div className="bg-card/25 border-border/30 absolute top-0 right-0 left-0 z-20 mx-4 mt-12 mb-6 rounded-2xl border p-4 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-muted-foreground text-sm">Connected as</p>
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
			<div className="relative pt-32 pb-12">
				<div className="container mx-auto max-w-7xl p-6">
					<div className="space-y-8">
						{/* Header */}
						<div className="space-y-2 text-center">
							<h1 className="text-foreground text-4xl font-bold">{translations.organizers.validate.title}</h1>
							<p className="text-muted-foreground text-lg">{translations.organizers.validate.subtitle}</p>
						</div>

						{/* Stats Grid */}
						<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
							<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										{translations.organizers.validate.stats.totalOrganizers}
									</CardTitle>
									<Building className="text-muted-foreground h-4 w-4" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats?.totalOrganizers ?? 0}</div>
								</CardContent>
							</Card>

							<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										{translations.organizers.validate.stats.pendingValidation}
									</CardTitle>
									<Clock className="text-muted-foreground h-4 w-4" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-orange-600">{stats?.pendingOrganizers ?? 0}</div>
								</CardContent>
							</Card>

							<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										{translations.organizers.validate.stats.approvedPartners}
									</CardTitle>
									<Users className="text-muted-foreground h-4 w-4" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-green-600">
										{(stats?.totalOrganizers ?? 0) - (stats?.pendingOrganizers ?? 0)}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Pending Organizers List */}
						<div className="space-y-6">
							<div>
								<h2 className="text-foreground mb-2 text-2xl font-bold">
									{translations.organizers.validate.pending.title}
								</h2>
								<p className="text-muted-foreground">{translations.organizers.validate.subtitle}</p>
							</div>

							{pendingOrganizers.length === 0 ? (
								<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
									<CardContent className="py-12 text-center">
										<CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
										<h3 className="text-foreground mb-2 text-xl font-semibold">
											{translations.organizers.validate.pending.noResults}
										</h3>
										<p className="text-muted-foreground">
											{translations.organizers.validate.pending.noResultsDescription}
										</p>
									</CardContent>
								</Card>
							) : (
								<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
									{pendingOrganizers.map(organizer => (
										<Card
											className="dark:border-border/50 bg-card/80 group hover:bg-card/90 border-black/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg"
											key={organizer.id}
										>
											<CardHeader className="pb-4">
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<CardTitle className="flex items-center gap-2 text-lg">
															<Building className="h-5 w-5" />
															{organizer.name}
														</CardTitle>
														<CardDescription className="mt-1">{organizer.email}</CardDescription>
													</div>
													<Badge className="text-xs" variant="secondary">
														<Clock className="mr-1 h-3 w-3" />
														Pending
													</Badge>
												</div>
											</CardHeader>
											<CardContent className="space-y-4">
												{organizer.website != null && organizer.website !== undefined && organizer.website !== '' && (
													<div className="text-sm">
														<span className="text-muted-foreground">Website: </span>
														<a
															className="text-primary hover:underline"
															href={organizer.website}
															rel="noopener noreferrer"
															target="_blank"
														>
															{organizer.website}
														</a>
													</div>
												)}

												<div className="text-sm">
													<span className="text-muted-foreground">Created: </span>
													{formatDateObjectForDisplay(new Date(organizer.created), locale)}
												</div>

												<div className="flex gap-2">
													<Button
														className="flex-1 bg-green-600 hover:bg-green-700"
														onClick={() => void handleApproveOrganizer(organizer.id)}
														size="sm"
													>
														<CheckCircle className="mr-2 h-4 w-4" />
														{translations.organizers.validate.pending.actions.approve}
													</Button>
													<Button
														className="flex-1"
														onClick={() => void handleRejectOrganizer(organizer.id)}
														size="sm"
														variant="destructive"
													>
														<XCircle className="mr-2 h-4 w-4" />
														{translations.organizers.validate.pending.actions.reject}
													</Button>
													<Button className="px-3" size="sm" variant="outline">
														<Eye className="h-4 w-4" />
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
