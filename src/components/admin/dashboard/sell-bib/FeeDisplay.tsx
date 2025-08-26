import { Calculator, Info, AlertCircle } from 'lucide-react'
import React from 'react'

import { PAYPAL_PERCENTAGE_FEE, PAYPAL_FIXED_FEE, PLATFORM_FEE_PERCENTAGE } from '@/constants/fees.constant'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getFeeBreakdown } from '@/lib/utils/feeCalculations'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Locale } from '@/lib/i18n/config'

interface FeeDisplayProps {
	amount: number
	locale: Locale
}

export default function FeeDisplay({ locale, amount }: FeeDisplayProps) {
	const breakdown = getFeeBreakdown(amount)

	// Import translations

	const feeDisplayTranslations = require('./feeDisplayLocales.json')
	const t = getTranslations(locale, feeDisplayTranslations)

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			minimumFractionDigits: 2,
			currency: 'EUR',
		}).format(value)
	}

	const formatPercentage = (value: number) => {
		return `${(value * 100).toFixed(1)}%`
	}

	if (amount <= 0) {
		return (
			<Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
						<Calculator className="h-5 w-5" />
						{t.feeCalculator}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-orange-700 dark:text-orange-300">{t.enterPriceToSeeFees}</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<TooltipProvider>
			<Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
						<Calculator className="h-5 w-5" />
						{t.feeBreakdown}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Selling Price */}
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.sellingPriceLabel}</span>
						<span className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(amount)}</span>
					</div>

					{/* Platform Fee */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-600 dark:text-gray-400">{t.platformFee}</span>
							<Tooltip>
								<TooltipTrigger>
									<Info className="h-4 w-4 text-gray-500" />
								</TooltipTrigger>
								<TooltipContent>
									<p className="max-w-xs">
										{t.platformCommission.replace('{percentage}', formatPercentage(PLATFORM_FEE_PERCENTAGE))}
									</p>
								</TooltipContent>
							</Tooltip>
						</div>
						{breakdown.hasPlatformFees ? (
							<span className="text-sm text-red-600 dark:text-red-400">-{formatCurrency(breakdown.platformFee)}</span>
						) : (
							<span className="text-sm text-green-600 dark:text-green-400">{t.free}</span>
						)}
					</div>

					{/* Platform Fee Note when free */}
					{!breakdown.hasPlatformFees && (
						<div className="center text-xs text-green-600 italic dark:text-green-400">{t.platformFeesWaived}</div>
					)}

					{/* PayPal Fee */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-600 dark:text-gray-400">{t.paypalFee}</span>
							<Tooltip>
								<TooltipTrigger>
									<Info className="h-4 w-4 text-gray-500" />
								</TooltipTrigger>
								<TooltipContent>
									<p className="max-w-xs">
										{t.paypalProcessing
											.replace('{percentage}', formatPercentage(PAYPAL_PERCENTAGE_FEE))
											.replace('{fixedFee}', formatCurrency(PAYPAL_FIXED_FEE))}
									</p>
								</TooltipContent>
							</Tooltip>
						</div>
						<span className="text-sm text-red-600 dark:text-red-400">-{formatCurrency(breakdown.paypalFee)}</span>
					</div>

					{/* Total Fees */}
					<div className="border-t border-gray-300 pt-3 dark:border-gray-600">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.totalFees}</span>
							<span className="text-sm font-medium text-red-600 dark:text-red-400">
								-{formatCurrency(breakdown.totalFees)}
							</span>
						</div>
					</div>

					{/* You'll Receive */}
					<div className="rounded-lg bg-green-100 p-3 dark:bg-green-950/30">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-green-800 dark:text-green-200">{t.youllReceive}</span>
							<span className="text-lg font-bold text-green-900 dark:text-green-100">
								{formatCurrency(breakdown.netAmount)}
							</span>
						</div>
					</div>

					{/* Fee Percentage */}
					<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
						<span>{t.totalFeesLabel}</span>
						<span>{formatPercentage(breakdown.totalFees / amount)}</span>
					</div>

					{/* Important Note */}
					<div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-950/30">
						<div className="flex items-start gap-2">
							<AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
							<div className="text-xs text-amber-800 dark:text-amber-200">
								<p className="font-medium">{t.importantNote}</p>
								<p className="mt-1">{t.paypalFeesVary}</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</TooltipProvider>
	)
}
