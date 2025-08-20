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
	const [sellerName, setSellerName] = useState('Marie Dupont')
	const [buyerName, setBuyerName] = useState('Jean Martin')
	const [eventName, setEventName] = useState('Marathon de Paris 2024')
	const [bibPrice, setBibPrice] = useState(150)
	const [orderId, setOrderId] = useState('BW123456789')
	const [eventDistance, setEventDistance] = useState('42.2 km')
	const [bibCategory, setBibCategory] = useState('Marathon')
	const [sellerEmail, setSellerEmail] = useState('seller@example.com')
	const [buyerEmail, setBuyerEmail] = useState('buyer@example.com')
	const [transactionId, setTransactionId] = useState('tx_abc123def')
	const [paypalCaptureId, setPaypalCaptureId] = useState('CAPTURE123456789')
	const [locale, setLocale] = useState('fr')
	const [isLoading, setIsLoading] = useState<string | null>(null)

	const sendTestEmail = async (
		template: 'verification' | 'welcome' | 'sale-confirmation' | 'purchase-confirmation' | 'sale-alert'
	) => {
		if (!email) {
			toast.error('Veuillez saisir une adresse email')
			return
		}

		setIsLoading(template)

		try {
			const payload: Record<string, string> = {
				template,
				locale,
				email,
			}

			if (template === 'verification') {
				payload.code = code
			} else if (template === 'welcome') {
				payload.firstName = firstName
			} else if (template === 'sale-confirmation') {
				payload.sellerName = sellerName
				payload.buyerName = buyerName
				payload.eventName = eventName
				payload.bibPrice = bibPrice.toString()
				payload.orderId = orderId
			} else if (template === 'purchase-confirmation') {
				payload.buyerName = buyerName
				payload.sellerName = sellerName
				payload.eventName = eventName
				payload.bibPrice = bibPrice.toString()
				payload.orderId = orderId
				payload.eventDistance = eventDistance
				payload.bibCategory = bibCategory
			} else if (template === 'sale-alert') {
				payload.sellerName = sellerName
				payload.sellerEmail = sellerEmail
				payload.buyerName = buyerName
				payload.buyerEmail = buyerEmail
				payload.eventName = eventName
				payload.bibPrice = bibPrice.toString()
				payload.orderId = orderId
				payload.eventDistance = eventDistance
				payload.bibCategory = bibCategory
				payload.transactionId = transactionId
				payload.paypalCaptureId = paypalCaptureId
			}

			const response = await fetch('/api/emails/test', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			})

			const result = (await response.json()) as { error?: string }

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

	const openPreview = (
		template: 'verification' | 'welcome' | 'sale-confirmation' | 'purchase-confirmation' | 'sale-alert'
	) => {
		const params = new URLSearchParams({
			template,
			locale,
			...(template === 'verification' && { code }),
			...(template === 'welcome' && { firstName }),
			...(template === 'sale-confirmation' && {
				sellerName,
				orderId,
				eventName,
				buyerName,
				bibPrice: bibPrice.toString(),
			}),
			...(template === 'purchase-confirmation' && {
				sellerName,
				orderId,
				eventName,
				eventDistance,
				buyerName,
				bibPrice: bibPrice.toString(),
				bibCategory,
			}),
			...(template === 'sale-alert' && {
				transactionId,
				sellerName,
				sellerEmail,
				paypalCaptureId,
				orderId,
				eventName,
				eventDistance,
				buyerName,
				buyerEmail,
				bibPrice: bibPrice.toString(),
				bibCategory,
			}),
		})

		window.open(`/api/emails/preview?${params}`, '_blank')
	}

	return (
		<div className="container mx-auto max-w-7xl p-6">
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
								<SelectItem value="es">Español</SelectItem>
								<SelectItem value="it">Italiano</SelectItem>
								<SelectItem value="de">Deutsch</SelectItem>
								<SelectItem value="pt">Português</SelectItem>
								<SelectItem value="nl">Nederlands</SelectItem>
								<SelectItem value="ko">한국어</SelectItem>
								<SelectItem value="ro">Română</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Tests d'emails */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
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
								onClick={() => void sendTestEmail('verification')}
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
								onClick={() => void sendTestEmail('welcome')}
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

				{/* Email de confirmation de vente */}
				<Card>
					<CardHeader>
						<CardTitle>Email de confirmation de vente</CardTitle>
						<CardDescription>Template envoyé au vendeur après une vente réussie</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="sellerName">Nom du vendeur</Label>
							<Input
								id="sellerName"
								placeholder="Marie Dupont"
								value={sellerName}
								onChange={e => setSellerName(e.target.value)}
							/>
						</div>

						<div>
							<Label htmlFor="buyerName">Nom de l'acheteur</Label>
							<Input
								id="buyerName"
								placeholder="Jean Martin"
								value={buyerName}
								onChange={e => setBuyerName(e.target.value)}
							/>
						</div>

						<div>
							<Label htmlFor="eventName">Nom de l'événement</Label>
							<Input
								id="eventName"
								placeholder="Marathon de Paris 2024"
								value={eventName}
								onChange={e => setEventName(e.target.value)}
							/>
						</div>

						<div>
							<Label htmlFor="bibPrice">Prix du dossard (€)</Label>
							<Input
								id="bibPrice"
								type="number"
								placeholder="150"
								value={bibPrice}
								onChange={e => setBibPrice(Number(e.target.value))}
							/>
						</div>

						<div>
							<Label htmlFor="orderId">N° de commande</Label>
							<Input
								id="orderId"
								placeholder="BW123456789"
								value={orderId}
								onChange={e => setOrderId(e.target.value)}
							/>
						</div>

						<div className="flex gap-2">
							<Button
								onClick={() => void sendTestEmail('sale-confirmation')}
								disabled={isLoading === 'sale-confirmation' || !email}
								className="flex-1"
							>
								{isLoading === 'sale-confirmation' ? 'Envoi...' : 'Envoyer'}
							</Button>
							<Button variant="outline" onClick={() => openPreview('sale-confirmation')}>
								Aperçu
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Email de confirmation d'achat */}
				<Card>
					<CardHeader>
						<CardTitle>Email de confirmation d'achat</CardTitle>
						<CardDescription>Template envoyé à l'acheteur après un achat réussi</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="buyerNamePurchase">Nom de l'acheteur</Label>
							<Input
								id="buyerNamePurchase"
								placeholder="Jean Martin"
								value={buyerName}
								onChange={e => setBuyerName(e.target.value)}
							/>
						</div>

						<div>
							<Label htmlFor="sellerNamePurchase">Nom du vendeur</Label>
							<Input
								id="sellerNamePurchase"
								placeholder="Marie Dupont"
								value={sellerName}
								onChange={e => setSellerName(e.target.value)}
							/>
						</div>

						<div>
							<Label htmlFor="eventNamePurchase">Nom de l'événement</Label>
							<Input
								id="eventNamePurchase"
								placeholder="Marathon de Paris 2024"
								value={eventName}
								onChange={e => setEventName(e.target.value)}
							/>
						</div>

						<div>
							<Label htmlFor="eventDistance">Distance</Label>
							<Input
								id="eventDistance"
								placeholder="42.2 km"
								value={eventDistance}
								onChange={e => setEventDistance(e.target.value)}
							/>
						</div>

						<div>
							<Label htmlFor="bibCategory">Catégorie</Label>
							<Input
								id="bibCategory"
								placeholder="Marathon"
								value={bibCategory}
								onChange={e => setBibCategory(e.target.value)}
							/>
						</div>

						<div className="flex gap-2">
							<Button
								onClick={() => void sendTestEmail('purchase-confirmation')}
								disabled={isLoading === 'purchase-confirmation' || !email}
								className="flex-1"
							>
								{isLoading === 'purchase-confirmation' ? 'Envoi...' : 'Envoyer'}
							</Button>
							<Button variant="outline" onClick={() => openPreview('purchase-confirmation')}>
								Aperçu
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Email d'alerte admin */}
				<Card>
					<CardHeader>
						<CardTitle>Email d'alerte admin</CardTitle>
						<CardDescription>Template d'alerte envoyé aux administrateurs lors d'une vente</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="sellerEmailAdmin">Email vendeur</Label>
							<Input
								id="sellerEmailAdmin"
								placeholder="seller@example.com"
								value={sellerEmail}
								onChange={e => setSellerEmail(e.target.value)}
							/>
						</div>

						<div>
							<Label htmlFor="buyerEmailAdmin">Email acheteur</Label>
							<Input
								id="buyerEmailAdmin"
								placeholder="buyer@example.com"
								value={buyerEmail}
								onChange={e => setBuyerEmail(e.target.value)}
							/>
						</div>

						<div>
							<Label htmlFor="transactionId">ID Transaction</Label>
							<Input
								id="transactionId"
								placeholder="tx_abc123def"
								value={transactionId}
								onChange={e => setTransactionId(e.target.value)}
							/>
						</div>

						<div>
							<Label htmlFor="paypalCaptureId">PayPal Capture ID</Label>
							<Input
								id="paypalCaptureId"
								placeholder="CAPTURE123456789"
								value={paypalCaptureId}
								onChange={e => setPaypalCaptureId(e.target.value)}
							/>
						</div>

						<div className="flex gap-2">
							<Button
								onClick={() => void sendTestEmail('sale-alert')}
								disabled={isLoading === 'sale-alert' || !email}
								className="flex-1"
							>
								{isLoading === 'sale-alert' ? 'Envoi...' : 'Envoyer'}
							</Button>
							<Button variant="outline" onClick={() => openPreview('sale-alert')}>
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
