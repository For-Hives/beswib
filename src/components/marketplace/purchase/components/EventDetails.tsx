'use client'

import React from 'react'

import type { BibSale } from '@/components/marketplace/CardMarket'
import type { Event } from '@/models/event.model'
import type { Organizer } from '@/models/organizer.model'

interface EventDetailsProps {
	/** The bib sale data containing event information */
	bib: BibSale
	/** Optional event data with additional details */
	eventData?: Event & { expand?: { organizer: Organizer } }
	/** Optional organizer data */
	organizerData?: Organizer
}

/**
 * Component that displays detailed event information including description and organizer details
 * Shows event stats, description, and organizer information in a structured layout
 */
export default function EventDetails({ bib, eventData, organizerData }: EventDetailsProps) {
	return (
		<div className="mt-6">
			{/* Event Description with Organizer Info */}
			{eventData?.description != null && eventData.description.trim() !== '' ? (
				<div className="border-border/50 bg-card/50 rounded-lg border p-4 backdrop-blur-sm">
					<h3 className="text-primary mb-3 text-sm font-semibold">À propos de cet événement</h3>
					<p className="text-foreground/80 mb-4 text-sm leading-relaxed">{eventData.description}</p>

					{/* Organizer Information */}
					{(organizerData != null || eventData?.expand?.organizer != null) && (
						<div className="border-border/30 border-t pt-4">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<p className="text-muted-foreground mb-1 text-xs font-medium">Organisé par</p>
									<p className="text-foreground text-sm font-medium">
										{organizerData?.name ?? eventData?.expand?.organizer?.name ?? 'Unknown Organizer'}
									</p>

									{/* Website Link */}
									{((organizerData?.website != null && organizerData.website.trim() !== '') ||
										(eventData?.expand?.organizer?.website != null &&
											eventData.expand.organizer.website.trim() !== '')) && (
										<a
											href={organizerData?.website ?? eventData?.expand?.organizer?.website ?? '#'}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:text-primary/80 mt-1 inline-block text-xs font-medium underline"
										>
											{organizerData?.website ?? eventData?.expand?.organizer?.website}
										</a>
									)}
								</div>

								{/* Verified Partner Badge */}
								{(organizerData?.isPartnered === true || eventData?.expand?.organizer?.isPartnered === true) && (
									<div className="ml-3 flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/15 px-2.5 py-1">
										<div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
										<span className="text-xs font-medium text-green-400">Vérifié</span>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			) : (
				<div className="border-border/50 bg-card/50 rounded-lg border p-4 backdrop-blur-sm">
					<h3 className="text-primary mb-3 text-sm font-semibold">À propos de cet événement</h3>
					<p className="text-foreground/80 mb-4 text-sm leading-relaxed">
						Secure your spot for {bib.event.name}. This race bib includes all official race materials and registration
						transfer to your name.
					</p>

					{/* Organizer Information - Fallback */}
					{(organizerData != null || eventData?.expand?.organizer != null) && (
						<div className="border-border/30 border-t pt-4">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<p className="text-muted-foreground mb-1 text-xs font-medium">Organisé par</p>
									<p className="text-foreground text-sm font-medium">
										{organizerData?.name ?? eventData?.expand?.organizer?.name ?? 'Unknown Organizer'}
									</p>

									{/* Website Link - Fallback */}
									{((organizerData?.website != null && organizerData.website.trim() !== '') ||
										(eventData?.expand?.organizer?.website != null &&
											eventData.expand.organizer.website.trim() !== '')) && (
										<a
											href={organizerData?.website ?? eventData?.expand?.organizer?.website ?? '#'}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:text-primary/80 mt-1 inline-block text-xs font-medium underline"
										>
											{organizerData?.website ?? eventData?.expand?.organizer?.website}
										</a>
									)}
								</div>

								{/* Verified Partner Badge - Fallback */}
								{(organizerData?.isPartnered === true || eventData?.expand?.organizer?.isPartnered === true) && (
									<div className="ml-3 flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/15 px-2.5 py-1">
										<div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
										<span className="text-xs font-medium text-green-400">Vérifié</span>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
