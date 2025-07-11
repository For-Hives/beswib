import type { Metadata } from 'next'

import React from 'react'

export const metadata: Metadata = {
	title: 'Purchase Failed',
	description: 'Your purchase failed.',
}

export default function PurchaseFailurePage() {
	return (
		<div className="container mx-auto px-4 py-8 text-center">
			<h1 className="mb-4 text-3xl font-bold">Purchase Failed</h1>
			<p className="text-lg">Unfortunately, your purchase could not be completed.</p>
			<p className="text-md mt-2">Please try again or contact support if the issue persists.</p>
		</div>
	)
}
