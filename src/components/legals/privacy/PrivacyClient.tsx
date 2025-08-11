'use client'

import Link from 'next/link'

import { getTranslations } from '@/lib/getDictionary'
import { Badge } from '@/components/ui/badge'
import { Locale } from '@/lib/i18n-config'

import Translations from './locales.json'

interface Props {
	locale: Locale
}

export default function PrivacyClient({ locale }: Readonly<Props>) {
	const t = getTranslations(locale, Translations)

	return (
		<div className="w-full px-4 py-12 md:py-24 xl:px-0">
			<div className="container mx-auto max-w-4xl">
				<div className="mb-8 flex items-center gap-3">
					<Badge variant="outline">{t.privacy.badge}</Badge>
					<h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t.privacy.title}</h1>
				</div>

				<p className="text-muted-foreground mb-8 leading-relaxed">{t.privacy.intro}</p>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.privacy.websiteVisitors.title}</h2>
					<p className="text-muted-foreground">{t.privacy.websiteVisitors.content1}</p>
					<p className="text-muted-foreground">{t.privacy.websiteVisitors.content2}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.privacy.pii.title}</h2>
					<p className="text-muted-foreground">{t.privacy.pii.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.privacy.aggregated.title}</h2>
					<p className="text-muted-foreground">{t.privacy.aggregated.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.privacy.protection.title}</h2>
					<p className="text-muted-foreground">{t.privacy.protection.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.privacy.cookies.title}</h2>
					<p className="text-muted-foreground">{t.privacy.cookies.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.privacy.business.title}</h2>
					<p className="text-muted-foreground">{t.privacy.business.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.privacy.thirdParty.title}</h2>
					<p className="text-muted-foreground">{t.privacy.thirdParty.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.privacy.changes.title}</h2>
					<p className="text-muted-foreground">{t.privacy.changes.content}</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.privacy.contact.title}</h2>
					<p className="text-muted-foreground">
						<strong>{t.privacy.contact.ownerName}</strong>
					</p>
					<p className="text-muted-foreground">{t.privacy.contact.ownerDetails}</p>
					<p className="text-muted-foreground">
						<strong>{t.privacy.contact.hostingTitle}</strong>
						<br />
						{t.privacy.contact.hostingDetails}
					</p>
					<p>
						<Link href={t.privacy.contact.website} className="underline" target="_blank" rel="noreferrer">
							{t.privacy.contact.website}
						</Link>
					</p>
				</section>
			</div>
		</div>
	)
}
