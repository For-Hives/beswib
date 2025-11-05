import type { Metadata } from 'next'

import React, { Suspense } from 'react'

import type { LocaleParams } from '@/lib/generation/staticParams'
import { generateSimplePageMetadata } from '@/lib/seo'

import PurchaseSuccessClient from './purchaseSuccessClient'

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	return generateSimplePageMetadata(
		locale,
		'Purchase Successful',
		'Thank you for your purchase. Your transaction was successful.',
		'/purchase/success'
	)
}

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
