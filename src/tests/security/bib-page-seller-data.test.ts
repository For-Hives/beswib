// @vitest-environment node
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mockPocketbase } from '@/tests/mocks/pocketbase'

// The page of a bib is public, and what a Server Component passes to a Client Component is written in
// the HTML of every visitor. The bib comes from PocketBase with the whole record of its seller expanded
// (e-mail, phone, address, birth date, emergency contact): the page must hand over the name shown on
// the card, nothing else.

vi.mock('@clerk/nextjs/server', () => ({
	auth: vi.fn(() => Promise.resolve({ userId: null })),
}))
vi.mock('@/lib/services/pocketbase', () => ({
	pb: mockPocketbase,
}))
vi.mock('@/app/[locale]/marketplace/[id]/MarketplaceItemClient', () => ({
	default: () => null,
}))
vi.mock('@/services/bib.services', () => ({
	fetchPublicBibById: vi.fn(),
	fetchPrivateBibByToken: vi.fn(),
	checkBibListingStatus: vi.fn(),
}))
vi.mock('@/services/organizer.services', () => ({
	fetchOrganizerById: vi.fn(() => Promise.resolve(null)),
}))
vi.mock('@/services/user.services', () => ({
	fetchUserByClerkId: vi.fn(),
}))

import MarketplaceItemPage from '@/app/[locale]/marketplace/[id]/page'
import type { Bib } from '@/models/bib.model'
import { checkBibListingStatus, fetchPrivateBibByToken, fetchPublicBibById } from '@/services/bib.services'

const TOKEN = 'Zq7Lm2Xc9Vb4Nk8Jh5Gf1Ds6Ap3Wo0Ei'

// The record of the seller as PocketBase expands it on the bib
const seller = {
	role: 'user',
	postalCode: '74000',
	phoneNumber: '+33600000000',
	lastName: 'Seller',
	id: 'seller_pb',
	firstName: 'Sam',
	emergencyContactPhone: '+33611111111',
	emergencyContactName: 'Emergency Contact',
	email: 'sam.seller@example.com',
	contactEmail: 'sam.contact@example.com',
	clerkId: 'clerk_seller_secret',
	city: 'Annecy',
	birthDate: '1990-05-01 00:00:00.000Z',
	address: '1 rue du Lac',
}
const SELLER_PRIVATE_VALUES = [
	seller.email,
	seller.contactEmail,
	seller.phoneNumber,
	seller.address,
	seller.postalCode,
	seller.birthDate,
	seller.emergencyContactName,
	seller.emergencyContactPhone,
	seller.clerkId,
]

function bibRecord(listed: 'private' | 'public') {
	return {
		validated: true,
		status: 'available',
		sellerUserId: seller.id,
		registrationNumber: 'REG-42',
		privateListingToken: listed === 'private' ? TOKEN : undefined,
		price: 100,
		originalPrice: 120,
		optionValues: {},
		lockedAt: null,
		listed,
		id: 'bib_1',
		expand: {
			sellerUserId: seller,
			eventId: {
				typeCourse: 'trail',
				participants: 1200,
				name: 'Trail des Crêtes',
				location: 'Annecy, France',
				id: 'event_1',
				eventDate: '2031-06-01 08:00:00.000Z',
				distanceKm: 42,
			},
		},
		eventId: 'event_1',
	} as unknown as Bib & { expand: { eventId: never; sellerUserId: never } }
}

async function renderPage(searchParams: { tkn?: string } = {}) {
	const element = (await MarketplaceItemPage({
		searchParams: Promise.resolve(searchParams),
		params: Promise.resolve({ locale: 'fr', id: 'bib_1' }),
	})) as ReactElement<Record<string, unknown>>
	return element.props
}

beforeEach(() => {
	vi.clearAllMocks()
})

describe('what the page of a bib sends to the browser', () => {
	it.each([
		['public', {}],
		['private', { tkn: TOKEN }],
	] as const)(
		'hands over the name of the seller of a %s listing, and no personal data',
		async (listed, searchParams) => {
			vi.mocked(checkBibListingStatus).mockResolvedValue({ listed, exists: true, available: true })
			vi.mocked(fetchPublicBibById).mockResolvedValue(bibRecord('public'))
			vi.mocked(fetchPrivateBibByToken).mockResolvedValue(bibRecord('private'))

			const props = await renderPage(searchParams)

			expect(props).not.toHaveProperty('sellerUser')
			expect(props.bibSale).toMatchObject({ user: { lastName: 'Seller', id: 'seller_pb', firstName: 'Sam' } })
			const sent = JSON.stringify(props)
			for (const value of SELLER_PRIVATE_VALUES) expect(sent).not.toContain(value)
		}
	)

	it('does not send the raw bib record, which carries the expanded seller', async () => {
		vi.mocked(checkBibListingStatus).mockResolvedValue({ listed: 'public', exists: true, available: true })
		vi.mocked(fetchPublicBibById).mockResolvedValue(bibRecord('public'))

		const props = await renderPage()

		expect(props).not.toHaveProperty('bibData')
		expect(JSON.stringify(props)).not.toContain('"expand":{"sellerUserId"')
	})

	it('sends no seller at all for a private listing opened without its token', async () => {
		vi.mocked(checkBibListingStatus).mockResolvedValue({ listed: 'private', exists: true, available: true })

		const props = await renderPage()

		expect(props.bibSale).toBeUndefined()
		expect(fetchPublicBibById).not.toHaveBeenCalled()
	})
})
