'use server'

import { createOrder, PayPalPaymentCaptureResource } from './paypal.services'
import { createTransaction, updateTransaction, getTransactionByOrderId } from './transaction.services'
import { fetchBibById, updateBib } from './bib.services'
import type { Transaction } from '@/models/transaction.model'
import type { BibSale } from '@/components/marketplace/CardMarket'

type SalesCreateInput = {
	buyerUserId: string
	sellerMerchantId: string // PayPal merchant id
	bibId: string
}

type SalesCreateOutput = {
	orderId: string
	transaction: Transaction
}

// Create PayPal order and persist a pending Transaction linked to that order
export async function salesCreate(input: SalesCreateInput): Promise<SalesCreateOutput> {
	console.info('Creating sale with input:', input)

	const { buyerUserId, sellerMerchantId, bibId } = input
	if (!buyerUserId || !sellerMerchantId || !bibId) {
		throw new Error('Missing required salesCreate parameters')
	}

	// Fetch bib for details and price/seller
	const bib = await fetchBibById(bibId)
	if (!bib) throw new Error('Bib not found')

	// Build the BibSale lightweight object expected by createOrder
	const bibSale: BibSale = {
		id: bib.id,
		price: bib.price,
		originalPrice: bib.originalPrice ?? 0,
		status: bib.status === 'sold' ? 'sold' : 'available',
		lockedAt: bib.lockedAt ?? null,
		user: {
			id: bib.sellerUserId,
			firstName: '',
			lastName: '',
		},
		event: {
			id: bib.eventId,
			name: '',
			image: '',
			date: new Date(),
			distance: 0,
			distanceUnit: 'km',
			location: '',
			participantCount: 0,
			type: 'running',
		},
	}

	const order = await createOrder(sellerMerchantId, bibSale)
	if (order.id == null || order.id === '') {
		throw new Error(order.error ?? 'Failed to create PayPal order')
	}

	const platformFee = Number((bib.price * 0.1).toFixed(2))

	const tx = await createTransaction({
		status: 'pending',
		sellerUserId: bib.sellerUserId,
		buyerUserId,
		bibId: bib.id,
		amount: bib.price,
		platformFee,
		paymentIntentId: order.id, // legacy field
		paypal_order_id: order.id,
		paypal_capture_id: '',
		payer_email: '',
		currency: 'EUR',
		payment_status: 'PENDING',
		capture_time: '',
		raw_webhook_payload: '',
	})

	if (!tx) throw new Error('Failed to create transaction')

	return { orderId: order.id, transaction: tx }
}

type SalesCompleteInput = {
	event: {
		resource: PayPalPaymentCaptureResource & {
			payer?: { payer_id?: string }
			update_time?: string
			create_time?: string
		}
	}
}

type SalesCompleteOutput = {
	transactionId: string | null
	bibId: string | null
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
	const bibId = (found?.bibId ?? bibIdFromPayload) || null

	if (typeof transactionId === 'string' && transactionId !== '') {
		await updateTransaction(transactionId, {
			status: 'succeeded',
			paymentIntentId: captureId,
			paypal_order_id: orderId,
			paypal_capture_id: captureId,
			payer_email: payerEmail,
			payer_id: payerId,
			amount,
			currency,
			payment_status: status,
			capture_time: captureTime,
			raw_webhook_payload: JSON.stringify(input.event),
		})
	}

	if (typeof bibId === 'string' && bibId !== '') {
		// If we have buyerUserId from original transaction, prefer that
		const buyerUserId = found?.buyerUserId
		await updateBib(bibId, {
			status: 'sold',
			validated: true,
			...(typeof buyerUserId === 'string' && buyerUserId !== '' ? { buyerUserId } : {}),
		})
	}

	return { transactionId, bibId }
}
