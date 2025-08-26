'use client'

import { AlertTriangle } from 'lucide-react'
import React from 'react'

import Link from 'next/link'

import type { Locale } from '@/lib/i18n/config'
import type { User } from '@/models/user.model'

import { EventWaitlistCard } from '@/components/marketplace/EventWaitlistCard'
import marketplaceTranslations from '@/components/marketplace/locales.json'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getTranslations } from '@/lib/i18n/dictionary'

interface ActionButtonsProps {
	/** Whether user is signed in */
	isSignedIn: boolean | undefined
	/** Whether user profile is complete */
	isProfileComplete: boolean
	/** Whether current user is the seller */
	isOwnBib: boolean
	/** Locale for navigation */
	locale: Locale
	/** Handler for buy button click */
	onBuyNowClick: () => void
	/** Event ID for navigation */
	eventId: string
	/** Event name for waitlist */
	eventName: string
	/** Current user data */
	user?: User | null
}

/**
 * Component that displays action buttons with appropriate alerts and states
 * Handles different user states: not signed in, incomplete profile, own bib, etc.
 */
export default function ActionButtons({
	user,
	onBuyNowClick,
	locale,
	isSignedIn,
	isProfileComplete,
	isOwnBib,
	eventName,
	eventId,
}: Readonly<ActionButtonsProps>) {
	const t = getTranslations(locale, marketplaceTranslations)
	return (
		<div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
			{/* Profile Incomplete Alert */}
			{!isProfileComplete && isSignedIn === true && !isOwnBib && (
				<div className="sm:col-span-2">
					<Alert className="mb-4" variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>{t.profileIncompleteTitle ?? 'Profile Incomplete'}</AlertTitle>
						<AlertDescription>
							{t.profileIncompleteBody ?? 'Please complete your runner profile before purchasing a bib.'}{' '}
							<Link className="font-bold underline" href={`/${locale}/profile`}>
								{t.completeProfile ?? 'Complete Profile'}
							</Link>
						</AlertDescription>
					</Alert>
				</div>
			)}

			{/* Own Bib Alert */}
			{isOwnBib && isSignedIn === true && (
				<div className="sm:col-span-2">
					<Alert className="mb-4" variant="default">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>{t.ownBibTitle ?? 'Your Own Bib'}</AlertTitle>
						<AlertDescription>
							{t.ownBibBody ?? 'You cannot purchase your own bib. You can manage it from your'}{' '}
							<Link className="font-bold underline" href={`/${locale}/dashboard/seller`}>
								{t.sellerDashboard ?? 'seller dashboard'}
							</Link>
							.
						</AlertDescription>
					</Alert>
				</div>
			)}

			{/* Buy Button - Only show if user can potentially purchase */}
			{(isSignedIn !== true || (isSignedIn === true && isProfileComplete && !isOwnBib)) && (
				<button
					type="button"
					onClick={onBuyNowClick}
					className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary w-full cursor-pointer rounded-md px-8 py-3 text-base font-medium transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
					disabled={isOwnBib}
				>
					{isSignedIn !== true ? (t.signInToPurchase ?? 'Sign In to Purchase') : (t.purchaseBib ?? 'Purchase Bib')}
				</button>
			)}

			{/* Event Details Button - Only show if user can potentially purchase */}
			{(isSignedIn !== true || (isSignedIn === true && isProfileComplete && !isOwnBib)) && (
				<Link href={`/${locale}/events/${eventId}`}>
					<button
						type="button"
						className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-primary w-full cursor-pointer rounded-md border px-8 py-3 text-base font-medium transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none"
					>
						{t.eventDetails ?? 'Event Details'}
					</button>
				</Link>
			)}

			{/* Event Waitlist Card - Show on all marketplace pages */}
			<div className="sm:col-span-2">
				<EventWaitlistCard eventId={eventId} eventName={eventName} locale={locale} user={user} className="mt-6" />
			</div>
		</div>
	)
}
