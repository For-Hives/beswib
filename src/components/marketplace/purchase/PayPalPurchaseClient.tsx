'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useQueryState } from 'nuqs'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

import type { User as AppUser } from '@/models/user.model'
import type { Event } from '@/models/event.model'
import type { Organizer } from '@/models/organizer.model'
import type { Bib } from '@/models/bib.model'

import { createSale } from '@/app/[locale]/purchase/actions'
import { BibSale } from '@/components/marketplace/CardMarket'
import { capturePayment } from '@/services/paypal.services'
import { isUserProfileComplete } from '@/lib/userValidation'
import { Locale } from '@/lib/i18n-config'
// import Lanyard from '@/components/ui/BibPriceLanyard'
import { isLocked, lockBib } from '@/services/bib.services'

// Import sub-components
import { EventImage, EventDetails, PriceDisplay, ActionButtons, ContentTabs, PaymentPanel } from './components'
import { LockTimer } from './LockTimer'
import { toast } from 'sonner'
import { DateTime } from 'luxon'
// import { pbDateToLuxon } from '@/lib/dateUtils'

interface PayPalPurchaseClientProps {
	bib: BibSale
	locale: Locale
	sellerUser: AppUser | null
	user: AppUser | null
	eventData?: Event & { expand?: { organizer: Organizer } }
	organizerData?: Organizer
	bibData?: Bib & { expand?: { eventId: Event; sellerUserId: AppUser } }
}

/**
 * Main component for PayPal purchase flow
 * Orchestrates the complete purchase experience including:
 * - Interactive 3D lanyard display
 * - Event information and pricing
 * - User authentication and profile validation
 * - PayPal payment processing
 * - Purchase confirmation and navigation
 */
type DateLike = string | Date | null | undefined
type LockStatus = 'locked' | 'unlocked' | 'userlocked'

export default function PayPalPurchaseClient({
	user,
	sellerUser,
	locale,
	bib,
	eventData,
	organizerData,
}: Readonly<PayPalPurchaseClientProps>) {
	// Local safe converter to avoid type-aware linter issues with cross-module inference
	const toLuxon = (date: DateLike): DateTime | null => {
		if (date instanceof Date) {
			const dt = DateTime.fromJSDate(date).toUTC()
			return dt.isValid ? dt : null
		}
		if (typeof date === 'string' && date.trim() !== '') {
			let dt = DateTime.fromISO(date, { zone: 'utc' })
			if (dt.isValid) return dt
			dt = DateTime.fromSQL(date, { zone: 'utc' })
			if (dt.isValid) return dt
			dt = DateTime.fromFormat(date, "yyyy-MM-dd HH:mm:ss.SSS'Z'", { zone: 'utc' })
			if (dt.isValid) return dt
		}
		return null
	}

	const normalizeLockStatus = (value: unknown): LockStatus => {
		return value === 'locked' || value === 'unlocked' || value === 'userlocked' ? (value as LockStatus) : 'locked'
	}
	const [errorMessage, setErrorMessage] = useState<null | string>(null)
	const [successMessage, setSuccessMessage] = useState<null | string>(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const [lockExpiration, setLockExpiration] = useState<DateTime | null>(null)
	const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
	const [loading, setLoading] = useState(false)
	const { isSignedIn } = useUser()
	const router = useRouter()
	const [isProfileComplete, setIsProfileComplete] = useState(false)

	// Nuqs param for lockedAt
	const [lockedAtParam, setLockedAtParam] = useQueryState<string | null>('lockedAt', {
		history: 'replace',
		shallow: false,
		parse: (value: string | null) => value,
		defaultValue: null,
	})

	// Check if current user is the seller of this bib
	const isOwnBib = user?.id === bib.user.id

	useEffect(() => {
		setIsProfileComplete(isUserProfileComplete(user))
	}, [user])

	// Set lockExpiration from Nuqs lockedAt param
	useEffect(() => {
		if (lockedAtParam) {
			const lockedDt = DateTime.fromISO(lockedAtParam)
			setLockExpiration(lockedDt.plus({ minutes: 5 }))
		} else {
			setLockExpiration(null)
		}
	}, [lockedAtParam])

	// Interactive countdown timer
	useEffect(() => {
		if (!lockExpiration) {
			setSecondsLeft(null)
			return
		}
		const updateSeconds = () => {
			const left = Math.max(0, Math.floor((lockExpiration.toMillis() - Date.now()) / 1000))
			setSecondsLeft(left)
			if (left <= 0) {
				setLockExpiration(null)
			}
		}
		updateSeconds()
		const interval = setInterval(updateSeconds, 1000)
		return () => clearInterval(interval)
	}, [lockExpiration])

	// Check if user is authenticated when trying to open payment modal
	const handleBuyNowClick = async () => {
		if (isSignedIn !== true) {
			router.push(`/${locale}/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)
			return
		}
		if (isOwnBib) {
			// User trying to buy their own bib - do nothing, button should be disabled
			return
		}
		if (isProfileComplete) {
			// check for lock mechanism to prevent multi user to buy the same bib
			const isBibLocked: LockStatus = normalizeLockStatus(await isLocked(bib.id, lockedAtParam ?? ''))
			if (isBibLocked === 'locked') {
				toast.error('This bib is currently locked by another user for purchase. Please try again later.')
				return
			}
			// Try to lock the bib for this user
			setLoading(true)

			try {
				if (isBibLocked === 'unlocked') {
					const lockedBib = await lockBib(bib.id, user?.id ?? '')
					if (lockedBib === null || lockedBib === undefined) {
						toast.error('Failed to lock bib. It may have just been locked by another user.')
						console.error('Failed to lock bib:', lockedBib)
						setLoading(false)
						return
					}
					const lockedDt: DateTime | null = toLuxon(lockedBib.lockedAt)
					setLockExpiration(lockedDt !== null ? lockedDt.plus({ minutes: 5 }) : null)
					// Store lockedAt in Nuqs param
					const lockedAtDt: DateTime | null = toLuxon(lockedBib.lockedAt)
					if (lockedAtDt !== null) {
						const iso = lockedAtDt.toISO()
						if (iso !== null) {
							setLockedAtParam(iso).catch(() => {
								toast.error('Error with the lock mechanism')
							})
						}
					}
				} else if (isBibLocked === 'userlocked') {
					toast.info('This bib is currently locked by you for purchase.')
				}
				setIsPanelOpen(true)
			} catch (err) {
				toast.error('Error locking bib for purchase.' + (err instanceof Error ? err.message : String(err)))
			} finally {
				setLoading(false)
			}
		}
	}

	const handleCreateOrder = useCallback(async () => {
		// Get seller's PayPal merchant ID
		const sellerId = sellerUser?.paypalMerchantId

		if (sellerId === null || sellerId === undefined || sellerId === '') {
			const errorMsg = 'Seller PayPal account not configured'
			setErrorMessage(errorMsg)
			throw new Error(errorMsg)
		}

		try {
			setLoading(true)
			setErrorMessage(null)

			const res = await createSale(bib.id, sellerId)
			if (!res.success || res.orderId == null || res.orderId === '') {
				throw new Error(res.error ?? 'Failed to create sale')
			}

			console.info('Sale created, order:', res.orderId)
			return res.orderId
		} catch (error: unknown) {
			const errorMsg = 'Error creating order: ' + (error instanceof Error ? error.message : 'Unknown error')
			console.error('Order creation error:', error instanceof Error ? error.message : 'Unknown error')
			setErrorMessage(errorMsg)
			throw new Error(errorMsg)
		} finally {
			setLoading(false)
		}
	}, [sellerUser?.paypalMerchantId, bib.id])

	const onApprove = useCallback(
		async (data: { orderID: string }) => {
			try {
				setLoading(true)
				setErrorMessage(null)

				const res = await capturePayment(data.orderID)
				if (res.error !== null && res.error !== undefined && res.error !== '') {
					throw new Error(res.error)
				}

				setSuccessMessage('Payment captured successfully!')
				console.info('Payment captured:', res)

				router.push(`/${locale}/purchase/success`)
			} catch (error: unknown) {
				const errorMsg = 'Error capturing payment: ' + (error instanceof Error ? error.message : 'Unknown error')
				console.error('Capture error:', error instanceof Error ? error.message : 'Unknown error')
				setErrorMessage(errorMsg)
			} finally {
				setLoading(false)
			}
		},
		[bib.id, locale, router]
	)

	const onError = useCallback((_err: Record<string, unknown>) => {
		console.error('PayPal Error:', _err)
		const message = typeof _err.message === 'string' ? _err.message : 'An unknown error occurred'
		setErrorMessage('PayPal Error: ' + message)
		setLoading(false)
	}, [])

	const onCancel = useCallback(() => {
		console.info('PayPal payment cancelled')
		setErrorMessage('Payment cancelled by user')
		setLoading(false)
	}, [])

	return (
		<div className="relative">
			{/* Lock timer in top left corner */}
			{secondsLeft !== null && secondsLeft > 0 && (
				<div style={{ position: 'fixed', top: 24, left: 24, zIndex: 50 }}>
					<LockTimer seconds={secondsLeft} />
				</div>
			)}
			{/* Interactive Price Lanyard with dynamic price display */}
			<div className="mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
				<div className="lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 lg:gap-y-10 xl:gap-x-16">
					{/* Event Image */}
					<div className="lg:col-span-4 lg:row-end-1">
						<EventImage bib={bib} eventData={eventData} locale={locale} />
					</div>

					{/* Product Details */}
					<div className="mx-auto mt-14 max-w-2xl sm:mt-16 lg:col-span-3 lg:row-span-2 lg:row-end-2 lg:mt-0 lg:max-w-none">
						<div className="flex flex-col-reverse">
							<div className="mt-4">
								<h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{bib.event.name}</h1>
								<h2 id="information-heading" className="sr-only">
									Bib information
								</h2>
								<p className="text-muted-foreground mt-2 text-sm">
									Event Date: {bib.event.date.toLocaleDateString()} • {bib.event.location}
								</p>
							</div>

							<div className="space-y-4">
								{/* Race Stats */}
								<div className="text-muted-foreground flex items-center gap-6 text-sm">
									{/* Distance + Elevation */}
									<span>
										{bib.event.distance}
										{bib.event.distanceUnit}
										{(eventData?.elevationGainM ?? 0) > 0 && (
											<span className="text-muted-foreground/70"> (+{eventData?.elevationGainM}m)</span>
										)}
									</span>

									{/* Participants */}
									<span>{bib.event.participantCount.toLocaleString()} runners</span>
								</div>
							</div>
						</div>

						{/* Event Description with Organizer Info */}
						<EventDetails bib={bib} eventData={eventData} organizerData={organizerData} locale={locale} />

						{/* Price */}
						<PriceDisplay bib={bib} eventData={eventData} />
						<ActionButtons
							isSignedIn={isSignedIn}
							isProfileComplete={isProfileComplete}
							isOwnBib={isOwnBib}
							locale={locale}
							onBuyNowClick={() => {
								void handleBuyNowClick()
							}}
						/>
					</div>
				</div>

				{/* Tabbed Content Section */}
				<ContentTabs bib={bib} eventData={eventData} locale={locale} />
			</div>
			<PaymentPanel
				isOpen={isPanelOpen}
				onClose={() => setIsPanelOpen(false)}
				bib={bib}
				locale={locale}
				eventData={eventData as Event}
				errorMessage={errorMessage}
				successMessage={successMessage}
				loading={loading}
				isProfileComplete={isProfileComplete}
				onCreateOrder={handleCreateOrder}
				onApprove={onApprove}
				onError={onError}
				onCancel={onCancel}
			/>
		</div>
	)
}
