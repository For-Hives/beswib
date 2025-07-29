'use client'

import { useEffect, useState } from 'react'

import { useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

import { completePayPalOnboarding } from '@/services/paypal-onboarding.services'

export default function PayPalCallbackHandler() {
	const searchParams = useSearchParams()
	const { user } = useUser()
	const [status, setStatus] = useState<'error' | 'loading' | 'success'>('loading')
	const [message, setMessage] = useState('')

	useEffect(() => {
		const handleCallback = async () => {
			try {
				const merchantId = searchParams.get('merchantId')
				const merchantIdInPayPal = searchParams.get('merchantIdInPayPal')

				if (user?.id === null || user?.id === undefined || user?.id === '') {
					setStatus('error')
					setMessage('User not authenticated')
					return
				}

				if (
					(merchantId === null || merchantId === undefined || merchantId === '') &&
					(merchantIdInPayPal === null || merchantIdInPayPal === undefined || merchantIdInPayPal === '')
				) {
					setStatus('error')
					setMessage('Missing merchant ID from PayPal')
					return
				}

				const finalMerchantId = merchantId ?? merchantIdInPayPal

				if (finalMerchantId === null || finalMerchantId === '') {
					setStatus('error')
					setMessage('Invalid merchant ID')
					return
				}

				// Complete the onboarding process
				const result = await completePayPalOnboarding(user.id, finalMerchantId)

				if (result.error !== null && result.error !== undefined && result.error !== '') {
					setStatus('error')
					setMessage(result.error)
					return
				}

				setStatus('success')
				setMessage('PayPal setup completed successfully!')

				// Redirect to profile after a short delay
				setTimeout(() => {
					window.close() // Close the popup window
					// Parent window will need to refresh manually or listen for storage events
				}, 2000)
			} catch (error) {
				console.error('PayPal callback error:', error)
				setStatus('error')
				setMessage('An unexpected error occurred')
			}
		}

		void handleCallback()
	}, [searchParams, user?.id])

	return (
		<div className="space-y-4">
			{status === 'loading' && (
				<div className="text-center">
					<div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
					<p>Processing PayPal setup...</p>
				</div>
			)}

			{status === 'success' && (
				<div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-900/20">
					<div className="mb-2 text-2xl">✅</div>
					<p className="font-medium text-green-800 dark:text-green-300">{message}</p>
					<p className="mt-2 text-sm text-green-600 dark:text-green-400">
						This window will close automatically in a few seconds.
					</p>
				</div>
			)}

			{status === 'error' && (
				<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/20">
					<div className="mb-2 text-2xl">❌</div>
					<p className="font-medium text-red-800 dark:text-red-300">Setup Failed</p>
					<p className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>
					<button
						className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
						onClick={() => window.close()}
						type="button"
					>
						Close Window
					</button>
				</div>
			)}
		</div>
	)
}
