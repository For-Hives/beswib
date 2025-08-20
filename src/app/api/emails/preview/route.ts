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
	const code = searchParams.get('code') || 'ABC-123'
	const firstName = searchParams.get('firstName') || 'Marie'
	const sellerName = searchParams.get('sellerName') || 'Marie Dupont'
	const buyerName = searchParams.get('buyerName') || 'Jean Martin'
	const eventName = searchParams.get('eventName') || 'Marathon de Paris 2024'
	const bibPrice = Number(searchParams.get('bibPrice')) || 150
	const orderId = searchParams.get('orderId') || 'BW123456789'
	const locale = searchParams.get('locale') || 'fr'

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
				const platformFee = Number((bibPrice * 0.1).toFixed(2))
				const totalReceived = Number((bibPrice - platformFee).toFixed(2))
				emailComponent = React.createElement(BeswibSaleConfirmation, {
					totalReceived,
					sellerName,
					platformFee,
					orderId,
					locale,
					eventName,
					eventLocation: 'Paris, France',
					eventDate: '14 avril 2024',
					buyerName,
					bibPrice,
				})
				break
			case 'purchase-confirmation':
				emailComponent = React.createElement(BeswibPurchaseConfirmation, {
					sellerName,
					orderId,
					locale,
					eventName,
					eventLocation: 'Paris, France',
					eventDistance: '42.2 km',
					eventDate: '14 avril 2024',
					buyerName,
					bibPrice,
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
