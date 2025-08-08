'use client'

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { useCallback, useEffect, useRef, useState } from 'react'

import { capturePayment, createOrder, onboardSeller } from '@/services/paypal.services'
import type { Locale } from '@/lib/i18n-config'
import { getTranslations } from '@/lib/getDictionary'

import paypalTranslations from './locales.json'

interface PaypalC2CProps {
	locale: Locale
}

export default function PaypalC2C({ locale }: PaypalC2CProps) {
	const t = getTranslations(locale, paypalTranslations)
	const [sellerUrl, setSellerUrl] = useState<null | string>(null)
	const [sellerId, setSellerId] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<null | string>(null)
	const [success, setSuccess] = useState<null | string>(null)
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
			if (data.error != null) {
				throw new Error(data.error)
			}
			setSellerUrl(data.action_url ?? null)
			setSuccess(t.onboardingSuccess)
		} catch (error: unknown) {
			console.error('Erreur onboarding:', error instanceof Error ? error.message : 'Unknown error')
			setError(t.onboardingError.replace('{error}', error instanceof Error ? error.message : 'Unknown error'))
		} finally {
			setLoading(false)
		}
	}

	const handleCreateOrder = useCallback(async () => {
		if (!sellerId.trim()) {
			const errorMsg = t.enterSellerId
			setError(errorMsg)
			throw new Error(t.sellerIdMissing)
		}

		try {
			setLoading(true)
			setError(null)

			const data = await createOrder(sellerId.trim(), '10.00')
			if (data.error != null) {
				throw new Error(data.error)
			}

			console.info(t.orderCreated, data)
			return data.id ?? ''
		} catch (error: unknown) {
			const errorMsg = t.orderError.replace('{error}', error instanceof Error ? error.message : 'Unknown error')
			console.error('Erreur création order:', error instanceof Error ? error.message : 'Unknown error')
			setError(errorMsg)
			throw new Error(errorMsg)
		} finally {
			setLoading(false)
		}
	}, [sellerId])

	const onApprove = useCallback(async (data: { orderID: string }) => {
		try {
			setLoading(true)
			setError(null)

			const res = await capturePayment(data.orderID)
			if (res.error != null) {
				throw new Error(res.error)
			}

			setSuccess(t.paymentCaptured)
			console.info(t.paymentCaptured, res)

			// Reset after successful payment
			setTimeout(() => {
				setSuccess(null)
			}, 5000)
		} catch (error: unknown) {
			const errorMsg =
				'Erreur pendant la capture du paiement: ' + (error instanceof Error ? error.message : 'Unknown error')
			console.error('Erreur capture:', error instanceof Error ? error.message : 'Unknown error')
			setError(errorMsg)
		} finally {
			setLoading(false)
		}
	}, [])

	const onError = useCallback((err: Record<string, unknown>) => {
		console.error('PayPal Error:', err)
		const message = typeof err.message === 'string' ? err.message : 'Une erreur inconnue est survenue'
		setError('Erreur PayPal: ' + message)
		setLoading(false)
	}, [])

	const onCancel = useCallback(() => {
		console.info('PayPal payment cancelled')
		setError(t.paymentCancelled)
		setLoading(false)
	}, [])

	return (
		<div
			style={{
				padding: 20,
				maxWidth: 600,
				margin: '0 auto',
				fontFamily: 'sans-serif',
			}}
		>
			<h2>Marketplace C2C - Sandbox Test</h2>

			{/* Onboarding Section */}
			<div
				style={{
					padding: 20,
					marginBottom: 30,
					borderRadius: 8,
					border: '1px solid #ddd',
				}}
			>
				<h3>1. Onboarding Vendeur</h3>
				<button
					disabled={loading}
					onClick={() => {
						void onboard()
					}}
					style={{
						padding: '10px 20px',
						cursor: loading ? 'not-allowed' : 'pointer',
						color: 'white',
						borderRadius: 4,
						border: 'none',
						backgroundColor: loading ? '#ccc' : '#007cba',
					}}
				>
					{loading ? t.creating : t.createSeller}
				</button>

				{sellerUrl != null && (
					<div style={{ marginTop: 10 }}>
						<p>{t.onboardingGenerated}</p>
						<a
							href={sellerUrl}
							rel="noreferrer"
							style={{
								textDecoration: 'none',
								padding: '8px 16px',
								display: 'inline-block',
								color: 'white',
								borderRadius: 4,
								backgroundColor: '#28a745',
							}}
							target="_blank"
						>
							{t.completeOnboarding}
						</a>
					</div>
				)}
			</div>

			{/* Payment Section */}
			<div style={{ padding: 20, borderRadius: 8, border: '1px solid #ddd' }}>
				<h3>2. Test de Paiement</h3>

				{error != null && (
					<div
						style={{
							padding: 10,
							marginBottom: 15,
							color: '#721c24',
							borderRadius: 4,
							border: '1px solid #f5c6cb',
							backgroundColor: '#f8d7da',
						}}
					>
						❌ {error}
					</div>
				)}

				{success != null && (
					<div
						style={{
							padding: 10,
							marginBottom: 15,
							color: '#155724',
							borderRadius: 4,
							border: '1px solid #c3e6cb',
							backgroundColor: '#d4edda',
						}}
					>
						✅ {success}
					</div>
				)}

				<input
					onChange={e => setSellerId(e.target.value)}
					placeholder="Seller Merchant ID (ex: 56HWWPL2WXLVL)"
					style={{
						width: '100%',
						padding: 10,
						marginBottom: 15,
						fontSize: 14,
						borderRadius: 4,
						border: '1px solid #ddd',
					}}
					type="text"
					value={sellerId}
				/>

				<div ref={paypalContainerRef}>
					{sellerId.trim() && (
						<PayPalScriptProvider
							deferLoading={false}
							options={{
								intent: 'capture',
								currency: 'EUR',
								clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '',
							}}
						>
							<PayPalButtons
								createOrder={handleCreateOrder}
								disabled={loading || !sellerId.trim()}
								key={sellerId} // Force re-render when sellerId changes
								onApprove={onApprove}
								onCancel={onCancel}
								onError={onError}
								style={{
									shape: 'rect',
									layout: 'vertical',
									label: 'paypal',
									height: 50,
									color: 'blue',
								}}
							/>
						</PayPalScriptProvider>
					)}

					{!sellerId.trim() && (
						<div
							style={{
								textAlign: 'center',
								padding: 20,
								color: '#6c757d',
								borderRadius: 4,
								border: '2px dashed #dee2e6',
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
