'use client'

import { useEffect } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useParams, useRouter } from 'next/navigation'

export default function SSOCallback() {
	const { handleRedirectCallback } = useClerk()
	const router = useRouter()
	const params = useParams()

	useEffect(() => {
		async function handleCallback() {
			try {
				const locale = typeof params?.locale === 'string' ? params.locale : Array.isArray(params?.locale) ? params?.locale?.[0] : 'en'
				await handleRedirectCallback({
					redirectUrlComplete: `/${locale}/dashboard`,
					signInUrl: `/${locale}/sign-in`,
					signUpUrl: `/${locale}/sign-up`,
				})
				router.push(`/${locale}/dashboard`)
			} catch (error) {
				console.error('SSO callback error:', error)
				const locale = typeof params?.locale === 'string' ? params.locale : Array.isArray(params?.locale) ? params?.locale?.[0] : 'en'
				router.push(`/${locale}/sign-in?error=sso_error`)
			}
		}

		handleCallback()
	}, [handleRedirectCallback, router])

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="space-y-4 text-center">
				<div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
				<p className="text-muted-foreground">Connexion en cours...</p>
			</div>
		</div>
	)
}
