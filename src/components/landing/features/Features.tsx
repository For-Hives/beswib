import { Calendar, ChartBar, CreditCard, Globe, Mail, Search, Star, Users } from 'lucide-react'

import { LocaleParams } from '@/lib/generation/staticParams'
import { getTranslations } from '@/lib/i18n/dictionary'
import { cn } from '@/lib/utils'

import translations from './locales.json'

export default async function FeaturesBento({ localeParams }: { localeParams: Promise<LocaleParams> }) {
	const { locale } = await localeParams

	const t = getTranslations(locale, translations)

	const features = [
		{
			title: t.features.security.title,
			icon: <Star />,
			hoverColor: 'yellow',
			description: t.features.security.description,
		},
		{
			title: t.features.trust.title,
			icon: <Users />,
			hoverColor: 'blue',
			description: t.features.trust.description,
		},
		{
			title: t.features.search.title,
			icon: <Search />,
			hoverColor: 'purple',
			description: t.features.search.description,
		},
		{
			title: t.features.profitability.title,
			icon: <CreditCard />,
			hoverColor: 'green',
			description: t.features.profitability.description,
		},
		{
			title: t.features.analytics.title,
			icon: <ChartBar />,
			hoverColor: 'orange',
			description: t.features.analytics.description,
		},
		{
			title: t.features.community.title,
			icon: <Globe />,
			hoverColor: 'pink',
			description: t.features.community.description,
		},
		{
			title: t.features.notifications.title,
			icon: <Mail />,
			hoverColor: 'indigo',
			description: t.features.notifications.description,
		},
		{
			title: t.features.support.title,
			icon: <Calendar />,
			hoverColor: 'red',
			description: t.features.support.description,
		},
	]

	return (
		<section className="dark:bg-muted border-t border-neutral-200/60 bg-white py-24 dark:border-neutral-200/10">
			<div className="mx-auto max-w-7xl">
				<div className="mb-16 text-center">
					<h2 className="mb-6 text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
						{t.features.title}
					</h2>
					<p className="mx-auto max-w-3xl text-xl text-neutral-700 dark:text-neutral-300">{t.features.subtitle}</p>
				</div>

				<FeaturesSectionWithHoverEffects features={features} />
			</div>
		</section>
	)
}

function FeaturesSectionWithHoverEffects({
	features,
}: {
	features: Array<{ description: string; hoverColor: string; icon: React.ReactNode; title: string }>
}) {
	return (
		<div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 py-10 md:grid-cols-2 lg:grid-cols-4">
			{features.map((feature, index) => (
				<Feature key={feature.title} {...feature} index={index} />
			))}
		</div>
	)
}

const Feature = ({
	title,
	index,
	icon,
	hoverColor,
	description,
}: {
	description: string
	hoverColor: string
	icon: React.ReactNode
	index: number
	title: string
}) => {
	const getColorClasses = (color: string) => {
		const colorMap = {
			yellow: {
				icon: 'text-yellow-600 dark:text-yellow-400 xl:text-neutral-600 dark:xl:text-neutral-400 xl:group-hover/feature:text-yellow-600 dark:xl:group-hover/feature:text-yellow-400',
				gradient:
					'from-yellow-100/50 dark:from-yellow-900/10 xl:from-neutral-100/50 dark:xl:from-neutral-900/10 xl:group-hover/feature:from-yellow-100/50 dark:xl:group-hover/feature:from-yellow-900/10',
				border:
					'bg-yellow-500/50 dark:bg-yellow-500/50 xl:bg-neutral-300 xl:dark:bg-neutral-300 xl:group-hover/feature:bg-yellow-500/50 xl:group-hover/feature:dark:bg-yellow-500/50',
			},
			red: {
				icon: 'text-red-600 dark:text-red-400 xl:text-neutral-600 dark:xl:text-neutral-400 xl:group-hover/feature:text-red-600 dark:xl:group-hover/feature:text-red-400',
				gradient:
					'from-red-100/50 dark:from-red-900/10 xl:from-neutral-100/50 dark:xl:from-neutral-900/10 xl:group-hover/feature:from-red-100/50 dark:xl:group-hover/feature:from-red-900/10',
				border:
					'bg-red-500/50 dark:bg-red-500/50 xl:bg-neutral-300 xl:dark:bg-neutral-300 xl:group-hover/feature:bg-red-500/50 xl:group-hover/feature:dark:bg-red-500/50',
			},
			purple: {
				icon: 'text-purple-600 dark:text-purple-400 xl:text-neutral-600 dark:xl:text-neutral-400 xl:group-hover/feature:text-purple-600 dark:xl:group-hover/feature:text-purple-400',
				gradient:
					'from-purple-100/50 dark:from-purple-900/10 xl:from-neutral-100/50 dark:xl:from-neutral-900/10 xl:group-hover/feature:from-purple-100/50 dark:xl:group-hover/feature:from-purple-900/10',
				border:
					'bg-purple-500/50 dark:bg-purple-500/50 xl:bg-neutral-300 xl:dark:bg-neutral-300 xl:group-hover/feature:bg-purple-500/50 xl:group-hover/feature:dark:bg-purple-500/50',
			},
			pink: {
				icon: 'text-pink-600 dark:text-pink-400 xl:text-neutral-600 dark:xl:text-neutral-400 xl:group-hover/feature:text-pink-600 dark:xl:group-hover/feature:text-pink-400',
				gradient:
					'from-pink-100/50 dark:from-pink-900/10 xl:from-neutral-100/50 dark:xl:from-neutral-900/10 xl:group-hover/feature:from-pink-100/50 dark:xl:group-hover/feature:from-pink-900/10',
				border:
					'bg-pink-500/50 dark:bg-pink-500/50 xl:bg-neutral-300 xl:dark:bg-neutral-300 xl:group-hover/feature:bg-pink-500/50 xl:group-hover/feature:dark:bg-pink-500/50',
			},
			orange: {
				icon: 'text-orange-600 dark:text-orange-400 xl:text-neutral-600 dark:xl:text-neutral-400 xl:group-hover/feature:text-orange-600 dark:xl:group-hover/feature:text-orange-400',
				gradient:
					'from-orange-100/50 dark:from-orange-900/10 xl:from-neutral-100/50 dark:xl:from-neutral-900/10 xl:group-hover/feature:from-orange-100/50 dark:xl:group-hover/feature:from-orange-900/10',
				border:
					'bg-orange-500/50 dark:bg-orange-500/50 xl:bg-neutral-300 xl:dark:bg-neutral-300 xl:group-hover/feature:bg-orange-500/50 xl:group-hover/feature:dark:bg-orange-500/50',
			},
			indigo: {
				icon: 'text-indigo-600 dark:text-indigo-400 xl:text-neutral-600 dark:xl:text-neutral-400 xl:group-hover/feature:text-indigo-600 dark:xl:group-hover/feature:text-indigo-400',
				gradient:
					'from-indigo-100/50 dark:from-indigo-900/10 xl:from-neutral-100/50 dark:xl:from-neutral-900/10 xl:group-hover/feature:from-indigo-100/50 dark:xl:group-hover/feature:from-indigo-900/10',
				border:
					'bg-indigo-500/50 dark:bg-indigo-500/50 xl:bg-neutral-300 xl:dark:bg-neutral-300 xl:group-hover/feature:bg-indigo-500/50 xl:group-hover/feature:dark:bg-indigo-500/50',
			},
			green: {
				icon: 'text-green-600 dark:text-green-400 xl:text-neutral-600 dark:xl:text-neutral-400 xl:group-hover/feature:text-green-600 dark:xl:group-hover/feature:text-green-400',
				gradient:
					'from-green-100/50 dark:from-green-900/10 xl:from-neutral-100/50 dark:xl:from-neutral-900/10 xl:group-hover/feature:from-green-100/50 dark:xl:group-hover/feature:from-green-900/10',
				border:
					'bg-green-500/50 dark:bg-green-500/50 xl:bg-neutral-300 xl:dark:bg-neutral-300 xl:group-hover/feature:bg-green-500/50 xl:group-hover/feature:dark:bg-green-500/50',
			},
			blue: {
				icon: 'text-blue-600 dark:text-blue-400 xl:text-neutral-600 dark:xl:text-neutral-400 xl:group-hover/feature:text-blue-600 dark:xl:group-hover/feature:text-blue-400',
				gradient:
					'from-blue-100/50 dark:from-blue-900/10 xl:from-neutral-100/50 dark:xl:from-neutral-900/10 xl:group-hover/feature:from-blue-100/50 dark:xl:group-hover/feature:from-blue-900/10',
				border:
					'bg-blue-500/50 dark:bg-blue-500/50 xl:bg-neutral-300 xl:dark:bg-neutral-300 xl:group-hover/feature:bg-blue-500/50 xl:group-hover/feature:dark:bg-blue-500/50',
			},
		}
		return colorMap[color as keyof typeof colorMap] ?? colorMap.blue
	}

	const colors = getColorClasses(hoverColor)
	return (
		<div
			className={cn(
				'group/feature relative flex flex-col border-neutral-200 py-10 lg:border-r dark:border-neutral-800',
				(index === 0 || index === 4) && 'border-neutral-200 lg:border-l dark:border-neutral-800',
				index < 4 && 'border-neutral-200 lg:border-b dark:border-neutral-800'
			)}
		>
			<div
				className={cn(
					'pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100 dark:from-neutral-800',
					colors.gradient
				)}
			/>
			<div
				className={cn(
					'relative z-10 mb-4 px-10 text-neutral-600 transition-colors duration-200 dark:text-neutral-400',
					colors.icon
				)}
			>
				{icon}
			</div>
			<div className="relative z-10 mb-2 px-10 text-lg font-bold">
				<div
					className={cn(
						'absolute inset-y-0 left-0 h-6 w-1 origin-center rounded-tr-full rounded-br-full bg-neutral-300 transition-all duration-200 group-hover/feature:h-8 dark:bg-neutral-700',
						colors.border
					)}
				/>
				<span className="inline-block text-neutral-800 transition duration-200 group-hover/feature:translate-x-2 dark:text-neutral-100">
					{title}
				</span>
			</div>
			<p className="relative z-10 max-w-xs px-10 text-sm text-neutral-600 dark:text-neutral-300">{description}</p>
		</div>
	)
}
