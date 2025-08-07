'use client'
import React, { useEffect, useState } from 'react'
import { useQueryState } from 'nuqs'
import { getTransactionByOrderId } from '@/services/transaction.services'
import { fetchBibById } from '@/services/bib.services'

type Transaction = {
	status?: string
	amount?: string
	currency?: string
	bibId?: string
}
type Bib = {
	number?: string
	eventName?: string
	organizerName?: string
	organizerEmail?: string
}

export default function PurchaseSuccessClient() {
	const [transactionId] = useQueryState('transactionId')
	const [transaction, setTransaction] = useState<Transaction | null>(null)
	const [bib, setBib] = useState<Bib | null>(null)
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchData = async () => {
			if (transactionId == null || transactionId.trim() === '') {
				setError('No transaction ID provided.')
				setLoading(false)
				return
			}
			try {
				const tx = await getTransactionByOrderId(transactionId)
				setTransaction(tx as Transaction)
				if (tx && typeof tx.bibId === 'string' && tx.bibId.trim() !== '') {
					const bibData = await fetchBibById(tx.bibId)
					setBib(bibData as Bib)
				}
			} catch {
				setError('Failed to fetch transaction details.')
			}
			setLoading(false)
		}
		void fetchData()
	}, [transactionId])

	if (loading) {
		return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>
	}
	if (typeof error === 'string' && error.trim() !== '') {
		return <div className="container mx-auto px-4 py-8 text-center text-red-600">{error}</div>
	}

	return (
		<div className="container mx-auto px-4 py-8 text-center">
			<h1 className="mb-4 text-3xl font-bold">Purchase Successful!</h1>
			<p className="text-lg">Thank you for your purchase. Your transaction has been completed.</p>
			<div className="mt-6">
				<h2 className="mb-2 text-xl font-semibold">Transaction Details</h2>
				<div className="mb-2">
					Status:{' '}
					<span className="font-bold">
						{typeof transaction?.status === 'string' && transaction.status.trim() !== ''
							? transaction.status
							: 'Unknown'}
					</span>
				</div>
				<div className="mb-2">
					Amount: <span className="font-bold">{transaction?.amount ?? 'N/A'}</span> {transaction?.currency ?? ''}
				</div>
				<div className="mb-2">
					Bib Number: <span className="font-bold">{bib?.number ?? 'N/A'}</span>
				</div>
				<div className="mb-2">
					Event: <span className="font-bold">{bib?.eventName ?? 'N/A'}</span>
				</div>
			</div>
			<div className="mt-6">
				<h2 className="mb-2 text-xl font-semibold">Organizer Contact</h2>
				<div className="mb-2">
					Name: <span className="font-bold">{bib?.organizerName ?? 'N/A'}</span>
				</div>
				<div className="mb-2">
					Email: <span className="font-bold">{bib?.organizerEmail ?? 'N/A'}</span>
				</div>
			</div>
			<div className="mt-6 text-green-700">
				<p>You will receive a confirmation email shortly with all details.</p>
				<p>If you have any questions, please contact the event organizer.</p>
			</div>
		</div>
	)
}
