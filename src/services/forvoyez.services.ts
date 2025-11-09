'use server'

/**
 * Forvoyez API service for generating image alt text using AI
 * Documentation: https://doc.forvoyez.com/using-the-api
 */

interface ForvoyezResponse {
	title?: string
	alternativeText?: string
	caption?: string
}

interface GenerateAltTextOptions {
	language?: string
	keywords?: string
	context?: string
}

/**
 * Generates alt text for an image using Forvoyez AI API
 * @param imageFile The image file to analyze
 * @param options Optional configuration (language, keywords, context)
 * @returns The generated alt text or null if failed
 */
export async function generateImageAltText(
	imageFile: File,
	options: GenerateAltTextOptions = {}
): Promise<string | null> {
	try {
		const apiKey = process.env.FORVOYEZ_TOKEN

		if (!apiKey) {
			console.error('FORVOYEZ_TOKEN is not configured in environment variables')
			return null
		}

		// Create FormData for multipart/form-data request
		const formData = new FormData()
		formData.append('image', imageFile)

		// Add optional language (defaults to 'fr' for French)
		if (options.language) {
			formData.append('language', options.language)
		}

		// Add optional keywords
		if (options.keywords) {
			formData.append('keywords', options.keywords)
		}

		// Add optional context
		if (options.context) {
			formData.append('context', options.context)
		}

		// Define schema to get alternativeText
		const schema = JSON.stringify({
			alternativeText: 'string',
		})
		formData.append('schema', schema)

		// Call Forvoyez API
		const response = await fetch('https://forvoyez.com/api/describe', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
			body: formData,
		})

		if (!response.ok) {
			const errorText = await response.text()
			console.error(`Forvoyez API error (${response.status}):`, errorText)
			return null
		}

		const data = (await response.json()) as ForvoyezResponse

		if (data.alternativeText) {
			console.info('Successfully generated alt text with Forvoyez')
			return data.alternativeText
		} else {
			console.error('Forvoyez API response missing alternativeText field')
			return null
		}
	} catch (error) {
		console.error('Error calling Forvoyez API:', error)
		return null
	}
}
