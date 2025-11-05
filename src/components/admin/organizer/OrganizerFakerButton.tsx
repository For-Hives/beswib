'use client'

import { useEffect, useState } from 'react'
import type { UseFormSetValue } from 'react-hook-form'

import { Button } from '@/components/ui/button'

interface OrganizerFakerButtonProps {
	setValue: UseFormSetValue<OrganizerFormData>
}

// Type for organizer form data - server-safe
interface OrganizerFormData {
	email: string
	isPartnered: boolean
	logoFile?: unknown
	name: string
	website?: string
}

// Simple faker functions for organizer data
const faker = {
	internet: {
		url: () => {
			const domains = [
				'marathon-events.fr',
				'trail-adventures.com',
				'course-organisee.fr',
				'sport-events.org',
				'running-club.net',
			]
			return `https://www.${domains[Math.floor(Math.random() * domains.length)]}`
		},
		email: () => {
			const domains = ['gmail.com', 'outlook.fr', 'yahoo.com', 'hotmail.fr', 'free.fr']
			const prefixes = ['contact', 'info', 'admin', 'organisation', 'hello', 'team']
			return `${prefixes[Math.floor(Math.random() * prefixes.length)]}@${domains[Math.floor(Math.random() * domains.length)]}`
		},
	},
	company: {
		name: () => {
			const types = ['Marathon', 'Trail', 'Ultra', 'Course', 'Challenge', 'Run', 'Sport', 'Athletic']
			const locations = [
				'Paris',
				'Lyon',
				'Marseille',
				'Bordeaux',
				'Nice',
				'Toulouse',
				'Nantes',
				'Strasbourg',
				'Montpellier',
				'Lille',
				'Annecy',
				'Chamonix',
				'Grenoble',
				'Cannes',
				'Biarritz',
			]
			const suffixes = ['Organisation', 'Events', 'Club', 'Association', 'Federation', 'Team', 'Academy', 'Experience']

			const useLocation = Math.random() > 0.5
			if (useLocation) {
				return `${types[Math.floor(Math.random() * types.length)]} de ${locations[Math.floor(Math.random() * locations.length)]}`
			} else {
				return `${types[Math.floor(Math.random() * types.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`
			}
		},
	},
}

// Check if we're in development mode and on localhost
const isDevelopment = () => {
	if (typeof window === 'undefined') return false

	const hostname = window.location.hostname
	const isDev = process.env.NODE_ENV === 'development'
	const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')

	return isDev && isLocalhost
}

export default function OrganizerFakerButton({ setValue }: OrganizerFakerButtonProps) {
	const [showFaker, setShowFaker] = useState(false)

	useEffect(() => {
		setShowFaker(isDevelopment())
	}, [])

	const fillWithFakeData = () => {
		const organizerName = faker.company.name()

		const fakeData: Partial<OrganizerFormData> = {
			website: faker.internet.url(),
			name: organizerName,
			isPartnered: Math.random() > 0.3, // 70% chance of being partnered
			email: faker.internet.email(),
		}

		// Fill form with fake data
		Object.entries(fakeData).forEach(([key, value]) => {
			if (value !== undefined) {
				setValue(key as keyof OrganizerFormData, value)
			}
		})

		console.info('🎭 Fake organizer data generated:', fakeData)
	}

	// Don't render in production
	if (!showFaker) {
		return null
	}

	return (
		<div className="absolute top-4 right-4 z-50">
			<Button
				className="border-yellow-300 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
				onClick={fillWithFakeData}
				size="sm"
				type="button"
				variant="outline"
			>
				🎲 Fill with test data
			</Button>
		</div>
	)
}
