'use client'

import { useState } from 'react'
import { useAuth, useSignIn } from '@clerk/nextjs'
import Link from 'next/link'

import { Input } from '@/components/ui/inputAlt'
import { Button } from '@/components/ui/button'
import AuthSplitScreen from '@/components/ui/AuthSplitScreen'

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [code, setCode] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [successfulCreation, setSuccessfulCreation] = useState(false)
	const [secondFactor, setSecondFactor] = useState(false)
	const [complete, setComplete] = useState(false)

	const { isSignedIn } = useAuth()
	const { isLoaded, signIn, setActive } = useSignIn()

	if (!isLoaded) {
		return <div>Loading...</div>
	}

	// If the user is already signed in,
	// redirect them to the home page
	if (isSignedIn) {
		return <div>Already signed in</div>
	}

	// Send the password reset code to the user's email
	async function create(e: React.FormEvent) {
		e.preventDefault()
		await signIn
			?.create({
				strategy: 'reset_password_email_code',
				identifier: email,
			})
			.then(_ => {
				setSuccessfulCreation(true)
				setError('')
			})
			.catch(err => {
				console.error('error', err.errors[0].longMessage)
				setError(err.errors[0].longMessage)
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
				code,
				password,
			})
			.then(result => {
				// Check if 2FA is required
				if (result.status === 'needs_second_factor') {
					setSecondFactor(true)
					setError('')
				} else if (result.status === 'complete') {
					// Set the active session to
					// the newly created session (user is now signed in)
					setActive({ session: result.createdSessionId })
					setComplete(true)
				} else {
					console.log(result)
				}
			})
			.catch(err => {
				console.error('error', err.errors[0].longMessage)
				setError(err.errors[0].longMessage)
			})
	}

	return (
		<AuthSplitScreen>
			<div className="w-full max-w-md space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-foreground text-2xl font-bold tracking-tight">Mot de passe oublié</h1>
					{!successfulCreation && !complete && (
						<p className="text-muted-foreground text-sm">
							Entrez votre adresse email pour recevoir un code de réinitialisation
						</p>
					)}
					{successfulCreation && !complete && (
						<p className="text-muted-foreground text-sm">Nous avons envoyé un code de réinitialisation à votre email</p>
					)}
					{complete && <p className="text-sm text-emerald-600">Votre mot de passe a été réinitialisé avec succès !</p>}
				</div>

				{!successfulCreation && !complete && (
					<form onSubmit={create} className="space-y-4">
						{error && (
							<div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
								{error}
							</div>
						)}

						<div className="space-y-2">
							<label htmlFor="email" className="text-foreground text-sm font-medium">
								Adresse email
							</label>
							<Input
								type="email"
								placeholder="votre@email.com"
								value={email}
								onChange={e => setEmail(e.target.value)}
								required
							/>
						</div>

						<Button type="submit" size="lg" className="w-full" disabled={isLoading}>
							Envoyer le code
						</Button>
					</form>
				)}

				{successfulCreation && !complete && (
					<form onSubmit={reset} className="space-y-4">
						{error && (
							<div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
								{error}
							</div>
						)}

						<div className="space-y-2">
							<label htmlFor="password" className="text-foreground text-sm font-medium">
								Nouveau mot de passe
							</label>
							<Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
						</div>

						<div className="space-y-2">
							<label htmlFor="code" className="text-foreground text-sm font-medium">
								Code de réinitialisation
							</label>
							<Input
								type="text"
								placeholder="123456"
								value={code}
								onChange={e => setCode(e.target.value)}
								required
								className="text-center font-mono text-lg tracking-wider"
							/>
						</div>

						<Button type="submit" size="lg" className="w-full" disabled={isLoading}>
							Réinitialiser le mot de passe
						</Button>
					</form>
				)}

				{complete && (
					<div className="text-center">
						<Button asChild size="lg" className="w-full">
							<Link href="/dashboard">Continuer vers le tableau de bord</Link>
						</Button>
					</div>
				)}

				<div className="text-center">
					<Link href="/sign-in" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
						← Retour à la connexion
					</Link>
				</div>
			</div>
		</AuthSplitScreen>
	)
}
