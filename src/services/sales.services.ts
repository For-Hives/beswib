'use server'

import type { SalesCreateInput, SalesCreateOutput, SalesCompleteInput, SalesCompleteOutput } from '@/models/sales.model'
import type { BibSale } from '@/models/marketplace.model'

import { createTransaction, updateTransaction, getTransactionByOrderId } from './transaction.services'
import { fetchBibById, updateBib } from './bib.services'
import {
	sendSaleAlert,
	sendSellerSaleConfirmation,
	sendBuyerPurchaseConfirmation,
	sendAdminSaleAlert,
} from './notification.service'
import { fetchUserByClerkId, fetchUserById } from './user.services'
import { createOrder } from './paypal.services'

// Create PayPal order and persist a pending Transaction linked to that order
export async function salesCreate(input: SalesCreateInput): Promise<SalesCreateOutput> {
	console.info('Creating sale with input:', input)

	const { sellerMerchantId, buyerUserId, bibId } = input
	if (!buyerUserId || !sellerMerchantId || !bibId) {
		throw new Error('Missing required salesCreate parameters')
	}

	// Fetch bib for details and price/seller
	const bib = await fetchBibById(bibId)
	if (!bib) throw new Error('Bib not found')

	// Build the BibSale lightweight object expected by createOrder
	const bibSale: BibSale = {
		user: {
			lastName: '',
			id: bib.sellerUserId,
			firstName: '',
		},
		status: bib.status === 'sold' ? 'sold' : 'available',
		price: bib.price,
		originalPrice: bib.originalPrice ?? 0,
		lockedAt: bib.lockedAt ?? null,
		id: bib.id,
		event: {
			type: 'road',
			participantCount: 0,
			name: '',
			location: '',
			image: '',
			id: bib.eventId,
			distanceUnit: 'km',
			distance: 0,
			date: new Date(),
		},
	}

	const order = await createOrder(sellerMerchantId, bibSale)
	if (order.id == null || order.id === '') {
		throw new Error(order.error ?? 'Failed to create PayPal order')
	}

	const platformFee = Number((bib.price * 0.1).toFixed(2))

	// Map Clerk buyer id to PocketBase user id
	const pbBuyer = await fetchUserByClerkId(buyerUserId)
	if (!pbBuyer) {
		throw new Error('Buyer user not found in database')
	}

	const tx = await createTransaction({
		status: 'pending',
		seller_user_id: bib.sellerUserId,
		raw_webhook_payload: '',
		platform_fee: platformFee,
		paypal_order_id: order.id,
		paypal_capture_id: '',
		payment_status: 'PENDING',
		payer_id: '',
		payer_email: '',
		currency: 'EUR',
		capture_time: '',
		buyer_user_id: pbBuyer.id,
		bib_id: bib.id,
		amount: bib.price,
	})

	if (!tx) throw new Error('Failed to create transaction')

	return { transaction: tx, orderId: order.id }
}

// Types moved to src/models/sales.model

// Finalize the Transaction and mark the bib as sold based on PayPal capture webhook
export async function salesComplete(input: SalesCompleteInput): Promise<SalesCompleteOutput> {
	const resource = input.event.resource
	const orderId = resource.supplementary_data?.related_ids?.order_id ?? ''
	const captureId = resource.id ?? ''
	const payerEmail = resource.payee?.email_address ?? ''
	const payerId = resource.payer?.payer_id ?? ''
	const amountStr = resource.amount?.value ?? ''
	const amount = amountStr !== '' ? Number(amountStr) : 0
	const currency = resource.amount?.currency_code ?? ''
	const status = resource.status ?? ''
	const captureTime = resource.update_time ?? resource.create_time ?? ''
	const bibIdFromPayload = resource.supplementary_data?.related_ids?.bib_id ?? ''

	const found = await getTransactionByOrderId(orderId)
	const transactionId = found?.id ?? null
	const bibId = (found?.bib_id ?? bibIdFromPayload) || null

	if (typeof transactionId === 'string' && transactionId !== '') {
		await updateTransaction(transactionId, {
			status: 'succeeded',
			raw_webhook_payload: JSON.stringify(input.event),
			paypal_order_id: orderId,
			paypal_capture_id: captureId,
			payment_status: status,
			payer_id: payerId,
			payer_email: payerEmail,
			currency,
			capture_time: captureTime,
			amount,
		})
	}

	if (typeof bibId === 'string' && bibId !== '') {
		// If we have buyerUserId from original transaction, prefer that
		const buyerUserId = found?.buyer_user_id
		await updateBib(bibId, {
			validated: true,
			status: 'sold',
			...(typeof buyerUserId === 'string' && buyerUserId !== '' ? { buyerUserId } : {}),
		})
	}

	// Fire-and-forget sale alert to Discord (legacy - for backup)
	void sendSaleAlert({ orderId, currency, bibId, amount })

	// Send comprehensive admin alert email and user confirmations
	if (found?.seller_user_id && bibId) {
		try {
			const sellerUser = await fetchUserById(found.seller_user_id)
			const bib = await fetchBibById(bibId)
			const buyerUser = found.buyer_user_id ? await fetchUserById(found.buyer_user_id) : null

			if (sellerUser && bib?.event) {
				const platformFee = Number((amount * 0.1).toFixed(2))
				const totalReceived = Number((amount - platformFee).toFixed(2))

				// Format event date
				const eventDate = bib.event.date
					? new Date(bib.event.date).toLocaleDateString('fr-FR', {
							year: 'numeric',
							month: 'long',
							day: 'numeric',
						})
					: undefined

				// Send comprehensive admin alert
				void sendAdminSaleAlert({
					sellerName: `${sellerUser.firstName || ''} ${sellerUser.lastName || ''}`.trim(),
					sellerEmail: sellerUser.email,
					buyerName: buyerUser ? `${buyerUser.firstName || ''} ${buyerUser.lastName || ''}`.trim() : 'Acheteur',
					buyerEmail: buyerUser?.email,
					eventName: bib.event.name,
					bibPrice: amount,
					platformFee,
					netRevenue: totalReceived,
					orderId,
					eventDate,
					eventLocation: bib.event.location,
					eventDistance: bib.event.distance ? `${bib.event.distance} ${bib.event.distanceUnit || 'km'}` : undefined,
					bibCategory: bib.event.type || 'Course',
					transactionId: transactionId || undefined,
					paypalCaptureId: captureId,
				})

				// Send seller sale confirmation
				void sendSellerSaleConfirmation({
					sellerEmail: sellerUser.email,
					sellerName: `${sellerUser.firstName || ''} ${sellerUser.lastName || ''}`.trim(),
					buyerName: buyerUser ? `${buyerUser.firstName || ''} ${buyerUser.lastName || ''}`.trim() : 'Acheteur',
					eventName: bib.event.name,
					bibPrice: amount,
					platformFee,
					totalReceived,
					orderId,
					eventDate,
					eventLocation: bib.event.location,
					locale: sellerUser.locale || 'fr',
				})

				// Send purchase confirmation email to buyer
				if (buyerUser) {
					void sendBuyerPurchaseConfirmation({
						buyerEmail: buyerUser.email,
						buyerName: `${buyerUser.firstName || ''} ${buyerUser.lastName || ''}`.trim(),
						sellerName: `${sellerUser.firstName || ''} ${sellerUser.lastName || ''}`.trim(),
						eventName: bib.event.name,
						bibPrice: amount,
						orderId,
						eventDate,
						eventLocation: bib.event.location,
						eventDistance: bib.event.distance ? `${bib.event.distance} ${bib.event.distanceUnit || 'km'}` : undefined,
						bibCategory: bib.event.type || 'Course',
						locale: buyerUser.locale || 'fr',
					})
				}
			}
		} catch (error) {
			console.error('Error sending confirmation emails:', error)
		}
	}

	return { transactionId, bibId }
}
