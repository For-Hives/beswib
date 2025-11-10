/** biome-ignore-all lint/suspicious/noArrayIndexKey: <the usage is ok, we know that the index is stable.> */
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
	href?: string
	label: string
}

interface BreadcrumbProps {
	className?: string
	items: BreadcrumbItem[]
}

export function Breadcrumb({ className, items }: BreadcrumbProps) {
	return (
		<nav aria-label="Breadcrumb" className={cn('flex items-center space-x-1 text-sm', className)}>
			<ol className="flex items-center space-x-1">
				{items.map((item, index) => {
					const isLast = index === items.length - 1
					const key = item.href || item.label

					return (
						<li key={`${key}-${index}`} className="flex items-center">
							{index > 0 && <ChevronRight className="text-muted-foreground mx-1 size-4" />}
							{item.href && !isLast ? (
								<Link className="text-muted-foreground hover:text-foreground transition-colors" href={item.href}>
									{item.label}
								</Link>
							) : (
								<span className={cn(isLast ? 'text-foreground font-medium' : 'text-muted-foreground')}>
									{item.label}
								</span>
							)}
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
