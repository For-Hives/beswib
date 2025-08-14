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
			<div className="space-y-4 text-center">
				<div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
				<p className="text-muted-foreground">Completing sign in...</p>
			</div>
		</div>
	)
}
