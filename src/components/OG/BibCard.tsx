import * as React from 'react'

import type { BibSale } from '@/models/marketplace.model'
import type { Organizer } from '@/models/organizer.model'
import type { Event } from '@/models/event.model'
import type { User } from '@/models/user.model'
import type { Locale } from '@/lib/i18n/config'
import type { Bib } from '@/models/bib.model'

import marketplaceTranslations from '@/app/[locale]/marketplace/locales.json'
import { getCurrencyForLocale } from '@/lib/utils/currency'
import { getOrganizerImageUrl } from '@/lib/utils/images'
import { formatDateWithLocale } from '@/lib/utils/date'
import { getTranslations } from '@/lib/i18n/dictionary'

// Flexible type that works with both BibSale and actual service response
type BibData = BibSale | (Bib & { expand?: { eventId: Event; sellerUserId: User } })

// Helper function to get background color based on event type
function getTypeColor(type: BibSale['event']['type']) {
	switch (type) {
		case 'cycle':
			return { border: 'rgba(6, 182, 212, 0.5)', bg: 'rgba(6, 182, 212, 0.15)' }
		case 'other':
			return { border: 'rgba(107, 114, 128, 0.5)', bg: 'rgba(107, 114, 128, 0.15)' }
		case 'road':
			return { border: 'rgba(34, 197, 94, 0.5)', bg: 'rgba(34, 197, 94, 0.15)' }
		case 'trail':
			return { border: 'rgba(234, 179, 8, 0.5)', bg: 'rgba(234, 179, 8, 0.15)' }
		case 'triathlon':
			return { border: 'rgba(147, 51, 234, 0.5)', bg: 'rgba(147, 51, 234, 0.15)' }
	}
}

// Helper function to get event type label using translations
function getTypeLabel(type: BibSale['event']['type'], locale: Locale) {
	const t = getTranslations(locale, marketplaceTranslations)
	const sportTypes = t.sportTypes as Record<string, string> | undefined
	return sportTypes?.[type] ?? type
}

// Helper function to format participant count
function formatParticipantCount(participantCount: number) {
	return participantCount.toLocaleString('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	})
}

// Helper functions to extract data from either format and normalize
function getEventFromBib(bib: BibData) {
	if ('event' in bib) {
		return bib.event
	}

	const event = bib.expand?.eventId
	if (!event) return null

	// Map Event model to BibSale event format
	return {
		type: event.typeCourse,
		participantCount: event.participants ?? 0,
		name: event.name,
		location: event.location,
		id: event.id,
		distanceUnit: 'km' as const,
		distance: event.distanceKm ?? 0,
		date: event.eventDate,
	}
}

function getUserFromBib(bib: BibData) {
	if ('user' in bib) {
		return bib.user
	}

	const user = bib.expand?.sellerUserId
	if (!user) return null

	return {
		lastName: user.lastName,
		id: user.id,
		firstName: user.firstName ?? 'Anonymous',
	}
}

interface BibCardProps {
	bib: BibData
	locale: Locale
	organizer?: Organizer
	exchangeRates?: Record<string, number> | null
}

// OpenGraph-compatible price formatting (avoids special characters that need dynamic fonts)
function formatPriceForOG(price: number, currencyCode: string): string {
	switch (currencyCode) {
		case 'krw':
			// Use KRW instead of ₩ symbol to avoid font loading issues
			return `${Math.round(price).toLocaleString()} KRW`
		case 'ron':
			// Use RON instead of lei to avoid font loading issues
			return `${price.toFixed(2)} RON`
		case 'usd':
			// Use $ which is supported by default fonts
			return `$${price.toFixed(2)}`
		case 'eur':
		default:
			// Use EUR symbol which is supported by default fonts
			return `€${price.toFixed(2)}`
	}
}

// Helper function to convert price with fallback to EUR
function convertPriceWithFallback(
	priceInEur: number,
	currency: string,
	rates: Record<string, number> | null | undefined
): string {
	if (currency === 'eur' || !rates) {
		return formatPriceForOG(priceInEur, 'eur')
	}
	const rate = rates[currency]
	if (!rate) {
		return formatPriceForOG(priceInEur, 'eur')
	}
	const converted = Math.round(priceInEur * rate * 100) / 100
	return formatPriceForOG(converted, currency)
}

export default function BibCard({ organizer, locale, exchangeRates, bib }: Readonly<BibCardProps>) {
	const event = getEventFromBib(bib)
	const user = getUserFromBib(bib)
	const t = getTranslations(locale, marketplaceTranslations)

	// Currency conversion
	const targetCurrency = getCurrencyForLocale(locale)
	const convertedPrice = convertPriceWithFallback(bib.price, targetCurrency, exchangeRates)
	const convertedOriginalPrice =
		bib.originalPrice != null ? convertPriceWithFallback(bib.originalPrice, targetCurrency, exchangeRates) : null

	if (!event || !user) {
		return <div style={{ width: '280px', height: '380px', borderRadius: '16px', backgroundColor: '#f3f4f6' }} />
	}

	const typeColors = getTypeColor(event.type)
	const typeLabel = getTypeLabel(event.type, locale)

	// Calculate discount percentage if original price exists
	const originalPrice = bib.originalPrice ?? 0
	const discountPercentage =
		originalPrice > 0 && originalPrice > bib.price ? Math.round(((originalPrice - bib.price) / originalPrice) * 100) : 0

	return (
		<div
			style={{
				width: '280px',
				transform: 'rotate(3deg)',
				position: 'relative',
				overflow: 'hidden',
				height: '380px',
				flexDirection: 'column',
				display: 'flex',
				boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				borderRadius: '16px',
				border: '1px solid #e5e7eb',
				backgroundColor: '#fff',
			}}
		>
			{/* Image container */}
			<div
				style={{
					position: 'relative',
					margin: '16px',
					justifyContent: 'center',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<img
					src={
						getOrganizerImageUrl(organizer, bib.id).startsWith('/')
							? `https://beswib.com${getOrganizerImageUrl(organizer, bib.id)}`
							: getOrganizerImageUrl(organizer, bib.id)
					}
					alt="Organizer logo"
					style={{
						width: '100%',
						objectPosition: 'center',
						objectFit: 'cover',
						height: '160px',
						borderRadius: '12px',
					}}
				/>
				{/* Event type badge */}
				<div
					style={{
						top: '8px',
						position: 'absolute',
						padding: '4px 12px',
						left: '8px',
						fontWeight: '500',
						fontSize: '11px',
						fontFamily: 'Geist',
						color: 'white',
						borderRadius: '20px',
						border: `1px solid ${typeColors.border}`,
						backgroundColor: typeColors.bg,
					}}
				>
					{typeLabel}
				</div>

				{/* Discount badge */}
				{discountPercentage > 10 && (
					<div
						style={{
							top: '8px',
							right: '8px',
							position: 'absolute',
							padding: '4px 12px',
							fontWeight: '500',
							fontSize: '11px',
							fontFamily: 'Geist',
							color: 'white',
							borderRadius: '20px',
							border: '1px solid rgba(239, 68, 68, 0.5)',
							backgroundColor: 'rgba(239, 68, 68, 0.15)',
						}}
					>
						-{discountPercentage}%
					</div>
				)}
			</div>

			{/* Content */}
			<div
				style={{
					padding: '0 16px 16px 16px',
					flexDirection: 'column',
					flex: 1,
					display: 'flex',
				}}
			>
				{/* Seller info */}
				<div
					style={{
						textAlign: 'center',
						marginBottom: '16px',
						fontStyle: 'italic',
						fontSize: '10px',
						fontFamily: 'Geist',
						display: 'flex',
						color: '#6b7280',
					}}
				>
					{t.soldBy} {user.firstName ?? 'Anonymous'}
				</div>

				{/* Title and price */}
				<div
					style={{
						marginBottom: '12px',
						justifyContent: 'space-between',
						display: 'flex',
						alignItems: 'flex-start',
					}}
				>
					<div
						style={{
							maxWidth: '180px',
							lineHeight: 1.2,
							fontWeight: 'bold',
							fontSize: '16px',
							fontFamily: 'Geist',
							display: 'flex',
							color: '#111827',
						}}
					>
						{event.name}
					</div>
					<div
						style={{
							flexDirection: 'column',
							display: 'flex',
							alignItems: 'flex-end',
						}}
					>
						<div
							style={{
								fontWeight: 'bold',
								fontSize: '18px',
								fontFamily: 'Geist',
								display: 'flex',
								color: '#111827',
							}}
						>
							{convertedPrice}
						</div>
						{originalPrice > 0 && originalPrice > bib.price && (
							<div
								style={{
									textDecoration: 'line-through',
									fontStyle: 'italic',
									fontSize: '12px',
									fontFamily: 'Geist',
									display: 'flex',
									color: '#6b7280',
								}}
							>
								{convertedOriginalPrice}
							</div>
						)}
					</div>
				</div>

				{/* Event details */}
				<div
					style={{
						gap: '8px',
						flexDirection: 'column',
						display: 'flex',
					}}
				>
					{/* Date */}
					<div
						style={{
							gap: '8px',
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
							<path
								stroke="#6b7280"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M3 9h18M7 3v2m10-2v2M6 13h2m-2 4h2m3-4h2m-2 4h2m3-4h2m-2 4h2M6.2 21h11.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C21 19.48 21 18.92 21 17.8V8.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C19.48 5 18.92 5 17.8 5H6.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C3 6.52 3 7.08 3 8.2v9.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C4.52 21 5.08 21 6.2 21"
							></path>
						</svg>
						<div
							style={{
								fontSize: '11px',
								fontFamily: 'Geist',
								display: 'flex',
								color: '#6b7280',
							}}
						>
							{formatDateWithLocale(event.date, locale)}
						</div>
					</div>
					{/* Location and distance */}
					<div
						style={{
							gap: '8px',
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
							<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
							<circle cx="12" cy="10" r="3" />
						</svg>
						<div
							style={{
								gap: '4px',
								fontSize: '11px',
								fontFamily: 'Geist',
								display: 'flex',
								color: '#6b7280',
								alignItems: 'center',
							}}
						>
							<span>{event.location}</span>
							<span>•</span>
							<span>
								{event.distance}
								<span style={{ fontStyle: 'italic' }}>{event.distanceUnit}</span>
							</span>
						</div>
					</div>

					{/* Participants */}
					<div
						style={{
							gap: '8px',
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
							<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
							<circle cx="12" cy="7" r="4" />
						</svg>
						<div
							style={{
								fontSize: '11px',
								fontFamily: 'Geist',
								display: 'flex',
								color: '#6b7280',
							}}
						>
							{formatParticipantCount(event.participantCount)} {t.participants}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
