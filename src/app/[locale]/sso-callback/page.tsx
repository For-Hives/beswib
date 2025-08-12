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
			<div className="text-center space-y-4">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
				<p className="text-muted-foreground">Connexion en cours...</p>
			</div>
		</div>
	)
}