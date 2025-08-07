'use client'

import React from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { Locale } from '@/lib/i18n-config'

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
}

/**
 * Component that displays action buttons with appropriate alerts and states
 * Handles different user states: not signed in, incomplete profile, own bib, etc.
 */
export default function ActionButtons({
	isSignedIn,
	isProfileComplete,
	isOwnBib,
	locale,
	onBuyNowClick,
}: ActionButtonsProps) {
	return (
		<div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
			{/* Profile Incomplete Alert */}
			{!isProfileComplete && isSignedIn === true && !isOwnBib && (
				<div className="sm:col-span-2">
					<Alert className="mb-4" variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Profile Incomplete</AlertTitle>
						<AlertDescription>
							Please complete your runner profile before purchasing a bib.{' '}
							<Link className="font-bold underline" href={`/${locale}/profile`}>
								Complete Profile
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
						<AlertTitle>Your Own Bib</AlertTitle>
						<AlertDescription>
							You cannot purchase your own bib. You can manage it from your{' '}
							<Link className="font-bold underline" href={`/${locale}/dashboard/seller`}>
								seller dashboard
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
					className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary w-full rounded-md px-8 py-3 text-base font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
					disabled={isOwnBib}
				>
					{isSignedIn !== true ? 'Sign In to Purchase' : 'Purchase Bib'}
				</button>
			)}

			{/* Event Details Button - Only show if user can potentially purchase */}
			{(isSignedIn !== true || (isSignedIn === true && isProfileComplete && !isOwnBib)) && (
				<button
					type="button"
					className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-primary w-full rounded-md border px-8 py-3 text-base font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
				>
					Event Details
				</button>
			)}
		</div>
	)
}
