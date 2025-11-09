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

interface GenerateArticleTranslationOptions {
	title: string
	description: string
	extract: string
	content: string
	imageAlt?: string
	seoTitle?: string
	seoDescription?: string
	targetLocale: string
}

interface ArticleTranslationResult {
	title: string
	description: string
	extract: string
	content: string
	imageAlt: string
	seoTitle: string
	seoDescription: string
}

/**
 * Extracts base64 images from HTML content and replaces them with placeholders
 * Returns the cleaned content and a map of placeholders to original full data URLs
 */
function extractBase64Images(htmlContent: string): {
	cleanedContent: string
	imageMap: Map<string, string>
} {
	const imageMap = new Map<string, string>()
	let placeholderIndex = 0

	// Regex to match base64 images in img src attributes (captures full data URL)
	const base64ImageRegex = /<img([^>]*?)src="(data:image\/[^;]+;base64,[^"]+)"([^>]*?)>/gi

	const cleanedContent = htmlContent.replace(base64ImageRegex, (_match, beforeSrc, fullDataUrl, afterSrc) => {
		const placeholder = `__BASE64_IMAGE_PLACEHOLDER_${placeholderIndex}__`
		// Store the full data URL (including type and base64 prefix)
		imageMap.set(placeholder, fullDataUrl)
		placeholderIndex++
		// Keep the img tag structure but replace base64 with placeholder
		return `<img${beforeSrc}src="${placeholder}"${afterSrc}>`
	})

	return { cleanedContent, imageMap }
}

/**
 * Restores base64 images back into the translated content
 */
function restoreBase64Images(translatedContent: string, imageMap: Map<string, string>): string {
	let restoredContent = translatedContent

	for (const [placeholder, fullDataUrl] of imageMap.entries()) {
		// Replace placeholder with the original full data URL
		restoredContent = restoredContent.replace(placeholder, fullDataUrl)
	}

	return restoredContent
}

/**
 * Translates a complete article from French to a target language using Gemini Flash
 * Context: Beswib is an international marketplace for reselling race bibs
 *
 * @param options Article data in French and target locale
 * @returns Fully translated article content including SEO and alt text
 */
export async function generateArticleTranslation(
	options: GenerateArticleTranslationOptions
): Promise<ArticleTranslationResult | null> {
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
		const targetLanguage = languageMap[options.targetLocale] || 'English'

		// Extract base64 images from content to save tokens
		const { cleanedContent, imageMap } = extractBase64Images(options.content)

		console.info(`Extracted ${imageMap.size} base64 image(s) from content before translation`)

		const prompt = `You are a professional translator specializing in sports and e-commerce content for Beswib, an international marketplace for reselling race bibs.

CONTEXT ABOUT BESWIB:
- Beswib is a platform where athletes can legally resell their race bibs (dossards) for running, trail, cycling, triathlon, and other sports events
- Athletes sell bibs when they can't participate (injury, schedule conflicts, etc.)
- Buyers can find spots for sold-out events
- The platform operates internationally across 9 languages
- All transactions are secure, legal, and compliant
- We help reduce DNS (Did Not Start) rates and minimize waste at sporting events

TASK:
Translate the following French article content into ${targetLanguage}. Maintain the professional tone, technical accuracy for sports terminology, and SEO best practices.

IMPORTANT TRANSLATION GUIDELINES:
1. Keep HTML tags intact in the content (do not translate HTML tags, only the text inside them)
2. Preserve any URLs, technical terms, and brand names
3. Keep image placeholders EXACTLY as they are (do not modify __BASE64_IMAGE_PLACEHOLDER_X__)
4. Adapt sports terminology appropriately for the target culture
5. Maintain the engaging and professional tone
6. Keep SEO title under 60 characters and SEO description under 160 characters
7. For image alt text, describe what's in the image naturally in the target language

FRENCH ARTICLE DATA:

Title: ${options.title}

Description: ${options.description}

Extract: ${options.extract}

Content (HTML):
${cleanedContent}

${options.imageAlt ? `Image Alt Text: ${options.imageAlt}` : ''}

${options.seoTitle ? `SEO Title: ${options.seoTitle}` : ''}

${options.seoDescription ? `SEO Description: ${options.seoDescription}` : ''}

Respond ONLY with a JSON object in this exact format (no markdown, no code blocks):
{
  "title": "translated title",
  "description": "translated description",
  "extract": "translated extract",
  "content": "translated content with preserved HTML tags and image placeholders",
  "imageAlt": "translated image alt text (if image exists, otherwise provide a generic description)",
  "seoTitle": "translated SEO title (max 60 chars)",
  "seoDescription": "translated SEO description (max 160 chars)"
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
		const result = JSON.parse(cleanedText) as ArticleTranslationResult

		// Restore base64 images back into the translated content
		result.content = restoreBase64Images(result.content, imageMap)
		console.info(`Restored ${imageMap.size} base64 image(s) into translated content`)

		// Validate and truncate SEO fields if needed
		if (result.seoTitle.length > 60) {
			console.warn('Generated SEO title exceeds 60 characters, truncating...')
			result.seoTitle = `${result.seoTitle.substring(0, 57)}...`
		}

		if (result.seoDescription.length > 160) {
			console.warn('Generated SEO description exceeds 160 characters, truncating...')
			result.seoDescription = `${result.seoDescription.substring(0, 157)}...`
		}

		console.info(`Successfully translated article to ${targetLanguage} with Gemini Flash`)
		return result
	} catch (error) {
		console.error('Error calling Gemini API for translation:', error)
		return null
	}
}
