'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Shield, AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/inputAlt'
import { Label } from '@/components/ui/label'

interface TokenValidationProps {
	bibId: string
	locale: string
	onValidToken: (token: string) => void
	translations: {
		title?: string
		description?: string
		tokenLabel?: string
		tokenPlaceholder?: string
		validateButton?: string
		invalidToken?: string
		requiredToken?: string
		backToMarketplace?: string
		errorTitle?: string
		validationFailedTitle?: string
		validationFailedDesc?: string
		tryAgainButton?: string
	}
}

export default function TokenValidation({ bibId, locale, onValidToken, translations: t }: TokenValidationProps) {
	const [token, setToken] = useState('')
	const [isValidating, setIsValidating] = useState(false)
	const [error, setError] = useState('')
	const [isSuccess, setIsSuccess] = useState(false)
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!token.trim()) {
			setError(t.requiredToken ?? 'Private token is required')
			return
		}

		setIsValidating(true)
		setError('')

		try {
			// Validate token by attempting to fetch the private bib
			const response = await fetch(`/api/validate-private-token`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ bibId, token: token.trim() }),
			})

			if (response.ok) {
				// Token is valid, redirect with token in URL
				onValidToken(token.trim())
			} else {
				setError(t.invalidToken ?? 'Invalid private token')
			}
		} catch (error) {
			console.error('Token validation error:', error)
			setError(t.invalidToken ?? 'Invalid private token')
		} finally {
			setIsValidating(false)
		}
	}

	const handleBackToMarketplace = () => {
		router.push(`/${locale}/marketplace`)
	}

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

			{/* Back Navigation */}
			<div className="bg-card/25 border-border/30 absolute top-0 right-0 left-0 z-20 mx-4 mt-12 mb-6 rounded-2xl border p-4 backdrop-blur-sm">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" onClick={handleBackToMarketplace}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						{t.backToMarketplace ?? 'Back to Marketplace'}
					</Button>
				</div>
			</div>

			<div className="relative flex min-h-screen items-center justify-center pt-32 pb-12">
				<Card className="bg-card/80 dark:border-border/50 mx-4 w-full max-w-md border-black/50 backdrop-blur-sm">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
							<Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
						</div>
						<CardTitle className="flex items-center justify-center gap-2 text-xl">
							<Lock className="h-5 w-5" />
							{t.title ?? 'Private Listing Access'}
						</CardTitle>
						<CardDescription className="text-center">
							{t.description ?? 'This is a private bib listing. Please enter the private token to access it.'}
						</CardDescription>
					</CardHeader>

					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="token">{t.tokenLabel ?? 'Private Token'}</Label>
								<Input
									id="token"
									type="text"
									value={token}
									onChange={e => setToken(e.target.value)}
									placeholder={t.tokenPlaceholder ?? 'Enter your private token...'}
									disabled={isValidating}
									className="font-mono"
									autoFocus
								/>
							</div>

							{error && (
								<Alert variant="destructive">
									<AlertTriangle className="h-4 w-4" />
									<AlertTitle>{t.errorTitle || 'Access Denied'}</AlertTitle>
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<Button type="submit" className="w-full" disabled={isValidating || !token.trim()}>
								{isValidating ? (
									<>
										<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
										Validating...
									</>
								) : (
									<>
										<Shield className="mr-2 h-4 w-4" />
										{t.validateButton ?? 'Access Private Listing'}
									</>
								)}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
