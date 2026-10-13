import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
	usePathname: () => '/en',
	useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

import HeaderClient from '@/components/global/HeaderClient'

describe('HeaderClient', () => {
	it('keeps the height of the header in the server HTML, before the header itself renders', () => {
		// The header only renders after a short wait on the client. Without this space the page starts
		// at the top of the window and is pushed down by 64px when the header arrives: a layout shift.
		expect(renderToString(<HeaderClient locale="en" />)).toBe('<div class="h-16"></div>')
	})
})
