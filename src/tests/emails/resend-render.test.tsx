// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

import BeswibWelcomeEmail from '@/components/emails/BeswibWelcomeEmail'

// The app hands its templates to Resend as React elements (`react: <Template />`)
// and Resend renders them itself, through its own import of @react-email/render.
// If that package stops resolving, Resend throws and no e-mail leaves: this test
// goes through the real SDK, with only the network replaced.

describe('Resend renders the templates it is given', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('posts the HTML and the text of a React template', async () => {
		const { Resend } = await vi.importActual<typeof import('resend')>('resend')
		const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(Response.json({ id: 'email_123' })))
		vi.stubGlobal('fetch', fetchMock)

		const { data, error } = await new Resend('re_test_key').emails.send({
			from: 'Beswib <noreply@beswib.com>',
			to: 'runner@example.com',
			subject: 'Welcome',
			react: <BeswibWelcomeEmail firstName="Zoé" locale="fr" />,
		})

		expect(error).toBeNull()
		expect(data?.id).toBe('email_123')
		expect(fetchMock).toHaveBeenCalledTimes(1)
		const [url, options] = fetchMock.mock.calls[0]
		expect(String(url)).toBe('https://api.resend.com/emails')
		const sent = JSON.parse(String(options?.body)) as { html?: string; react?: unknown }
		expect(sent.html).toContain('<!DOCTYPE html')
		expect(sent.html).toContain('Zoé')
		expect(sent.react).toBeUndefined()
	})
})
