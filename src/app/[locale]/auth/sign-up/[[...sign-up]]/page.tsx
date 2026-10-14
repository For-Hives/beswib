'use client'

import { Show, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import CustomSignUp from '@/components/auth/CustomSignUp'
import AuthSplitScreen from '@/components/ui/AuthSplitScreen'
import { afterAuthPath } from '@/lib/utils/redirect'

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
	const { isSignedIn, isLoaded } = useAuth()
	const router = useRouter()
	const [locale, setLocale] = useState('en')

	useEffect(() => {
		void params.then(p => setLocale(p.locale || 'en'))
	}, [params])

	useEffect(() => {
		if (isLoaded && isSignedIn) {
			// The same destination as the form and the middleware: the three can answer the same sign-in
			router.push(afterAuthPath(window.location.search, window.location.origin, locale))
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
		<Show when="signed-out">
			<AuthSplitScreen>
				<CustomSignUp />
			</AuthSplitScreen>
		</Show>
	)
}
