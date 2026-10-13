import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let pathname = '/en'
vi.mock('next/navigation', () => ({ usePathname: () => pathname }))

import PageTransition from '@/components/ui/PageTransition'

// PageTransition wraps every page of the app: the page leaving fades out, then
// the new one fades in. A page that stays blank, or the previous page staying on
// screen, is what a change in the animation library could bring.

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('PageTransition', () => {
	let container: HTMLDivElement
	let root: Root

	const show = (path: string, text: string) => {
		pathname = path
		act(() => {
			root.render(
				<PageTransition>
					<p>{text}</p>
				</PageTransition>
			)
		})
	}

	// In short slices: React only applies the end of an exit when an act() scope closes
	const settle = async (ms: number) => {
		for (let elapsed = 0; elapsed < ms; elapsed += 50) {
			await act(async () => {
				await sleep(50)
			})
		}
	}

	const pages = () => [...container.children].map(child => child as HTMLElement)

	beforeEach(() => {
		vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
		container = document.createElement('div')
		document.body.appendChild(container)
		root = createRoot(container)
	})

	afterEach(() => {
		act(() => root.unmount())
		container.remove()
		vi.unstubAllGlobals()
	})

	it('shows the first page fully once it has faded in', async () => {
		show('/en', 'home')
		await settle(800)

		expect(pages()).toHaveLength(1)
		expect(pages()[0].textContent).toBe('home')
		expect(pages()[0].style.opacity).toBe('1')
	})

	it('replaces the page when the path changes', async () => {
		show('/en', 'home')
		await settle(800)
		show('/en/blog', 'blog')
		await settle(1200)

		expect(pages()).toHaveLength(1)
		expect(pages()[0].textContent).toBe('blog')
		expect(pages()[0].style.opacity).toBe('1')
	})

	it('ends on the last page after two navigations in a row', async () => {
		show('/en', 'home')
		await settle(800)
		show('/en/faq', 'faq')
		await settle(100)
		show('/en/contact', 'contact')
		await settle(1500)

		expect(pages()).toHaveLength(1)
		expect(pages()[0].textContent).toBe('contact')
		expect(pages()[0].style.opacity).toBe('1')
	})
})
