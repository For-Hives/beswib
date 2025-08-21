import { NextRequest, NextResponse } from 'next/server'

import {
	sendVerificationEmail,
	sendWelcomeEmail,
	sendWaitlistConfirmationEmail,
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
		const { template, locale = 'fr', email, ...params } = body

		if (!template || !email) {
			return NextResponse.json({ error: 'Template and email are required' }, { status: 400 })
		}

		let success = false

		switch (template) {
			case 'verification':
				success = await sendVerificationEmail(email, params.code || 'TEST-123', locale)
				break

			case 'welcome':
				success = await sendWelcomeEmail(email, params.firstName, locale)
				break

			case 'sale-confirmation':
				// Calculate fees for seller
				const bibPrice = Number(params.bibPrice) || 150
				const platformRate = Number(params.platformRate) || 0.1
				const paypalRate = Number(params.paypalRate) || 0.035

				const platformFee = Number((bibPrice * platformRate).toFixed(2))
				const paypalFee = Number((bibPrice * paypalRate).toFixed(2))
				const totalReceived = Number((bibPrice - platformFee - paypalFee).toFixed(2))

				success = await sendSaleConfirmationEmail({
					totalReceived,
					sellerName: params.sellerName,
					sellerEmail: email,
					platformFee,
					paypalFee,
					orderId: params.orderId,
					locale,
					eventName: params.eventName,
					eventLocation: 'Paris, France',
					eventDate: '14 avril 2024',
					buyerName: params.buyerName,
					bibPrice,
				})
				break

			case 'purchase-confirmation':
				// Calculate fees for buyer confirmation
				const purchaseBibPrice = Number(params.bibPrice) || 150
				const purchasePlatformRate = Number(params.platformRate) || 0.1
				const purchasePaypalRate = Number(params.paypalRate) || 0.035

				const purchasePlatformFee = Number((purchaseBibPrice * purchasePlatformRate).toFixed(2))
				const purchasePaypalFee = Number((purchaseBibPrice * purchasePaypalRate).toFixed(2))

				success = await sendPurchaseConfirmationEmail({
					sellerName: params.sellerName,
					platformFee: purchasePlatformFee,
					paypalFee: purchasePaypalFee,
					orderId: params.orderId,
					locale,
					listingPrice: purchaseBibPrice,
					eventName: params.eventName,
					eventLocation: 'Paris, France',
					eventDistance: params.eventDistance || '42.2 km',
					eventDate: '14 avril 2024',
					buyerName: params.buyerName,
					buyerEmail: email,
					bibCategory: params.bibCategory || 'Marathon',
				})
				break

			case 'sale-alert':
				const alertBibPrice = Number(params.bibPrice) || 150
				const alertPlatformFee = Number((alertBibPrice * 0.1).toFixed(2))
				const alertNetRevenue = Number((alertBibPrice - alertPlatformFee).toFixed(2))

				success = await sendSaleAlertEmail({
					transactionId: params.transactionId,
					sellerName: params.sellerName,
					sellerEmail: params.sellerEmail,
					saleTimestamp: new Date().toLocaleString('fr-FR'),
					platformFee: alertPlatformFee,
					paypalCaptureId: params.paypalCaptureId,
					orderId: params.orderId,
					netRevenue: alertNetRevenue,
					eventName: params.eventName,
					eventLocation: 'Paris, France',
					eventDistance: params.eventDistance || '42.2 km',
					eventDate: '14 avril 2024',
					buyerName: params.buyerName,
					buyerEmail: params.buyerEmail,
					bibPrice: alertBibPrice,
					bibCategory: params.bibCategory || 'Marathon',
				})
				break

			case 'waitlist-confirmation':
				success = await sendWaitlistConfirmationEmail(
					email,
					params.userName,
					params.eventName,
					params.eventId,
					params.eventDistance,
					params.bibCategory,
					locale
				)
				break

			case 'waitlist-alert':
				const waitlistBibPrice = Number(params.bibPrice) || 150
				success = await sendWaitlistAlertEmail([email], {
					timeRemaining: params.timeRemaining,
					sellerName: params.sellerName,
					locale,
					eventName: params.eventName,
					eventLocation: 'Paris, France',
					eventId: params.eventId,
					eventDistance: params.eventDistance || '42.2 km',
					eventDate: '14 avril 2024',
					bibPrice: waitlistBibPrice,
					bibCategory: params.bibCategory || 'Marathon',
				})
				success = success.sent > 0
				break

			case 'bib-approval':
				success = await sendBibApprovalEmail({
					sellerName: params.sellerName,
					sellerEmail: email,
					organizerName: 'Organisateur Marathon',
					locale,
					eventName: params.eventName,
					eventLocation: 'Paris, France',
					eventDistance: params.eventDistance || '42.2 km',
					eventDate: '14 avril 2024',
					bibPrice: Number(params.bibPrice) || 150,
					bibCategory: params.bibCategory || 'Marathon',
				})
				break

			case 'purchase-approval':
				success = await sendPurchaseApprovalEmail({
					organizerName: 'Organisateur Marathon',
					orderId: params.orderId,
					locale,
					eventName: params.eventName,
					eventLocation: 'Paris, France',
					eventDistance: params.eventDistance || '42.2 km',
					eventDate: '14 avril 2024',
					buyerName: params.buyerName,
					buyerEmail: email,
					bibPrice: Number(params.bibPrice) || 150,
					bibCategory: params.bibCategory || 'Marathon',
				})
				break

			default:
				return NextResponse.json({ error: `Unknown template: ${template}` }, { status: 400 })
		}

		if (success) {
			return NextResponse.json({ success: true, message: `Email ${template} sent successfully` })
		} else {
			return NextResponse.json({ error: `Failed to send ${template} email` }, { status: 500 })
		}
	} catch (error) {
		console.error('Email test API error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
