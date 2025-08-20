import { NextRequest, NextResponse } from 'next/server'

import {
	sendVerificationEmail,
	sendWelcomeEmail,
	sendSaleConfirmationEmail,
	sendPurchaseConfirmationEmail,
	sendSaleAlertEmail,
	sendWaitlistAlertEmail,
	sendBibApprovalEmail,
	sendPurchaseApprovalEmail,
} from '@/services/email.service'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { template, email, ...params } = body

		if (!email || !template) {
			return NextResponse.json({ error: 'Email and template are required' }, { status: 400 })
		}

		let success = false

		switch (template) {
			case 'verification':
				const code = params.code || 'TEST-123'
				success = await sendVerificationEmail(email, code, params.locale)
				break
			case 'welcome':
				success = await sendWelcomeEmail(email, params.firstName, params.locale)
				break
			case 'sale-confirmation':
				const bibPrice = Number(params.bibPrice) || 150
				const platformFee = Number((bibPrice * 0.1).toFixed(2))
				const totalReceived = Number((bibPrice - platformFee).toFixed(2))

				success = await sendSaleConfirmationEmail({
					totalReceived,
					sellerName: params.sellerName || 'Marie Dupont',
					sellerEmail: email,
					platformFee,
					orderId: params.orderId || 'BW123456789',
					locale: params.locale || 'fr',
					eventName: params.eventName || 'Marathon de Paris 2024',
					eventLocation: params.eventLocation || 'Paris, France',
					eventDate: params.eventDate || '14 avril 2024',
					buyerName: params.buyerName || 'Jean Martin',
					bibPrice,
				})
				break
			case 'purchase-confirmation':
				const purchaseBibPrice = Number(params.bibPrice) || 150

				success = await sendPurchaseConfirmationEmail({
					sellerName: params.sellerName || 'Marie Dupont',
					orderId: params.orderId || 'BW123456789',
					locale: params.locale || 'fr',
					eventName: params.eventName || 'Marathon de Paris 2024',
					eventLocation: params.eventLocation || 'Paris, France',
					eventDistance: params.eventDistance || '42.2 km',
					eventDate: params.eventDate || '14 avril 2024',
					buyerName: params.buyerName || 'Jean Martin',
					buyerEmail: email,
					bibPrice: purchaseBibPrice,
					bibCategory: params.bibCategory || 'Marathon',
				})
				break
			case 'sale-alert':
				const alertBibPrice = Number(params.bibPrice) || 150
				const alertPlatformFee = Number((alertBibPrice * 0.1).toFixed(2))
				const alertNetRevenue = Number((alertBibPrice - alertPlatformFee).toFixed(2))

				success = await sendSaleAlertEmail({
					transactionId: params.transactionId || 'tx_abc123def',
					sellerName: params.sellerName || 'Marie Dupont',
					sellerEmail: params.sellerEmail || 'seller@example.com',
					saleTimestamp: new Date().toLocaleString('fr-FR'),
					platformFee: alertPlatformFee,
					paypalCaptureId: params.paypalCaptureId || 'CAPTURE123456789',
					orderId: params.orderId || 'BW123456789',
					netRevenue: alertNetRevenue,
					eventName: params.eventName || 'Marathon de Paris 2024',
					eventLocation: params.eventLocation || 'Paris, France',
					eventDistance: params.eventDistance || '42.2 km',
					eventDate: params.eventDate || '14 avril 2024',
					buyerName: params.buyerName || 'Jean Martin',
					buyerEmail: params.buyerEmail || 'buyer@example.com',
					bibPrice: alertBibPrice,
					bibCategory: params.bibCategory || 'Marathon',
				})
				break
			case 'waitlist-alert':
				const waitlistBibPrice = Number(params.bibPrice) || 150

				const waitlistResult = await sendWaitlistAlertEmail([email], {
					timeRemaining: params.timeRemaining || '2 semaines',
					sellerName: params.sellerName || 'Marie Dupont',
					locale: params.locale || 'fr',
					eventName: params.eventName || 'Marathon de Paris 2024',
					eventLocation: params.eventLocation || 'Paris, France',
					eventId: params.eventId || 'event_123456',
					eventDistance: params.eventDistance || '42.2 km',
					eventDate: params.eventDate || '14 avril 2024',
					bibPrice: waitlistBibPrice,
					bibCategory: params.bibCategory || 'Marathon',
				})
				success = waitlistResult.sent > 0
				break
			case 'bib-approval':
				const approvalBibPrice = Number(params.bibPrice) || 150

				success = await sendBibApprovalEmail({
					sellerName: params.sellerName || 'Marie Dupont',
					sellerEmail: email,
					organizerName: params.organizerName || 'ASO Events',
					locale: params.locale || 'fr',
					eventName: params.eventName || 'Marathon de Paris 2024',
					eventLocation: params.eventLocation || 'Paris, France',
					eventDistance: params.eventDistance || '42.2 km',
					eventDate: params.eventDate || '14 avril 2024',
					bibPrice: approvalBibPrice,
					bibCategory: params.bibCategory || 'Marathon',
				})
				break
			case 'purchase-approval':
				const purchaseApprovalBibPrice = Number(params.bibPrice) || 150

				success = await sendPurchaseApprovalEmail({
					organizerName: params.organizerName || 'ASO Events',
					orderId: params.orderId || 'BW123456789',
					locale: params.locale || 'fr',
					eventName: params.eventName || 'Marathon de Paris 2024',
					eventLocation: params.eventLocation || 'Paris, France',
					eventDistance: params.eventDistance || '42.2 km',
					eventDate: params.eventDate || '14 avril 2024',
					buyerName: params.buyerName || 'Jean Martin',
					buyerEmail: email,
					bibPrice: purchaseApprovalBibPrice,
					bibCategory: params.bibCategory || 'Marathon',
				})
				break
			default:
				return NextResponse.json(
					{
						error:
							'Template not found. Available: verification, welcome, sale-confirmation, purchase-confirmation, sale-alert, waitlist-alert, bib-approval, purchase-approval',
					},
					{ status: 400 }
				)
		}

		if (success) {
			return NextResponse.json({ message: 'Email sent successfully' })
		} else {
			return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
		}
	} catch (error) {
		console.error('Email test error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
