import { AlertCircle, Calculator, Info } from 'lucide-react'
import sellBibLocales from '@/app/[locale]/dashboard/seller/sell-bib/locales.json'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PAYPAL_FIXED_FEE, PAYPAL_PERCENTAGE_FEE, PLATFORM_FEE_PERCENTAGE } from '@/constants/fees.constant'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { getFeeBreakdown } from '@/lib/utils/feeCalculations'

interface FeeDisplayProps {
	amount: number
	locale: Locale
}

export default function FeeDisplay({ locale, amount }: FeeDisplayProps) {
	const breakdown = getFeeBreakdown(amount)

	// Import translations from the main sell-bib locales file
	const t = getTranslations(locale, sellBibLocales)

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
						{t.form.pricing.feeCalculator}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-orange-700 dark:text-orange-300">{t.form.pricing.enterPriceToSeeFees}</p>
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
						{t.form.pricing.feeBreakdown}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Selling Price */}
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
							{t.form.pricing.sellingPriceLabel}
						</span>
						<span className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(amount)}</span>
					</div>

					{/* Platform Fee */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-600 dark:text-gray-400">{t.form.pricing.platformFee}</span>
							<Tooltip>
								<TooltipTrigger>
									<Info className="h-4 w-4 text-gray-500" />
								</TooltipTrigger>
								<TooltipContent>
									<p className="max-w-xs">
										{t.form.pricing.platformCommission.replace(
											'{percentage}',
											formatPercentage(PLATFORM_FEE_PERCENTAGE)
										)}
									</p>
								</TooltipContent>
							</Tooltip>
						</div>
						{breakdown.hasPlatformFees ? (
							<span className="text-sm text-red-600 dark:text-red-400">-{formatCurrency(breakdown.platformFee)}</span>
						) : (
							<span className="text-sm text-green-600 dark:text-green-400">{t.form.pricing.free}</span>
						)}
					</div>

					{/* Platform Fee Note when free */}
					{!breakdown.hasPlatformFees && (
						<div className="center text-xs text-green-600 italic dark:text-green-400">
							{t.form.pricing.platformFeesWaived}
						</div>
					)}

					{/* PayPal Fee */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-600 dark:text-gray-400">{t.form.pricing.paypalFee}</span>
							<Tooltip>
								<TooltipTrigger>
									<Info className="h-4 w-4 text-gray-500" />
								</TooltipTrigger>
								<TooltipContent>
									<p className="max-w-xs">
										{t.form.pricing.paypalProcessing
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
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.form.pricing.totalFees}</span>
							<span className="text-sm font-medium text-red-600 dark:text-red-400">
								-{formatCurrency(breakdown.totalFees)}
							</span>
						</div>
					</div>

					{/* You'll Receive */}
					<div className="rounded-lg bg-green-100 p-3 dark:bg-green-950/30">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-green-800 dark:text-green-200">
								{t.form.pricing.youllReceive}
							</span>
							<span className="text-lg font-bold text-green-900 dark:text-green-100">
								{formatCurrency(breakdown.netAmount)}
							</span>
						</div>
					</div>

					{/* Fee Percentage */}
					<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
						<span>{t.form.pricing.totalFeesLabel}</span>
						<span>{formatPercentage(breakdown.totalFees / amount)}</span>
					</div>

					{/* Important Note */}
					<div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-950/30">
						<div className="flex items-start gap-2">
							<AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
							<div className="text-xs text-amber-800 dark:text-amber-200">
								<p className="font-medium">{t.form.pricing.importantNote}</p>
								<p className="mt-1">{t.form.pricing.paypalFeesVary}</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</TooltipProvider>
	)
}
