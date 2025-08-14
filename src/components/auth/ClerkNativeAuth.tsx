'use client'

import { SignIn, SignUp } from '@clerk/nextjs'
import { useParams } from 'next/navigation'

import { type Locale } from '@/lib/i18n-config'

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
 * Note: Localization is handled at the ClerkProvider level
 */
export function ClerkNativeSignIn({ signUpUrl, redirectUrl }: ClerkNativeSignInProps) {
	const params = useParams()
	const locale = (params?.locale as Locale) ?? 'en'

	return <SignIn redirectUrl={redirectUrl ?? `/${locale}/dashboard`} signUpUrl={signUpUrl ?? `/${locale}/auth/sign-up`} />
}

/**
 * Native Clerk SignUp component with proper localization
 * Note: Localization is handled at the ClerkProvider level
 */
export function ClerkNativeSignUp({ signInUrl, redirectUrl }: ClerkNativeSignUpProps) {
	const params = useParams()
	const locale = (params?.locale as Locale) ?? 'en'

	return <SignUp redirectUrl={redirectUrl ?? `/${locale}/dashboard`} signInUrl={signInUrl ?? `/${locale}/auth/sign-in`} />
}
