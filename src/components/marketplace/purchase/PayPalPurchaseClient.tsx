'use client'

import { useUser } from '@clerk/nextjs'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { captureOrder, checkPurchaseLock, createSale, lockBibForPurchase } from '@/app/[locale]/purchase/actions'
import marketplaceTranslations from '@/components/marketplace/locales.json'
import { priceBucket } from '@/lib/analytics/buckets'
import type { EventProps } from '@/lib/analytics/catalog'
import { fundingSource, paypalCodeKind } from '@/lib/analytics/classify'
import { track, trackView } from '@/lib/analytics/client'
import { bibIdOf, eventIdOf } from '@/lib/analytics/ids'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { signInPath } from '@/lib/utils/redirect'
import { isUserProfileComplete } from '@/lib/validation/user'
import type { Event } from '@/models/event.model'
import type { BibSale } from '@/models/marketplace.model'
import type { Organizer } from '@/models/organizer.model'
import type { User as AppUser } from '@/models/user.model'
import { EventWaitlistCard } from '../EventWaitlistCard'
// Import sub-components
import { ActionButtons, ContentTabs, EventDetails, EventImage, PriceDisplay } from './components'
import PaymentDialog from './components/PaymentDialog'
import { LockTimer } from './LockTimer'

interface PayPalPurchaseClientProps {
	bib: BibSale
	locale: Locale
	/** The seller, cut down to what the purchase needs: the page sends this to the browser of any visitor */
	sellerUser: Pick<AppUser, 'paypalMerchantId'> | null
	user: AppUser | null
	eventData?: Event & { expand?: { organizer: Organizer } }
	organizerData?: Organizer
	/** The bib was reached through its private link (analytics probes) */
	isPrivate?: boolean
	/** Token of that private link: the server asks for it at every purchase step. Never an analytics property */
	privateToken?: string
}

/**
 * Main component for PayPal purchase flow
 * Orchestrates the complete purchase experience including:
 * - Event information and pricing
 * - User authentication and profile validation
 * - PayPal payment processing
 * - Purchase confirmation and navigation
 */
type DateLike = string | Date | null | undefined
type LockStatus = 'locked' | 'unlocked' | 'userlocked'
// What the lock check answers: the state of the lock, or a refusal that has nothing to do with the lock
type LockCheck = LockStatus | 'unauthenticated' | 'unavailable'
const LOCK_CHECKS: readonly LockCheck[] = ['locked', 'unlocked', 'userlocked', 'unauthenticated', 'unavailable']

export default function PayPalPurchaseClient({
	user,
	sellerUser,
	privateToken,
	organizerData,
	locale,
	isPrivate = false,
	eventData,
	bib,
}: Readonly<PayPalPurchaseClientProps>) {
	const t = getTranslations(locale, marketplaceTranslations)
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

	const normalizeLockStatus = (value: unknown): LockCheck => {
		return LOCK_CHECKS.find(check => check === value) ?? 'locked'
	}
	const [errorMessage, setErrorMessage] = useState<null | string>(null)
	const [successMessage, setSuccessMessage] = useState<null | string>(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const [lockExpiration, setLockExpiration] = useState<DateTime | null>(null)
	const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
	const [isInstrumentDeclined, setIsInstrumentDeclined] = useState<boolean>(false)
	const [loading, setLoading] = useState(false)
	const { isSignedIn, isLoaded } = useUser()
	const router = useRouter()
	const [isProfileComplete, setIsProfileComplete] = useState(false)

	// Nuqs param for lockedAt
	const [lockedAtParam, setLockedAtParam] = useQueryState<string | null>('lockedAt', {
		shallow: false,
		parse: (value: string | null) => value,
		history: 'replace',
		defaultValue: null,
	})

	// Check if current user is the seller of this bib
	const isOwnBib = user?.id === bib.user.id

	useEffect(() => {
		setIsProfileComplete(isUserProfileComplete(user))
	}, [user])

	// Analytics: what every purchase event says about the bib (stable while the bib is the same)
	const bibId = bibIdOf(bib)
	const eventId = eventIdOf(bib.event)
	const price = priceBucket(bib.price)
	const purchaseProps = useMemo(
		() => ({
			price_bucket: price,
			listing: isPrivate ? ('private' as const) : ('public' as const),
			event_id: eventId,
			bib_id: bibId,
		}),
		[bibId, eventId, price, isPrivate]
	)
	const viewedBibRef = useRef<string | null>(null)
	const orderCreatedRef = useRef(false)
	const orderErrorTrackedRef = useRef(false)
	const paypalDismissedRef = useRef(false)
	const lockSawPositiveRef = useRef(false)
	const dialogStateRef = useRef({ isOpen: false, hasError: false })

	useEffect(() => {
		dialogStateRef.current = { isOpen: isPanelOpen, hasError: errorMessage != null && errorMessage !== '' }
	}, [isPanelOpen, errorMessage])

	// The server re-renders this page when the lockedAt param changes: one view per bib, not per render
	useEffect(() => {
		if (!isLoaded || viewedBibRef.current === bibId) return
		viewedBibRef.current = bibId
		const viewer: EventProps<'bib_view'>['viewer'] =
			isSignedIn !== true
				? 'anonymous'
				: isOwnBib
					? 'own_bib'
					: isUserProfileComplete(user)
						? 'ready'
						: 'profile_incomplete'
		trackView('bib_view', {
			viewer,
			state: 'available',
			price_bucket: purchaseProps.price_bucket,
			listing: purchaseProps.listing,
			event_id: purchaseProps.event_id,
			bib_id: viewer === 'own_bib' ? undefined : purchaseProps.bib_id,
		})
	}, [isLoaded, isSignedIn, isOwnBib, user, bibId, purchaseProps])

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
			if (left > 0) lockSawPositiveRef.current = true
			if (left <= 0) {
				// A stale lockedAt (reload, shared URL) is at zero on its first tick: not an expiry
				if (lockSawPositiveRef.current) {
					lockSawPositiveRef.current = false
					const { isOpen, hasError } = dialogStateRef.current
					track('purchase_lock_expire', {
						stage: !isOpen
							? 'dialog_closed'
							: hasError
								? 'error_shown'
								: orderCreatedRef.current
									? 'paypal_open'
									: 'dialog_open',
						event_id: eventId,
						bib_id: bibId,
					})
				}
				setLockExpiration(null)
			}
		}
		updateSeconds()
		const interval = setInterval(updateSeconds, 1000)
		return () => clearInterval(interval)
	}, [lockExpiration])

	// Helper: update local lock state and URL param from a lockedAt value
	const updateLockStateFrom = useCallback(
		(lockedAt: DateLike) => {
			const lockedDt: DateTime | null = toLuxon(lockedAt)
			setLockExpiration(lockedDt != null ? lockedDt.plus({ minutes: 5 }) : null)
			if (lockedDt != null) {
				const iso = lockedDt.toISO()
				if (iso != null) {
					setLockedAtParam(iso).catch(() => {
						toast.error('Error with the lock mechanism')
					})
				}
			}
		},
		[setLockedAtParam]
	)

	// Helper: enforce locking rules and open the payment panel
	const attemptLockAndOpenPanel = useCallback(
		async (status: LockStatus) => {
			if (status === 'locked') {
				track('purchase_error', { ...purchaseProps, step: 'lock', kind: 'locked_by_other' })
				toast.error('This bib is currently locked by another user for purchase. Please try again later.')
				return
			}

			setLoading(true)
			try {
				if (status === 'unlocked') {
					const lockedBib = await lockBibForPurchase(bib.id, privateToken ?? null)
					if (lockedBib == null || lockedBib === undefined) {
						track('purchase_error', { ...purchaseProps, step: 'lock', kind: 'lock_failed' })
						toast.error('Failed to lock bib. It may have just been locked by another user.')
						console.error('Failed to lock bib:', lockedBib)
						return
					}
					updateLockStateFrom(lockedBib.lockedAt)
				} else if (status === 'userlocked') {
					toast.info('This bib is currently locked by you for purchase.')
				}
				orderCreatedRef.current = false
				paypalDismissedRef.current = false
				track('purchase_start', { ...purchaseProps, lock: status === 'unlocked' ? 'new' : 'resumed' })
				setIsPanelOpen(true)
			} catch (err) {
				track('purchase_error', { ...purchaseProps, step: 'lock', kind: 'exception' })
				toast.error(`Error locking bib for purchase.${err instanceof Error ? err.message : String(err)}`)
			} finally {
				setLoading(false)
			}
		},
		[bib.id, updateLockStateFrom, privateToken, purchaseProps]
	)

	// Check if user is authenticated when trying to open payment modal
	const handleBuyNowClick = async () => {
		track('purchase_click', {
			...purchaseProps,
			viewer:
				isSignedIn !== true ? 'anonymous' : isOwnBib ? 'own_bib' : isProfileComplete ? 'ready' : 'profile_incomplete',
		})
		if (isSignedIn !== true) {
			// Back to this bib after sign-in. The query string comes along: a private listing is only
			// reachable with its token
			router.push(signInPath(locale, `${window.location.pathname}${window.location.search}`))
			return
		}
		if (isOwnBib) return // User trying to buy their own bib - button is disabled upstream
		if (!isProfileComplete) return

		// Check lock status to prevent multiple users purchasing the same bib
		const status = normalizeLockStatus(
			await checkPurchaseLock(bib.id, lockedAtParam ?? '', privateToken ?? null).catch((error: unknown) => {
				track('purchase_error', { ...purchaseProps, step: 'lock', kind: 'exception' })
				throw error
			})
		)
		// The server refused before it looked at the lock: nobody else is buying this bib
		if (status === 'unauthenticated') {
			// The browser still shows a session the server no longer accepts (expired, or not refreshed yet)
			track('purchase_error', { ...purchaseProps, step: 'lock', kind: 'unauthenticated' })
			toast.error('We could not verify your session. Please try again, or reload the page and sign in again.')
			return
		}
		if (status === 'unavailable') {
			track('purchase_error', { ...purchaseProps, step: 'lock', kind: 'bib_not_found' })
			toast.error(t.bibNotFound ?? 'Bib not found, or invalid access token')
			// The page shows a bib the server no longer sells to this visitor (the seller replaced the private
			// link, or the listing changed): the server renders what is true now
			router.refresh()
			return
		}
		await attemptLockAndOpenPanel(status)
	}

	const handleCreateOrder = useCallback(async () => {
		orderErrorTrackedRef.current = false
		// Get seller's PayPal merchant ID
		const sellerId = sellerUser?.paypalMerchantId
		if (sellerId == null || sellerId === undefined || sellerId === '') {
			track('purchase_error', { ...purchaseProps, step: 'order', kind: 'seller_not_configured' })
			orderErrorTrackedRef.current = true
			const errorMsg = 'Seller PayPal account not configured'
			setErrorMessage(errorMsg)
			throw new Error(errorMsg)
		}

		try {
			setLoading(true)
			setErrorMessage(null)

			const res = await createSale(bib.id, sellerId, locale, privateToken ?? null)
			if (!res.success || res.orderId == null || res.orderId === '') {
				track('purchase_error', { ...purchaseProps, step: 'order', kind: res.errorKind ?? 'exception' })
				orderErrorTrackedRef.current = true
				throw new Error(res.error ?? 'Failed to create sale')
			}

			orderCreatedRef.current = true
			track('purchase_step', { ...purchaseProps, step: 'order_created', funding_source: 'na' })
			return res.orderId
		} catch (error: unknown) {
			if (!orderErrorTrackedRef.current) {
				track('purchase_error', { ...purchaseProps, step: 'order', kind: 'exception' })
				orderErrorTrackedRef.current = true
			}
			const errorMsg = `Error creating order: ${error instanceof Error ? error.message : 'Unknown error'}`
			console.error('Order creation error:', error instanceof Error ? error.message : 'Unknown error')
			setErrorMessage(errorMsg)
			throw new Error(errorMsg)
		} finally {
			setLoading(false)
		}
	}, [sellerUser?.paypalMerchantId, bib.id, privateToken, purchaseProps])

	const onApprove = useCallback(
		async (data: { orderID: string }) => {
			let outcomeTracked = false
			try {
				track('purchase_step', { ...purchaseProps, step: 'approved', funding_source: 'na' })
				setLoading(true)
				setErrorMessage(null)

				// Pass the lock key (lockedAtParam) to enforce a last DB check server-side
				const res = await captureOrder(data.orderID, lockedAtParam ?? null, privateToken ?? null)

				// Handle instrument declined error specifically
				if (res.isInstrumentDeclined === true || res.needsPaymentRestart === true) {
					setIsInstrumentDeclined(true)
					setErrorMessage(res.error ?? 'Your payment method was declined. Please try a different payment method.')
					console.warn('Payment instrument declined, allowing retry with different funding source')
					track('purchase_error', {
						...purchaseProps,
						step: 'capture',
						kind: res.errorKind ?? 'instrument_declined',
					})
					return // Don't redirect, allow user to retry
				}

				if (res.error != null && res.error !== undefined && res.error !== '') {
					outcomeTracked = true
					track('purchase_error', {
						...purchaseProps,
						step: 'capture',
						kind: res.errorKind ?? paypalCodeKind(res.errorCode),
					})
					throw new Error(res.error)
				}

				outcomeTracked = true
				track('purchase_success', purchaseProps)
				setSuccessMessage('Payment captured successfully!')

				router.push(`/${locale}/purchase/success`)
			} catch (error: unknown) {
				if (!outcomeTracked) track('purchase_error', { ...purchaseProps, step: 'capture', kind: 'exception' })
				const errorMsg = `Error capturing payment: ${error instanceof Error ? error.message : 'Unknown error'}`
				console.error('Capture error:', error instanceof Error ? error.message : 'Unknown error')
				setErrorMessage(errorMsg)
				setIsInstrumentDeclined(false) // Reset instrument declined flag on other errors
			} finally {
				setLoading(false)
			}
		},
		[bib.id, locale, router, lockedAtParam, privateToken, purchaseProps]
	)

	const onError = useCallback(
		(err: Record<string, unknown>) => {
			// The SDK also reports here the order creation failure that handleCreateOrder already sent
			if (orderErrorTrackedRef.current) orderErrorTrackedRef.current = false
			else track('purchase_error', { ...purchaseProps, step: 'paypal', kind: 'sdk_error' })
			console.error('PayPal Error:', err)
			// Minimal error handling - just log and continue
			console.warn('PayPal error occurred, but continuing...')
			setLoading(false)
		},
		[purchaseProps]
	)

	// Function to restart payment flow after instrument declined
	const handlePaymentRestart = useCallback(() => {
		setIsInstrumentDeclined(false)
		setErrorMessage(null)
		setSuccessMessage(null)
		// The PayPal buttons will automatically allow selecting a different funding source
	}, [])

	const onCancel = useCallback(() => {
		track('purchase_cancel', { ...purchaseProps, where: 'paypal_popup', reached: 'order_created' })
		paypalDismissedRef.current = true
		setLoading(false)
		// Don't show error, just stop loading
	}, [purchaseProps])

	const handleFundingClick = useCallback(
		(source: string | undefined) => {
			track('purchase_step', { ...purchaseProps, step: 'payment_click', funding_source: fundingSource(source) })
		},
		[purchaseProps]
	)

	const handleSdkLoadError = useCallback(() => {
		track('purchase_error', { ...purchaseProps, step: 'paypal', kind: 'sdk_load_failed' })
	}, [purchaseProps])

	const handleDialogDismiss = useCallback(() => {
		track('purchase_cancel', {
			...purchaseProps,
			where: 'payment_dialog',
			reached: paypalDismissedRef.current ? 'paypal_dismissed' : orderCreatedRef.current ? 'order_created' : 'dialog',
		})
		orderCreatedRef.current = false
		paypalDismissedRef.current = false
	}, [purchaseProps])

	return (
		<div className="relative">
			{/* Lock timer in top left corner */}
			{secondsLeft != null && secondsLeft > 0 && (
				<div style={{ zIndex: 50, top: 24, position: 'fixed', left: 24 }}>
					<LockTimer seconds={secondsLeft} />
				</div>
			)}
			<div className="mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
				<div className="lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 lg:gap-y-10 xl:gap-x-16">
					{/* Event Image */}
					<div className="lg:col-span-4 lg:row-end-1">
						<EventImage bib={bib} eventData={eventData} locale={locale} />
						{/* Event Waitlist Card - Show on all marketplace pages */}
						<div className="lg:col-span-4">
							<EventWaitlistCard
								eventId={bib.event.id}
								analyticsEventId={eventId}
								eventName={bib.event.name}
								locale={locale}
								user={user}
								className="mt-6"
							/>
						</div>
					</div>

					{/* Product Details */}
					<div className="mx-auto mt-14 max-w-2xl sm:mt-16 lg:col-span-3 lg:row-span-2 lg:row-end-2 lg:mt-0 lg:max-w-none">
						<div className="flex flex-col-reverse">
							<div className="mt-4">
								<h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
									{bib.event.name} - {t.purchase?.bibTitle ?? 'Race Bib Purchase'}
								</h1>
								<h2 id="information-heading" className="sr-only">
									{t.bibInformation ?? 'Bib information'}
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
									<span>
										{bib.event.participantCount.toLocaleString(locale)} {t.participants ?? 'participants'}
									</span>
								</div>
							</div>
						</div>

						{/* Event Description with Organizer Info */}
						<EventDetails bib={bib} eventData={eventData} organizerData={organizerData} locale={locale} />

						{/* Price */}
						<PriceDisplay bib={bib} eventData={eventData} locale={locale} />
						<ActionButtons
							isSignedIn={isSignedIn}
							isProfileComplete={isProfileComplete}
							isOwnBib={isOwnBib}
							locale={locale}
							onBuyNowClick={() => {
								void handleBuyNowClick()
							}}
							eventId={bib.event.id}
							eventName={bib.event.name}
							user={user}
						/>
					</div>
				</div>

				{/* Tabbed Content Section */}
				<ContentTabs bib={bib} eventData={eventData} locale={locale} />
			</div>
			<PaymentDialog
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
				isInstrumentDeclined={isInstrumentDeclined}
				onPaymentRestart={handlePaymentRestart}
				onFundingClick={handleFundingClick}
				onSdkLoadError={handleSdkLoadError}
				onDismiss={handleDialogDismiss}
			/>
		</div>
	)
}
