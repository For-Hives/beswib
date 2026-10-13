// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { generateArticleTranslation, generateSEOContent } from '@/services/gemini.services'

/**
 * Offline regression test: the real AI SDK code runs (provider, request building, response parsing),
 * only the network is replaced. It pins the request sent to Gemini and the handling of its answer.
 */

const fetchMock = vi.fn<typeof fetch>()

function geminiResponse(text: string): Response {
	return new Response(
		JSON.stringify({
			candidates: [{ content: { role: 'model', parts: [{ text }] }, finishReason: 'STOP', index: 0 }],
			usageMetadata: { promptTokenCount: 1, candidatesTokenCount: 1, totalTokenCount: 2 },
		}),
		{ status: 200, headers: { 'content-type': 'application/json' } }
	)
}

function lastRequest(): { url: string; headers: Headers; body: Record<string, unknown> } {
	expect(fetchMock).toHaveBeenCalledTimes(1)
	const [input, init] = fetchMock.mock.calls[0]
	return {
		url: String(input),
		headers: new Headers(init?.headers),
		body: JSON.parse(String(init?.body)) as Record<string, unknown>,
	}
}

describe('gemini.services', () => {
	beforeEach(() => {
		fetchMock.mockReset()
		vi.stubEnv('GEMINI_API_KEY', 'test-gemini-key')
		vi.stubGlobal('fetch', fetchMock)
		vi.spyOn(console, 'info').mockImplementation(() => undefined)
		vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.unstubAllEnvs()
		vi.restoreAllMocks()
	})

	it('generateSEOContent calls gemini-2.5-flash with temperature 0.7 and returns the parsed JSON', async () => {
		fetchMock.mockResolvedValueOnce(
			geminiResponse('```json\n{"seoTitle":"Buy a race bib","seoDescription":"Find a bib for a sold-out race."}\n```')
		)

		const result = await generateSEOContent({ title: 'Marathon de Paris', locale: 'en' })

		expect(result).toEqual({ seoTitle: 'Buy a race bib', seoDescription: 'Find a bib for a sold-out race.' })

		const request = lastRequest()
		expect(request.url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent')
		expect(request.headers.get('x-goog-api-key')).toBe('test-gemini-key')
		expect(request.headers.get('content-type')).toBe('application/json')

		const { contents, generationConfig, ...rest } = request.body
		expect(rest).toEqual({})
		expect(generationConfig).toEqual({ temperature: 0.7 })
		const [message, ...others] = contents as Array<{ role: string; parts: Array<{ text: string }> }>
		expect(others).toEqual([])
		expect(message.role).toBe('user')
		expect(message.parts).toHaveLength(1)
		expect(message.parts[0].text).toContain('Article Title: Marathon de Paris')
		expect(message.parts[0].text).toContain('Generate SEO-optimized content in English')
	})

	it('generateSEOContent returns null when Gemini answers something that is not JSON', async () => {
		fetchMock.mockResolvedValueOnce(geminiResponse('Sorry, I cannot help with that.'))

		await expect(generateSEOContent({ title: 'Marathon de Paris' })).resolves.toBeNull()
	})

	it('generateSEOContent returns null without calling Gemini when the API key is missing', async () => {
		vi.stubEnv('GEMINI_API_KEY', '')

		await expect(generateSEOContent({ title: 'Marathon de Paris' })).resolves.toBeNull()
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it('generateArticleTranslation keeps base64 images out of the prompt, restores them and sanitises the slug', async () => {
		const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='
		fetchMock.mockResolvedValueOnce(
			geminiResponse(
				JSON.stringify({
					title: 'Paris Marathon',
					slug: 'Marathón de París 2026!',
					description: 'Translated description',
					extract: 'Translated extract',
					content: '<p>Hello</p><img src="__BASE64_IMAGE_PLACEHOLDER_0__" alt="x">',
					imageAlt: 'Runners',
					seoTitle: 'Paris Marathon',
					seoDescription: 'Translated SEO description',
				})
			)
		)

		const result = await generateArticleTranslation({
			title: 'Marathon de Paris',
			description: 'Description',
			extract: 'Extrait',
			content: `<p>Bonjour</p><img src="${dataUrl}" alt="x">`,
			targetLocale: 'es',
		})

		expect(result?.slug).toBe('marathon-de-paris-2026')
		expect(result?.content).toBe(`<p>Hello</p><img src="${dataUrl}" alt="x">`)
		expect(result?.title).toBe('Paris Marathon')
		expect(result?.logs).toHaveLength(3)

		const request = lastRequest()
		expect(request.url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent')
		expect(request.headers.get('x-goog-api-key')).toBe('test-gemini-key')

		const { contents, generationConfig, ...rest } = request.body
		expect(rest).toEqual({})
		expect(generationConfig).toEqual({ temperature: 0.7 })
		const [message, ...others] = contents as Array<{ role: string; parts: Array<{ text: string }> }>
		expect(others).toEqual([])
		expect(message.role).toBe('user')
		expect(message.parts).toHaveLength(1)
		expect(message.parts[0].text).toContain('__BASE64_IMAGE_PLACEHOLDER_0__')
		expect(message.parts[0].text).not.toContain('iVBORw0KGgo')
		expect(message.parts[0].text).toContain('into Spanish')
	})
})
