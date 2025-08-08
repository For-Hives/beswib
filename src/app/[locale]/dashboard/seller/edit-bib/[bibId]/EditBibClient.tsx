'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

import type { Event } from '@/models/event.model'
import type { Bib } from '@/models/bib.model'

import { getTranslations } from '@/lib/getDictionary'
import { Locale } from '@/lib/i18n-config'
import { formatDateObjectForDisplay } from '@/lib/dateUtils'

import { handleToggleListingStatus, handleUpdateBibDetails, handleWithdrawBib } from './actions'
import editBibTranslations from './locales.json'

interface EditBibClientProps {
	bibId: string
	initialBibWithEvent: (Bib & { expand?: { eventId?: Event } }) | null
	initialError?: null | string
	locale: Locale
}

// TODO: create loading.tsx skeleton for this page
export default function EditBibClient({ locale, initialError, initialBibWithEvent, bibId }: EditBibClientProps) {
	const t = getTranslations(locale, editBibTranslations)

	const router = useRouter()
	const [bib, setBib] = useState<(Bib & { expand?: { eventId?: Event } }) | null>(initialBibWithEvent)
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (initialError != null) {
			toast.error(initialError)
		}
	}, [initialError])

	function handleUpdateDetailsAction(formData: FormData) {
		setIsLoading(true)

		handleUpdateBibDetails(bibId, formData)
			.then(updatedBib => {
				toast.success('Details updated successfully!')
				const newEventId = updatedBib.eventId

				const nextState: Bib & { expand?: { eventId?: Event } } = {
					...updatedBib,
					expand: bib?.expand,
					eventId: newEventId,
				}
				setBib(nextState)
				setIsLoading(false)
			})
			.catch((error: unknown) => {
				toast.error(error instanceof Error ? error.message : String(error))
				setIsLoading(false)
			})
	}

	function handleToggleListingStatusAction(newListed: 'private' | 'public', formData: FormData) {
		setIsLoading(true)

		handleToggleListingStatus(bibId, newListed, formData)
			.then(updatedBib => {
				toast.success('Listing status updated successfully!')
				const newEventId = updatedBib.eventId
				const nextState: Bib & { expand?: { eventId?: Event } } = {
					...updatedBib,
					expand: bib?.expand,
					eventId: newEventId,
				}
				setBib(nextState)
				setIsLoading(false)
			})
			.catch((error: unknown) => {
				toast.error(error instanceof Error ? error.message : String(error))
				setIsLoading(false)
			})
	}

	function handleWithdrawAction() {
		setIsLoading(true)
		handleWithdrawBib(bibId)
			.then(() => {
				toast.success('Bib withdrawn successfully!')
				router.push('/dashboard/seller?success=Bib+listing+withdrawn')
			})
			.catch((error: unknown) => {
				toast.error(error instanceof Error ? error.message : String(error))
				setIsLoading(false)
			})
	}

	if (bib == null && initialError == null) {
		return <p>{t.bibNotFound ?? 'Bib not found.'}</p>
	}

	if (initialError != null && bib == null) {
		return (
			<div className="container mx-auto p-4 text-center">
				<p className="text-red-500">{initialError}</p>
				<Link className="mt-4 inline-block text-blue-500 hover:underline" href="/dashboard/seller">
					{t.backToDashboard ?? 'Back to Dashboard'}
				</Link>
			</div>
		)
	}

	if (bib == null) {
		return <p>Loading bib details or an unexpected error occurred.</p>
	}

	const currentStatusDisplay = typeof bib.status === 'string' ? bib.status.replace('_', ' ') : 'N/A'
	const eventName = bib.expand?.eventId?.name ?? 'N/A'
	const eventDate =
		bib.expand?.eventId?.eventDate != null
			? formatDateObjectForDisplay(new Date(bib.expand.eventId.eventDate), locale)
			: 'N/A'
	const eventLocation = bib.expand?.eventId?.location ?? 'N/A'

	return (
		<div className="container mx-auto max-w-3xl p-4">
			<header className="mb-8 text-center">
				<h1 className="text-3xl font-bold">{t.title}</h1>
				<p className="text-sm text-gray-600">
					{t.currentStatus}: <span className="font-semibold">{currentStatusDisplay}</span>
				</p>
			</header>

			<section className="mb-8 rounded-lg border bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-800">
				<h2 className="mb-4 text-xl font-semibold">{t.eventDetails}</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<p>
						<strong>{t.eventName}:</strong> {eventName}
					</p>
					<p>
						<strong>{t.eventDate}:</strong> {eventDate}
					</p>
					<p>
						<strong>{t.eventLocation}:</strong> {eventLocation}
					</p>
				</div>
			</section>

			<section className="mb-8 rounded-lg border bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-800">
				<h2 className="mb-4 text-xl font-semibold">{t.bibDetails}</h2>
				<form action={handleUpdateDetailsAction} className="space-y-4">
					<div>
						<label className="block text-sm font-medium" htmlFor="registrationNumber">
							{t.registrationNumber}
						</label>
						<input
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-neutral-600 dark:bg-neutral-700"
							defaultValue={bib.registrationNumber}
							disabled={isLoading}
							id="registrationNumber"
							name="registrationNumber"
							required
							type="text"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium" htmlFor="price">
							{t.price}
						</label>
						<input
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-neutral-600 dark:bg-neutral-700"
							defaultValue={bib.price}
							disabled={isLoading}
							id="price"
							min="0.01"
							name="price"
							required
							step="0.01"
							type="number"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium" htmlFor="originalPrice">
							{t.originalPrice}
						</label>
						<input
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-neutral-600 dark:bg-neutral-700"
							defaultValue={bib.originalPrice ?? ''}
							disabled={isLoading}
							id="originalPrice"
							min="0"
							name="originalPrice"
							step="0.01"
							type="number"
						/>
					</div>

					<button
						className="btn btn-primary w-full sm:w-auto"
						disabled={isLoading || bib.status === 'sold' || bib.status === 'expired' || bib.status === 'withdrawn'}
						type="submit"
					>
						{t.updateDetails}
					</button>
				</form>
			</section>

			{bib.status !== 'sold' && bib.status !== 'expired' && bib.status !== 'withdrawn' && (
				<section className="mb-8 rounded-lg border bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-800">
					<h2 className="mb-4 text-xl font-semibold">{t.listingStatus}</h2>
					{bib.listed === 'public' || bib.listed === 'private' ? (
						<form
							action={formData =>
								handleToggleListingStatusAction(bib.listed === 'public' ? 'private' : 'public', formData)
							}
							className="space-y-4"
						>
							{bib.listed === 'public' && (
								<div>
									<label className="block text-sm font-medium" htmlFor="privateListingToken">
										{t.privateListingToken} (Required for private listing)
									</label>
									<input
										className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-neutral-600 dark:bg-neutral-700"
										disabled={isLoading}
										id="privateListingToken"
										name="privateListingToken"
										type="text"
									/>
								</div>
							)}
							<button className="btn btn-secondary" disabled={isLoading} type="submit">
								{bib.listed === 'public' ? t.makePrivate : t.makePublic}
							</button>
						</form>
					) : (
						<div className="space-y-4">
							<form action={formData => handleToggleListingStatusAction('public', formData)}>
								<button className="btn btn-primary mr-2" disabled={isLoading} type="submit">
									{t.makePublic}
								</button>
							</form>
							<form action={formData => handleToggleListingStatusAction('private', formData)}>
								<div>
									<label className="block text-sm font-medium" htmlFor="privateListingTokenToggle">
										{t.privateListingToken} (Required for private listing)
									</label>
									<input
										className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-neutral-600 dark:bg-neutral-700"
										disabled={isLoading}
										id="privateListingTokenToggle"
										name="privateListingToken"
										required
										type="text"
									/>
								</div>
								<button className="btn btn-secondary mt-2" disabled={isLoading} type="submit">
									{t.makePrivate}
								</button>
							</form>
						</div>
					)}
				</section>
			)}

			{bib.status !== 'sold' && bib.status !== 'expired' && bib.status !== 'withdrawn' && (
				<section className="mb-8 rounded-lg border bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-800">
					<h2 className="mb-4 text-xl font-semibold">{t.withdrawListing}</h2>
					<button
						className="btn btn-danger"
						disabled={isLoading}
						onClick={() => {
							handleWithdrawAction()
						}}
					>
						{t.confirmWithdraw}
					</button>
				</section>
			)}

			<div className="mt-8 text-center">
				<Link className="text-blue-500 hover:underline" href="/dashboard/seller">
					{t.backToDashboard}
				</Link>
			</div>
		</div>
	)
}
