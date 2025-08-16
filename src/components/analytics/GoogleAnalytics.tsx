'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
	interface Window {
		gtag?: (command: string, ...args: any[]) => void
		dataLayer?: any[]
	}
}

interface GoogleAnalyticsProps {
	measurementId: string
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
	const pathname = usePathname()
	const searchParams = useSearchParams()

	useEffect(() => {
		if (!measurementId || !window.gtag) return

		const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
		
		window.gtag('config', measurementId, {
			page_path: url,
			cookie_flags: 'SameSite=None;Secure',
		})
	}, [pathname, searchParams, measurementId])

	if (!measurementId) return null

	return (
		<>
			<Script
				src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
				strategy="afterInteractive"
				id="gtag-base"
			/>
			<Script
				id="gtag-init"
				strategy="afterInteractive"
				dangerouslySetInnerHTML={{
					__html: `
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());
						gtag('config', '${measurementId}', {
							page_path: window.location.pathname,
							send_page_view: false,
							cookie_flags: 'SameSite=None;Secure'
						});
					`,
				}}
			/>
		</>
	)
}

export function trackEvent(action: string, category: string, label?: string, value?: number) {
	if (typeof window !== 'undefined' && window.gtag) {
		window.gtag('event', action, {
			event_category: category,
			event_label: label,
			value: value,
		})
	}
}