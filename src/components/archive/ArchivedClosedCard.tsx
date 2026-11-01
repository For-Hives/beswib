import { Archive } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import translations from '@/components/global/locales.json'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'

type ClosedFlow = 'purchase' | 'sell' | 'payments'

/**
 * What stands where a payment, a listing or a payout step used to be: Beswib is archived, and the
 * code behind those steps is gone. `children` adds a way on from there.
 */
export function ArchivedClosedCard({
	locale,
	flow,
	children,
}: Readonly<{ locale: Locale; flow: ClosedFlow; children?: ReactNode }>) {
	const t = getTranslations(locale, translations).archive

	return (
		<div className="dark:border-border/50 bg-card/80 rounded-lg border border-black/50 p-6 backdrop-blur-sm">
			<p className="text-foreground flex items-center gap-2 font-semibold">
				<Archive className="h-4 w-4 shrink-0" />
				{t.closed[flow].title}
			</p>
			<p className="text-muted-foreground mt-2 text-sm">{t.closed[flow].body}</p>
			<div className="mt-4 flex flex-wrap gap-3">
				{children}
				<Link
					href={`/${locale}/contact`}
					className="text-primary hover:text-primary/80 inline-flex items-center text-sm font-medium underline"
				>
					{t.noticeCta}
				</Link>
			</div>
		</div>
	)
}
