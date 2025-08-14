'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, SignedOut } from '@clerk/nextjs'

import AuthSplitScreen from '@/components/ui/AuthSplitScreen'
import { ClerkNativeSignIn } from '@/components/auth/ClerkNativeAuth'

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
				<ClerkNativeSignIn />
			</AuthSplitScreen>
		</SignedOut>
	)
}