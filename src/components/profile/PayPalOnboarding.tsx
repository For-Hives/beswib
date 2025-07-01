'use client'

import { useState } from 'react'

import type { User } from '@/models/user.model'

import { initiatePayPalOnboarding } from '@/services/paypal-onboarding.services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PayPalOnboardingProps {
	t: {
		connectPayPal: string
		paypalConnectionStatus: string
		paypalMerchantId: string
		paypalNotVerified: string
		paypalVerified: string
	}
	user: User
}

export default function PayPalOnboarding({ t, user }: PayPalOnboardingProps) {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<null | string>(null)
	const [onboardingUrl, setOnboardingUrl] = useState<null | string>(null)

	const handlePayPalConnect = async () => {
		try {
			setLoading(true)
			setError(null)

			const result = await initiatePayPalOnboarding(user.id)

			if (result.error !== null && result.error !== undefined && result.error !== '') {
				setError(result.error)
				return
			}

			if (result.actionUrl !== null && result.actionUrl !== undefined && result.actionUrl !== '') {
				setOnboardingUrl(result.actionUrl)
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

	return (
		<div className="space-y-4">
			{/* PayPal Merchant ID Display (if available) */}
			{user.paypalMerchantId !== null && user.paypalMerchantId !== '' && (
				<div>
					<Label htmlFor="paypal-merchant-id">{t.paypalMerchantId}</Label>
					<Input disabled id="paypal-merchant-id" readOnly value={user.paypalMerchantId} />
				</div>
			)}

			{/* Connect Button */}
			<Button
				className="w-full"
				disabled={loading || user.paypalAccountVerified}
				onClick={() => {
					void handlePayPalConnect()
				}}
			>
				{loading ? 'Connecting...' : t.connectPayPal}
			</Button>

			{/* Onboarding URL Display */}
			{onboardingUrl !== null && (
				<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
					<p className="text-sm text-blue-800 dark:text-blue-300">
						PayPal onboarding window opened. If it didn't open automatically:
					</p>
					<a
						className="mt-2 inline-block text-sm font-medium text-blue-600 underline hover:text-blue-800"
						href={onboardingUrl}
						rel="noopener noreferrer"
						target="_blank"
					>
						Complete PayPal Setup
					</a>
				</div>
			)}

			{/* Error Display */}
			{error !== null && (
				<div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
					<p className="text-sm text-red-800 dark:text-red-300">{error}</p>
				</div>
			)}

			{/* Connection Status */}
			<p className="text-muted-foreground text-sm">
				{t.paypalConnectionStatus}{' '}
				<span className={user.paypalAccountVerified === true ? 'text-green-500' : 'text-red-500'}>
					{user.paypalAccountVerified === true ? t.paypalVerified : t.paypalNotVerified}
				</span>
			</p>
		</div>
	)
}
