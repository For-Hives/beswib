'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import type { Locale } from '@/lib/i18n/config'
import { afterAuthPath, returnPathFrom, signInPath, signUpPath } from '@/lib/utils/redirect'

interface CallbackPages {
	destination: string
	signInUrl: string
	signUpUrl: string
}

// Where Google or Facebook hands the visitor back (see oauthCallbackPath). Clerk finishes the
// attempt here, and only then is there a session. When the provider returned straight to the
// destination, those visitors arrived there signed out, without a word. Beswib is archived: a sign-in
// with an account it does not know is not turned into a sign-up.
export default function Page() {
	const params = useParams()
	const locale = ((params?.locale as string) || 'en') as Locale
	const [pages, setPages] = useState<CallbackPages | null>(null)

	// Set in an effect: the query string is only known in the browser
	useEffect(() => {
		const returnTo = returnPathFrom(window.location.search, window.location.origin)
		setPages({
			// An attempt that cannot be finished (refused at the provider, an error) goes back to the
			// form, which still knows the page to come back to
			signUpUrl: signUpPath(locale, returnTo),
			signInUrl: signInPath(locale, returnTo),
			destination: afterAuthPath(window.location.search, window.location.origin, locale),
		})
	}, [locale])

	return (
		<div className="flex h-screen flex-col items-center justify-center gap-6">
			<div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
			{/* The destination is the one the forms would have chosen, given as the "force" addresses:
			    Clerk then uses it whatever its own settings or the address bar say */}
			{pages != null && (
				<AuthenticateWithRedirectCallback
					transferable={false}
					signInForceRedirectUrl={pages.destination}
					signUpForceRedirectUrl={pages.destination}
					signInUrl={pages.signInUrl}
					signUpUrl={pages.signUpUrl}
				/>
			)}
		</div>
	)
}
