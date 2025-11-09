'use server'

import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'

/**
 * Gemini AI service for generating SEO content using Google's Gemini Flash
 * Uses Vercel AI SDK for structured output
 */

interface GenerateSEOOptions {
	title: string
	description?: string
	extract?: string
	locale?: string
}

interface SEOResult {
	seoTitle: string
	seoDescription: string
}

/**
 * Generates SEO-optimized title and description for a blog article using Gemini Flash
 * Context: Beswib is an international marketplace for reselling race bibs (running, cycling, triathlon, etc.)
 *
 * @param options Article information (title, description, extract, locale)
 * @returns Generated SEO title and description
 */
export async function generateSEOContent(options: GenerateSEOOptions): Promise<SEOResult | null> {
	try {
		const apiKey = process.env.GEMINI_API_KEY

		if (!apiKey) {
			console.error('GEMINI_API_KEY is not configured in environment variables')
			return null
		}

		const google = createGoogleGenerativeAI({
			apiKey,
		})

		const model = google('gemini-2.5-flash')

		const locale = options.locale || 'fr'
		const languageMap: Record<string, string> = {
			en: 'English',
			fr: 'French',
			es: 'Spanish',
			it: 'Italian',
			de: 'German',
			ro: 'Romanian',
			pt: 'Portuguese',
			nl: 'Dutch',
			ko: 'Korean',
		}
		const languageName = languageMap[locale] || 'French'

		// Build context from article data
		const articleContext = `
Article Title: ${options.title}
${options.description ? `Description: ${options.description}` : ''}
${options.extract ? `Extract: ${options.extract}` : ''}
`.trim()

		const prompt = `You are an SEO expert for Beswib, an international marketplace for reselling race bibs in second-hand condition.

CONTEXT ABOUT BESWIB:
- Beswib is a platform where athletes can legally resell their race bibs (dossards) for running, trail, cycling, triathlon, and other sports events
- Athletes sell bibs when they can't participate (injury, schedule conflicts, etc.)
- Buyers can find spots for sold-out events
- The platform operates internationally across 9 languages
- All transactions are secure, legal, and compliant
- We help reduce DNS (Did Not Start) rates and minimize waste at sporting events

ARTICLE INFORMATION:
${articleContext}

TASK:
Generate SEO-optimized content in ${languageName} for this blog article. The content should:
1. Be relevant to our marketplace and target audience (runners, cyclists, triathletes, event organizers)
2. Include relevant keywords about race bibs, sporting events, resale, second-hand market
3. Be engaging and encourage clicks from search results
4. Follow SEO best practices

Generate:
- SEO Title: Maximum 60 characters, compelling and keyword-rich
- SEO Description: Maximum 160 characters, clear call-to-action and value proposition

Respond ONLY with a JSON object in this exact format:
{
  "seoTitle": "your title here",
  "seoDescription": "your description here"
}

Do not include any markdown formatting, code blocks, or additional text. Just the raw JSON object.`

		const { text } = await generateText({
			model,
			prompt,
			temperature: 0.7,
		})

		// Parse the JSON response
		const cleanedText = text
			.trim()
			.replace(/^```json\s*/, '')
			.replace(/\s*```$/, '')
			.trim()
		const result = JSON.parse(cleanedText) as SEOResult

		// Validate lengths
		if (result.seoTitle.length > 60) {
			console.warn('Generated SEO title exceeds 60 characters, truncating...')
			result.seoTitle = `${result.seoTitle.substring(0, 57)} ...`
		}

		if (result.seoDescription.length > 160) {
			console.warn('Generated SEO description exceeds 160 characters, truncating...')
			result.seoDescription = `${result.seoDescription.substring(0, 157)} ...`
		}

		console.info('Successfully generated SEO content with Gemini Flash')
		return result
	} catch (error) {
		console.error('Error calling Gemini API:', error)
		return null
	}
}
