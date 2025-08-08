'use client'

// import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Locale } from '@/lib/i18n-config'
import { getTranslations } from '@/lib/getDictionary'

import Translations from './locales.json'

interface Props {
	locale: Locale
}

export default function TermsClient({ locale }: Readonly<Props>) {
	const t = getTranslations(locale, Translations)

	return (
		<div className="w-full px-4 py-12 md:py-24 xl:px-0">
			<div className="container mx-auto max-w-4xl">
				<div className="mb-8 flex items-center gap-3">
					<Badge variant="outline">{t.terms.badge}</Badge>
					<h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t.terms.title}</h1>
				</div>

				<p className="text-muted-foreground mb-8 leading-relaxed">{t.terms.intro}</p>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.terms.scope.title}</h2>
					<p className="text-muted-foreground">{t.terms.scope.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.terms.marketModel.title}</h2>
					<p className="text-muted-foreground">{t.terms.marketModel.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.terms.accounts.title}</h2>
					<p className="text-muted-foreground">{t.terms.accounts.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.terms.transactions.title}</h2>
					<p className="text-muted-foreground">{t.terms.transactions.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.terms.fees.title}</h2>
					<p className="text-muted-foreground">{t.terms.fees.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.terms.payments.title}</h2>
					<p className="text-muted-foreground">{t.terms.payments.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.terms.organizers.title}</h2>
					<p className="text-muted-foreground">{t.terms.organizers.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.terms.liability.title}</h2>
					<p className="text-muted-foreground">{t.terms.liability.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.terms.ipr.title}</h2>
					<p className="text-muted-foreground">{t.terms.ipr.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.terms.termination.title}</h2>
					<p className="text-muted-foreground">{t.terms.termination.content}</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.terms.changes.title}</h2>
					<p className="text-muted-foreground">{t.terms.changes.content}</p>
				</section>

				{/* Optional PDF link can be enabled by adding pdfUrl/pdfCta keys in translations */}
			</div>
		</div>
	)
}
