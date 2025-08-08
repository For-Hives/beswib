import type { Metadata } from 'next'

import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'

import type { Event } from '@/models/event.model'
import type { Bib } from '@/models/bib.model'

import { fetchBibById, processBibSale } from '@/services/bib.services'
import { generateLocaleParams } from '@/lib/generateStaticParams'
import { fetchUserByClerkId } from '@/services/user.services'
import { getTranslations } from '@/lib/getDictionary'
import { Locale } from '@/lib/i18n-config'

import translations from './locales.json'

export type BibPurchasePageProps = {
	params: Promise<{ bibId: string; locale: Locale }>
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BibPurchasePage({
	searchParams: searchParamsPromise,
	params: paramsPromise,
}: BibPurchasePageProps) {
	const { locale, bibId } = await paramsPromise
	const t = getTranslations(locale, translations)

	const { userId: currentUserId } = await auth()

	let currentUserPocketBaseId: null | string = null
	if (currentUserId != null) {
		const pbUser = await fetchUserByClerkId(currentUserId)
		currentUserPocketBaseId = pbUser ? pbUser.id : null
	}

	const searchParams = await searchParamsPromise

	if (currentUserId == null) {
		redirect(`/sign-in?redirect_url=/purchase/${bibId}`)
	}

	const bib = (await fetchBibById(bibId)) as (Bib & { expand?: { eventId: Event } }) | null

	if (!bib) {
		notFound()
	}

	const errorParam = searchParams?.error
	const errorMessage =
		errorParam != null && typeof errorParam === 'string' && errorParam !== '' ? decodeURIComponent(errorParam) : null

	if (bib.listed !== 'public') {
		return (
			<div className="mx-auto max-w-lg p-4 text-center text-[var(--text-dark)] md:p-8">
				<p className="mb-6 rounded-lg border border-red-300 bg-[var(--error-bg)] p-4 text-[var(--error-text)]">
					{t.purchase.errors.bibNotAvailable.replace('{status}', bib.status)}
				</p>
				<Link className="text-[var(--accent-sporty)] hover:underline" href="/events">
					{t.purchase.browseOtherEvents}
				</Link>
			</div>
		)
	}

	// Block purchase if event has passed or transfer window closed
	const now = new Date()
	const eventDateObj = bib.expand?.eventId ? new Date(bib.expand.eventId.eventDate) : null
	const transferDeadline = bib.expand?.eventId?.transferDeadline ? new Date(bib.expand.eventId.transferDeadline) : null
	const isSaleOpen = transferDeadline != null ? transferDeadline >= now : eventDateObj != null ? eventDateObj >= now : false
	if (!isSaleOpen) {
		return (
			<div className="mx-auto max-w-lg p-4 text-center text-[var(--text-dark)] md:p-8">
				<p className="mb-6 rounded-lg border border-red-300 bg-[var(--error-bg)] p-4 text-[var(--error-text)]">
					{t.purchase.errors.bibNotAvailable.replace('{status}', 'closed')}
				</p>
				<Link className="text-[var(--accent-sporty)] hover:underline" href="/events">
					{t.purchase.browseOtherEvents}
				</Link>
			</div>
		)
	}

	// Compare PocketBase ID of seller with PocketBase ID of current user
	if (bib.sellerUserId === currentUserPocketBaseId) {
		return (
			<div className="mx-auto max-w-lg p-4 text-center text-[var(--text-dark)] md:p-8">
				<p className="mb-6 rounded-lg border border-red-300 bg-[var(--error-bg)] p-4 text-[var(--error-text)]">
					{t.purchase.errors.cannotPurchaseOwnBib}
				</p>
				<Link className="text-[var(--accent-sporty)] hover:underline" href={`/events/${bib.eventId}`}>
					{t.purchase.backToEventPage}
				</Link>
			</div>
		)
	}

	const eventName = bib.expand?.eventId?.name ?? `Event ID: ${bib.eventId}`
	const eventDateStr = bib.expand?.eventId ? new Date(bib.expand.eventId.eventDate).toLocaleDateString() : 'N/A'

	async function handleConfirmPurchase() {
		'use server'

		const t = getTranslations(locale, translations)

		// currentUserId is Clerk ID from auth()
		if (currentUserId == null) {
			redirect(`/purchase/${bibId}?error=${encodeURIComponent(t.purchase.errors.authFailed)}`)
			return
		}

		const user = await fetchUserByClerkId(currentUserId)
		if (!user) {
			redirect(`/purchase/${bibId}?error=${encodeURIComponent(t.purchase.errors.authFailed)}`)
			return
		}

		try {
			const result = await processBibSale(bibId, user.id)
			if (result.success && result.transaction) {
				redirect(
					`/dashboard/buyer?purchase_success=true&bib_id=${bibId}&event_name=${encodeURIComponent(eventName)}&transaction_id=${result.transaction.id}`
				)
			} else {
				redirect(`/purchase/${bibId}?error=${encodeURIComponent(result.error ?? t.purchase.errors.purchaseFailed)}`)
			}
		} catch (error) {
			console.error('Error in handleConfirmPurchase Server Action:', error)
			let message = t.purchase.errors.unexpectedError
			if (error instanceof Error) message = error.message
			redirect(`/purchase/${bibId}?error=${encodeURIComponent(message)}`)
		}
	}

	return (
		<div className="mx-auto max-w-lg p-4 text-[var(--text-dark)] md:p-8">
			<header className="mb-8 text-center">
				<h1 className="text-3xl font-bold">{t.purchase.title}</h1>
			</header>

			{}
			{errorMessage != null && (
				<div className="mb-6 rounded-md border border-red-300 bg-[var(--error-bg)] p-3 text-center text-sm text-[var(--error-text)]">
					{t.purchase.errors.errorPrefix} {errorMessage}
				</div>
			)}

			<div className="bento-box space-y-4">
				<h2 className="mb-4 border-b border-[var(--border-color)] pb-3 text-xl font-semibold">
					{t.purchase.details.title}
				</h2>
				<p>
					<span className="font-semibold">{t.purchase.details.event}:</span> {eventName}
				</p>
				<p>
				<span className="font-semibold">{t.purchase.details.eventDate}:</span> {eventDateStr}
				</p>
				<p>
					<span className="font-semibold">{t.purchase.details.registrationNumber}:</span>{' '}
					{t.purchase.details.registrationNumberNote}
				</p>
				{bib.optionValues.size != null && bib.optionValues.size !== '' && (
					<p>
						<span className="font-semibold">{t.purchase.details.size}:</span> {bib.optionValues.size ?? 'N/A'}
					</p>
				)}
				{bib.optionValues.gender != null && (
					<p>
						<span className="font-semibold">{t.purchase.details.gender}:</span> {bib.optionValues.gender}
					</p>
				)}

				<div className="my-4 text-center text-2xl font-bold text-[var(--accent-sporty)]">
					{t.purchase.details.price}: ${bib.price.toFixed(2)}
				</div>
			</div>

			<form action={handleConfirmPurchase} className="mt-6">
				<button className="btn btn-primary w-full py-3 text-lg" type="submit">
					{t.purchase.confirmButton}
				</button>
			</form>

			<p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">{t.purchase.agreementText}</p>
			<Link
				className="mt-6 block text-center text-[var(--accent-sporty)] hover:underline"
				href={`/events/${bib.eventId}`}
			>
				{t.purchase.cancelLink}
			</Link>
		</div>
	)
}

export async function generateMetadata({ params: paramsPromise }: BibPurchasePageProps): Promise<Metadata> {
	const { locale, bibId } = await paramsPromise

	const t = getTranslations(locale, translations)

	const bib = await fetchBibById(bibId)
	if (bib == null) {
		return { title: t.purchase.metadata.notFoundTitle }
	}
	const eventName = (bib as Bib & { expand?: { eventId: Event } }).expand?.eventId?.name ?? 'Event'
	return {
		title: t.purchase.metadata.titleTemplate.replace('{eventName}', eventName),
		description: t.purchase.metadata.descriptionTemplate
			.replace('{eventName}', eventName)
			.replace('{price}', bib.price.toFixed(2)),
	}
}

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}
