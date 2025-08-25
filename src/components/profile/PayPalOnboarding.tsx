'use client'
import { CircleCheckBig, ExternalLink, RefreshCw, Unlink, XCircle } from 'lucide-react'
import { Suspense } from 'react'
import React from 'react'

import { usePayPalMerchantStatus } from '@/hooks/usePayPalMerchantStatus'
import { usePayPalOnboarding } from '@/hooks/usePayPalOnboarding'
import { usePayPalDisconnect } from '@/hooks/usePayPalDisconnect'
import { useUser } from '@/hooks/useUser'

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import profileTranslations from '@/app/[locale]/profile/locales.json'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Locale } from '@/lib/i18n/config'

import PayPalOnboardingSkeleton from './PayPalOnboardingSkeleton'

interface PayPalOnboardingProps {
	locale: Locale
	userId: string
}

export default function PayPalOnboarding(props: PayPalOnboardingProps) {
	return (
		<Suspense fallback={<PayPalOnboardingSkeleton />}>
			<PayPalOnboardingContent {...props} />
		</Suspense>
	)
}

// Utility to normalize various error shapes into a message
function formatError(error: unknown, fallback: string): string {
	if (error instanceof Error) return error.message
	if (typeof error === 'object' && error != null && 'message' in error) {
		const maybe = (error as { message?: unknown }).message
		if (typeof maybe === 'string') return maybe
	}
	return fallback
}

// Local translation shape helpers to avoid `any` and unsafe member access
type StatusText = { paypalVerified: string; paypalNotVerified: string }
type DisconnectText = {
	disconnectTitle: string
	disconnectDescription: string
	cancel: string
	disconnecting: string
	confirm: string
}

// Badge indicating current PayPal connection status
function StatusBadge({ t, hasMerchantId }: { hasMerchantId: boolean; t: StatusText }) {
	if (hasMerchantId) {
		return null
	}
	return (
		<Badge variant="destructive">
			<XCircle className="mr-1 h-3 w-3" />
			{t.paypalNotVerified}
		</Badge>
	)
}

// Panel showing the merchant ID once available
function MerchantIdPanel({ merchantId }: { merchantId: string }) {
	return (
		<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
			<p className="text-sm text-blue-800 dark:text-blue-300">
				<strong>Merchant ID:</strong> {merchantId}
			</p>
			<p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
				Your PayPal merchant ID has been automatically retrieved and saved.
			</p>
		</div>
	)
}

function PendingLinkNotice() {
	return (
		<div className="flex flex-col items-center justify-center space-y-2 py-6">
			<RefreshCw className="mb-2 h-6 w-6 animate-spin text-blue-600" />
			<span className="text-sm font-medium text-blue-700 dark:text-blue-300">
				It could take a few minutes to link your PayPal account.
			</span>
		</div>
	)
}

function DisconnectConfirmDialog({
	t,
	setOpen,
	pending,
	open,
	onConfirm,
}: {
	open: boolean
	setOpen: (open: boolean) => void
	pending: boolean
	onConfirm: () => void
	t: DisconnectText
}) {
	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t.disconnectTitle}</AlertDialogTitle>
					<AlertDialogDescription>{t.disconnectDescription}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={pending}>{t.cancel}</AlertDialogCancel>
					<AlertDialogAction
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						onClick={onConfirm}
						disabled={pending}
					>
						{pending ? (
							<>
								<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
								{t.disconnecting}
							</>
						) : (
							t.confirm
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}

function PayPalOnboardingContent({ userId, locale }: PayPalOnboardingProps) {
	const t = getTranslations(locale, profileTranslations).profile.sellerInfo
	const { isLoading, error, data: user } = useUser(userId)

	const onboardingMutation = usePayPalOnboarding()
	const disconnectMutation = usePayPalDisconnect()
	const [showDisconnectConfirm, setShowDisconnectConfirm] = React.useState(false)

	// Merchant KYC / payments readiness status (fetched once; manual refresh only)
	const merchantStatusQuery = usePayPalMerchantStatus(userId)

	const handlePayPalConnect = () => {
		onboardingMutation.mutate(userId)
	}

	const handleDisconnect = () => {
		disconnectMutation.mutate(userId, {
			onSuccess: () => {
				setShowDisconnectConfirm(false)
			},
		})
	}

	if (isLoading) {
		return <PayPalOnboardingSkeleton />
	}

	if (error) {
		console.error('User fetch error:', error)
		return (
			<Alert variant="destructive">
				<XCircle className="h-4 w-4" />
				<AlertDescription>{formatError(error, 'Failed to load user data. Please refresh the page.')}</AlertDescription>
			</Alert>
		)
	}

	const hasMerchantId = typeof user?.paypalMerchantId === 'string' && user.paypalMerchantId.length > 0
	const actionUrl = typeof onboardingMutation.data?.actionUrl === 'string' ? onboardingMutation.data.actionUrl : ''
	const isOnboardingPending = onboardingMutation.isPending
	const isOnboardingSuccess = onboardingMutation.isSuccess
	const isDisconnectPending = disconnectMutation.isPending

	const paymentsReceivable = merchantStatusQuery.data?.payments_receivable === true
	const emailConfirmed = merchantStatusQuery.data?.primary_email_confirmed === true

	return (
		<div className="space-y-6">
			{/* Status Overview */}
			<Card className="relative">
				<CardHeader className="">
					<CardTitle>PayPal Account Status</CardTitle>
					<CardDescription>{t.paypalConnectionStatus}</CardDescription>
					<div>
						<StatusBadge hasMerchantId={hasMerchantId} t={t} />
					</div>
					{hasMerchantId ? (
						<div className="mt-3 flex flex-col gap-2">
							{/* 1 - Account Linked */}
							<Tooltip>
								<TooltipTrigger asChild>
									<Badge
										variant={hasMerchantId ? 'default' : 'destructive'}
										className={`flex w-full items-center justify-between ${
											hasMerchantId
												? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
												: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
										}`}
									>
										<span>{t.paypalLinkInfo.accountLinked}</span>
										{!merchantStatusQuery.isLoading ? (
											hasMerchantId ? (
												<CircleCheckBig className="h-4 w-4" />
											) : (
												<XCircle className="h-4 w-4" />
											)
										) : null}
									</Badge>
								</TooltipTrigger>
								<TooltipContent side="right">
									{!merchantStatusQuery.isLoading && hasMerchantId
										? t.paypalLinkInfo.accountLinkedTooltip
										: t.paypalLinkInfo.accountNotLinkedTooltip}
								</TooltipContent>
							</Tooltip>

							{/* 2 - Paypal KYC (payments receivable) */}
							<Tooltip>
								<TooltipTrigger asChild>
									<Badge
										variant={paymentsReceivable ? 'default' : 'destructive'}
										className={`flex w-full items-center justify-between ${
											paymentsReceivable
												? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
												: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
										}`}
									>
										<span>{t.paypalLinkInfo.paypalKYC}</span>
										{!merchantStatusQuery.isLoading ? (
											paymentsReceivable ? (
												<CircleCheckBig className="h-4 w-4" />
											) : (
												<XCircle className="h-4 w-4" />
											)
										) : null}
									</Badge>
								</TooltipTrigger>
								<TooltipContent side="right">
									{paymentsReceivable
										? t.paypalLinkInfo.paypalKYCCheckTooltip
										: t.paypalLinkInfo.paypalKYCNotCheckTooltip}
								</TooltipContent>
							</Tooltip>

							{/* 3 - Paypal Email */}
							<Tooltip>
								<TooltipTrigger asChild>
									<Badge
										variant={emailConfirmed ? 'default' : 'destructive'}
										className={`flex w-full items-center justify-between ${
											emailConfirmed
												? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
												: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
										}`}
									>
										<span>{t.paypalLinkInfo.paypalEmail}</span>
										{!merchantStatusQuery.isLoading ? (
											emailConfirmed ? (
												<CircleCheckBig className="h-4 w-4" />
											) : (
												<XCircle className="h-4 w-4" />
											)
										) : null}
									</Badge>
								</TooltipTrigger>
								<TooltipContent side="right">
									{emailConfirmed
										? t.paypalLinkInfo.paypalEmailCheckTooltip
										: t.paypalLinkInfo.paypalEmailNotCheckTooltip}
								</TooltipContent>
							</Tooltip>

							{/* 4 - Refresh button */}
							<div className="pt-1">
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										void merchantStatusQuery.refetch()
									}}
									disabled={merchantStatusQuery.isFetching}
								>
									{merchantStatusQuery.isFetching ? (
										<>
											<RefreshCw className="mr-2 h-3 w-3 animate-spin" /> {t.paypalLinkInfo.refreshChecking}
										</>
									) : (
										<>
											<RefreshCw className="mr-2 h-3 w-3" /> {t.paypalLinkInfo.refreshStatus}
										</>
									)}
								</Button>
							</div>
						</div>
					) : null}
				</CardHeader>
			</Card>

			{/* Onboarding Section */}
			<Card>
				<CardHeader>
					<CardTitle>{t.onboardingTitle}</CardTitle>
					<CardDescription>{t.onboardingDescription}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{hasMerchantId && merchantStatusQuery.isSuccess && paymentsReceivable === false ? (
						<Alert variant="destructive">
							<XCircle className="h-4 w-4" />
							<AlertDescription>{t.paypalNotReadyAlert}</AlertDescription>
						</Alert>
					) : null}
					{/* PayPal Merchant ID Display (if available) */}
					{hasMerchantId && <MerchantIdPanel merchantId={user.paypalMerchantId as string} />}

					{/* Connect/Disconnect Button or Loader */}
					{isOnboardingPending ? (
						<Button className="w-full" disabled>
							<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
							Connecting...
						</Button>
					) : isOnboardingSuccess && !hasMerchantId ? (
						<PendingLinkNotice />
					) : hasMerchantId ? (
						<>
							<Button
								className="w-full"
								variant="destructive"
								onClick={() => setShowDisconnectConfirm(true)}
								disabled={isDisconnectPending}
							>
								{isDisconnectPending ? (
									<>
										<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
										{t.disconnecting}
									</>
								) : (
									<>
										<Unlink className="mr-2 h-4 w-4" />
										{t.disconnectButton}
									</>
								)}
							</Button>

							<DisconnectConfirmDialog
								open={showDisconnectConfirm}
								setOpen={setShowDisconnectConfirm}
								pending={isDisconnectPending}
								onConfirm={handleDisconnect}
								t={t}
							/>

							{/* Error Display for disconnect */}
							{disconnectMutation.error ? (
								<Alert variant="destructive">
									<XCircle className="h-4 w-4" />
									<AlertDescription>
										{formatError(disconnectMutation.error, 'Failed to disconnect PayPal account')}
									</AlertDescription>
								</Alert>
							) : null}
						</>
					) : (
						<Button className="w-full" disabled={isOnboardingPending} onClick={handlePayPalConnect}>
							{t.createSellerButton}
						</Button>
					)}

					{/* Onboarding URL Display */}
					{actionUrl.length > 0 && (
						<Alert>
							<ExternalLink className="h-4 w-4" />
							<AlertDescription>
								<div className="space-y-2">
									<p>PayPal onboarding window opened. If it didn&apos;t open automatically:</p>
									<a
										className="inline-flex items-center text-sm font-medium text-blue-600 underline hover:text-blue-800"
										href={actionUrl}
										rel="noopener noreferrer"
										target="_blank"
									>
										{t.completeSetup} <ExternalLink className="ml-1 h-3 w-3" />
									</a>
								</div>
							</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>

			{/* Error Display for onboarding */}
			{onboardingMutation.error ? (
				<Alert variant="destructive">
					<XCircle className="h-4 w-4" />
					<AlertDescription>
						{formatError(onboardingMutation.error, 'Failed to initiate PayPal onboarding')}
					</AlertDescription>
				</Alert>
			) : null}
		</div>
	)
}
