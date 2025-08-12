'use client'

import { useEffect } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function SSOCallback() {
	const { handleRedirectCallback } = useClerk()
	const router = useRouter()

	useEffect(() => {
		async function handleCallback() {
			try {
				await handleRedirectCallback()
				router.push('/dashboard')
			} catch (error) {
				console.error('SSO callback error:', error)
				router.push('/sign-in?error=sso_error')
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
