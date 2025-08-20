import { render } from '@react-email/components'
import React from 'react'

import { NextRequest, NextResponse } from 'next/server'

import BeswibPurchaseConfirmation from '@/components/emails/BeswibPurchaseConfirmation'
import { BeswibEmailVerification, BeswibWelcomeEmail } from '@/components/emails'
import BeswibSaleConfirmation from '@/components/emails/BeswibSaleConfirmation'
import BeswibSaleAlert from '@/components/emails/BeswibSaleAlert'

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const template = searchParams.get('template')
	const code = searchParams.get('code') ?? 'ABC-123'
	const firstName = searchParams.get('firstName') ?? 'Marie'
	const sellerName = searchParams.get('sellerName') ?? 'Marie Dupont'
	const buyerName = searchParams.get('buyerName') ?? 'Jean Martin'
	const eventName = searchParams.get('eventName') ?? 'Marathon de Paris 2024'
	const bibPrice = Number(searchParams.get('bibPrice')) || 150
	const orderId = searchParams.get('orderId') ?? 'BW123456789'
	const locale = searchParams.get('locale') ?? 'fr'

	// Paramètres optionnels pour personnaliser les frais
	const customPlatformRate = Number(searchParams.get('platformRate')) || 0.1 // Default 10%
	const customPaypalRate = Number(searchParams.get('paypalRate')) || 0.035 // Default 3.5%

	try {
		let emailComponent: React.ReactElement

		switch (template) {
			case 'verification':
				emailComponent = React.createElement(BeswibEmailVerification, { validationCode: code, locale })
				break
			case 'welcome':
				emailComponent = React.createElement(BeswibWelcomeEmail, { locale, firstName })
				break
			case 'sale-confirmation':
				// Calcul complet des frais pour le vendeur
				const listingPriceSale = bibPrice
				const platformFeeSale = Number((listingPriceSale * customPlatformRate).toFixed(2)) // % du prix affiché
				const paypalFeeSale = Number((listingPriceSale * customPaypalRate).toFixed(2)) // % approximation PayPal
				const totalReceivedSale = Number((listingPriceSale - platformFeeSale - paypalFeeSale).toFixed(2)) // Net reçu par le vendeur

				console.log(`📊 Calcul des frais pour ${eventName} (Vendeur):`)
				console.log(`   📝 Prix affiché (listing): ${listingPriceSale}€`)
				console.log(`   🏢 Frais plateforme (${(customPlatformRate * 100).toFixed(1)}%): ${platformFeeSale}€`)
				console.log(`   💳 Frais PayPal (${(customPaypalRate * 100).toFixed(1)}%): ${paypalFeeSale}€`)
				console.log(`   💵 Net vendeur: ${totalReceivedSale}€`)
				console.log(
					`   ✅ Formule: ${listingPriceSale}€ - ${platformFeeSale}€ - ${paypalFeeSale}€ = ${totalReceivedSale}€`
				)

				emailComponent = React.createElement(BeswibSaleConfirmation, {
					totalReceived: totalReceivedSale,
					sellerName,
					platformFee: platformFeeSale,
					paypalFee: paypalFeeSale,
					orderId,
					locale,
					eventName,
					eventLocation: 'Paris, France',
					eventDate: '14 avril 2024',
					buyerName,
					bibPrice: listingPriceSale,
				})
				break
			case 'purchase-confirmation':
				// Calcul complet des frais selon votre logique métier
				const listingPrice = bibPrice
				const platformFeePreview = Number((listingPrice * customPlatformRate).toFixed(2)) // % du prix affiché
				const paypalFeePreview = Number((listingPrice * customPaypalRate).toFixed(2)) // % approximation PayPal
				const totalAmountPreview = listingPrice // L'acheteur paie seulement le prix affiché
				const netAmountPreview = Number((listingPrice - platformFeePreview - paypalFeePreview).toFixed(2)) // Net reçu par le vendeur

				console.log(`📊 Calcul des frais pour ${eventName}:`)
				console.log(`   📝 Prix affiché (listing): ${listingPrice}€`)
				console.log(`   🏢 Frais plateforme (${(customPlatformRate * 100).toFixed(1)}%): ${platformFeePreview}€`)
				console.log(`   💳 Frais PayPal (${(customPaypalRate * 100).toFixed(1)}%): ${paypalFeePreview}€`)
				console.log(`   💰 Total acheteur (prix affiché): ${totalAmountPreview}€`)
				console.log(`   💵 Net vendeur: ${netAmountPreview}€`)
				console.log(
					`   ✅ Formule: ${listingPrice}€ - ${platformFeePreview}€ - ${paypalFeePreview}€ = ${netAmountPreview}€`
				)

				emailComponent = React.createElement(BeswibPurchaseConfirmation, {
					sellerName,
					platformFee: platformFeePreview,
					paypalFee: paypalFeePreview,
					orderId,
					locale,
					listingPrice: listingPrice,
					eventName,
					eventLocation: 'Paris, France',
					eventDistance: '42.2 km',
					eventDate: '14 avril 2024',
					buyerName,
					bibCategory: 'Marathon',
				})
				break
			case 'sale-alert':
				const platformFeeAlert = Number((bibPrice * 0.1).toFixed(2))
				const netRevenue = Number((bibPrice - platformFeeAlert).toFixed(2))
				emailComponent = React.createElement(BeswibSaleAlert, {
					transactionId: 'tx_abc123def',
					sellerName,
					sellerEmail: 'seller@example.com',
					saleTimestamp: new Date().toLocaleString('fr-FR'),
					platformFee: platformFeeAlert,
					paypalCaptureId: 'CAPTURE123456789',
					orderId,
					netRevenue,
					eventName,
					eventLocation: 'Paris, France',
					eventDistance: '42.2 km',
					eventDate: '14 avril 2024',
					buyerName,
					buyerEmail: 'buyer@example.com',
					bibPrice,
					bibCategory: 'Marathon',
				})
				break
			default:
				return NextResponse.json(
					{
						error:
							'Template not found. Available: verification, welcome, sale-confirmation, purchase-confirmation, sale-alert',
					},
					{ status: 400 }
				)
		}

		const html = await render(emailComponent)

		return new NextResponse(html, {
			headers: {
				'Content-Type': 'text/html',
			},
		})
	} catch (error) {
		console.error('Email preview error:', error)
		return NextResponse.json({ error: 'Failed to render email template' }, { status: 500 })
	}
}
