import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ActionButtons from './ActionButtons'

// Mock the translations
vi.mock('@/lib/i18n/dictionary', () => ({
	getTranslations: () => ({
		eventDetails: 'Event Details',
		profileIncompleteTitle: 'Profile Incomplete',
		profileIncompleteBody: 'Please complete your profile',
		completeProfile: 'Complete Profile',
		ownBibTitle: 'Your Own Bib',
		ownBibBody: 'You cannot purchase your own bib',
		sellerDashboard: 'seller dashboard',
		signInToPurchase: 'Sign In to Purchase',
		purchaseBib: 'Purchase Bib',
	}),
}))

describe('ActionButtons', () => {
	const defaultProps = {
		isSignedIn: false,
		isProfileComplete: false,
		isOwnBib: false,
		locale: 'en' as const,
		onBuyNowClick: vi.fn(),
		eventId: 'test-event-123',
	}

	it('renders Event Details button with correct link', () => {
		render(<ActionButtons {...defaultProps} />)
		
		const eventDetailsButton = screen.getByText('Event Details')
		expect(eventDetailsButton).toBeInTheDocument()
		
		// Check that the button is wrapped in a Link with correct href
		const link = eventDetailsButton.closest('a')
		expect(link).toHaveAttribute('href', '/en/events/test-event-123')
	})

	it('renders Event Details button when user is signed in and profile is complete', () => {
		render(<ActionButtons {...defaultProps} isSignedIn={true} isProfileComplete={true} />)
		
		const eventDetailsButton = screen.getByText('Event Details')
		expect(eventDetailsButton).toBeInTheDocument()
	})

	it('does not render Event Details button when user owns the bib', () => {
		render(<ActionButtons {...defaultProps} isSignedIn={true} isOwnBib={true} />)
		
		const eventDetailsButton = screen.queryByText('Event Details')
		expect(eventDetailsButton).not.toBeInTheDocument()
	})
})
