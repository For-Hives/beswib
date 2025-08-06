'use client'
import React from 'react'

import { CheckCircle, ExternalLink, RefreshCw, XCircle } from 'lucide-react'
import { Suspense } from 'react'

import { usePayPalOnboarding } from '@/hooks/usePayPalOnboarding'
import { usePayPalDisconnect } from '@/hooks/usePayPalDisconnect'
import { useUser } from '@/hooks/useUser'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import profileTranslations from '@/app/[locale]/profile/locales.json'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getTranslations } from '@/lib/getDictionary'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Locale } from '@/lib/i18n-config'

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

function PayPalOnboardingContent({ userId, locale }: PayPalOnboardingProps) {
	const t = getTranslations(locale, profileTranslations).profile.sellerInfo
	const { isLoading, error, data: user } = useUser(userId)

	const onboardingMutation = usePayPalOnboarding()
	const disconnectMutation = usePayPalDisconnect()
	const [showDisconnectConfirm, setShowDisconnectConfirm] = React.useState(false)

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

	const getStatusBadge = () => {
		if (typeof user?.paypalMerchantId === 'string' && user.paypalMerchantId.length > 0) {
			return (
				<Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" variant="default">
					<CheckCircle className="mr-1 h-3 w-3" />
					{t.paypalVerified}
				</Badge>
			)
		}
		return (
			<Badge variant="destructive">
				<XCircle className="mr-1 h-3 w-3" />
				{t.paypalNotVerified}
			</Badge>
		)
	}

	if (isLoading) {
		return <PayPalOnboardingSkeleton />
	}

	if (error) {
		console.error('User fetch error:', error)
		return (
			<Alert variant="destructive">
				<XCircle className="h-4 w-4" />
				<AlertDescription>
					{error instanceof Error
						? error.message
						: typeof error === 'object' &&
							  error !== null &&
							  'message' in error &&
							  typeof (error as { message?: unknown }).message === 'string'
							? String((error as { message?: unknown }).message)
							: 'Failed to load user data. Please refresh the page.'}
				</AlertDescription>
			</Alert>
		)
	}

	return (
		<div className="space-y-6">
			{/* Status Overview */}
			<Card className="relative">
				<CardHeader className="">
					<CardTitle>PayPal Account Status</CardTitle>
					<CardDescription>{t.paypalConnectionStatus}</CardDescription>
					<div>{getStatusBadge()}</div>
				</CardHeader>
			</Card>

			{/* Onboarding Section */}
			<Card>
				<CardHeader>
					<CardTitle>{t.onboardingTitle}</CardTitle>
					<CardDescription>{t.onboardingDescription}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* PayPal Merchant ID Display (if available) */}
					{typeof user?.paypalMerchantId === 'string' && user.paypalMerchantId.length > 0 && (
						<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
							<p className="text-sm text-blue-800 dark:text-blue-300">
								<strong>Merchant ID:</strong> {user.paypalMerchantId}
							</p>
							<p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
								Your PayPal merchant ID has been automatically retrieved and saved.
							</p>
						</div>
					)}

					{/* Connect/Disconnect Button */}
					{typeof user?.paypalMerchantId === 'string' && user.paypalMerchantId.length > 0 ? (
						<>
							<Button
								className="w-full"
								variant="destructive"
								onClick={() => setShowDisconnectConfirm(true)}
								disabled={disconnectMutation.isPending}
							>
								{disconnectMutation.isPending ? (
									<>
										<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
										Déconnexion...
									</>
								) : (
									'Déconnecter le compte vendeur'
								)}
							</Button>
							{/* Confirmation Dialog */}
							{showDisconnectConfirm && (
								<div className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black">
									<div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
										<p className="mb-4 text-sm">Êtes-vous sûr de vouloir déconnecter votre compte vendeur PayPal ?</p>
										<div className="flex justify-end gap-2">
											<Button
												variant="outline"
												onClick={() => setShowDisconnectConfirm(false)}
												disabled={disconnectMutation.isPending}
											>
												Annuler
											</Button>
											<Button variant="destructive" onClick={handleDisconnect} disabled={disconnectMutation.isPending}>
												{disconnectMutation.isPending ? (
													<>
														<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
														Déconnexion...
													</>
												) : (
													'Confirmer'
												)}
											</Button>
										</div>
									</div>
								</div>
							)}
							{/* Error Display for disconnect */}
							{disconnectMutation.error ? (
								<Alert variant="destructive">
									<XCircle className="h-4 w-4" />
									<AlertDescription>
										{disconnectMutation.error instanceof Error
											? disconnectMutation.error.message
											: typeof disconnectMutation.error === 'object' &&
												  disconnectMutation.error !== null &&
												  'message' in disconnectMutation.error &&
												  typeof (disconnectMutation.error as { message?: unknown }).message === 'string'
												? String((disconnectMutation.error as { message?: unknown }).message)
												: 'Failed to disconnect PayPal account'}
									</AlertDescription>
								</Alert>
							) : null}
						</>
					) : (
						<Button className="w-full" disabled={onboardingMutation.isPending} onClick={handlePayPalConnect}>
							{onboardingMutation.isPending ? (
								<>
									<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
									Connecting...
								</>
							) : (
								t.createSellerButton
							)}
						</Button>
					)}

					{/* Onboarding URL Display */}
					{typeof onboardingMutation.data?.actionUrl === 'string' && onboardingMutation.data.actionUrl.length > 0 && (
						<Alert>
							<ExternalLink className="h-4 w-4" />
							<AlertDescription>
								<div className="space-y-2">
									<p>PayPal onboarding window opened. If it didn't open automatically:</p>
									<a
										className="inline-flex items-center text-sm font-medium text-blue-600 underline hover:text-blue-800"
										href={onboardingMutation.data.actionUrl}
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
						{onboardingMutation.error instanceof Error
							? onboardingMutation.error.message
							: typeof onboardingMutation.error === 'object' &&
								  onboardingMutation.error !== null &&
								  'message' in onboardingMutation.error &&
								  typeof (onboardingMutation.error as { message?: unknown }).message === 'string'
								? String((onboardingMutation.error as { message?: unknown }).message)
								: 'Failed to initiate PayPal onboarding'}
					</AlertDescription>
				</Alert>
			) : null}
		</div>
	)
}
