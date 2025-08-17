'use client'

import { AlertTriangle, ShieldCheck, Settings, User as UserIcon, LayoutDashboard } from 'lucide-react'

import { useClerk } from '@clerk/nextjs'
import Link from 'next/link'

import type { User as UserType } from '@/models/user.model'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import dashboardTranslations from '@/app/[locale]/dashboard/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Locale } from '@/lib/i18n/config'

import { Button } from '../ui/button'

interface SerializedClerkUser {
	emailAddresses: { emailAddress: string; id: string }[]
	firstName: null | string
	id: string
	imageUrl: string
	lastName: null | string
	username: null | string
}

interface UserHeaderProps {
	clerkUser: SerializedClerkUser
	user: null | UserType
	locale?: Locale
}

export default function UserHeader({ user, locale, clerkUser }: Readonly<UserHeaderProps>) {
	const t = getTranslations(locale ?? ('en' as Locale), dashboardTranslations)
	const userName = clerkUser.firstName ?? clerkUser.emailAddresses[0]?.emailAddress ?? 'User'
	const { openUserProfile } = useClerk()

	const handleOpenAccount = () => {
		// Open Clerk's user profile modal as a clear way to manage account & sign out
		try {
			openUserProfile()
		} catch {
			// no-op: gracefully ignore if Clerk hasn't initialized yet
		}
	}

	const hasAtLeastOneContact =
		(user?.phoneNumber != null && String(user.phoneNumber).trim() !== '') ||
		(user?.contactEmail != null && String(user.contactEmail).trim() !== '')

	const isRunnerProfileComplete =
		user?.firstName != null &&
		user?.lastName != null &&
		user?.birthDate != null &&
		(user.birthDate instanceof Date ? !isNaN(user.birthDate.getTime()) : String(user.birthDate).trim() !== '') &&
		hasAtLeastOneContact &&
		user?.emergencyContactName != null &&
		user?.emergencyContactPhone != null &&
		user?.address != null &&
		user?.postalCode != null &&
		user?.city != null &&
		user?.country != null

	const isSellerProfileComplete = user?.paypalMerchantId != null

	return (
		<div className="py-4 lg:py-0">
			<div className="bg-card/25 border-border/30 top-2 right-0 left-0 z-20 mx-4 rounded-2xl border p-4 backdrop-blur-sm lg:absolute">
				<div className="flex flex-wrap items-start justify-between gap-2 lg:flex-nowrap">
					<div>
						<p className="text-muted-foreground text-sm">{t.dashboard.welcomeBack ?? 'Welcome back'}</p>
					</div>

					<div className="flex flex-col-reverse flex-wrap items-end justify-start gap-2 lg:flex-row lg:flex-nowrap lg:items-center">
						<div className="flex gap-2">
							<Link
								href="/dashboard"
								className="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
							>
								<LayoutDashboard className="h-4 w-4" />
								{t.dashboard.dashboardButton ?? 'Dashboard'}
							</Link>
							<Link
								href="/profile"
								className="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
							>
								<UserIcon className="h-4 w-4" />
								{t.dashboard.profileButton ?? 'Profile'}
							</Link>
						</div>

						<button
							type="button"
							onClick={handleOpenAccount}
							onKeyDown={e => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault()
									handleOpenAccount()
								}
							}}
							className="hover:bg-accent/40 focus-visible:ring-ring group border-border/40 bg-background/40 flex items-center gap-3 rounded-xl border p-2 pr-3 text-left shadow-sm backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
							aria-label="Open account menu"
						>
							<Avatar className="h-9 w-9">
								<AvatarImage src={clerkUser.imageUrl} alt={userName} />
								<AvatarFallback>{(userName || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
							</Avatar>
							<div className="flex flex-col items-start">
								<div className="bg-primary/10 text-primary w-fit rounded-full px-2 py-0.5 text-[10px] leading-4 font-medium">
									{t.dashboard.memberBadge ?? 'MEMBER'}
								</div>
								<p className="text-foreground flex items-center gap-2 text-sm font-medium">
									<span>{userName}</span>
									{clerkUser.emailAddresses[0] !== undefined && (
										<span className="text-muted-foreground hidden text-xs sm:inline">
											({clerkUser.emailAddresses[0].emailAddress})
										</span>
									)}
								</p>
							</div>
							<Settings className="text-muted-foreground/80 group-hover:text-foreground h-4 w-4 shrink-0" />
						</button>
					</div>
				</div>
			</div>
			{(isRunnerProfileComplete || isSellerProfileComplete) && (
				<>
					<div className="mx-4 pt-4 md:pt-24 xl:pt-32">
						<div className="flex justify-center gap-2">
							{isRunnerProfileComplete && (
								<div className="mt-4 rounded-lg border border-yellow-500/75 bg-yellow-500/15 p-1 text-sm text-yellow-700 lg:p-3 dark:border-yellow-500/50 dark:bg-yellow-500/10 dark:text-yellow-500">
									<Link className="flex items-center gap-2 text-xs lg:text-sm" href="/profile">
										<p>
											<AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
										</p>
										<p>
											{t.dashboard.runnerProfileIncomplete ??
												'Your runner profile is incomplete. Please update it to be able to buy bibs.'}
										</p>
									</Link>
								</div>
							)}
							{isSellerProfileComplete && (
								<div className="mt-4 rounded-lg border border-blue-500/75 bg-blue-500/15 p-1 text-sm text-blue-700 lg:p-3 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-500">
									<Link className="flex items-center gap-2 text-xs lg:text-sm" href="/profile">
										<p>
											<ShieldCheck className="h-4 w-4 md:h-5 md:w-5" />
										</p>
										<p>
											{t.dashboard.sellerProfileIncomplete ??
												'Your seller profile is incomplete. Please update it to be able to sell bibs.'}
										</p>
									</Link>
								</div>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	)
}
