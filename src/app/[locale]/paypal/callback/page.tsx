import { Suspense } from 'react'

import PayPalCallbackHandler from './PayPalCallbackHandler'

export default function PayPalCallbackPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mx-auto max-w-2xl text-center">
				<h1 className="mb-4 text-3xl font-bold">PayPal Setup</h1>
				<p className="mb-8 text-gray-600">Completing your PayPal seller setup...</p>

				<Suspense fallback={<div>Loading...</div>}>
					<PayPalCallbackHandler />
				</Suspense>
			</div>
		</div>
	)
}
