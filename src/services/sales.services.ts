'use server'

import type { SalesCreateInput, SalesCreateOutput, SalesCompleteInput, SalesCompleteOutput } from '@/models/sales.model'

import {
	sendSaleAlert,
	sendSellerSaleConfirmation,
	sendBuyerPurchaseConfirmation,
	sendAdminSaleAlert,
} from './notification.service'
import { createTransaction, updateTransaction, getTransactionByOrderId } from './transaction.services'
import { fetchUserByClerkId, fetchUserById } from './user.services'
import { fetchBibById, updateBib } from './bib.services'
import { createOrder } from './paypal.services'

// Create PayPal order and persist a pending Transaction linked to that order
export async function salesCreate(input: SalesCreateInput): Promise<SalesCreateOutput> {
	console.info('Creating sale with input:', input)

	const { sellerMerchantId, locale, buyerUserId, bibId } = input
	if (!buyerUserId || !sellerMerchantId || !bibId) {
		throw new Error('Missing required salesCreate parameters')
	}

	// Fetch bib with expanded event and seller data for complete details
	const bib = await fetchBibById(bibId)
	if (!bib) throw new Error('Bib not found')

	// Use the transformer to build a complete BibSale with all event details
	const { transformBibToBibSale } = await import('@/lib/transformers/bib')
	const bibSale = transformBibToBibSale(bib)
	if (!bibSale) {
		throw new Error('Unable to transform bib to BibSale - missing event or seller data')
	}

	const order = await createOrder(sellerMerchantId, bibSale, locale)
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

	void sendSaleAlert({ orderId, currency, bibId, amount })

	if (found?.seller_user_id != null && bibId != null) {
		try {
			const sellerUserId = found.seller_user_id
			const sellerUser = await fetchUserById(sellerUserId)
			const bib = await fetchBibById(bibId)
			const buyerUser = found.buyer_user_id != null ? await fetchUserById(found.buyer_user_id) : null

			if (sellerUser != null && bib?.expand?.eventId != null) {
				const platformFee = Number((amount * 0.1).toFixed(2))
				const totalReceived = Number((amount - platformFee).toFixed(2))

				// Format event date
				const eventDate =
					bib.expand.eventId.eventDate != null
						? new Date(bib.expand.eventId.eventDate).toLocaleDateString('fr-FR', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})
						: undefined

				// Send comprehensive admin alert
				void sendAdminSaleAlert({
					transactionId: transactionId ?? undefined,
					sellerName: `${sellerUser.firstName ?? ''} ${sellerUser.lastName ?? ''}`.trim(),
					sellerEmail: sellerUser.email,
					platformFee,
					paypalCaptureId: captureId,
					orderId,
					netRevenue: totalReceived,
					eventName: bib.expand.eventId.name,
					eventLocation: bib.expand.eventId.location,
					eventDistance: bib.expand.eventId.distanceKm != null ? `${bib.expand.eventId.distanceKm} km` : undefined,
					eventDate,
					buyerName: buyerUser != null ? `${buyerUser.firstName ?? ''} ${buyerUser.lastName ?? ''}`.trim() : 'Acheteur',
					buyerEmail: buyerUser?.email,
					bibPrice: amount,
					bibCategory: bib.expand.eventId.typeCourse ?? 'road',
				})

				// Send seller sale confirmation
				void sendSellerSaleConfirmation({
					totalReceived,
					sellerName: `${sellerUser.firstName ?? ''} ${sellerUser.lastName ?? ''}`.trim(),
					sellerEmail: sellerUser.email,
					platformFee,
					orderId,
					locale: sellerUser.locale ?? undefined, // Use seller's locale from DB, fallback will be handled by email service
					eventName: bib.expand.eventId.name,
					eventLocation: bib.expand.eventId.location,
					eventDate,
					buyerName: buyerUser != null ? `${buyerUser.firstName ?? ''} ${buyerUser.lastName ?? ''}`.trim() : 'Acheteur',
					bibPrice: amount,
				})

				// Send purchase confirmation email to buyer
				if (buyerUser != null) {
					void sendBuyerPurchaseConfirmation({
						sellerName: `${sellerUser.firstName ?? ''} ${sellerUser.lastName ?? ''}`.trim(),
						orderId,
						locale: buyerUser.locale ?? undefined, // Use buyer's locale from DB, fallback will be handled by email service
						eventName: bib.expand.eventId.name,
						eventLocation: bib.expand.eventId.location,
						eventDistance: bib.expand.eventId.distanceKm != null ? `${bib.expand.eventId.distanceKm} km` : undefined,
						eventDate,
						buyerName: `${buyerUser.firstName ?? ''} ${buyerUser.lastName ?? ''}`.trim(),
						buyerEmail: buyerUser.email,
						bibPrice: amount,
						bibCategory: bib.expand.eventId.typeCourse ?? 'road',
					})
				}
			}
		} catch (error) {
			console.error('Error sending confirmation emails:', error)
		}
	}

	return { transactionId, bibId }
}
