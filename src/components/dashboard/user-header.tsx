'use client'

import { AlertTriangle, ShieldCheck } from 'lucide-react'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

import type { User } from '@/models/user.model'

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
	user: null | User
}

export default function UserHeader({ user, clerkUser }: Readonly<UserHeaderProps>) {
	const userName = clerkUser.firstName ?? clerkUser.emailAddresses[0]?.emailAddress ?? 'User'

	const isRunnerProfileComplete =
		user?.firstName != null &&
		user?.lastName != null &&
		user?.birthDate != null &&
		(user.birthDate instanceof Date ? !isNaN(user.birthDate.getTime()) : String(user.birthDate).trim() !== '') &&
		user?.phoneNumber != null &&
		user?.emergencyContactName != null &&
		user?.emergencyContactPhone != null &&
		user?.address != null &&
		user?.postalCode != null &&
		user?.city != null &&
		user?.country != null

	const isSellerProfileComplete = user?.paypalMerchantId != null

	return (
		<div className="bg-card/25 border-border/30 absolute top-0 right-0 left-0 z-20 mx-4 mt-12 mb-6 rounded-2xl border p-4 backdrop-blur-sm">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-muted-foreground text-sm">Welcome back</p>
					<div className="flex">
						{!isRunnerProfileComplete && (
							<div className="mt-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-500">
								<Link className="flex items-center gap-2" href="/profile">
									<AlertTriangle className="h-5 w-5" />
									Your runner profile is incomplete. Please update it to be able to buy bibs.
								</Link>
							</div>
						)}
						{!isSellerProfileComplete && (
							<div className="mt-4 rounded-lg border border-blue-500/50 bg-blue-500/10 p-3 text-sm text-blue-500">
								<Link className="flex items-center gap-2" href="/profile">
									<ShieldCheck className="h-5 w-5" />
									Your seller profile is incomplete. Please update it to be able to sell bibs.
								</Link>
							</div>
						)}
					</div>
				</div>

				<div className="flex items-center justify-end gap-4">
					<div className="flex flex-col items-end gap-2">
						<div className="bg-primary/10 text-primary w-fit rounded-full px-3 py-1 text-xs font-medium">MEMBER</div>
						<p className="text-foreground font-medium">
							{userName}
							{clerkUser.emailAddresses[0] !== undefined && (
								<span className="text-muted-foreground ml-2 text-sm">({clerkUser.emailAddresses[0].emailAddress})</span>
							)}
						</p>
					</div>
					<UserButton />
				</div>
			</div>
		</div>
	)
}
