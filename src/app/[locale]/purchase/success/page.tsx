import React, { Suspense } from 'react'

import { LocaleParams } from '@/lib/generateStaticParams'

import PurchaseSuccessClient from './purchaseSuccessClient'

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
