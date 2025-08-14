'use client'

import { useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useSignUp } from '@clerk/nextjs'
import Link from 'next/link'

import {
	validateEmailValibot,
	validatePasswordValibot,
	validateNameValibot,
	validateVerificationCodeValibot,
	validateConfirmPasswordValibot,
} from '@/lib/validation-valibot'
import { PasswordStrength } from '@/components/ui/PasswordStrength'
import { translateClerkError } from '@/lib/clerkErrorTranslations'
import { getTranslations } from '@/lib/getDictionary'
import { FormInput } from '@/components/ui/FormInput'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { Locale } from '@/lib/i18n-config'
import mainLocales from '@/app/[locale]/locales.json'

export default function CustomSignUp() {
	const { signUp, setActive, isLoaded } = useSignUp()
	const router = useRouter()
	const params = useParams()
	const locale = (params?.locale as Locale) || 'en'
	const t = getTranslations(locale, mainLocales).auth

	const {
		verificationEmail,
		verificationCode,
		signUpData,
		setVerifying,
		setVerificationCode,
		setSignUpData,
		setSigningUp,
		setPendingVerification,
		setGlobalError,
		setFieldError,
		resetSignUpForm,
		pendingVerification,
		isVerifying,
		isSigningUp,
		globalError,
		fieldErrors,
		clearFieldError,
	} = useAuthStore()

	// Reset form on component mount
	useEffect(() => {
		resetSignUpForm()
	}, [resetSignUpForm])

	// Validate fields in real-time
	const validateField = (field: keyof typeof signUpData | 'verificationCode', value: string) => {
		let error = null

		switch (field) {
			case 'firstName':
				error = validateNameValibot(value, t.signUp.firstNameLabel.toLowerCase(), locale)
				break
			case 'lastName':
				error = validateNameValibot(value, t.signUp.lastNameLabel.toLowerCase(), locale)
				break
			case 'email':
				error = validateEmailValibot(value, locale)
				break
			case 'password':
				error = validatePasswordValibot(value, true, locale)
				break
			case 'confirmPassword':
				error = validateConfirmPasswordValibot(signUpData.password, value, locale)
				break
			case 'verificationCode':
				error = validateVerificationCodeValibot(value, locale)
				break
		}

		setFieldError(field, error)
		return error === null
	}

	// Handle input changes
	const handleInputChange = (field: keyof typeof signUpData) => (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setSignUpData({ [field]: value })

		// Clear field error on input change
		if (fieldErrors[field]) {
			clearFieldError(field)
		}

		// Clear global error
		if (globalError) {
			setGlobalError('')
		}

		// Also validate confirm password when password changes
		if (field === 'password' && signUpData.confirmPassword) {
			validateField('confirmPassword', signUpData.confirmPassword)
		}
	}

	// Handle verification code change
	const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setVerificationCode(value)

		// Clear field error on input change
		if (fieldErrors.verificationCode) {
			clearFieldError('verificationCode')
		}

		// Clear global error
		if (globalError) {
			setGlobalError('')
		}
	}

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!isLoaded || isSigningUp) return

		// Validate all fields
		const firstNameValid = validateField('firstName', signUpData.firstName)
		const lastNameValid = validateField('lastName', signUpData.lastName)
		const emailValid = validateField('email', signUpData.email)
		const passwordValid = validateField('password', signUpData.password)
		const confirmPasswordValid = validateField('confirmPassword', signUpData.confirmPassword)

		if (!firstNameValid || !lastNameValid || !emailValid || !passwordValid || !confirmPasswordValid) {
			return
		}

		setSigningUp(true)
		setGlobalError('')

		try {
			await signUp.create({
				password: signUpData.password,
				lastName: signUpData.lastName,
				firstName: signUpData.firstName,
				emailAddress: signUpData.email,
			})

			// Prepare email verification
			await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
			setPendingVerification(true, signUpData.email)
		} catch (err: any) {
			const errorMessage = translateClerkError(err, locale)
			setGlobalError(errorMessage)

			// Set specific field errors based on error codes
			if (err.errors?.[0]?.code === 'form_identifier_exists') {
				setFieldError('email', { message: translateClerkError(err, locale), code: 'exists' })
			}
		} finally {
			setSigningUp(false)
		}
	}

	// Handle verification
	const handleVerification = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!isLoaded || isVerifying) return

		// Validate verification code
		const codeValid = validateField('verificationCode', verificationCode)
		if (!codeValid) {
			return
		}

		setVerifying(true)
		setGlobalError('')

		try {
			const completeSignUp = await signUp.attemptEmailAddressVerification({
				code: verificationCode,
			})

			if (completeSignUp.status === 'complete') {
				void setActive({ session: completeSignUp.createdSessionId })
				router.push(`/${locale}/dashboard`)
			} else {
				setGlobalError(t.somethingWentWrong)
			}
		} catch (err: any) {
			const errorMessage = translateClerkError(err, locale)
			setGlobalError(errorMessage)
			setFieldError('verificationCode', { message: translateClerkError(err, locale), code: 'incorrect' })
		} finally {
			setVerifying(false)
		}
	}

	// Handle OAuth sign up
	const signUpWith = (strategy: 'oauth_google' | 'oauth_facebook') => {
		if (!signUp) return

		setSigningUp(true)
		void signUp.authenticateWithRedirect({
			strategy,
			redirectUrlComplete: `/${locale}/dashboard`,
			redirectUrl: `/${locale}/sso-callback`,
		})
	}

	if (!isLoaded) {
		return (
			<div className="flex h-96 items-center justify-center">
				<div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
			</div>
		)
	}

	// Verification form
	if (pendingVerification) {
		return (
			<div className="w-full max-w-md space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-foreground text-2xl font-bold tracking-tight">{t.signUp.verifyEmail.title}</h1>
					<p className="text-muted-foreground text-sm">
						{t.signUp.verifyEmail.subtitle} <strong>{verificationEmail}</strong>
					</p>
				</div>

				<form onSubmit={e => void handleVerification(e)} className="space-y-4">
					{globalError && (
						<div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm">
							<span className="text-destructive">⚠</span>
							{globalError}
						</div>
					)}

					<FormInput
						type="text"
						label={t.signUp.verifyEmail.codeLabel}
						placeholder={t.signUp.verifyEmail.codePlaceholder}
						value={verificationCode}
						onChange={handleVerificationCodeChange}
						error={fieldErrors.verificationCode}
						disabled={isVerifying}
						className="text-center font-mono text-lg tracking-wider"
						autoComplete="one-time-code"
					/>

					<Button type="submit" size="lg" className="w-full" disabled={isVerifying}>
						{isVerifying ? (
							<>
								<div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
								{t.signUp.verifyEmail.verifying}
							</>
						) : (
							t.signUp.verifyEmail.verifyButton
						)}
					</Button>
				</form>

				<div className="text-center">
					<button
						onClick={() => {
							setPendingVerification(false)
							setVerificationCode('')
							setGlobalError('')
							clearFieldError('verificationCode')
						}}
						className="text-muted-foreground hover:text-foreground text-sm transition-colors"
					>
						{t.signUp.verifyEmail.backToForm}
					</button>
				</div>
			</div>
		)
	}

	// Sign up form
	return (
		<div className="w-full max-w-md space-y-6">
			{/* Header */}
			<div className="space-y-2 text-start">
				<h1 className="text-foreground text-2xl font-bold tracking-tight">{t.signUp.title}</h1>
				<p className="text-muted-foreground text-sm">{t.signUp.subtitle}</p>
			</div>

			{/* OAuth Buttons */}
			<div className="space-y-3">
				<Button
					variant="outline"
					size="lg"
					className="w-full"
					onClick={() => signUpWith('oauth_google')}
					disabled={isSigningUp}
				>
					<Icons.google className="mr-2 h-4 w-4" />
					{t.signUp.signUpWithGoogle}
				</Button>
				<Button
					variant="outline"
					size="lg"
					className="w-full"
					onClick={() => signUpWith('oauth_facebook')}
					disabled={isSigningUp}
				>
					<Icons.facebook className="mr-2 h-4 w-4" />
					{t.signUp.signUpWithFacebook}
				</Button>
			</div>

			{/* Divider */}
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="border-border/50 w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background text-muted-foreground px-2 tracking-wider">{t.signUp.orCreateWith}</span>
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

				<div className="grid grid-cols-2 gap-4">
					<FormInput
						type="text"
						label={t.signUp.firstNameLabel}
						placeholder={t.signUp.firstNamePlaceholder}
						value={signUpData.firstName}
						onChange={handleInputChange('firstName')}
						error={fieldErrors.firstName}
						disabled={isSigningUp}
						autoComplete="given-name"
					/>

					<FormInput
						type="text"
						label={t.signUp.lastNameLabel}
						placeholder={t.signUp.lastNamePlaceholder}
						value={signUpData.lastName}
						onChange={handleInputChange('lastName')}
						error={fieldErrors.lastName}
						disabled={isSigningUp}
						autoComplete="family-name"
					/>
				</div>

				<FormInput
					type="email"
					label={t.signUp.emailLabel}
					placeholder={t.signUp.emailPlaceholder}
					value={signUpData.email}
					onChange={handleInputChange('email')}
					error={fieldErrors.email}
					disabled={isSigningUp}
					autoComplete="email"
				/>

				<div className="space-y-2">
					<FormInput
						type="password"
						label={t.signUp.passwordLabel}
						placeholder={t.signUp.passwordPlaceholder}
						value={signUpData.password}
						onChange={handleInputChange('password')}
						error={fieldErrors.password}
						disabled={isSigningUp}
						showPasswordToggle
						autoComplete="new-password"
					/>
					<PasswordStrength password={signUpData.password} show={signUpData.password.length > 0} locale={locale} />
				</div>

				<FormInput
					type="password"
					label={t.signUp.confirmPasswordLabel}
					placeholder={t.signUp.confirmPasswordPlaceholder}
					value={signUpData.confirmPassword}
					onChange={handleInputChange('confirmPassword')}
					error={fieldErrors.confirmPassword}
					disabled={isSigningUp}
					showPasswordToggle
					autoComplete="new-password"
				/>

				<Button type="submit" size="lg" className="w-full" disabled={isSigningUp}>
					{isSigningUp ? (
						<>
							<div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
							{t.signUp.signingUp}
						</>
					) : (
						t.signUp.signUpButton
					)}
				</Button>
			</form>

			{/* Footer */}
			<div className="text-center">
				<p className="text-muted-foreground text-sm">
					{t.signUp.alreadyAccount}{' '}
					<Link
						href={`/${locale}/sign-in`}
						className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
					>
						{t.signUp.signIn}
					</Link>
				</p>
			</div>
		</div>
	)
}
