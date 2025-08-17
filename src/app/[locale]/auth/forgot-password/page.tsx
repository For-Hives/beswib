'use client'

import { useState, useEffect } from 'react'

import { useParams, useRouter } from 'next/navigation'
import { useAuth, useSignIn } from '@clerk/nextjs'
import Link from 'next/link'

import AuthSplitScreen from '@/components/ui/AuthSplitScreen'
import { getTranslations } from '@/lib/i18n/dictionary'
import mainLocales from '@/app/[locale]/locales.json'
import { Input } from '@/components/ui/inputAlt'
import { Button } from '@/components/ui/button'
import { Locale } from '@/lib/i18n/config'

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [code, setCode] = useState('')
	const [isLoading] = useState(false)
	const [error, setError] = useState('')
	const [successfulCreation, setSuccessfulCreation] = useState(false)
	const [complete, setComplete] = useState(false)

	const { signIn, setActive } = useSignIn()
	const { isSignedIn, isLoaded } = useAuth()
	const router = useRouter()
	const params = useParams()
	const locale = ((params?.locale as string) || 'en') as Locale
	const t = getTranslations(locale, mainLocales).auth
	const { clerkErrors: errorsT } = getTranslations(locale, mainLocales) as {
		clerkErrors: Record<string, string>
	}

	function translateClerkErrorLocal(error: unknown): string {
		const e = (error ?? {}) as Partial<{
			code: string
			message: string
			errors: Array<Partial<{ code: string; message: string; longMessage: string }>>
		}>
		const code = e.code ?? e.errors?.[0]?.code
		const message = e.message ?? e.errors?.[0]?.message ?? e.errors?.[0]?.longMessage
		if (typeof code === 'string' && errorsT[code]) return errorsT[code]
		if (typeof message === 'string') {
			const m = message.toLowerCase()
			if (m.includes('password') && m.includes('incorrect')) return errorsT.form_password_incorrect
			if (m.includes('email') && m.includes('not found')) return errorsT.form_identifier_not_found
			if (m.includes('already exists') || m.includes('already taken')) return errorsT.form_identifier_exists
			if (m.includes('verification') && m.includes('code')) return errorsT.form_code_incorrect
			if (m.includes('expired')) return errorsT.verification_expired
			if (m.includes('rate limit') || m.includes('too many')) return errorsT.too_many_requests
			return message
		}
		return errorsT.default_error
	}

	// Redirect if already signed in
	useEffect(() => {
		if (isLoaded && isSignedIn) {
			router.push(`/${locale}/dashboard`)
		}
	}, [isLoaded, isSignedIn, router, locale])

	// Send the password reset code to the user's email
	async function create(e: React.FormEvent) {
		e.preventDefault()
		await signIn
			?.create({
				strategy: 'reset_password_email_code',
				identifier: email,
			})
			.then(() => {
				setSuccessfulCreation(true)
				setError('')
			})
			.catch((err: unknown) => {
				const msg = translateClerkErrorLocal(err)
				console.error('error', msg)
				setError(msg)
			})
	}

	// Reset the user's password.
	// Upon successful reset, the user will be
	// signed in and redirected to the home page
	async function reset(e: React.FormEvent) {
		e.preventDefault()
		await signIn
			?.attemptFirstFactor({
				strategy: 'reset_password_email_code',
				password,
				code,
			})
			.then(result => {
				// Check if 2FA is required
				if (result.status === 'needs_second_factor') {
					setError('')
				} else if (result.status === 'complete') {
					// Set the active session to
					// the newly created session (user is now signed in)
					void setActive({ session: result.createdSessionId })
					setComplete(true)
				} else {
					console.error(result)
				}
			})
			.catch((err: unknown) => {
				const msg = translateClerkErrorLocal(err)
				console.error('error', msg)
				setError(msg)
			})
	}

	return (
		<AuthSplitScreen>
			<div className="w-full max-w-md space-y-6">
				<div className="space-y-2 text-start">
					<h1 className="text-foreground text-2xl font-bold tracking-tight">{t.forgotPassword.title}</h1>
					{!successfulCreation && !complete && (
						<p className="text-muted-foreground text-sm">{t.forgotPassword.subtitle}</p>
					)}
					{successfulCreation && !complete && (
						<p className="text-muted-foreground text-sm">{t.forgotPassword.emailSentSubtitle}</p>
					)}
					{complete && <p className="text-sm text-emerald-600">{t.forgotPassword.successSubtitle}</p>}
				</div>

				{!successfulCreation && !complete && (
					<form onSubmit={e => void create(e)} className="space-y-4">
						{error && (
							<div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
								{error}
							</div>
						)}

						<div className="space-y-2">
							<label htmlFor="email" className="text-foreground text-sm font-medium">
								{t.forgotPassword.emailLabel}
							</label>
							<Input
								type="email"
								placeholder={t.forgotPassword.emailPlaceholder}
								value={email}
								onChange={e => setEmail(e.target.value)}
								required
							/>
						</div>

						<Button type="submit" size="lg" className="w-full" disabled={isLoading}>
							{t.forgotPassword.sendCodeButton}
						</Button>
					</form>
				)}

				{successfulCreation && !complete && (
					<form onSubmit={e => void reset(e)} className="space-y-4">
						{error && (
							<div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
								{error}
							</div>
						)}

						<div className="space-y-2">
							<label htmlFor="password" className="text-foreground text-sm font-medium">
								{t.forgotPassword.newPasswordLabel}
							</label>
							<Input
								type="password"
								placeholder={t.placeholders.password}
								value={password}
								onChange={e => setPassword(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="code" className="text-foreground text-sm font-medium">
								{t.forgotPassword.resetCodeLabel}
							</label>
							<Input
								type="text"
								placeholder={t.forgotPassword.resetCodePlaceholder}
								value={code}
								onChange={e => setCode(e.target.value)}
								required
								className="text-center font-mono text-lg tracking-wider"
							/>
						</div>

						<Button type="submit" size="lg" className="w-full" disabled={isLoading}>
							{t.forgotPassword.resetPasswordButton}
						</Button>
					</form>
				)}

				{complete && (
					<div className="text-center">
						<Link
							href={`/${locale}/dashboard`}
							className="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 w-full items-center justify-center rounded-md px-8 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
						>
							{t.forgotPassword.continueToDashboard}
						</Link>
					</div>
				)}

				<div className="text-center">
					<Link
						href={`/${locale}/auth/sign-in`}
						className="text-muted-foreground hover:text-foreground text-sm transition-colors"
					>
						{t.forgotPassword.backToSignIn}
					</Link>
				</div>
			</div>
		</AuthSplitScreen>
	)
}
