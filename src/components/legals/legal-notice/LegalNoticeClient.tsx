'use client'

import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Locale } from '@/lib/i18n-config'
import { getTranslations } from '@/lib/getDictionary'

import Translations from './locales.json'

interface Props {
	locale: Locale
}

export default function LegalNoticeClient({ locale }: Readonly<Props>) {
	const t = getTranslations(locale, Translations)

	return (
		<div className="w-full px-4 py-12 md:py-24 xl:px-0">
			<div className="container mx-auto max-w-4xl">
				<div className="mb-8 flex items-center gap-3">
					<Badge variant="outline">{t.legal.badge}</Badge>
					<h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t.legal.title}</h1>
				</div>

				<p className="text-muted-foreground mb-8 leading-relaxed">{t.legal.intro}</p>

				<section className="mb-8">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.legal.company.title}</h2>
					<div className="text-muted-foreground mt-2 space-y-2">
						<p>
							<strong>{t.legal.company.nameLabel}</strong> {t.legal.company.name}
						</p>
						<p>
							<strong>{t.legal.company.siretLabel}</strong> {t.legal.company.siret}
						</p>
						<p>
							<strong>{t.legal.company.vatLabel}</strong> {t.legal.company.vat}
						</p>
						<p>
							<strong>{t.legal.company.registeredOfficeLabel}</strong> {t.legal.company.registeredOffice}
						</p>
						<p>
							<strong>{t.legal.company.publicationDirectorLabel}</strong> {t.legal.company.publicationDirector}
						</p>
					</div>
				</section>

				<section className="mb-8">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.legal.contact.title}</h2>
					<div className="text-muted-foreground mt-2 space-y-2">
						<p>
							<Link href={t.legal.contact.website} className="underline" target="_blank" rel="noreferrer">
								{t.legal.contact.website}
							</Link>
						</p>
						<p>
							<strong>{t.legal.contact.emailLabel}</strong> {t.legal.contact.email}
						</p>
						<p>
							<strong>{t.legal.contact.phoneLabel}</strong> {t.legal.contact.phone}
						</p>
						<p>
							<strong>{t.legal.contact.postalLabel}</strong> {t.legal.contact.postal}
						</p>
					</div>
				</section>

				<section className="mb-8">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.legal.hosting.title}</h2>
					<div className="text-muted-foreground mt-2 space-y-1">
						<p>
							<strong>{t.legal.hosting.companyLabel}</strong> {t.legal.hosting.company}
						</p>
						<p>
							<strong>{t.legal.hosting.addressLabel}</strong> {t.legal.hosting.address}
						</p>
						<p>
							<strong>{t.legal.hosting.websiteLabel}</strong>{' '}
							<Link href={t.legal.hosting.website} className="underline" target="_blank" rel="noreferrer">
								{t.legal.hosting.website}
							</Link>
						</p>
					</div>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.legal.ipr.title}</h2>
					<p className="text-muted-foreground">{t.legal.ipr.content}</p>
				</section>

				<section className="mb-8 space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.legal.abuse.title}</h2>
					<p className="text-muted-foreground">
						{t.legal.abuse.content}{' '}
						<Link href={`mailto:${t.legal.contact.email}`} className="underline">
							{t.legal.contact.email}
						</Link>
						.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.legal.update.title}</h2>
					<p className="text-muted-foreground">{t.legal.update.content}</p>
				</section>
			</div>
		</div>
	)
}
