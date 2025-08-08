'use client'

import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

import type { User } from '@/models/user.model'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { isSellerProfileComplete } from '@/lib/userValidation'
import { getTranslations } from '@/lib/getDictionary'
import { Locale } from '@/lib/i18n-config'
import sellerTranslations from './locales.json'

interface SellerProfileValidationProps {
	user: User
	locale: Locale
}

export default function SellerProfileValidation({ user, locale }: SellerProfileValidationProps) {
	const isComplete = isSellerProfileComplete(user)
	const t = getTranslations(locale, sellerTranslations)

	if (isComplete) {
		return (
			<Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
						<CheckCircle className="h-5 w-5" />
						{t.sellerProfile.complete.title}
					</CardTitle>
					<CardDescription className="text-green-700 dark:text-green-300">
						{t.sellerProfile.complete.description}
					</CardDescription>
				</CardHeader>
			</Card>
		)
	}

	return (
		<Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
					<AlertCircle className="h-5 w-5" />
					{t.sellerProfile.incomplete.title}
				</CardTitle>
				<CardDescription className="text-orange-700 dark:text-orange-300">
					{t.sellerProfile.incomplete.description}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="text-sm text-orange-700 dark:text-orange-300">
					<p className="font-medium">{t.sellerProfile.incomplete.whyRequired}</p>
					<ul className="mt-1 list-disc space-y-1 pl-5">
						<li>{t.sellerProfile.incomplete.paypalMerchantId}</li>
						<li>{t.sellerProfile.incomplete.contactInfo}</li>
						<li>{t.sellerProfile.incomplete.addressInfo}</li>
					</ul>
				</div>
				<div className="flex flex-col gap-2 sm:flex-row">
					<Button asChild variant="default" className="flex-1">
						<Link href={`/${locale}/profile`}>
							{t.sellerProfile.incomplete.completeProfileButton}
							<ExternalLink className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
