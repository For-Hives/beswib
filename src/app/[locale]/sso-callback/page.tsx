'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

export default function SSOCallbackPage({ params }: { params: Promise<{ locale: string }> }) {
	const { isSignedIn, isLoaded } = useAuth()
	const router = useRouter()
	const [locale, setLocale] = useState('en')

	useEffect(() => {
		params.then(p => setLocale(p.locale || 'en'))
	}, [params])

	useEffect(() => {
		if (isLoaded) {
			if (isSignedIn) {
				// User successfully signed in, redirect to dashboard
				router.push(`/${locale}/dashboard`)
			} else {
				// Something went wrong, redirect to sign in
				router.push(`/${locale}/sign-in`)
			}
		}
	}, [isLoaded, isSignedIn, router, locale])

	return (
		<div className="flex h-screen items-center justify-center">
			<div className="text-center space-y-4">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
				<p className="text-muted-foreground">Completing sign in...</p>
			</div>
		</div>
	)
}