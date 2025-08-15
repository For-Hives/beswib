'use client'

import { getTranslations } from '@/lib/i18n/dictionary'
import { Badge } from '@/components/ui/badge'
import { Locale } from '@/lib/i18n/config'

import Translations from './locales.json'

interface Props {
	locale: Locale
}

export default function DataDeletionClient({ locale }: Readonly<Props>) {
	const t = getTranslations(locale, Translations)

	return (
		<div className="w-full px-4 py-12 md:py-24 xl:px-0">
			<div className="container mx-auto max-w-4xl">
				<div className="mb-8 flex items-center gap-3">
					<Badge variant="outline">{t.dataDeletion.badge}</Badge>
					<h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t.dataDeletion.title}</h1>
				</div>

				<p className="text-muted-foreground mb-8 leading-relaxed">{t.dataDeletion.intro}</p>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.dataDeletion.commitment.title}</h2>
					<p className="text-muted-foreground">{t.dataDeletion.commitment.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.dataDeletion.scope.title}</h2>
					<p className="text-muted-foreground">{t.dataDeletion.scope.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.dataDeletion.process.title}</h2>
					<p className="text-muted-foreground">{t.dataDeletion.process.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.dataDeletion.contact.title}</h2>
					<p className="text-muted-foreground">{t.dataDeletion.contact.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.dataDeletion.timeline.title}</h2>
					<p className="text-muted-foreground">{t.dataDeletion.timeline.content}</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.dataDeletion.exceptions.title}</h2>
					<p className="text-muted-foreground">{t.dataDeletion.exceptions.content}</p>
				</section>
			</div>
		</div>
	)
}
