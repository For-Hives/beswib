'use client'

import { CheckCircle, FileCheck, Handshake, RefreshCcw, Shield } from 'lucide-react'

import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'

import translations from './locales.json'

interface SecurityProcessClientProps {
	locale: Locale
}

export default function SecurityProcessClient({ locale }: Readonly<SecurityProcessClientProps>) {
	const t = getTranslations(locale, translations)

	const securityProcessData = [
		{
			title: t.security.partnership.title,
			status: 'completed' as const,
			relatedIds: [1],
			id: 0,
			icon: Handshake,
			energy: 100,
			date: `${t.steps.step} 1`,
			content: t.security.partnership.content,
			category: 'Partnership',
		},
		{
			title: t.security.certification.title,
			status: 'completed' as const,
			relatedIds: [0, 2],
			id: 1,
			icon: Shield,
			energy: 95,
			date: `${t.steps.step} 2`,
			content: t.security.certification.content,
			category: 'Certification',
		},
		{
			title: t.security.transfer.title,
			status: 'in-progress' as const,
			relatedIds: [1, 3],
			id: 2,
			icon: RefreshCcw,
			energy: 80,
			date: `${t.steps.step} 3`,
			content: t.security.transfer.content,
			category: 'Transfer',
		},
		{
			title: t.security.update.title,
			status: 'pending' as const,
			relatedIds: [2, 4],
			id: 3,
			icon: FileCheck,
			energy: 60,
			date: `${t.steps.step} 4`,
			content: t.security.update.content,
			category: 'Update',
		},
		{
			title: t.security.confirmation.title,
			status: 'pending' as const,
			relatedIds: [3],
			id: 4,
			icon: CheckCircle,
			energy: 100,
			date: `${t.steps.step} 5`,
			content: t.security.confirmation.content,
			category: 'Confirmation',
		},
	]

	return (
		<section className="pt-16 pb-32">
			{/* Header Section */}
			<div className="mx-auto max-w-7xl px-6 py-16">
				<h2 className="text-foreground mb-4 text-center text-4xl font-bold">{t.security.title}</h2>
				<p className="text-muted-foreground mx-auto max-w-2xl text-center text-lg">{t.security.subtitle}</p>
			</div>

			{/* Timeline Component */}
			<RadialOrbitalTimeline timelineData={securityProcessData} />
		</section>
	)
}
