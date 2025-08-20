'use client'

import { useState } from 'react'

import { toast } from 'sonner'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function EmailTestClient() {
	const [email, setEmail] = useState('')
	const [firstName, setFirstName] = useState('')
	const [code, setCode] = useState('TEST-123')
	const [locale, setLocale] = useState('fr')
	const [isLoading, setIsLoading] = useState<string | null>(null)

	const sendTestEmail = async (template: 'verification' | 'welcome') => {
		if (!email) {
			toast.error('Veuillez saisir une adresse email')
			return
		}

		setIsLoading(template)

		try {
			const payload: any = {
				template,
				locale,
				email,
			}

			if (template === 'verification') {
				payload.code = code
			} else if (template === 'welcome') {
				payload.firstName = firstName
			}

			const response = await fetch('/api/emails/test', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			})

			const result = await response.json()

			if (response.ok) {
				toast.success(`Email ${template} envoyé avec succès à ${email}`)
			} else {
				toast.error(`Erreur: ${result.error}`)
			}
		} catch (error) {
			toast.error("Erreur lors de l'envoi de l'email")
			console.error('Email sending error:', error)
		} finally {
			setIsLoading(null)
		}
	}

	const openPreview = (template: 'verification' | 'welcome') => {
		const params = new URLSearchParams({
			template,
			...(template === 'verification' && { code }),
			...(template === 'welcome' && { firstName }),
		})

		window.open(`/api/emails/preview?${params}`, '_blank')
	}

	return (
		<div className="container mx-auto max-w-4xl p-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Test des emails Beswib</h1>
				<p className="text-muted-foreground mt-2">Interface de test pour les templates d'emails React Email</p>
			</div>

			{/* Configuration globale */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Configuration</CardTitle>
					<CardDescription>Paramètres communs pour tous les tests d'emails</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label htmlFor="email">Adresse email de destination *</Label>
						<Input
							id="email"
							type="email"
							placeholder="test@example.com"
							value={email}
							onChange={e => setEmail(e.target.value)}
						/>
					</div>

					<div>
						<Label htmlFor="locale">Langue</Label>
						<Select value={locale} onValueChange={setLocale}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="fr">Français</SelectItem>
								<SelectItem value="en">English</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Tests d'emails */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Email de vérification */}
				<Card>
					<CardHeader>
						<CardTitle>Email de vérification</CardTitle>
						<CardDescription>Template pour la vérification d'adresse email avec code</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="code">Code de vérification</Label>
							<Input id="code" placeholder="ABC-123" value={code} onChange={e => setCode(e.target.value)} />
						</div>

						<div className="flex gap-2">
							<Button
								onClick={() => sendTestEmail('verification')}
								disabled={isLoading === 'verification' || !email}
								className="flex-1"
							>
								{isLoading === 'verification' ? 'Envoi...' : 'Envoyer'}
							</Button>
							<Button variant="outline" onClick={() => openPreview('verification')}>
								Aperçu
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Email de bienvenue */}
				<Card>
					<CardHeader>
						<CardTitle>Email de bienvenue</CardTitle>
						<CardDescription>Template d'accueil pour les nouveaux utilisateurs</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="firstName">Prénom (optionnel)</Label>
							<Input
								id="firstName"
								placeholder="Marie"
								value={firstName}
								onChange={e => setFirstName(e.target.value)}
							/>
						</div>

						<div className="flex gap-2">
							<Button
								onClick={() => sendTestEmail('welcome')}
								disabled={isLoading === 'welcome' || !email}
								className="flex-1"
							>
								{isLoading === 'welcome' ? 'Envoi...' : 'Envoyer'}
							</Button>
							<Button variant="outline" onClick={() => openPreview('welcome')}>
								Aperçu
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Instructions */}
			<Card className="mt-6">
				<CardHeader>
					<CardTitle>Instructions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-muted-foreground space-y-2 text-sm">
						<p>
							• Assurez-vous que la variable <code>RESEND_API_KEY</code> est configurée
						</p>
						<p>
							• L'adresse d'expédition est définie par <code>NOTIFY_EMAIL_FROM</code>
						</p>
						<p>• Vérifiez vos spams si vous ne recevez pas l'email</p>
						<p>• Utilisez "Aperçu" pour voir le rendu sans envoyer</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
