import * as React from 'react'

import type { Organizer } from '@/models/organizer.model'
import type { Event } from '@/models/event.model'
import type { Locale } from '@/lib/i18n/config'

import eventTranslations from '@/app/[locale]/events/[id]/locales.json'
import { getCurrencyForLocale } from '@/lib/utils/currency'
import { getOrganizerImageUrl } from '@/lib/utils/images'
import { formatDateWithLocale } from '@/lib/utils/date'
import { getTranslations } from '@/lib/i18n/dictionary'

// Helper function to get background color based on event type
function getTypeColor(type: Event['typeCourse']) {
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
function getTypeLabel(type: Event['typeCourse'], locale: Locale) {
	const t = getTranslations(locale, eventTranslations)
	const typeLabels = t.event?.typeLabels as Record<string, string> | undefined
	return typeLabels?.[type] ?? type
}

// Helper function to format participant count
function formatParticipantCount(participantCount: number) {
	return participantCount.toLocaleString('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	})
}

// OpenGraph-compatible price formatting
function formatPriceForOG(price: number, currencyCode: string): string {
	switch (currencyCode) {
		case 'krw':
			return `${Math.round(price).toLocaleString()} KRW`
		case 'ron':
			return `${price.toFixed(2)} RON`
		case 'usd':
			return `$${price.toFixed(2)}`
		case 'eur':
		default:
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

interface EventCardProps {
	event: Event
	locale: Locale
	organizer?: Organizer
	exchangeRates?: Record<string, number> | null
}

export default function EventCard({ organizer, locale, exchangeRates, event }: Readonly<EventCardProps>) {
	const t = getTranslations(locale, eventTranslations)

	// Currency conversion for official price
	const targetCurrency = getCurrencyForLocale(locale)
	const convertedPrice =
		event.officialStandardPrice != null
			? convertPriceWithFallback(event.officialStandardPrice, targetCurrency, exchangeRates)
			: null

	if (event == null) {
		return <div style={{ width: '280px', height: '380px', borderRadius: '16px', backgroundColor: '#f3f4f6' }} />
	}

	const typeColors = getTypeColor(event.typeCourse)
	const typeLabel = getTypeLabel(event.typeCourse, locale)

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
						getOrganizerImageUrl(organizer, event.id).startsWith('/')
							? `https://beswib.com${getOrganizerImageUrl(organizer, event.id)}`
							: getOrganizerImageUrl(organizer, event.id)
					}
					alt="Event image"
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
						display: 'flex',
						color: 'white',
						borderRadius: '20px',
						border: `1px solid ${typeColors.border}`,
						backgroundColor: typeColors.bg,
					}}
				>
					{typeLabel}
				</div>

				{/* Official price badge */}
				{convertedPrice != null && (
					<div
						style={{
							top: '8px',
							right: '8px',
							position: 'absolute',
							padding: '4px 12px',
							fontWeight: '500',
							fontSize: '11px',
							fontFamily: 'Geist',
							display: 'flex',
							color: 'white',
							borderRadius: '20px',
							border: '1px solid rgba(34, 197, 94, 0.5)',
							backgroundColor: 'rgba(34, 197, 94, 0.15)',
						}}
					>
						{convertedPrice}
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
				{/* Organizer info */}
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
					{organizer?.name ?? t.event?.title ?? 'Event'}
				</div>

				{/* Title and participants */}
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
						{event.participants != null && (
							<div
								style={{
									fontWeight: 'bold',
									fontSize: '14px',
									fontFamily: 'Geist',
									display: 'flex',
									color: '#111827',
								}}
							>
								{formatParticipantCount(event.participants)}
							</div>
						)}
						<div
							style={{
								fontStyle: 'italic',
								fontSize: '10px',
								fontFamily: 'Geist',
								display: 'flex',
								color: '#6b7280',
							}}
						>
							{t.event?.participants ?? 'participants'}
						</div>
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
							{formatDateWithLocale(event.eventDate, locale)}
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
							{event.distanceKm != null && (
								<>
									<span>•</span>
									<span>
										{event.distanceKm}
										<span style={{ fontStyle: 'italic' }}>km</span>
									</span>
								</>
							)}
						</div>
					</div>

					{/* Elevation gain */}
					{event.elevationGainM != null && (
						<div
							style={{
								gap: '8px',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" fill="#6b7280">
								<path d="m17.012 3.021-.912 1.66-6.522 11.856-1.916-1.916-.66 1.098-5.86 9.767L.235 27h31.284l-.598-1.395-3-7-.582-1.357-2.068 2.068-7.403-14.605zm-.073 4.282 3.04 5.996-.774.664-2.28-1.953-2.279 1.953-.93-.799zm-.013 7.34 2.28 1.953 1.702-1.46 3.2 6.315.622 1.233 1.932-1.932L28.482 25H3.766q2.146-3.578 4.293-7.154l1.988 1.988.642-1.166q1.022-1.857 2.043-3.713l1.914 1.64z"></path>
							</svg>
							<div
								style={{
									fontSize: '11px',
									fontFamily: 'Geist',
									display: 'flex',
									color: '#6b7280',
								}}
							>
								+{event.elevationGainM}m {t.event?.elevationGain ?? 'elevation'}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
