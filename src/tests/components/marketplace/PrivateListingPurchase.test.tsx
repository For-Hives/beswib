import { inspect } from 'node:util'
import { act, type ReactNode, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The server refuses every purchase step of a private listing without its token (see
// src/tests/security/private-listing-purchase.test.ts). This file proves the other half: the page
// hands the token of the link to each of those steps, and to nothing else.

const { actions, push, track, trackView } = vi.hoisted(() => ({
	trackView: vi.fn(),
	track: vi.fn(),
	push: vi.fn(),
	actions: {
		lockBibForPurchase: vi.fn(),
		createSale: vi.fn(),
		checkPurchaseLock: vi.fn(),
		captureOrder: vi.fn(),
	},
}))

vi.mock('@/app/[locale]/purchase/actions', () => actions)
vi.mock('@/lib/analytics/client', () => ({ trackView, track }))
vi.mock('@clerk/nextjs', () => ({ useUser: () => ({ isSignedIn: true, isLoaded: true }) }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
vi.mock('sonner', () => ({ toast: { info: vi.fn(), error: vi.fn() } }))
vi.mock('@/lib/validation/user', () => ({ isUserProfileComplete: () => true }))
// The lockedAt parameter of the URL, kept in memory
vi.mock('nuqs', () => ({
	useQueryState: () => {
		const [value, setValue] = useState<string | null>(null)
		return [
			value,
			(next: string | null) => {
				setValue(next)
				return Promise.resolve(new URLSearchParams())
			},
		]
	},
}))

// The purchase UI, reduced to the three things a buyer does: Buy, pay (order creation), approve
vi.mock('@/components/marketplace/purchase/components', () => ({
	PriceDisplay: () => null,
	EventImage: () => null,
	EventDetails: () => null,
	ContentTabs: () => null,
	ActionButtons: ({ onBuyNowClick }: { onBuyNowClick: () => void }) => (
		<button type="button" data-testid="buy" onClick={onBuyNowClick} />
	),
}))
vi.mock('@/components/marketplace/purchase/components/PaymentDialog', () => ({
	default: ({
		onCreateOrder,
		onApprove,
		isOpen,
	}: {
		isOpen: boolean
		onCreateOrder: () => Promise<string>
		onApprove: (data: { orderID: string }) => Promise<void>
	}) =>
		isOpen ? (
			<>
				<button type="button" data-testid="pay" onClick={() => void onCreateOrder().catch(() => undefined)} />
				<button type="button" data-testid="approve" onClick={() => void onApprove({ orderID: ORDER_ID })} />
			</>
		) : null,
}))
vi.mock('@/components/marketplace/purchase/PayPalProvider', () => ({
	PayPalProvider: ({ children }: { children: ReactNode }) => children,
}))
vi.mock('@/components/marketplace/purchase/LockTimer', () => ({ LockTimer: () => null }))
vi.mock('@/components/marketplace/EventWaitlistCard', () => ({ EventWaitlistCard: () => null }))
vi.mock('@/components/marketplace/TokenValidation', () => ({ default: () => <div data-testid="token-form" /> }))
vi.mock('@/components/analytics/TrackView', () => ({ TrackView: () => null }))

import MarketplaceItemClient from '@/app/[locale]/marketplace/[id]/MarketplaceItemClient'
import type { Event } from '@/models/event.model'
import type { BibSale } from '@/models/marketplace.model'
import type { User } from '@/models/user.model'
import { mockEvent, mockUser } from '@/tests/mocks/data'

const TOKEN = 'Zq7Lm2Xc9Vb4Nk8Jh5Gf1Ds6Ap3Wo0Ei'
const ORDER_ID = 'ORDER-1234567890ABCDEFGH'
const MERCHANT_ID = 'SELLERMERCHANT01'
const LOCKED_AT = '2031-05-01 10:00:00.000Z'
const LOCK_KEY = '2031-05-01T10:00:00.000Z'

const seller: User = { ...mockUser, paypalMerchantId: MERCHANT_ID, id: 'seller_pb' }
const buyer: User = { ...mockUser, id: 'buyer_pb' }
const eventData: Event = { ...mockEvent, id: 'event_1' }
const bibSale: BibSale = {
	user: { lastName: 'Seller', id: seller.id, firstName: 'Sam' },
	status: 'available',
	price: 100,
	originalPrice: 120,
	lockedAt: null,
	id: 'bib_1',
	event: {
		type: 'trail',
		participantCount: 1200,
		name: 'Trail des Crêtes',
		location: 'Annecy, France',
		image: '/bib.png',
		id: 'event_1',
		distanceUnit: 'km',
		distance: 42,
		date: new Date('2031-06-01T08:00:00.000Z'),
	},
}

let container: HTMLDivElement
let root: Root

function renderBibPage(listing: { isPrivate: boolean; initialToken?: string }) {
	act(() =>
		root.render(
			<MarketplaceItemClient
				bibId={bibSale.id}
				locale="fr"
				initialToken={listing.initialToken}
				isPrivate={listing.isPrivate}
				bibSale={bibSale}
				sellerUser={seller}
				user={buyer}
				eventData={eventData}
				translations={{}}
			/>
		)
	)
}

async function click(testId: string) {
	const button = container.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`)
	expect(button, `button "${testId}"`).not.toBeNull()
	await act(async () => {
		button?.click()
		// Let the server action "answer" and the state updates that follow settle
		await new Promise(resolve => setTimeout(resolve, 0))
	})
}

async function buyThroughToCapture() {
	await click('buy')
	await click('pay')
	await click('approve')
}

beforeEach(() => {
	Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true)
	vi.clearAllMocks()
	actions.checkPurchaseLock.mockResolvedValue('unlocked')
	actions.lockBibForPurchase.mockResolvedValue({ lockedAt: LOCKED_AT })
	actions.createSale.mockResolvedValue({ transactionId: 'tx_1', success: true, orderId: ORDER_ID })
	actions.captureOrder.mockResolvedValue({ data: { status: 'COMPLETED', id: ORDER_ID } })
	vi.spyOn(console, 'error').mockImplementation(() => {})
	vi.spyOn(console, 'warn').mockImplementation(() => {})
	container = document.createElement('div')
	document.body.appendChild(container)
	root = createRoot(container)
})

afterEach(() => {
	act(() => root.unmount())
	container.remove()
	vi.restoreAllMocks()
})

describe('bib page of a private listing opened with its link', () => {
	it('gives the token of the link to every purchase step', async () => {
		renderBibPage({ isPrivate: true, initialToken: TOKEN })
		await buyThroughToCapture()

		expect(actions.checkPurchaseLock).toHaveBeenCalledExactlyOnceWith(bibSale.id, '', TOKEN)
		expect(actions.lockBibForPurchase).toHaveBeenCalledExactlyOnceWith(bibSale.id, TOKEN)
		expect(actions.createSale).toHaveBeenCalledExactlyOnceWith(bibSale.id, MERCHANT_ID, 'fr', TOKEN)
		expect(actions.captureOrder).toHaveBeenCalledExactlyOnceWith(ORDER_ID, LOCK_KEY, TOKEN)
		expect(push).toHaveBeenCalledExactlyOnceWith('/fr/purchase/success')
	})

	it('sends the token to no analytics event, no log and no navigation', async () => {
		renderBibPage({ isPrivate: true, initialToken: TOKEN })
		await buyThroughToCapture()

		// A refused capture too: the error path logs and tracks
		actions.captureOrder.mockResolvedValue({ errorKind: 'bib_not_found', error: 'Bib not found.' })
		await click('approve')

		const sent = inspect(
			[track, trackView, push, vi.mocked(console.error), vi.mocked(console.warn)].map(spy => spy.mock.calls),
			{ maxStringLength: null, maxArrayLength: null, depth: null }
		)
		expect(sent).toContain('purchase_success')
		expect(sent).toContain('bib_not_found')
		expect(sent).toContain("listing: 'private'")
		expect(sent).not.toContain(TOKEN)
	})

	it('shows the token form, and no purchase step, without a token', () => {
		renderBibPage({ isPrivate: true })

		expect(container.querySelector('[data-testid="token-form"]')).not.toBeNull()
		expect(container.querySelector('[data-testid="buy"]')).toBeNull()
	})
})

describe('bib page of a public listing', () => {
	it('goes through the purchase without any token', async () => {
		renderBibPage({ isPrivate: false })
		await buyThroughToCapture()

		expect(actions.checkPurchaseLock).toHaveBeenCalledExactlyOnceWith(bibSale.id, '', null)
		expect(actions.lockBibForPurchase).toHaveBeenCalledExactlyOnceWith(bibSale.id, null)
		expect(actions.createSale).toHaveBeenCalledExactlyOnceWith(bibSale.id, MERCHANT_ID, 'fr', null)
		expect(actions.captureOrder).toHaveBeenCalledExactlyOnceWith(ORDER_ID, LOCK_KEY, null)
		expect(push).toHaveBeenCalledExactlyOnceWith('/fr/purchase/success')
	})

	it('does not forward a tkn parameter that a public listing has no use for', async () => {
		renderBibPage({ isPrivate: false, initialToken: TOKEN })
		await buyThroughToCapture()

		expect(inspect(Object.values(actions).map(action => action.mock.calls))).not.toContain(TOKEN)
	})
})
