import React, { Suspense } from 'react'
import PurchaseSuccessClient from './purchaseSuccessClient'

export default function PurchaseSuccessPage() {
	return (
		<div>
			<Suspense fallback={<div>Loading...</div>}>
				<PurchaseSuccessClient />
			</Suspense>
		</div>
	)
}
