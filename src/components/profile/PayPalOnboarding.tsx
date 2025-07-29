'use client'

import { AlertCircle, CheckCircle, ExternalLink, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { User } from '@/models/user.model'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { initiatePayPalOnboarding } from '@/services/paypal-onboarding.services'
import profileTranslations from '@/app/[locale]/profile/locales.json'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getTranslations } from '@/lib/getDictionary'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Locale } from '@/lib/i18n-config'

interface PayPalOnboardingProps {
	locale: Locale
	user: User
}

export default function PayPalOnboarding({ user, locale }: PayPalOnboardingProps) {
	const t = getTranslations(locale, profileTranslations).profile

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<null | string>(null)
	const [success, setSuccess] = useState<null | string>(null)
	const [onboardingUrl, setOnboardingUrl] = useState<null | string>(null)

	// Clear messages when component mounts
	useEffect(() => {
		setError(null)
		setSuccess(null)
	}, [])

	const handlePayPalConnect = async () => {
		try {
			setLoading(true)
			setError(null)
			setSuccess(null)

			const result = await initiatePayPalOnboarding(user.id)

			if (result.error !== null && result.error !== undefined && result.error !== '') {
				setError(result.error)
				return
			}

			if (result.actionUrl !== null && result.actionUrl !== undefined && result.actionUrl !== '') {
				setOnboardingUrl(result.actionUrl)
				setSuccess('PayPal onboarding started! Complete the setup in the popup window.')

				// Open PayPal onboarding in a new window
				window.open(result.actionUrl, '_blank', 'width=400,height=600')
			}
		} catch (err) {
			setError('Failed to initiate PayPal connection')
			console.error('PayPal connection error:', err)
		} finally {
			setLoading(false)
		}
	}

	const getStatusBadge = () => {
		if (user.paypalMerchantId) {
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

	return (
		<div className="space-y-6">
			{/* Status Overview */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						PayPal Account Status
						{getStatusBadge()}
					</CardTitle>
					<CardDescription>{t.paypalConnectionStatus}</CardDescription>
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
					{user.paypalMerchantId && (
						<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
							<p className="text-sm text-blue-800 dark:text-blue-300">
								<strong>Merchant ID:</strong> {user.paypalMerchantId}
							</p>
							<p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
								Your PayPal merchant ID has been automatically retrieved and saved.
							</p>
						</div>
					)}

					{/* Connect Button */}
					<Button
						className="w-full"
						disabled={loading || !!user.paypalMerchantId}
						onClick={() => {
							void handlePayPalConnect()
						}}
					>
						{loading ? 'Connecting...' : t.createSellerButton}
					</Button>

					{/* Onboarding URL Display */}
					{onboardingUrl !== null && (
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								<div className="space-y-2">
									<p>PayPal onboarding window opened. If it didn't open automatically:</p>
									<a
										className="inline-flex items-center text-sm font-medium text-blue-600 underline hover:text-blue-800"
										href={onboardingUrl}
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

			{/* Payment Testing Section (if merchant ID is available) */}
			{user.paypalMerchantId && (
				<Card>
					<CardHeader>
						<CardTitle>{t.paymentTestTitle}</CardTitle>
						<CardDescription>{t.paymentTestDescription}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
							<p className="text-sm text-orange-800 dark:text-orange-300">{t.testingPayment}</p>
							<p className="mt-1 text-xs text-orange-600 dark:text-orange-400">Merchant ID: {user.paypalMerchantId}</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Success Display */}
			{success !== null && (
				<Alert>
					<CheckCircle className="h-4 w-4" />
					<AlertDescription>{success}</AlertDescription>
				</Alert>
			)}

			{/* Error Display */}
			{error !== null && (
				<Alert variant="destructive">
					<XCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}
		</div>
	)
}
