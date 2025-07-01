'use client'

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { useCallback, useEffect, useRef, useState } from 'react'

import { capturePayment, createOrder, onboardSeller } from '@/services/paypal.services'

export default function PaypalC2C() {
	const [sellerUrl, setSellerUrl] = useState<string | null>(null)
	const [sellerId, setSellerId] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const paypalContainerRef = useRef<HTMLDivElement>(null)

	// Clear errors when sellerId changes
	useEffect(() => {
		setError(null)
		setSuccess(null)
	}, [sellerId])

	const onboard = async () => {
		try {
			setLoading(true)
			setError(null)
			const tracking_id = 'seller_' + Date.now()
			const data = await onboardSeller(tracking_id)
			if (data.error) {
				throw new Error(data.error)
			}
			setSellerUrl(data.action_url!)
			setSuccess("Lien d'onboarding généré avec succès!")
		} catch (e: any) {
			console.error('Erreur onboarding:', e.message)
			setError("Erreur pendant l'onboarding: " + e.message)
		} finally {
			setLoading(false)
		}
	}

	const handleCreateOrder = useCallback(async () => {
		if (!sellerId.trim()) {
			const errorMsg = 'Merci de renseigner un sellerId'
			setError(errorMsg)
			throw new Error('Seller ID manquant')
		}

		try {
			setLoading(true)
			setError(null)

			const data = await createOrder(sellerId.trim(), '10.00')
			if (data.error) {
				throw new Error(data.error)
			}

			console.log('Order créée :', data)
			return data.id!
		} catch (e: any) {
			const errorMsg = 'Erreur pendant la création de la commande: ' + e.message
			console.error('Erreur création order:', e.message)
			setError(errorMsg)
			throw new Error(errorMsg)
		} finally {
			setLoading(false)
		}
	}, [sellerId])

	const onApprove = useCallback(async (data: any) => {
		try {
			setLoading(true)
			setError(null)

			const res = await capturePayment(data.orderID)
			if (res.error) {
				throw new Error(res.error)
			}

			setSuccess('Paiement capturé avec succès!')
			console.log('Paiement capturé:', res)

			// Reset after successful payment
			setTimeout(() => {
				setSuccess(null)
			}, 5000)
		} catch (e: any) {
			const errorMsg = 'Erreur pendant la capture du paiement: ' + e.message
			console.error('Erreur capture:', e.message)
			setError(errorMsg)
		} finally {
			setLoading(false)
		}
	}, [])

	const onError = useCallback((err: any) => {
		console.error('PayPal Error:', err)
		setError('Erreur PayPal: ' + (err.message ?? 'Une erreur inconnue est survenue'))
		setLoading(false)
	}, [])

	const onCancel = useCallback(() => {
		console.log('PayPal payment cancelled')
		setError("Paiement annulé par l'utilisateur")
		setLoading(false)
	}, [])

	return (
		<div
			style={{
				padding: 20,
				fontFamily: 'sans-serif',
				maxWidth: 600,
				margin: '0 auto',
			}}
		>
			<h2>Marketplace C2C - Sandbox Test</h2>

			{/* Onboarding Section */}
			<div
				style={{
					marginBottom: 30,
					padding: 20,
					border: '1px solid #ddd',
					borderRadius: 8,
				}}
			>
				<h3>1. Onboarding Vendeur</h3>
				<button
					onClick={onboard}
					disabled={loading}
					style={{
						padding: '10px 20px',
						backgroundColor: loading ? '#ccc' : '#007cba',
						color: 'white',
						border: 'none',
						borderRadius: 4,
						cursor: loading ? 'not-allowed' : 'pointer',
					}}
				>
					{loading ? 'Création...' : 'Créer un vendeur (onboarding)'}
				</button>

				{sellerUrl && (
					<div style={{ marginTop: 10 }}>
						<p>✅ Lien d'onboarding généré!</p>
						<a
							href={sellerUrl}
							target="_blank"
							rel="noreferrer"
							style={{
								display: 'inline-block',
								padding: '8px 16px',
								backgroundColor: '#28a745',
								color: 'white',
								textDecoration: 'none',
								borderRadius: 4,
							}}
						>
							Terminer l'onboarding du vendeur
						</a>
					</div>
				)}
			</div>

			{/* Payment Section */}
			<div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
				<h3>2. Test de Paiement</h3>

				{error && (
					<div
						style={{
							color: '#721c24',
							backgroundColor: '#f8d7da',
							padding: 10,
							borderRadius: 4,
							marginBottom: 15,
							border: '1px solid #f5c6cb',
						}}
					>
						❌ {error}
					</div>
				)}

				{success && (
					<div
						style={{
							color: '#155724',
							backgroundColor: '#d4edda',
							padding: 10,
							borderRadius: 4,
							marginBottom: 15,
							border: '1px solid #c3e6cb',
						}}
					>
						✅ {success}
					</div>
				)}

				<input
					type="text"
					placeholder="Seller Merchant ID (ex: 56HWWPL2WXLVL)"
					value={sellerId}
					onChange={e => setSellerId(e.target.value)}
					style={{
						padding: 10,
						marginBottom: 15,
						width: '100%',
						border: '1px solid #ddd',
						borderRadius: 4,
						fontSize: 14,
					}}
				/>

				<div ref={paypalContainerRef}>
					{sellerId.trim() && (
						<PayPalScriptProvider
							options={{
								clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
								currency: 'EUR',
								intent: 'capture',
							}}
							deferLoading={false}
						>
							<PayPalButtons
								key={sellerId} // Force re-render when sellerId changes
								disabled={loading || !sellerId.trim()}
								createOrder={handleCreateOrder}
								onApprove={onApprove}
								onError={onError}
								onCancel={onCancel}
								style={{
									layout: 'vertical',
									color: 'blue',
									shape: 'rect',
									label: 'paypal',
									height: 50,
								}}
							/>
						</PayPalScriptProvider>
					)}

					{!sellerId.trim() && (
						<div
							style={{
								padding: 20,
								textAlign: 'center',
								color: '#6c757d',
								border: '2px dashed #dee2e6',
								borderRadius: 4,
							}}
						>
							Veuillez entrer un Seller Merchant ID pour afficher les boutons PayPal
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
