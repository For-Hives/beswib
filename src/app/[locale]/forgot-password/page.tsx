'use client'

import { useState } from 'react'

import { useSignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import AuthSplitScreen from '@/components/ui/AuthSplitScreen'
import { Input } from '@/components/ui/inputAlt'
import { Button } from '@/components/ui/button'
import { authTranslations } from '@/lib/translations/auth'
import { Locale } from '@/lib/i18n-config'
import { translateClerkError } from '@/lib/clerkErrorTranslations'

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [code, setCode] = useState('')
	const [isLoading] = useState(false)
	const [error, setError] = useState('')
	const [successfulCreation, setSuccessfulCreation] = useState(false)
	const [complete, setComplete] = useState(false)

	const { signIn, setActive } = useSignIn()
	const params = useParams()
	const locale = ((params?.locale as string) || 'en') as Locale
	const t = authTranslations[locale]

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
			.catch((err: any) => {
				const msg = translateClerkError(err, locale)
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
			.catch((err: any) => {
				const msg = translateClerkError(err, locale)
				console.error('error', msg)
				setError(msg)
			})
	}

	return (
		<>
			<SignedOut>
				<AuthSplitScreen>
					<div className="w-full max-w-md space-y-6">
						<div className="space-y-2 text-center">
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
								<Button asChild size="lg" className="w-full">
									<Link href={`/${locale}/dashboard`}>{t.forgotPassword.continueToDashboard}</Link>
								</Button>
							</div>
						)}

						<div className="text-center">
							<Link
								href={`/${locale}/sign-in`}
								className="text-muted-foreground hover:text-foreground text-sm transition-colors"
							>
								{t.forgotPassword.backToSignIn}
							</Link>
						</div>
					</div>
				</AuthSplitScreen>
			</SignedOut>
			<RedirectToSignIn />
		</>
	)
}
