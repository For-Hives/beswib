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
					sellerEmail: email,
					sellerName: params.sellerName || 'Marie Dupont',
					buyerName: params.buyerName || 'Jean Martin',
					eventName: params.eventName || 'Marathon de Paris 2024',
					bibPrice,
					platformFee,
					totalReceived,
					orderId: params.orderId || 'BW123456789',
					eventDate: params.eventDate || '14 avril 2024',
					eventLocation: params.eventLocation || 'Paris, France',
					locale: params.locale || 'fr',
				})
				break
			case 'purchase-confirmation':
				const purchaseBibPrice = Number(params.bibPrice) || 150

				success = await sendPurchaseConfirmationEmail({
					buyerEmail: email,
					buyerName: params.buyerName || 'Jean Martin',
					sellerName: params.sellerName || 'Marie Dupont',
					eventName: params.eventName || 'Marathon de Paris 2024',
					bibPrice: purchaseBibPrice,
					orderId: params.orderId || 'BW123456789',
					eventDate: params.eventDate || '14 avril 2024',
					eventLocation: params.eventLocation || 'Paris, France',
					eventDistance: params.eventDistance || '42.2 km',
					bibCategory: params.bibCategory || 'Marathon',
					locale: params.locale || 'fr',
				})
				break
			case 'sale-alert':
				const alertBibPrice = Number(params.bibPrice) || 150
				const alertPlatformFee = Number((alertBibPrice * 0.1).toFixed(2))
				const alertNetRevenue = Number((alertBibPrice - alertPlatformFee).toFixed(2))

				success = await sendSaleAlertEmail({
					sellerName: params.sellerName || 'Marie Dupont',
					sellerEmail: params.sellerEmail || 'seller@example.com',
					buyerName: params.buyerName || 'Jean Martin',
					buyerEmail: params.buyerEmail || 'buyer@example.com',
					eventName: params.eventName || 'Marathon de Paris 2024',
					bibPrice: alertBibPrice,
					platformFee: alertPlatformFee,
					netRevenue: alertNetRevenue,
					orderId: params.orderId || 'BW123456789',
					eventDate: params.eventDate || '14 avril 2024',
					eventLocation: params.eventLocation || 'Paris, France',
					eventDistance: params.eventDistance || '42.2 km',
					bibCategory: params.bibCategory || 'Marathon',
					transactionId: params.transactionId || 'tx_abc123def',
					paypalCaptureId: params.paypalCaptureId || 'CAPTURE123456789',
					saleTimestamp: new Date().toLocaleString('fr-FR'),
				})
				break
			case 'waitlist-alert':
				const waitlistBibPrice = Number(params.bibPrice) || 150

				const waitlistResult = await sendWaitlistAlertEmail([email], {
					eventName: params.eventName || 'Marathon de Paris 2024',
					eventId: params.eventId || 'event_123456',
					bibPrice: waitlistBibPrice,
					eventDate: params.eventDate || '14 avril 2024',
					eventLocation: params.eventLocation || 'Paris, France',
					eventDistance: params.eventDistance || '42.2 km',
					bibCategory: params.bibCategory || 'Marathon',
					sellerName: params.sellerName || 'Marie Dupont',
					timeRemaining: params.timeRemaining || '2 semaines',
					locale: params.locale || 'fr',
				})
				success = waitlistResult.sent > 0
				break
			case 'bib-approval':
				const approvalBibPrice = Number(params.bibPrice) || 150

				success = await sendBibApprovalEmail({
					sellerEmail: email,
					sellerName: params.sellerName || 'Marie Dupont',
					eventName: params.eventName || 'Marathon de Paris 2024',
					eventDate: params.eventDate || '14 avril 2024',
					eventLocation: params.eventLocation || 'Paris, France',
					bibPrice: approvalBibPrice,
					eventDistance: params.eventDistance || '42.2 km',
					bibCategory: params.bibCategory || 'Marathon',
					organizerName: params.organizerName || 'ASO Events',
					locale: params.locale || 'fr',
				})
				break
			case 'purchase-approval':
				const purchaseApprovalBibPrice = Number(params.bibPrice) || 150

				success = await sendPurchaseApprovalEmail({
					buyerEmail: email,
					buyerName: params.buyerName || 'Jean Martin',
					eventName: params.eventName || 'Marathon de Paris 2024',
					eventDate: params.eventDate || '14 avril 2024',
					eventLocation: params.eventLocation || 'Paris, France',
					bibPrice: purchaseApprovalBibPrice,
					eventDistance: params.eventDistance || '42.2 km',
					bibCategory: params.bibCategory || 'Marathon',
					organizerName: params.organizerName || 'ASO Events',
					orderId: params.orderId || 'BW123456789',
					locale: params.locale || 'fr',
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
