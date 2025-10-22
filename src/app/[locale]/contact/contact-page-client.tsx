'use client'

import BentoGrid from '@/components/contact/bento-grid'
import type globalTranslations from '@/components/global/locales.json'

type Translations = (typeof globalTranslations)['en']['contact']

export default function ContactPageClient({ t }: { t: Translations }) {
	return (
		<div className="bg-background min-h-screen">
			<div className="mx-auto max-w-7xl p-4 pt-10 font-sans xl:px-0 xl:pt-20">
				<BentoGrid t={t} />
			</div>
		</div>
	)
}
