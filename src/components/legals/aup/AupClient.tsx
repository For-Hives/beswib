'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'

import Translations from './locales.json'

interface Props {
	locale: Locale
}

export default function AupClient({ locale }: Readonly<Props>) {
	const t = getTranslations(locale, Translations)

	return (
		<div className="w-full px-4 py-12 md:py-24 xl:px-0">
			<div className="container mx-auto max-w-4xl">
				<div className="mb-8 flex items-center gap-3">
					<Badge variant="outline">{t.aup.badge}</Badge>
					<h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t.aup.title}</h1>
				</div>

				<p className="text-muted-foreground mb-8 leading-relaxed">{t.aup.intro}</p>

				<section className="mb-8 space-y-4">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.aup.introduction.title}</h2>
					<p className="text-muted-foreground">{t.aup.introduction.content}</p>
				</section>

				<section className="mb-8 space-y-4">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.aup.prohibited.title}</h2>

					<div className="space-y-4">
						<h3 className="text-lg font-medium">{t.aup.prohibited.illegal.title}</h3>
						<ul className="text-muted-foreground list-disc space-y-2 pl-6">
							<li>
								<strong>{t.aup.prohibited.illegal.fraud.title}</strong> {t.aup.prohibited.illegal.fraud.content}
							</li>
							<li>
								<strong>{t.aup.prohibited.illegal.misleading.title}</strong>{' '}
								{t.aup.prohibited.illegal.misleading.content}
							</li>
							<li>
								<strong>{t.aup.prohibited.illegal.impersonation.title}</strong>{' '}
								{t.aup.prohibited.illegal.impersonation.content}
							</li>
							<li>
								<strong>{t.aup.prohibited.illegal.laundering.title}</strong>{' '}
								{t.aup.prohibited.illegal.laundering.content}
							</li>
						</ul>
					</div>

					<div className="space-y-4">
						<h3 className="text-lg font-medium">{t.aup.prohibited.platform.title}</h3>
						<ul className="text-muted-foreground list-disc space-y-2 pl-6">
							<li>
								<strong>{t.aup.prohibited.platform.circumvention.title}</strong>{' '}
								{t.aup.prohibited.platform.circumvention.content}
							</li>
							<li>
								<strong>{t.aup.prohibited.platform.manipulation.title}</strong>{' '}
								{t.aup.prohibited.platform.manipulation.content}
							</li>
							<li>
								<strong>{t.aup.prohibited.platform.interference.title}</strong>{' '}
								{t.aup.prohibited.platform.interference.content}
							</li>
							<li>
								<strong>{t.aup.prohibited.platform.access.title}</strong> {t.aup.prohibited.platform.access.content}
							</li>
							<li>
								<strong>{t.aup.prohibited.platform.overload.title}</strong> {t.aup.prohibited.platform.overload.content}
							</li>
						</ul>
					</div>

					<div className="space-y-4">
						<h3 className="text-lg font-medium">{t.aup.prohibited.content.title}</h3>
						<ul className="text-muted-foreground list-disc space-y-2 pl-6">
							<li>
								<strong>{t.aup.prohibited.content.unauthorized.title}</strong>{' '}
								{t.aup.prohibited.content.unauthorized.content}
							</li>
							<li>
								<strong>{t.aup.prohibited.content.regulations.title}</strong>{' '}
								{t.aup.prohibited.content.regulations.content}
							</li>
							<li>
								<strong>{t.aup.prohibited.content.intellectual.title}</strong>{' '}
								{t.aup.prohibited.content.intellectual.content}
							</li>
							<li>
								<strong>{t.aup.prohibited.content.abusive.title}</strong> {t.aup.prohibited.content.abusive.content}
							</li>
						</ul>
					</div>

					<div className="space-y-4">
						<h3 className="text-lg font-medium">{t.aup.prohibited.conduct.title}</h3>
						<ul className="text-muted-foreground list-disc space-y-2 pl-6">
							<li>
								<strong>{t.aup.prohibited.conduct.harassment.title}</strong>{' '}
								{t.aup.prohibited.conduct.harassment.content}
							</li>
							<li>
								<strong>{t.aup.prohibited.conduct.abuse.title}</strong> {t.aup.prohibited.conduct.abuse.content}
							</li>
							<li>
								<strong>{t.aup.prohibited.conduct.privacy.title}</strong> {t.aup.prohibited.conduct.privacy.content}
							</li>
						</ul>
					</div>
				</section>

				<section className="mb-8 space-y-4">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.aup.enforcement.title}</h2>
					<p className="text-muted-foreground">{t.aup.enforcement.content}</p>
					<ul className="text-muted-foreground list-disc space-y-2 pl-6">
						<li>{t.aup.enforcement.warning}</li>
						<li>{t.aup.enforcement.removal}</li>
						<li>{t.aup.enforcement.suspension}</li>
						<li>{t.aup.enforcement.termination}</li>
						<li>{t.aup.enforcement.legal}</li>
						<li>{t.aup.enforcement.report}</li>
					</ul>
				</section>

				<section className="mb-8 space-y-4">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.aup.reporting.title}</h2>
					<p className="text-muted-foreground">
						{t.aup.reporting.content}{' '}
						<Link href={`/${locale}/contact`} className="underline">
							{t.aup.reporting.contactPage}
						</Link>{' '}
						{t.aup.reporting.email}{' '}
						<Link href="mailto:support@beswib.com" className="underline">
							support@beswib.com
						</Link>
						. {t.aup.reporting.details}
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t.aup.changes.title}</h2>
					<p className="text-muted-foreground">{t.aup.changes.content}</p>
				</section>
			</div>
		</div>
	)
}
