'use client'

import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { PayPalButtons } from '@paypal/react-paypal-js'
import React, { useState, useCallback } from 'react'

import Image from 'next/image'

import type { BibSale } from '@/models/marketplace.model'
import type { Event } from '@/models/event.model'
import type { Locale } from '@/lib/i18n/config'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getTranslations } from '@/lib/i18n/dictionary'
import { formatDateWithLocale } from '@/lib/utils/date'
import mainLocales from '@/app/[locale]/locales.json'
import { cn } from '@/lib/utils'

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
	/** Whether payment method was declined */
	isInstrumentDeclined?: boolean
	/** Handler for payment restart after instrument declined */
	onPaymentRestart?: () => void
}

/**
 * Component that displays the payment dialog with PayPal integration using shadcn Dialog
 * Handles the complete purchase flow with order summary and payment processing
 */
export default function PaymentDialog({
	successMessage,
	onPaymentRestart,
	onError,
	onCreateOrder,
	onClose,
	onCancel,
	onApprove,
	locale,
	loading,
	isProfileComplete,
	isOpen,
	isInstrumentDeclined,
	eventData,
	errorMessage,
	bib,
}: PaymentDialogProps) {
	const paymentT = getTranslations(locale, mainLocales).payment

	// Track PayPal interaction state to manage focus
	const [isPayPalInteracting, setIsPayPalInteracting] = useState(false)

	// Wrapped PayPal handlers to manage focus state
	const handleCreateOrder = useCallback(async () => {
		setIsPayPalInteracting(true)
		try {
			return await onCreateOrder()
		} catch (error) {
			setIsPayPalInteracting(false)
			throw error
		}
	}, [onCreateOrder])

	const handleApprove = useCallback(
		async (data: { orderID: string }) => {
			try {
				await onApprove(data)
			} finally {
				setIsPayPalInteracting(false)
			}
		},
		[onApprove]
	)

	const handleError = useCallback(
		(err: Record<string, unknown>) => {
			setIsPayPalInteracting(false)
			onError(err)
		},
		[onError]
	)

	const handleCancel = useCallback(() => {
		setIsPayPalInteracting(false)
		onCancel()
	}, [onCancel])

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
				return 'bg-cyan-500/15 border-cyan-500/50 text-dark dark:text-white'
			case 'other':
				return 'bg-gray-500/15 border-gray-500/50 text-dark dark:text-white'
			case 'road':
				return 'bg-green-500/15 border-green-500/50 text-dark dark:text-white'
			case 'trail':
				return 'bg-yellow-500/15 border-yellow-500/50 text-dark dark:text-white'
			case 'triathlon':
				return 'bg-purple-500/15 border-purple-500/50 text-dark dark:text-white'
		}
	}

	// Show success dialog
	if (successMessage != null && successMessage !== '') {
		return (
			<AlertDialog open={isOpen}>
				<AlertDialogContent className="sm:max-w-md">
					<AlertDialogHeader>
						<div className="mb-4 flex items-center justify-center">
							<div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
								<CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
							</div>
						</div>
						<AlertDialogTitle className="text-center text-green-600 dark:text-green-400">
							{paymentT.paymentSuccess}
						</AlertDialogTitle>
						<AlertDialogDescription className="text-center">{paymentT.paymentSuccessMessage}</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="my-4">
						<div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-900/10">
							<p className="text-sm font-medium text-green-700 dark:text-green-300">{successMessage}</p>
						</div>
					</div>
					<AlertDialogFooter className="sm:justify-center">
						<AlertDialogAction onClick={onClose} className="w-full sm:w-auto">
							{paymentT.goToDashboard}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		)
	}

	// Show error dialog
	if (errorMessage != null && errorMessage !== '') {
		const isCancelled = errorMessage?.toLowerCase().includes('cancel')
		const isDeclined = isInstrumentDeclined ?? errorMessage.toLowerCase().includes('declined')

		return (
			<AlertDialog open={isOpen}>
				<AlertDialogContent className="sm:max-w-md">
					<AlertDialogHeader>
						<div className="mb-4 flex items-center justify-center">
							<div
								className={`rounded-full p-3 ${
									isCancelled
										? 'bg-orange-100 dark:bg-orange-900/20'
										: isDeclined
											? 'bg-yellow-100 dark:bg-yellow-900/20'
											: 'bg-red-100 dark:bg-red-900/20'
								}`}
							>
								{isCancelled ? (
									<XCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
								) : isDeclined ? (
									<AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
								) : (
									<AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
								)}
							</div>
						</div>
						<AlertDialogTitle
							className={`text-center ${
								isCancelled
									? 'text-orange-600 dark:text-orange-400'
									: isDeclined
										? 'text-yellow-600 dark:text-yellow-400'
										: 'text-red-600 dark:text-red-400'
							}`}
						>
							{isCancelled
								? paymentT.paymentCancelled
								: isDeclined
									? paymentT.paymentMethodDeclined
									: paymentT.paymentError}
						</AlertDialogTitle>
						<AlertDialogDescription className="text-center">
							{isCancelled
								? paymentT.paymentCancelledMessage
								: isDeclined
									? paymentT.paymentDeclinedMessage
									: errorMessage}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="gap-2 sm:justify-center">
						<AlertDialogCancel onClick={onClose}>{paymentT.contactSupport}</AlertDialogCancel>
						{isDeclined && onPaymentRestart ? (
							<AlertDialogAction onClick={onPaymentRestart}>{paymentT.tryDifferentPaymentMethod}</AlertDialogAction>
						) : (
							<AlertDialogAction onClick={onClose}>{paymentT.tryAgain}</AlertDialogAction>
						)}
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		)
	}

	// Show main payment dialog
	return (
		<Dialog
			open={isOpen}
			onOpenChange={open => !open && onClose()}
			modal={!isPayPalInteracting} // Disable modal behavior when PayPal is interacting
		>
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
						<div className="bg-card/100 rounded-lg border p-4">
							<h3 className="text-foreground mb-4 text-sm font-medium">{paymentT.paymentMethod}</h3>

							<div className="rounded-lg">
								<div
									className="rounded-lg bg-white p-4"
									style={{ zIndex: 9999, position: 'relative', colorScheme: 'none' }}
								>
									<PayPalButtons
										createOrder={handleCreateOrder}
										disabled={loading || !isProfileComplete}
										onApprove={handleApprove}
										onCancel={handleCancel}
										onError={handleError}
										style={{
											shape: 'rect' as const,
											layout: 'vertical' as const,
											label: 'paypal' as const,
											height: 50,
											color: 'blue' as const,
										}}
										// Force iframe mode, disable popups
										fundingSource={undefined}
										// Disable popup fallback for better iframe experience
										forceReRender={[isPayPalInteracting]}
									/>
								</div>
							</div>
						</div>

						{/* Security Features */}
						<div className="rounded-lg border border-green-500/40 bg-green-500/10 p-4 backdrop-blur-sm">
							<div className="text-sm">
								<p className="font-medium text-green-700 dark:text-green-300">{paymentT.secureTransaction}</p>
								<p className="mt-1 text-green-600 dark:text-green-200">{paymentT.secureDescription}</p>
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
