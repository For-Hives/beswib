import * as React from 'react'

import type { BibSale } from '@/models/marketplace.model'
import type { Organizer } from '@/models/organizer.model'
import type { Event } from '@/models/event.model'
import type { User } from '@/models/user.model'
import type { Locale } from '@/lib/i18n/config'
import type { Bib } from '@/models/bib.model'

import { formatDateWithLocale } from '@/lib/utils/date'

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

// Helper function to get event type label
function getTypeLabel(type: BibSale['event']['type'], locale: Locale) {
	const labels: Record<string, Record<string, string>> = {
		fr: {
			triathlon: 'Triathlon',
			trail: 'Trail',
			road: 'Route',
			other: 'Autre',
			cycle: 'Cyclisme',
		},
		en: {
			triathlon: 'Triathlon',
			trail: 'Trail',
			road: 'Road',
			other: 'Other',
			cycle: 'Cycling',
		},
	}

	const localeLabels = labels[locale] ?? labels.en
	return localeLabels[type] ?? localeLabels.other
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
		type: event.typeCourse as 'cycle' | 'other' | 'road' | 'trail' | 'triathlon',
		participantCount: event.participants ?? 0,
		name: event.name,
		location: event.location,
		image: 'https://via.placeholder.com/300x200', // Placeholder since Event model doesn't have image
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
}

function formatImage(image: string) {
	// If image is already a full URL, return it
	if (image.startsWith('http')) {
		return image
	}

	// If image is in the new format (filename only), construct the full URL
	if (image?.includes('_')) {
		return `https://api.staging.beswib.com/api/files/pbc_4261386219/4x60p60un9x29wm/${image}?token=`
	}

	// Default fallback image
	return 'https://beswib.com/bib-blue.png'
}

export default function BibCard({ organizer, locale, bib }: Readonly<BibCardProps>) {
	const event = getEventFromBib(bib)
	const user = getUserFromBib(bib)

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
					height: '160px',
					display: 'flex',
					borderRadius: '12px',
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundImage: `url(${formatImage(organizer?.logo ?? '')})`,
					backgroundColor: '#f3f4f6',
					alignItems: 'center',
				}}
			>
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
					vendu par {user.firstName ?? 'Anonymous'}
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
							{bib.price}€
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
								{originalPrice}€
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
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
							<line x1="16" y1="2" x2="16" y2="6" />
							<line x1="8" y1="2" x2="8" y2="6" />
							<line x1="3" y1="10" x2="21" y2="10" />
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
							{formatParticipantCount(event.participantCount)} participants
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
