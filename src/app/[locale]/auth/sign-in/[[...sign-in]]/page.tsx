'use client'

import { SignedOut, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import CustomSignIn from '@/components/auth/CustomSignIn'
import AuthSplitScreen from '@/components/ui/AuthSplitScreen'

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
	const { isSignedIn, isLoaded } = useAuth()
	const router = useRouter()
	const [locale, setLocale] = useState('en')

	useEffect(() => {
		void params.then(p => setLocale(p.locale || 'en'))
	}, [params])

	useEffect(() => {
		if (isLoaded && isSignedIn) {
			router.push(`/${locale}/dashboard`)
		}
	}, [isLoaded, isSignedIn, router, locale])

	if (!isLoaded) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
			</div>
		)
	}

	return (
		<SignedOut>
			<AuthSplitScreen>
				<CustomSignIn />
			</AuthSplitScreen>
		</SignedOut>
	)
}
