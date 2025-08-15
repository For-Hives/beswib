'use client'

import { PayPalButtons } from '@paypal/react-paypal-js'
import React from 'react'

import Image from 'next/image'

import type { BibSale } from '@/models/marketplace.model'
import type { Event } from '@/models/event.model'
import type { Locale } from '@/lib/i18n/config'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getTranslations } from '@/lib/i18n/dictionary'
import { formatDateWithLocale } from '@/lib/utils/date'
import mainLocales from '@/app/[locale]/locales.json'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react'

interface PaymentDialogProps {
	/** Whether the payment dialog is open */
	isOpen: boolean
	/** Handler to close the payment dialog */
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
}

/**
 * Component that displays the payment dialog with PayPal integration using shadcn Dialog
 * Handles the complete purchase flow with order summary and payment processing
 */
export default function PaymentDialog({
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
}: PaymentDialogProps) {
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
			case 'cycling':
				return 'bg-cyan-500/15 border-cyan-500/50'
			case 'other':
				return 'bg-gray-500/15 border-gray-500/50'
			case 'running':
				return 'bg-green-500/15 border-green-500/50'
			case 'swimming':
				return 'bg-blue-500/15 border-blue-500/50'
			case 'trail':
				return 'bg-yellow-500/15 border-yellow-500/50'
			case 'triathlon':
				return 'bg-purple-500/15 border-purple-500/50'
		}
	}

	// Show success dialog
	if (successMessage) {
		return (
			<Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<div className="mb-4 flex items-center gap-3">
							<div className="rounded-full bg-green-100 p-2">
								<CheckCircle className="h-6 w-6 text-green-600" />
							</div>
							<DialogTitle className="text-green-600">{paymentT.paymentSuccess}</DialogTitle>
						</div>
					</DialogHeader>
					<div className="space-y-4">
						<p className="text-muted-foreground text-center">{paymentT.paymentSuccessMessage}</p>
						<div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
							<p className="text-sm font-medium text-green-700">{successMessage}</p>
						</div>
					</div>
					<DialogFooter className="sm:justify-center">
						<Button onClick={onClose} className="w-full sm:w-auto">
							{paymentT.goToDashboard}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		)
	}

	// Show error dialog
	if (errorMessage) {
		return (
			<Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<div className="mb-4 flex items-center gap-3">
							<div className="rounded-full bg-red-100 p-2">
								{errorMessage.toLowerCase().includes('cancel') ? (
									<XCircle className="h-6 w-6 text-red-600" />
								) : (
									<AlertCircle className="h-6 w-6 text-red-600" />
								)}
							</div>
							<DialogTitle className="text-red-600">
								{errorMessage.toLowerCase().includes('cancel') ? paymentT.paymentCancelled : paymentT.paymentError}
							</DialogTitle>
						</div>
					</DialogHeader>
					<div className="space-y-4">
						<p className="text-muted-foreground text-center">
							{errorMessage.toLowerCase().includes('cancel') ? paymentT.paymentCancelledMessage : errorMessage}
						</p>
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={onClose}>
							{paymentT.contactSupport}
						</Button>
						<Button onClick={onClose}>{paymentT.tryAgain}</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		)
	}

	// Show main payment dialog
	return (
		<Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
				<DialogHeader>
					<DialogTitle>{paymentT.title}</DialogTitle>
				</DialogHeader>

				<div className="grid gap-6 lg:grid-cols-3">
					{/* Order Summary - Left Side */}
					<div className="space-y-6 lg:col-span-2">
						{/* Event Summary Card */}
						<div className="bg-card/80 rounded-lg border p-4 backdrop-blur-sm">
							<h3 className="text-foreground mb-4 text-sm font-medium">{paymentT.eventDetails}</h3>
							<div className="flex items-start gap-4">
								<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
									<Image alt="Event Image" className="object-cover" fill sizes="64px" src={bib.event.image} />
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
									{hasValidReference && <p className="text-muted-foreground text-sm line-through">€{referencePrice}</p>}
								</div>
							</div>
						</div>

						{/* Order Summary Details */}
						<div className="bg-card/80 rounded-lg border p-4 backdrop-blur-sm">
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
								<div className="border-t pt-3">
									<div className="flex items-center justify-between text-lg font-semibold">
										<span className="text-foreground">{paymentT.total}</span>
										<span className="text-foreground">€{bib.price}</span>
									</div>
								</div>
							</div>
						</div>

						{/* What's Included */}
						<div className="bg-card/80 rounded-lg border p-4 backdrop-blur-sm">
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
						<div className="bg-card/80 rounded-lg border p-4 backdrop-blur-sm">
							<h3 className="text-foreground mb-4 text-sm font-medium">{paymentT.paymentMethod}</h3>

							<div className="rounded-lg border p-4">
								{loading && (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="mr-2 h-6 w-6 animate-spin" />
										<span className="text-muted-foreground text-sm">{paymentT.paymentProcessing}</span>
									</div>
								)}
								{!loading && (
									<PayPalButtons
										createOrder={onCreateOrder}
										disabled={loading || !isProfileComplete}
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
								)}
							</div>
						</div>

						{/* Security Features */}
						<div className="rounded-lg border border-green-500/40 bg-green-500/10 p-4 backdrop-blur-sm">
							<div className="text-sm">
								<p className="font-medium text-green-300">{paymentT.secureTransaction}</p>
								<p className="mt-1 text-green-200">{paymentT.secureDescription}</p>
							</div>
						</div>

						{/* Trust Indicators */}
						<div className="space-y-4 text-center">
							<div className="text-muted-foreground flex items-center justify-center gap-4 text-xs">
								<div className="flex items-center gap-1">
									<div className="h-2 w-2 rounded-full bg-green-400"></div>
									<span>{paymentT.ssl256}</span>
								</div>
								<div className="flex items-center gap-1">
									<div className="h-2 w-2 rounded-full bg-blue-400"></div>
									<span>{paymentT.paypalSecured}</span>
								</div>
							</div>
							<p className="text-muted-foreground text-xs">{paymentT.trustedAthletes}</p>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
