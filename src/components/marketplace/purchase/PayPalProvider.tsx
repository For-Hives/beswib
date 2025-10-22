'use client'

import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import type React from 'react'

// Ensure the PayPal Client ID is set in your environment variables
if (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID === undefined || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID === '') {
	throw new Error('Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID environment variable')
}

export function PayPalProvider({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<PayPalScriptProvider
			options={{
				intent: 'capture',
				debug: true,
				currency: 'EUR',
				components: 'buttons',
				commit: true,
				clientId:
					process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ??
					(() => {
						throw new Error('NEXT_PUBLIC_PAYPAL_CLIENT_ID is not defined')
					})(),
			}}
		>
			{children}
		</PayPalScriptProvider>
	)
}
