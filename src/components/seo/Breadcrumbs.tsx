import { ChevronRight, Home } from 'lucide-react'

import Link from 'next/link'

import type { Locale } from '@/lib/i18n/config'

interface BreadcrumbItem {
	label: string
	href?: string
	current?: boolean
}

interface BreadcrumbsProps {
	items: BreadcrumbItem[]
	locale: Locale
	className?: string
}

export default function Breadcrumbs({ locale, items, className = '' }: BreadcrumbsProps) {
	if (items.length === 0) return null

	return (
		<nav className={`text-muted-foreground flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
			<ol className="flex items-center space-x-1">
				{/* Home */}
				<li>
					<Link
						href={`/${locale}`}
						className="hover:text-foreground flex items-center gap-1 transition-colors"
						aria-label="Home"
					>
						<Home className="h-4 w-4" />
						<span className="sr-only">Home</span>
					</Link>
				</li>

				{/* Separator */}
				{items.length > 0 && (
					<li>
						<ChevronRight className="h-4 w-4" />
					</li>
				)}

				{/* Navigation items */}
				{items.map((item, index) => (
					<li key={index}>
						{item.current ? (
							<span className="text-foreground font-medium" aria-current="page">
								{item.label}
							</span>
						) : item.href ? (
							<Link href={item.href} className="hover:text-foreground transition-colors">
								{item.label}
							</Link>
						) : (
							<span>{item.label}</span>
						)}

						{/* Separator (except for last item) */}
						{index < items.length - 1 && <ChevronRight className="ml-1 h-4 w-4" />}
					</li>
				))}
			</ol>
		</nav>
	)
}

// Specialized component for event pages
export function EventBreadcrumbs({
	locale,
	eventName,
	className = '',
}: {
	eventName: string
	locale: Locale
	className?: string
}) {
	const items: BreadcrumbItem[] = [
		{
			label: 'Events',
			href: `/${locale}/events`,
		},
		{
			label: eventName,
			current: true,
		},
	]

	return <Breadcrumbs items={items} locale={locale} className={className} />
}

// Specialized component for marketplace pages
export function MarketplaceBreadcrumbs({ locale, className = '' }: { locale: Locale; className?: string }) {
	const items: BreadcrumbItem[] = [
		{
			label: 'Marketplace',
			current: true,
		},
	]

	return <Breadcrumbs items={items} locale={locale} className={className} />
}

// Specialized component for legal pages
export function LegalBreadcrumbs({
	pageName,
	locale,
	className = '',
}: {
	pageName: string
	locale: Locale
	className?: string
}) {
	const items: BreadcrumbItem[] = [
		{
			label: 'Legal',
			href: `/${locale}/legals`,
		},
		{
			label: pageName,
			current: true,
		},
	]

	return <Breadcrumbs items={items} locale={locale} className={className} />
}
