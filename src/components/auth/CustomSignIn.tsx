'use client'

import { useState } from 'react'

import { useRouter, useParams } from 'next/navigation'
import { useSignIn } from '@clerk/nextjs'
import Link from 'next/link'

import { validateEmailValibot, validatePasswordValibot } from '@/lib/validation/valibot'
import { getTranslations } from '@/lib/i18n/dictionary'
import { FormInput } from '@/components/ui/FormInput'
import mainLocales from '@/app/[locale]/locales.json'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { Locale } from '@/lib/i18n/config'

interface FieldError {
	message: string
	code?: string
}

export default function CustomSignIn() {
	const { signIn, setActive, isLoaded } = useSignIn()
	const router = useRouter()
	const params = useParams()
	const locale = (params?.locale as Locale) || 'en'
	const translations = getTranslations(locale, mainLocales)
	const t = translations.auth
	const errorsT = translations.GLOBAL?.errors

	function translateClerkErrorLocal(error: unknown): string {
		const e = (error ?? {}) as Partial<{
			code: string
			message: string
			errors: Array<Partial<{ code: string; message: string; longMessage: string }>>
		}>
		const code = e.code ?? e.errors?.[0]?.code
		const message = e.message ?? e.errors?.[0]?.message ?? e.errors?.[0]?.longMessage

		// Ensure errorsT exists, otherwise return a fallback
		if (errorsT == null) {
			console.warn('Translation object errorsT is undefined')
			return typeof message === 'string' ? message : 'An error occurred. Please try again.'
		}

		// Handle specific error codes
		if (typeof code === 'string') {
			if (code === 'session_exists') {
				return 'You are already signed in. Redirecting...'
			}
			const errorMessage = errorsT?.[code as keyof typeof errorsT]
			if (errorMessage) return errorMessage
		}

		if (typeof message === 'string') {
			const m = message.toLowerCase()
			if (m.includes('password') && m.includes('incorrect'))
				return errorsT?.form_password_incorrect ?? 'Incorrect password'
			if (m.includes('email') && m.includes('not found')) return errorsT?.form_identifier_not_found ?? 'Email not found'
			if (m.includes('already exists') || m.includes('already taken'))
				return errorsT?.form_identifier_exists ?? 'Email already exists'
			if (m.includes('verification') && m.includes('code'))
				return errorsT?.form_code_incorrect ?? 'Incorrect verification code'
			if (m.includes('expired')) return errorsT?.verification_expired ?? 'Code expired'
			if (m.includes('rate limit') || m.includes('too many')) return errorsT?.too_many_requests ?? 'Too many requests'
			return message
		}

		return errorsT?.default_error ?? 'An error occurred. Please try again.'
	}

	// Local state instead of global store
	const [formData, setFormData] = useState({
		password: '',
		email: '',
	})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [globalError, setGlobalError] = useState('')
	const [fieldErrors, setFieldErrors] = useState<{
		email?: FieldError
		password?: FieldError
	}>({})

	// Validate fields in real-time
	const validateField = (field: 'email' | 'password', value: string) => {
		let error: FieldError | null = null

		switch (field) {
			case 'email':
				error = validateEmailValibot(value, locale)
				break
			case 'password':
				error = validatePasswordValibot(value, false, locale)
				break
		}

		setFieldErrors(prev => ({
			...prev,
			[field]: error,
		}))
		return error == null
	}

	// Handle input changes
	const handleInputChange = (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setFormData(prev => ({ ...prev, [field]: value }))

		// Clear field error on input change
		if (fieldErrors[field]) {
			setFieldErrors(prev => {
				const newErrors = { ...prev }
				delete newErrors[field]
				return newErrors
			})
		}

		// Clear global error
		if (globalError) {
			setGlobalError('')
		}
	}

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!isLoaded || isSubmitting) return

		// Validate all fields
		const emailValid = validateField('email', formData.email)
		const passwordValid = validateField('password', formData.password)

		if (!emailValid || !passwordValid) {
			return
		}

		setIsSubmitting(true)
		setGlobalError('')

		try {
			const result = await signIn.create({
				password: formData.password,
				identifier: formData.email,
			})

			if (result.status === 'complete') {
				await setActive({ session: result.createdSessionId })
				router.push(`/${locale}/dashboard`)
			} else {
				setGlobalError(t.somethingWentWrong)
			}
		} catch (err: unknown) {
			// Check for session_exists error specifically
			const e = (err ?? {}) as Partial<{ errors: Array<Partial<{ code: string }>> }>
			const code = e.errors?.[0]?.code

			if (code === 'session_exists') {
				// User is already signed in, redirect to dashboard
				console.info('User already signed in, redirecting to dashboard')
				router.push(`/${locale}/dashboard`)
				return
			}

			const errorMessage = translateClerkErrorLocal(err)
			setGlobalError(errorMessage)

			// Set specific field errors based on error codes
			if (code === 'form_identifier_not_found') {
				setFieldErrors(prev => ({
					...prev,
					email: { message: translateClerkErrorLocal(err), code: 'not_found' },
				}))
			} else if (code === 'form_password_incorrect') {
				setFieldErrors(prev => ({
					...prev,
					password: { message: translateClerkErrorLocal(err), code: 'incorrect' },
				}))
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	// Handle OAuth sign in
	const signInWith = (strategy: 'oauth_google' | 'oauth_facebook') => {
		if (!signIn) return

		setIsSubmitting(true)
		void signIn.authenticateWithRedirect({
			strategy,
			redirectUrlComplete: `/${locale}/dashboard`,
			redirectUrl: `/${locale}/dashboard`,
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
					disabled={isSubmitting}
				>
					<Icons.google className="mr-2 h-4 w-4" />
					{t.signIn.continueWithGoogle}
				</Button>
				<Button
					variant="outline"
					size="lg"
					className="w-full"
					onClick={() => signInWith('oauth_facebook')}
					disabled={isSubmitting}
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
					value={formData.email}
					onChange={handleInputChange('email')}
					error={fieldErrors.email}
					disabled={isSubmitting}
					autoComplete="email"
				/>

				<FormInput
					type="password"
					label={t.fields.password}
					placeholder={t.placeholders.password}
					value={formData.password}
					onChange={handleInputChange('password')}
					error={fieldErrors.password}
					disabled={isSubmitting}
					showPasswordToggle
					autoComplete="current-password"
				/>

				<div className="flex items-center justify-end">
					<Link
						href={`/${locale}/auth/forgot-password`}
						className="text-primary hover:text-primary/80 text-sm transition-colors hover:underline"
					>
						{t.signIn.forgotPassword}
					</Link>
				</div>

				<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
					{isSubmitting ? (
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
						href={`/${locale}/auth/sign-up`}
						className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
					>
						{t.signIn.createAccount}
					</Link>
				</p>
			</div>
		</div>
	)
}
