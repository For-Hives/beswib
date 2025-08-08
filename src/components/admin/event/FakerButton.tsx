'use client'

import { UseFormSetValue } from 'react-hook-form'
import { useEffect, useState } from 'react'

import { getAllOrganizersAction } from '@/app/[locale]/admin/actions'
import { EventOption } from '@/models/eventOption.model'
import { Organizer } from '@/models/organizer.model'
import { Button } from '@/components/ui/button'

import { EventFormData } from './types'

interface FakerButtonProps {
	setEventOptions?: (options: EventOption[]) => void
	setValue: UseFormSetValue<EventFormData>
}

// Simple faker functions without external dependencies
const faker = {
	number: {
		int: (options: { max: number; min: number }) => {
			return Math.floor(Math.random() * (options.max - options.min + 1)) + options.min
		},
		float: (options: { max: number; min: number; precision?: number }) => {
			const value = Math.random() * (options.max - options.min) + options.min
			return options.precision !== undefined ? parseFloat(value.toFixed(options.precision)) : value
		},
	},
	lorem: {
		paragraph: () => {
			const sentences = [
				'Cette course exceptionnelle vous emmènera à travers des paysages magnifiques.',
				'Parcourez des sentiers authentiques dans un cadre naturel préservé.',
				'Une expérience unique pour tous les niveaux de coureurs.',
				'Découvrez la beauté de nos régions à travers cette aventure sportive.',
				'Un défi sportif dans un environnement exceptionnel.',
				'Rejoignez-nous pour cette course inoubliable.',
			]
			return sentences.slice(0, Math.floor(Math.random() * 3) + 2).join(' ')
		},
	},
	location: {
		city: () => {
			const cities = [
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
				'Rennes',
				'Reims',
				'Annecy',
				'Chamonix',
				'Grenoble',
			]
			return cities[Math.floor(Math.random() * cities.length)]
		},
	},
	internet: {
		url: () => {
			const domains = ['example.com', 'test.fr', 'demo.org', 'sample.net']
			const paths = ['inscription', 'register', 'course', 'event', 'parcours', 'map']
			return `https://www.${domains[Math.floor(Math.random() * domains.length)]}/${paths[Math.floor(Math.random() * paths.length)]}`
		},
	},
	date: {
		future: (options?: { days?: number }) => {
			const days = options?.days ?? 365
			const futureDate = new Date()
			futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * days) + 1)
			return futureDate.toISOString().split('T')[0]
		},
		between: (from: Date, to: Date) => {
			const fromTime = from.getTime()
			const toTime = to.getTime()
			const randomTime = fromTime + Math.random() * (toTime - fromTime)
			return new Date(randomTime).toISOString().split('T')[0]
		},
	},
	company: {
		name: () => {
			const prefixes = ['Marathon', 'Trail', 'Ultra', 'Course', 'Challenge', 'Run']
			const locations = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Nice', 'Toulouse', 'Nantes', 'Strasbourg']
			const suffixes = ['Classic', 'Adventure', 'Experience', 'Festival', 'Championship']

			return `${prefixes[Math.floor(Math.random() * prefixes.length)]} de ${locations[Math.floor(Math.random() * locations.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`
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

export default function FakerButton({ setValue, setEventOptions }: Readonly<FakerButtonProps>) {
	const [showFaker, setShowFaker] = useState(false)
	const [organizers, setOrganizers] = useState<Organizer[]>([])

	useEffect(() => {
		setShowFaker(isDevelopment())

		// Load organizers for faker
		if (isDevelopment()) {
			const loadOrganizers = async () => {
				try {
					const result = await getAllOrganizersAction()
					if (result.success && result.data) {
						setOrganizers(result.data)
					}
				} catch (error) {
					console.error('Error loading organizers for faker:', error)
				}
			}
			void loadOrganizers()
		}
	}, [])

	const fillWithFakeData = () => {
		// Generate event date (future)
		const eventDate = faker.date.future({ days: 180 })
		const eventDateObj = new Date(eventDate)

		// Generate pickup dates (before event date)
		const pickupBeginDate = new Date(eventDateObj)
		pickupBeginDate.setDate(pickupBeginDate.getDate() - faker.number.int({ min: 7, max: 30 }))

		const pickupEndDate = new Date(pickupBeginDate)
		pickupEndDate.setDate(pickupEndDate.getDate() + faker.number.int({ min: 1, max: 7 }))

		// Generate transfer deadline (before event date)
		const transferDeadline = new Date(eventDateObj)
		transferDeadline.setDate(transferDeadline.getDate() - faker.number.int({ min: 1, max: 14 }))

		// Select a random organizer if available
		const randomOrganizer =
			organizers.length > 0 ? organizers[faker.number.int({ min: 0, max: organizers.length - 1 })] : null

		const fakeData: Partial<EventFormData> = {
			typeCourse: ['road', 'trail', 'triathlon', 'cycle'][faker.number.int({ min: 0, max: 3 })] as
				| 'road'
				| 'trail'
				| 'triathlon'
				| 'cycle',
			transferDeadline: transferDeadline.toISOString().split('T')[0],
			registrationUrl: faker.internet.url(),
			participants: faker.number.int({ min: 50, max: 2000 }),
			parcoursUrl: faker.internet.url(),
			organizer: randomOrganizer?.id ?? '', // Use actual organizer ID
			options: [
				{
					values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
					required: true,
					label: 'Taille du t-shirt',
					key: 'taille',
				},
				{
					values: ['Oui', 'Non'],
					required: false,
					label: 'Transport navette',
					key: 'transport',
				},
				{
					values: ['Végétarien', 'Omnivore', 'Végan'],
					required: true,
					label: 'Repas après course',
					key: 'repas',
				},
			],
			officialStandardPrice: faker.number.float({ precision: 2, min: 15, max: 150 }),
			name: faker.company.name(),
			location: faker.location.city(),
			isPartnered: Math.random() > 0.5,
			eventDate: eventDate,
			elevationGainM: faker.number.int({ min: 0, max: 3000 }),
			distanceKm: faker.number.float({ precision: 1, min: 5, max: 100 }),
			description: faker.lorem.paragraph(),
			bibPickupWindowEndDate: pickupEndDate.toISOString().split('T')[0],
			bibPickupWindowBeginDate: pickupBeginDate.toISOString().split('T')[0],
			bibPickupLocation: `${faker.location.city()} - Centre ville`,
		}

		// Fill form with fake data
		Object.entries(fakeData).forEach(([key, value]) => {
			if (value !== undefined) {
				setValue(key as keyof EventFormData, value)
			}
		})

		// Update event options state if setEventOptions is provided
		if (setEventOptions && fakeData.options) {
			setEventOptions(fakeData.options as EventOption[])
		}
	}

	if (!showFaker) {
		return null
	}

	return (
		<div className="absolute top-4 right-4 z-10">
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
