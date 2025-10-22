'use client'

import { PayPalButtons } from '@paypal/react-paypal-js'
import Image from 'next/image'
import mainLocales from '@/app/[locale]/locales.json'
import { SlidingPanel } from '@/components/ui/SlidingPanel'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { cn } from '@/lib/utils'
import { formatDateWithLocale } from '@/lib/utils/date'
import type { Event } from '@/models/event.model'
import type { BibSale } from '@/models/marketplace.model'

interface PaymentPanelProps {
	/** Whether the payment panel is open */
	isOpen: boolean
	/** Handler to close the payment panel */
	onClose: () => void
	/** The bib sale data */
	bib: BibSale
	/** Locale for date formatting */
	locale: Locale
	/** Optional event data for official price comparison */
	eventData?: Event
	/** Error message to display */
	errorMessage: string | null
	/** Success message to display */
	successMessage: string | null
	/** Whether payment is loading */
	loading: boolean
	/** Whether user profile is complete */
	isProfileComplete: boolean
	/** PayPal order creation handler */
	onCreateOrder: () => Promise<string>
	/** PayPal approval handler */
	onApprove: (data: { orderID: string }) => Promise<void>
	/** PayPal error handler */
	onError: (err: Record<string, unknown>) => void
	/** PayPal cancel handler */
	onCancel: () => void
	/** Whether payment method was declined */
	isInstrumentDeclined?: boolean
	/** Handler for payment restart after instrument declined */
	onPaymentRestart?: () => void
}

/**
 * Component that displays the payment panel with PayPal integration
 * Handles the complete purchase flow with order summary and payment processing
 */
export default function PaymentPanel({
	successMessage,
	onError,
	onCreateOrder,
	onClose,
	onCancel,
	onApprove,
	locale,
	loading,
	isProfileComplete,
	isOpen,
	eventData,
	errorMessage,
	bib,
}: PaymentPanelProps) {
	const paymentT = getTranslations(locale, mainLocales).payment
	// Calculate the lowest reference price between original and official
	const officialPrice = eventData?.officialStandardPrice ?? 0
	const originalPrice = bib.originalPrice ?? 0

	// Determine the reference price (lowest between original and official)
	const referencePrice =
		officialPrice > 0 && originalPrice > 0
			? Math.min(officialPrice, originalPrice)
			: officialPrice > 0
				? officialPrice
				: originalPrice > 0
					? originalPrice
					: 0

	// Check if we have a valid reference price to compare against
	const hasValidReference = referencePrice > 0 && referencePrice !== bib.price && referencePrice > bib.price

	/**
	 * Get background styling based on event type
	 * @param type - The type of sporting event
	 * @returns CSS classes for the badge styling
	 */
	function bgFromType(type: BibSale['event']['type']) {
		switch (type) {
			case 'cycle':
				return 'bg-cyan-500/15 border-cyan-500/50'
			case 'other':
				return 'bg-gray-500/15 border-gray-500/50'
			case 'road':
				return 'bg-green-500/15 border-green-500/50'
			case 'trail':
				return 'bg-yellow-500/15 border-yellow-500/50'
			case 'triathlon':
				return 'bg-purple-500/15 border-purple-500/50'
		}
	}

	return (
		<SlidingPanel className="z-[100]" isOpen={isOpen} onClose={onClose} title={paymentT.title} variant="slide">
			<div className="bg-background p-6">
				<div className="mx-auto max-w-4xl">
					<div className="grid gap-8 lg:grid-cols-3">
						{/* Order Summary - Left Side */}
						<div className="space-y-6 lg:col-span-2">
							{/* Event Summary Card */}
							<div className="dark:border-border/50 bg-card/80 rounded-lg border border-black/50 p-6 backdrop-blur-sm">
								<h3 className="text-foreground mb-4 text-sm font-medium">{paymentT.eventDetails}</h3>
								<div className="flex items-start gap-4">
									<div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
										<Image alt="Event Image" className="object-cover" fill sizes="80px" src={bib.event.image} />
									</div>
									<div className="min-w-0 flex-1">
										<h4 className="text-foreground truncate text-lg font-semibold">{bib.event.name}</h4>
										<p className="text-muted-foreground mt-1 text-sm">{formatDateWithLocale(bib.event.date, locale)}</p>
										<p className="text-muted-foreground text-sm">{bib.event.location}</p>
										<div className="mt-2 flex items-center gap-2">
											<span
												className={cn(
													'inline-block rounded-full border px-2 py-1 text-xs font-medium text-white/90',
													bgFromType(bib.event.type)
												)}
											>
												{bib.event.type.charAt(0).toUpperCase() + bib.event.type.slice(1)}
											</span>
											<span className="text-muted-foreground text-xs">
												{bib.event.distance}
												{bib.event.distanceUnit}
											</span>
										</div>
									</div>
									<div className="flex-shrink-0 text-right">
										<p className="text-foreground text-2xl font-bold">€{bib.price}</p>
										{hasValidReference && (
											<p className="text-muted-foreground text-sm line-through">€{referencePrice}</p>
										)}
									</div>
								</div>
							</div>

							{/* Order Summary Details */}
							<div className="dark:border-border/50 bg-card/80 rounded-lg border border-black/50 p-6 backdrop-blur-sm">
								<h3 className="text-foreground mb-4 text-sm font-medium">{paymentT.orderSummary}</h3>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-foreground/80">{paymentT.raceBibTransfer}</span>
										<span className="text-foreground/80">€{bib.price}</span>
									</div>
									{hasValidReference && (
										<div className="flex items-center justify-between text-green-400">
											<span className="text-sm">{paymentT.discountApplied}</span>
											<span className="text-sm">-€{(referencePrice - bib.price).toFixed(2)}</span>
										</div>
									)}
									<div className="border-border/20 border-t pt-3">
										<div className="flex items-center justify-between text-lg font-semibold">
											<span className="text-foreground">{paymentT.total}</span>
											<span className="text-foreground">€{bib.price}</span>
										</div>
									</div>
								</div>
							</div>

							{/* What's Included */}
							<div className="dark:border-border/50 bg-card/80 rounded-lg border border-black/50 p-6 backdrop-blur-sm">
								<h3 className="text-foreground mb-4 text-sm font-medium">{paymentT.whatsIncluded}</h3>
								<ul className="text-foreground/80 space-y-2 text-sm">
									<li>• {paymentT.officialBib}</li>
									<li>• {paymentT.eventMaterials}</li>
									<li>• {paymentT.transferService}</li>
									<li>• {paymentT.multilingualAssistance}</li>
								</ul>
							</div>
						</div>

						{/* Payment Section - Right Side */}
						<div className="space-y-6">
							<div className="dark:border-border/50 bg-card/80 rounded-lg border border-black/50 p-6 backdrop-blur-sm">
								<h3 className="text-foreground mb-4 text-sm font-medium">{paymentT.paymentMethod}</h3>

								{/* Error Messages */}
								{Boolean(errorMessage) && (
									<div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
										{errorMessage}
									</div>
								)}

								{/* Success Messages */}
								{Boolean(successMessage) && (
									<div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-400">
										{successMessage}
									</div>
								)}

								<div className="border-border/20 bg-background rounded-lg border p-4">
									<PayPalButtons
										createOrder={onCreateOrder}
										disabled={loading ?? !isProfileComplete}
										onApprove={onApprove}
										onCancel={onCancel}
										onError={onError}
										style={{
											shape: 'rect' as const,
											layout: 'vertical' as const,
											label: 'paypal' as const,
											height: 50,
											color: 'blue' as const,
										}}
									/>
								</div>
							</div>

							{/* Security Features */}
							<div className="rounded-lg border border-green-500/40 bg-green-500/10 p-6 backdrop-blur-sm">
								<div className="text-sm">
									<p className="font-medium text-green-300">{paymentT.secureTransaction}</p>
									<p className="mt-1 text-green-200">{paymentT.secureDescription}</p>
								</div>
							</div>

							{/* Trust Indicators */}
							<div className="space-y-4 text-center">
								<div className="text-muted-foreground flex items-center justify-center gap-6 text-xs">
									<div className="flex items-center gap-1">
										<div className="h-2 w-2 rounded-full bg-green-400"></div>
										<span>{paymentT.ssl256}</span>
									</div>
									<div className="flex items-center gap-1">
										<div className="h-2 w-2 rounded-full bg-blue-400"></div>
										<span>{paymentT.paypalSecured}</span>
									</div>
									<div className="flex items-center gap-1">
										<div className="h-2 w-2 rounded-full bg-purple-400"></div>
										<span>{paymentT.pciCompliant}</span>
									</div>
								</div>
								<p className="text-muted-foreground text-xs">{paymentT.trustedAthletes}</p>
								<div className="text-muted-foreground flex items-center justify-center gap-4 text-xs">
									<span>{paymentT.bankEncryption}</span>
									<span>{paymentT.instantConfirmation}</span>
									<span>{paymentT.fraudProtection}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</SlidingPanel>
	)
}
