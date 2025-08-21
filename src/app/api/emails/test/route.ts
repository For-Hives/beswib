import { NextRequest, NextResponse } from 'next/server'

import { sendVerificationEmail, sendWelcomeEmail, sendSaleConfirmationEmail, sendPurchaseConfirmationEmail, sendSaleAlertEmail, sendWaitlistAlertEmail, sendBibApprovalEmail, sendPurchaseApprovalEmail } from '@/services/email.service'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { template, locale = 'fr', email, ...params } = body

		if (!template || !email) {
			return NextResponse.json(
				{ error: 'Template and email are required' },
				{ status: 400 }
			)
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
					sellerEmail: email,
					sellerName: params.sellerName,
					buyerName: params.buyerName,
					eventName: params.eventName,
					bibPrice,
					platformFee,
					paypalFee,
					totalReceived,
					orderId: params.orderId,
					locale,
					eventDate: '14 avril 2024',
					eventLocation: 'Paris, France'
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
					buyerEmail: email,
					buyerName: params.buyerName,
					sellerName: params.sellerName,
					eventName: params.eventName,
					listingPrice: purchaseBibPrice,
					platformFee: purchasePlatformFee,
					paypalFee: purchasePaypalFee,
					orderId: params.orderId,
					locale,
					eventDate: '14 avril 2024',
					eventLocation: 'Paris, France',
					eventDistance: params.eventDistance || '42.2 km',
					bibCategory: params.bibCategory || 'Marathon'
				})
				break

			case 'sale-alert':
				const alertBibPrice = Number(params.bibPrice) || 150
				const alertPlatformFee = Number((alertBibPrice * 0.1).toFixed(2))
				const alertNetRevenue = Number((alertBibPrice - alertPlatformFee).toFixed(2))

				success = await sendSaleAlertEmail({
					sellerName: params.sellerName,
					sellerEmail: params.sellerEmail,
					buyerName: params.buyerName,
					buyerEmail: params.buyerEmail,
					eventName: params.eventName,
					bibPrice: alertBibPrice,
					platformFee: alertPlatformFee,
					netRevenue: alertNetRevenue,
					orderId: params.orderId,
					eventDate: '14 avril 2024',
					eventLocation: 'Paris, France',
					eventDistance: params.eventDistance || '42.2 km',
					bibCategory: params.bibCategory || 'Marathon',
					transactionId: params.transactionId,
					paypalCaptureId: params.paypalCaptureId,
					saleTimestamp: new Date().toLocaleString('fr-FR')
				})
				break

			case 'waitlist-confirmation':
				success = await sendWelcomeEmail(email, params.userName, locale)
				// Note: This is a simplified version since waitlist confirmation might need a different template
				break

			case 'waitlist-alert':
				const waitlistBibPrice = Number(params.bibPrice) || 150
				success = await sendWaitlistAlertEmail([email], {
					eventName: params.eventName,
					eventId: params.eventId,
					bibPrice: waitlistBibPrice,
					eventDate: '14 avril 2024',
					eventLocation: 'Paris, France',
					eventDistance: params.eventDistance || '42.2 km',
					bibCategory: params.bibCategory || 'Marathon',
					sellerName: params.sellerName,
					timeRemaining: params.timeRemaining,
					locale
				})
				success = success.sent > 0
				break

			case 'bib-approval':
				success = await sendBibApprovalEmail({
					sellerEmail: email,
					sellerName: params.sellerName,
					eventName: params.eventName,
					eventDate: '14 avril 2024',
					eventLocation: 'Paris, France',
					bibPrice: Number(params.bibPrice) || 150,
					eventDistance: params.eventDistance || '42.2 km',
					bibCategory: params.bibCategory || 'Marathon',
					organizerName: 'Organisateur Marathon',
					locale
				})
				break

			case 'purchase-approval':
				success = await sendPurchaseApprovalEmail({
					buyerEmail: email,
					buyerName: params.buyerName,
					eventName: params.eventName,
					eventDate: '14 avril 2024',
					eventLocation: 'Paris, France',
					bibPrice: Number(params.bibPrice) || 150,
					eventDistance: params.eventDistance || '42.2 km',
					bibCategory: params.bibCategory || 'Marathon',
					organizerName: 'Organisateur Marathon',
					orderId: params.orderId,
					locale
				})
				break

			default:
				return NextResponse.json(
					{ error: `Unknown template: ${template}` },
					{ status: 400 }
				)
		}

		if (success) {
			return NextResponse.json({ success: true, message: `Email ${template} sent successfully` })
		} else {
			return NextResponse.json(
				{ error: `Failed to send ${template} email` },
				{ status: 500 }
			)
		}
	} catch (error) {
		console.error('Email test API error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
