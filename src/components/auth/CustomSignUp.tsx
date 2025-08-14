'use client'

import { useState } from 'react'

import { useRouter, useParams } from 'next/navigation'
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
import { FieldError } from '@/types/auth'

export default function CustomSignUp() {
	const { signUp, setActive, isLoaded } = useSignUp()
	const router = useRouter()
	const params = useParams()
	const locale = (params?.locale as Locale) || 'en'
	const t = getTranslations(locale, mainLocales).auth

	// Local state instead of global store
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: ''
	})
	const [verificationCode, setVerificationCode] = useState('')
	const [pendingVerification, setPendingVerification] = useState(false)
	const [verificationEmail, setVerificationEmail] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isVerifying, setIsVerifying] = useState(false)
	const [globalError, setGlobalError] = useState('')
	const [fieldErrors, setFieldErrors] = useState<{
		firstName?: FieldError
		lastName?: FieldError
		email?: FieldError
		password?: FieldError
		confirmPassword?: FieldError
		verificationCode?: FieldError
	}>({})

	// Validate fields in real-time
	const validateField = (field: keyof typeof formData | 'verificationCode', value: string) => {
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
				error = validateConfirmPasswordValibot(formData.password, value, locale)
				break
			case 'verificationCode':
				error = validateVerificationCodeValibot(value, locale)
				break
		}

		setFieldErrors(prev => ({
			...prev,
			[field]: error
		}))
		return error === null
	}

	// Handle input changes
	const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
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

		// Also validate confirm password when password changes
		if (field === 'password' && formData.confirmPassword) {
			validateField('confirmPassword', formData.confirmPassword)
		}
	}

	// Handle verification code change
	const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setVerificationCode(value)

		// Clear field error on input change
		if (fieldErrors.verificationCode) {
			setFieldErrors(prev => {
				const newErrors = { ...prev }
				delete newErrors.verificationCode
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
		const firstNameValid = validateField('firstName', formData.firstName)
		const lastNameValid = validateField('lastName', formData.lastName)
		const emailValid = validateField('email', formData.email)
		const passwordValid = validateField('password', formData.password)
		const confirmPasswordValid = validateField('confirmPassword', formData.confirmPassword)

		if (!firstNameValid || !lastNameValid || !emailValid || !passwordValid || !confirmPasswordValid) {
			return
		}

		setIsSubmitting(true)
		setGlobalError('')

		try {
			await signUp.create({
				firstName: formData.firstName,
				lastName: formData.lastName,
				emailAddress: formData.email,
				password: formData.password,
			})

			// Prepare email verification
			await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
			setPendingVerification(true)
			setVerificationEmail(formData.email)
		} catch (err: any) {
			const errorMessage = translateClerkError(err, locale)
			setGlobalError(errorMessage)

			// Set specific field errors based on error codes
			if (err.errors?.[0]?.code === 'form_identifier_exists') {
				setFieldErrors(prev => ({
					...prev,
					email: { message: translateClerkError(err, locale), code: 'exists' }
				}))
			}
		} finally {
			setIsSubmitting(false)
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

		setIsVerifying(true)
		setGlobalError('')

		try {
			const completeSignUp = await signUp.attemptEmailAddressVerification({
				code: verificationCode,
			})

			if (completeSignUp.status === 'complete') {
				await setActive({ session: completeSignUp.createdSessionId })
				router.push(`/${locale}/dashboard`)
			} else {
				setGlobalError(t.somethingWentWrong)
			}
		} catch (err: any) {
			const errorMessage = translateClerkError(err, locale)
			setGlobalError(errorMessage)
			setFieldErrors(prev => ({
				...prev,
				verificationCode: { message: translateClerkError(err, locale), code: 'incorrect' }
			}))
		} finally {
			setIsVerifying(false)
		}
	}

	// Handle OAuth sign up
	const signUpWith = (strategy: 'oauth_google' | 'oauth_facebook') => {
		if (!signUp) return

		setIsSubmitting(true)
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
							setVerificationEmail('')
							setGlobalError('')
							setFieldErrors(prev => {
								const newErrors = { ...prev }
								delete newErrors.verificationCode
								return newErrors
							})
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
					disabled={isSubmitting}
				>
					<Icons.google className="mr-2 h-4 w-4" />
					{t.signUp.signUpWithGoogle}
				</Button>
				<Button
					variant="outline"
					size="lg"
					className="w-full"
					onClick={() => signUpWith('oauth_facebook')}
					disabled={isSubmitting}
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
						value={formData.firstName}
						onChange={handleInputChange('firstName')}
						error={fieldErrors.firstName}
						disabled={isSubmitting}
						autoComplete="given-name"
					/>

					<FormInput
						type="text"
						label={t.signUp.lastNameLabel}
						placeholder={t.signUp.lastNamePlaceholder}
						value={formData.lastName}
						onChange={handleInputChange('lastName')}
						error={fieldErrors.lastName}
						disabled={isSubmitting}
						autoComplete="family-name"
					/>
				</div>

				<FormInput
					type="email"
					label={t.signUp.emailLabel}
					placeholder={t.signUp.emailPlaceholder}
					value={formData.email}
					onChange={handleInputChange('email')}
					error={fieldErrors.email}
					disabled={isSubmitting}
					autoComplete="email"
				/>

				<div className="space-y-2">
					<FormInput
						type="password"
						label={t.signUp.passwordLabel}
						placeholder={t.signUp.passwordPlaceholder}
						value={formData.password}
						onChange={handleInputChange('password')}
						error={fieldErrors.password}
						disabled={isSubmitting}
						showPasswordToggle
						autoComplete="new-password"
					/>
					<PasswordStrength password={formData.password} show={formData.password.length > 0} locale={locale} />
				</div>

				<FormInput
					type="password"
					label={t.signUp.confirmPasswordLabel}
					placeholder={t.signUp.confirmPasswordPlaceholder}
					value={formData.confirmPassword}
					onChange={handleInputChange('confirmPassword')}
					error={fieldErrors.confirmPassword}
					disabled={isSubmitting}
					showPasswordToggle
					autoComplete="new-password"
				/>

				<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
					{isSubmitting ? (
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