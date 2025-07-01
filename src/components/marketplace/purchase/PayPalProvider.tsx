'use client'

import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import React from 'react'

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
				clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
				components: 'buttons',
				currency: 'EUR',
				'disable-funding': '',
				'enable-funding': 'venmo,paylater',
				intent: 'capture',
			}}
		>
			{children}
		</PayPalScriptProvider>
	)
}
