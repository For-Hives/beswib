import React, { Suspense } from 'react'
import PurchaseSuccessClient from './purchaseSuccessClient'
import { LocaleParams } from '@/lib/generateStaticParams'

export default async function PurchaseSuccessPage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params

	return (
		<div>
			<Suspense fallback={<div>Loading...</div>}>
				<PurchaseSuccessClient locale={locale} />
			</Suspense>
		</div>
	)
}
