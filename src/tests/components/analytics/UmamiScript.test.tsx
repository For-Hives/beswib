import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { registerBeforeSend, flushQueue } = vi.hoisted(() => ({
	registerBeforeSend: vi.fn(),
	flushQueue: vi.fn(),
}))

vi.mock('@/lib/analytics/before-send', () => ({ registerBeforeSend }))
vi.mock('@/lib/analytics/client', () => ({ flushQueue }))
// next/script injects the tag itself. Here it renders a plain element carrying the same props, so
// they can be read (a real <script async src> would be hoisted out of the container by React).
vi.mock('next/script', () => ({
	default: ({ onLoad, strategy, ...props }: Record<string, unknown> & { onLoad?: () => void; strategy?: string }) => (
		<span {...props} data-strategy={strategy} data-mock="next-script" ref={() => onLoad?.()} />
	),
}))

type UmamiScriptModule = typeof import('@/components/analytics/UmamiScript')

let container: HTMLDivElement
let root: Root

async function loadComponent(): Promise<UmamiScriptModule['UmamiScript']> {
	vi.resetModules()
	return (await import('@/components/analytics/UmamiScript')).UmamiScript
}

function script(): HTMLElement | null {
	return container.querySelector<HTMLElement>('[data-mock="next-script"]')
}

beforeEach(() => {
	Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true)
	registerBeforeSend.mockReset()
	flushQueue.mockReset()
	container = document.createElement('div')
	document.body.appendChild(container)
	root = createRoot(container)
})

afterEach(() => {
	act(() => root.unmount())
	container.remove()
	vi.unstubAllEnvs()
})

describe('UmamiScript', () => {
	it('renders nothing on the server: the tracker tag is never in the HTML', async () => {
		registerBeforeSend.mockReturnValue(true)
		const UmamiScript = await loadComponent()
		expect(renderToString(<UmamiScript version="v1.2.3" />)).toBe('')
		expect(registerBeforeSend).not.toHaveBeenCalled()
	})

	it('does not render the tracker when the hook could not be registered', async () => {
		registerBeforeSend.mockReturnValue(false)
		const UmamiScript = await loadComponent()
		act(() => root.render(<UmamiScript version="v1.2.3" />))
		expect(registerBeforeSend).toHaveBeenCalled()
		expect(script()).toBeNull()
	})

	it('registers the hook before the tracker tag exists', async () => {
		let scriptPresentAtRegistration: boolean | null = null
		registerBeforeSend.mockImplementation(() => {
			scriptPresentAtRegistration = script() !== null
			return true
		})
		const UmamiScript = await loadComponent()
		act(() => root.render(<UmamiScript version="v1.2.3" />))
		expect(scriptPresentAtRegistration).toBe(false)
		expect(script()).not.toBeNull()
	})

	it('renders the tracker with its attributes once the hook is registered', async () => {
		registerBeforeSend.mockReturnValue(true)
		const UmamiScript = await loadComponent()
		act(() => root.render(<UmamiScript version="v1.2.3" />))

		const tag = script()
		expect(tag?.getAttribute('src')).toBe('https://umami.wadefade.fr/script.js')
		expect(tag?.getAttribute('id')).toBe('umami-script')
		expect(tag?.getAttribute('data-website-id')).toBe('e9168017-b73b-491b-b7b0-fee64f07c847')
		expect(tag?.getAttribute('data-domains')).toBe('beswib.com')
		expect(tag?.getAttribute('data-tag')).toBe('v1.2.3')
		expect(tag?.getAttribute('data-before-send')).toBe('beswibBeforeSend')
		expect(tag?.getAttribute('data-exclude-hash')).toBe('true')
		expect(tag?.getAttribute('data-strategy')).toBe('afterInteractive')
	})

	it('does not turn on what was not asked for', async () => {
		registerBeforeSend.mockReturnValue(true)
		const UmamiScript = await loadComponent()
		act(() => root.render(<UmamiScript version="v1.2.3" />))
		const names = script()?.getAttributeNames() ?? []
		expect(names).not.toContain('data-performance')
		expect(names).not.toContain('data-do-not-track')
		// It would remove utm_* before the hook sees them
		expect(names).not.toContain('data-exclude-search')
		expect(names).not.toContain('data-host-url')
	})

	it('flushes the events that were waiting once the tracker has loaded', async () => {
		registerBeforeSend.mockReturnValue(true)
		const UmamiScript = await loadComponent()
		act(() => root.render(<UmamiScript version="v1.2.3" />))
		expect(flushQueue).toHaveBeenCalled()
	})

	it('takes the host and the domains from the two optional variables', async () => {
		vi.stubEnv('NEXT_PUBLIC_UMAMI_HOST', 'http://localhost:3001/')
		vi.stubEnv('NEXT_PUBLIC_UMAMI_DOMAINS', 'localhost,beswib.com')
		registerBeforeSend.mockReturnValue(true)
		const UmamiScript = await loadComponent()
		act(() => root.render(<UmamiScript version="v1.2.3" />))
		expect(script()?.getAttribute('src')).toBe('http://localhost:3001/script.js')
		expect(script()?.getAttribute('data-domains')).toBe('localhost,beswib.com')
	})

	it('falls back to the defaults when the variables are empty', async () => {
		vi.stubEnv('NEXT_PUBLIC_UMAMI_HOST', '  ')
		vi.stubEnv('NEXT_PUBLIC_UMAMI_DOMAINS', '')
		registerBeforeSend.mockReturnValue(true)
		const UmamiScript = await loadComponent()
		act(() => root.render(<UmamiScript version="v1.2.3" />))
		expect(script()?.getAttribute('src')).toBe('https://umami.wadefade.fr/script.js')
		expect(script()?.getAttribute('data-domains')).toBe('beswib.com')
	})
})
