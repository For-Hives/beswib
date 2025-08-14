'use client'

import { SignIn, SignUp } from '@clerk/nextjs'
import { useParams } from 'next/navigation'

import { type Locale } from '@/lib/i18n-config'
import { getClerkLocalization } from '@/lib/clerkLocalization'

interface ClerkNativeSignInProps {
	redirectUrl?: string
	signUpUrl?: string
}

interface ClerkNativeSignUpProps {
	redirectUrl?: string
	signInUrl?: string
}

/**
 * Native Clerk SignIn component with proper localization
 */
export function ClerkNativeSignIn({ redirectUrl, signUpUrl }: ClerkNativeSignInProps) {
	const params = useParams()
	const locale = (params?.locale as Locale) ?? 'en'
	const localization = getClerkLocalization(locale)

	return (
		<SignIn
			localization={localization}
			redirectUrl={redirectUrl ?? `/${locale}/dashboard`}
			signUpUrl={signUpUrl ?? `/${locale}/sign-up`}
		/>
	)
}

/**
 * Native Clerk SignUp component with proper localization
 */
export function ClerkNativeSignUp({ redirectUrl, signInUrl }: ClerkNativeSignUpProps) {
	const params = useParams()
	const locale = (params?.locale as Locale) ?? 'en'
	const localization = getClerkLocalization(locale)

	return (
		<SignUp
			localization={localization}
			redirectUrl={redirectUrl ?? `/${locale}/dashboard`}
			signInUrl={signInUrl ?? `/${locale}/sign-in`}
		/>
	)
}