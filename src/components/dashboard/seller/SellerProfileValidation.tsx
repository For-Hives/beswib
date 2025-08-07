'use client'

import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

import type { User } from '@/models/user.model'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { isSellerProfileComplete } from '@/lib/userValidation'

interface SellerProfileValidationProps {
	user: User
	locale: string
}

export default function SellerProfileValidation({ user, locale }: SellerProfileValidationProps) {
	const isComplete = isSellerProfileComplete(user)

	const getMissingFields = () => {
		const missing: string[] = []

		if (!user.paypalMerchantId || user.paypalMerchantId.trim() === '') {
			missing.push('PayPal Merchant ID')
		}
		if (!user.email || user.email.trim() === '') {
			missing.push('Email')
		}
		if (!user.firstName || user.firstName.trim() === '') {
			missing.push('First Name')
		}
		if (!user.lastName || user.lastName.trim() === '') {
			missing.push('Last Name')
		}
		if (!user.phoneNumber || user.phoneNumber.trim() === '') {
			missing.push('Phone Number')
		}
		if (!user.address || user.address.trim() === '') {
			missing.push('Address')
		}
		if (!user.postalCode || user.postalCode.trim() === '') {
			missing.push('Postal Code')
		}
		if (!user.city || user.city.trim() === '') {
			missing.push('City')
		}
		if (!user.country || user.country.trim() === '') {
			missing.push('Country')
		}

		return missing
	}

	const missingFields = getMissingFields()

	if (isComplete) {
		return (
			<Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
						<CheckCircle className="h-5 w-5" />
						Seller Profile Complete
					</CardTitle>
					<CardDescription className="text-green-700 dark:text-green-300">
						Your merchant profile is complete. You can now sell bibs on the marketplace.
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
					Complete Your Seller Profile
				</CardTitle>
				<CardDescription className="text-orange-700 dark:text-orange-300">
					To sell bibs, you need to complete your merchant profile with the following information:
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="text-sm text-orange-700 dark:text-orange-300">
					<p className="font-medium">Why is this required?</p>
					<ul className="mt-1 list-disc space-y-1 pl-5">
						<li>PayPal Merchant ID: Required to receive payments from buyers</li>
						<li>Contact Information: Required for transaction processing and customer support</li>
						<li>Address Information: Required for legal compliance and payment processing</li>
					</ul>
				</div>
				<div className="flex flex-col gap-2 sm:flex-row">
					<Button asChild variant="default" className="flex-1">
						<Link href={`/${locale}/profile`}>
							Complete Profile
							<ExternalLink className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
