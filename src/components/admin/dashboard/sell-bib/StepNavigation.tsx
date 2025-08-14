import { ArrowLeft, ArrowRight } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

interface StepNavigationProps {
	createdBib: boolean
	isFirstStep: boolean
	isLastStep: boolean
	isSubmitting: boolean
	locale: Locale
	onNext: () => void
	onPrevious: () => void
	onSubmit: () => Promise<void>
}

import sellBibTranslations from '@/app/[locale]/dashboard/seller/sell-bib/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Locale } from '@/lib/i18n/config'

export default function StepNavigation({
	onSubmit,
	onPrevious,
	onNext,
	locale,
	isSubmitting,
	isLastStep,
	isFirstStep,
	createdBib,
}: Readonly<StepNavigationProps>) {
	const t = getTranslations(locale, sellBibTranslations)

	const router = useRouter()

	return (
		<div className="flex items-center justify-between pt-8">
			<Button disabled={isSubmitting} onClick={() => router.push('/dashboard/seller')} size="lg" variant="outline">
				{createdBib ? 'Retour au Dashboard' : t.actions.cancel}
			</Button>

			<div className="flex gap-4">
				{!isFirstStep && !createdBib && (
					<Button disabled={isSubmitting} onClick={onPrevious} size="lg" variant="outline">
						<ArrowLeft className="mr-2 h-4 w-4" />
						{t.actions.previous}
					</Button>
				)}

				{(() => {
					if (!isLastStep) {
						return (
							<Button disabled={isSubmitting} onClick={onNext} size="lg">
								{t.actions.next}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						)
					}

					if (!createdBib) {
						return (
							<Button className="min-w-32" disabled={isSubmitting} onClick={() => void onSubmit()} size="lg">
								{isSubmitting ? t.messages.loading : t.actions.finish}
							</Button>
						)
					}

					return (
						<Button onClick={() => router.push('/dashboard/seller')} size="lg">
							Terminer
						</Button>
					)
				})()}
			</div>
		</div>
	)
}
