'use client'

import { useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useSignIn } from '@clerk/nextjs'
import Link from 'next/link'

import { validateEmailValibot, validatePasswordValibot } from '@/lib/validation-valibot'
import { translateClerkError } from '@/lib/clerkErrorTranslations'
import { getTranslations } from '@/lib/getDictionary'
import { FormInput } from '@/components/ui/FormInput'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { Locale } from '@/lib/i18n-config'
import authLocales from '@/components/auth/locales.json'

export default function CustomSignIn() {
	const { signIn, setActive, isLoaded } = useSignIn()
	const router = useRouter()
	const params = useParams()
	const locale = (params?.locale as Locale) || 'en'
	const t = getTranslations(locale, authLocales).auth

	const {
		signInData,
		setSigningIn,
		setSignInData,
		setGlobalError,
		setFieldError,
		resetSignInForm,
		isSigningIn,
		globalError,
		fieldErrors,
		clearFieldError,
	} = useAuthStore()

	// Reset form on component mount
	useEffect(() => {
		resetSignInForm()
	}, [resetSignInForm])

	// Validate fields in real-time
	const validateField = (field: 'email' | 'password', value: string) => {
		let error = null

		switch (field) {
			case 'email':
				error = validateEmailValibot(value, locale)
				break
			case 'password':
				error = validatePasswordValibot(value, false, locale)
				break
		}

		setFieldError(field, error)
		return error === null
	}

	// Handle input changes
	const handleInputChange = (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setSignInData({ [field]: value })

		// Clear field error on input change
		if (fieldErrors[field]) {
			clearFieldError(field)
		}

		// Clear global error
		if (globalError) {
			setGlobalError('')
		}
	}

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!isLoaded || isSigningIn) return

		// Validate all fields
		const emailValid = validateField('email', signInData.email)
		const passwordValid = validateField('password', signInData.password)

		if (!emailValid || !passwordValid) {
			return
		}

		setSigningIn(true)
		setGlobalError('')

		try {
			const result = await signIn.create({
				password: signInData.password,
				identifier: signInData.email,
			})

			if (result.status === 'complete') {
				await setActive({ session: result.createdSessionId })
				router.push(`/${locale}/dashboard`)
			} else {
				setGlobalError(t.somethingWentWrong)
			}
		} catch (err: any) {
			const errorMessage = translateClerkError(err, locale)
			setGlobalError(errorMessage)

			// Set specific field errors based on error codes
			if (err.errors?.[0]?.code === 'form_identifier_not_found') {
				setFieldError('email', { message: translateClerkError(err, locale), code: 'not_found' })
			} else if (err.errors?.[0]?.code === 'form_password_incorrect') {
				setFieldError('password', { message: translateClerkError(err, locale), code: 'incorrect' })
			}
		} finally {
			setSigningIn(false)
		}
	}

	// Handle OAuth sign in
	const signInWith = (strategy: 'oauth_google' | 'oauth_facebook') => {
		if (!signIn) return

		setSigningIn(true)
		void signIn.authenticateWithRedirect({
			strategy,
			redirectUrlComplete: `/${locale}/dashboard`,
			redirectUrl: `/${locale}/sso-callback`,
		})
	}

	return (
		<div className="w-full max-w-md space-y-6">
			{/* Header */}
			<div className="space-y-2 text-start">
				<h1 className="text-foreground text-2xl font-bold tracking-tight">{t.signIn.welcome}</h1>
				<p className="text-muted-foreground text-sm">{t.signIn.subtitle}</p>
			</div>

			{/* OAuth Buttons */}
			<div className="space-y-3">
				<Button
					variant="outline"
					size="lg"
					className="w-full"
					onClick={() => signInWith('oauth_google')}
					disabled={isSigningIn}
				>
					<Icons.google className="mr-2 h-4 w-4" />
					{t.signIn.continueWithGoogle}
				</Button>
				<Button
					variant="outline"
					size="lg"
					className="w-full"
					onClick={() => signInWith('oauth_facebook')}
					disabled={isSigningIn}
				>
					<Icons.facebook className="mr-2 h-4 w-4" />
					{t.signIn.continueWithFacebook}
				</Button>
			</div>

			{/* Divider */}
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="border-border/50 w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background text-muted-foreground px-2 tracking-wider">{t.signIn.orContinueWith}</span>
				</div>
			</div>

			{/* Form */}
			<form onSubmit={e => void handleSubmit(e)} className="space-y-4">
				{globalError && (
					<div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm">
						<span className="text-destructive">⚠</span>
						{globalError}
					</div>
				)}

				<FormInput
					type="email"
					label={t.fields.email}
					placeholder={t.placeholders.email}
					value={signInData.email}
					onChange={handleInputChange('email')}
					error={fieldErrors.email}
					disabled={isSigningIn}
					autoComplete="email"
				/>

				<FormInput
					type="password"
					label={t.fields.password}
					placeholder={t.placeholders.password}
					value={signInData.password}
					onChange={handleInputChange('password')}
					error={fieldErrors.password}
					disabled={isSigningIn}
					showPasswordToggle
					autoComplete="current-password"
				/>

				<div className="flex items-center justify-end">
					<Link
						href={`/${locale}/forgot-password`}
						className="text-primary hover:text-primary/80 text-sm transition-colors hover:underline"
					>
						{t.signIn.forgotPassword}
					</Link>
				</div>

				<Button type="submit" size="lg" className="w-full" disabled={isSigningIn}>
					{isSigningIn ? (
						<>
							<div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
							{t.signIn.signingIn}
						</>
					) : (
						t.signIn.signIn
					)}
				</Button>
			</form>

			{/* Footer */}
			<div className="text-center">
				<p className="text-muted-foreground text-sm">
					{t.signIn.noAccount}{' '}
					<Link
						href={`/${locale}/sign-up`}
						className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
					>
						{t.signIn.createAccount}
					</Link>
				</p>
			</div>
		</div>
	)
}
