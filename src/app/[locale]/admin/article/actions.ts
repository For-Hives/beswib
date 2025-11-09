'use server'

import { checkAdminAccess } from '@/guard/adminGuard'
import type { Locale } from '@/lib/i18n/config'
import type { Article } from '@/models/article.model'
import {
	createArticle,
	createImageWithAlt,
	deleteArticleById,
	fetchArticleById,
	fetchArticlesByTranslationGroup,
	getAllArticles,
	updateArticleById,
} from '@/services/article.services'
import { generateImageAltText } from '@/services/forvoyez.services'
import { generateArticleTranslation, generateSEOContent } from '@/services/gemini.services'
import { createSEO } from '@/services/seo.services'

/**
 * Server action to create a new article (admin only)
 * Verifies authentication via Clerk, platform registration, and admin permissions
 */
export async function createArticleAction(formData: FormData): Promise<{
	data?: Article
	error?: string
	success: boolean
}> {
	try {
		// Verify admin access (checks Clerk auth, platform registration, and admin role)
		const adminUser = await checkAdminAccess()

		if (adminUser == null) {
			return {
				success: false,
				error: 'Unauthorized: Admin access required',
			}
		}

		// Extract form data
		const title = formData.get('title') as string
		const slug = formData.get('slug') as string
		const locale = formData.get('locale') as Locale
		const description = formData.get('description') as string
		const extract = formData.get('extract') as string
		const content = formData.get('content') as string
		const imageFile = formData.get('imageFile') as File | null
		const imageAlt = formData.get('imageAlt') as string
		const seoTitle = formData.get('seoTitle') as string
		const seoDescription = formData.get('seoDescription') as string
		const translationGroup = formData.get('translationGroup') as string

		// Validate required fields
		if (!title || !slug || !locale) {
			return {
				success: false,
				error: 'Title, slug, and locale are required',
			}
		}

		// Handle image upload if provided
		let imageId = ''
		if (imageFile && imageFile.size > 0) {
			const imageResult = await createImageWithAlt(imageFile, imageAlt || title)
			if (imageResult) {
				imageId = imageResult.id
			}
		}

		// Handle SEO creation if provided
		let seoId = ''
		if (seoTitle || seoDescription) {
			const seoResult = await createSEO({
				title: seoTitle || title,
				description: seoDescription || description,
			})
			if (seoResult) {
				seoId = seoResult.id
			}
		}

		// Create the article with PocketBase service
		const result = await createArticle({
			title,
			slug,
			locale,
			description,
			extract,
			content,
			image: imageId,
			seo: seoId,
			translationGroup: translationGroup || undefined,
		})

		if (result != null) {
			console.info(`Admin ${adminUser.email} created article: ${result.title}`)
			return {
				success: true,
				data: result,
			}
		} else {
			throw new Error('Failed to create article')
		}
	} catch (error) {
		console.error('Error in createArticleAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create article',
		}
	}
}

/**
 * Server action to get all articles (admin only)
 */
export async function getAllArticlesAction(): Promise<{
	data?: Article[]
	error?: string
	success: boolean
}> {
	try {
		// Verify admin access
		const adminUser = await checkAdminAccess()

		if (adminUser == null) {
			return {
				success: false,
				error: 'Unauthorized: Admin access required',
			}
		}

		const articles = await getAllArticles(true)

		return {
			success: true,
			data: articles,
		}
	} catch (error) {
		console.error('Error in getAllArticlesAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch articles',
		}
	}
}

/**
 * Server action to get a single article by ID (admin only)
 */
export async function getArticleByIdAction(id: string): Promise<{
	data?: Article
	error?: string
	success: boolean
}> {
	try {
		// Verify admin access
		const adminUser = await checkAdminAccess()

		if (adminUser == null) {
			return {
				success: false,
				error: 'Unauthorized: Admin access required',
			}
		}

		const article = await fetchArticleById(id, true)

		if (article == null) {
			return {
				success: false,
				error: 'Article not found',
			}
		}

		return {
			success: true,
			data: article,
		}
	} catch (error) {
		console.error('Error in getArticleByIdAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch article',
		}
	}
}

/**
 * Server action to update an article (admin only)
 */
export async function updateArticleAction(
	id: string,
	formData: FormData
): Promise<{
	data?: Article
	error?: string
	success: boolean
}> {
	try {
		// Verify admin access
		const adminUser = await checkAdminAccess()

		if (adminUser == null) {
			return {
				success: false,
				error: 'Unauthorized: Admin access required',
			}
		}

		// Extract form data
		const title = formData.get('title') as string
		const slug = formData.get('slug') as string
		const locale = formData.get('locale') as Locale
		const description = formData.get('description') as string
		const extract = formData.get('extract') as string
		const content = formData.get('content') as string
		const imageFile = formData.get('imageFile') as File | null
		const imageAlt = formData.get('imageAlt') as string
		const seoTitle = formData.get('seoTitle') as string
		const seoDescription = formData.get('seoDescription') as string
		const translationGroup = formData.get('translationGroup') as string

		// Fetch the existing article to get current image and seo IDs
		const existingArticle = await fetchArticleById(id)
		if (existingArticle == null) {
			return {
				success: false,
				error: 'Article not found',
			}
		}

		// Handle image upload if provided
		let imageId = existingArticle.image
		if (imageFile && imageFile.size > 0) {
			const imageResult = await createImageWithAlt(imageFile, imageAlt || title)
			if (imageResult) {
				imageId = imageResult.id
			}
		} else if (imageAlt && existingArticle.image) {
			// If only alt text changed, update existing image
			const { updateImageWithAltById } = await import('@/services/article.services')
			await updateImageWithAltById(existingArticle.image as string, imageAlt)
		}

		// Handle SEO update if provided
		let seoId = existingArticle.seo
		if (seoTitle || seoDescription) {
			if (existingArticle.seo) {
				// Update existing SEO
				const { updateSEOById } = await import('@/services/seo.services')
				const seoResult = await updateSEOById(existingArticle.seo, {
					title: seoTitle || title,
					description: seoDescription || description,
				})
				if (seoResult) {
					seoId = seoResult.id
				}
			} else {
				// Create new SEO
				const seoResult = await createSEO({
					title: seoTitle || title,
					description: seoDescription || description,
				})
				if (seoResult) {
					seoId = seoResult.id
				}
			}
		}

		// Update the article with PocketBase service
		const result = await updateArticleById(id, {
			title,
			slug,
			locale,
			description,
			extract,
			content,
			image: imageId,
			seo: seoId,
			translationGroup: translationGroup || undefined,
		})

		if (result != null) {
			console.info(`Admin ${adminUser.email} updated article: ${result.title}`)
			return {
				success: true,
				data: result,
			}
		} else {
			throw new Error('Failed to update article')
		}
	} catch (error) {
		console.error('Error in updateArticleAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update article',
		}
	}
}

/**
 * Server action to delete an article (admin only)
 */
export async function deleteArticleAction(id: string): Promise<{
	error?: string
	success: boolean
}> {
	try {
		// Verify admin access
		const adminUser = await checkAdminAccess()

		if (adminUser == null) {
			return {
				success: false,
				error: 'Unauthorized: Admin access required',
			}
		}

		await deleteArticleById(id)

		console.info(`Admin ${adminUser.email} deleted article: ${id}`)

		return {
			success: true,
		}
	} catch (error) {
		console.error('Error in deleteArticleAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to delete article',
		}
	}
}

/**
 * Server action to generate alt text for an image using Forvoyez AI (admin only)
 */
export async function generateAltTextAction(formData: FormData): Promise<{
	altText?: string
	error?: string
	success: boolean
}> {
	try {
		// Verify admin access
		const adminUser = await checkAdminAccess()

		if (adminUser == null) {
			return {
				success: false,
				error: 'Unauthorized: Admin access required',
			}
		}

		// Extract image file from FormData
		const imageFile = formData.get('image') as File | null

		if (!imageFile || !(imageFile instanceof File)) {
			return {
				success: false,
				error: 'No image file provided',
			}
		}

		// Get optional language parameter (defaults to 'fr' in the service)
		const language = (formData.get('language') as string) || 'fr'

		// Call Forvoyez service to generate alt text
		const altText = await generateImageAltText(imageFile, { language })

		if (altText) {
			console.info(`Admin ${adminUser.email} generated alt text with Forvoyez`)
			return {
				success: true,
				altText,
			}
		} else {
			return {
				success: false,
				error: 'Failed to generate alt text from Forvoyez API',
			}
		}
	} catch (error) {
		console.error('Error in generateAltTextAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to generate alt text',
		}
	}
}

/**
 * Server action to generate SEO content using Gemini AI (admin only)
 */
export async function generateSEOAction(formData: FormData): Promise<{
	seoTitle?: string
	seoDescription?: string
	error?: string
	success: boolean
}> {
	try {
		// Verify admin access
		const adminUser = await checkAdminAccess()

		if (adminUser == null) {
			return {
				success: false,
				error: 'Unauthorized: Admin access required',
			}
		}

		// Extract article information
		const title = formData.get('title') as string
		const description = formData.get('description') as string
		const extract = formData.get('extract') as string
		const locale = formData.get('locale') as string

		if (!title) {
			return {
				success: false,
				error: 'Article title is required to generate SEO content',
			}
		}

		// Call Gemini service to generate SEO content
		const result = await generateSEOContent({
			title,
			description,
			extract,
			locale: locale || 'fr',
		})

		if (result) {
			console.info(`Admin ${adminUser.email} generated SEO content with Gemini`)
			return {
				success: true,
				seoTitle: result.seoTitle,
				seoDescription: result.seoDescription,
			}
		} else {
			return {
				success: false,
				error: 'Failed to generate SEO content from Gemini API',
			}
		}
	} catch (error) {
		console.error('Error in generateSEOAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to generate SEO content',
		}
	}
}

/**
 * Server action to get all translations of an article by translationGroup (admin only)
 */
export async function getArticleTranslationsAction(translationGroup: string): Promise<{
	data?: Article[]
	error?: string
	success: boolean
}> {
	try {
		// Verify admin access
		const adminUser = await checkAdminAccess()

		if (adminUser == null) {
			return {
				success: false,
				error: 'Unauthorized: Admin access required',
			}
		}

		if (!translationGroup) {
			return {
				success: false,
				error: 'Translation group ID is required',
			}
		}

		const translations = await fetchArticlesByTranslationGroup(translationGroup, true)

		return {
			success: true,
			data: translations,
		}
	} catch (error) {
		console.error('Error in getArticleTranslationsAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch translations',
		}
	}
}

/**
 * Server action to generate a translation of a French article into a target language (admin only)
 * Creates a new article in the target language with translated content, SEO, and alt text
 */
export async function generateArticleTranslationAction(
	sourceArticleId: string,
	targetLocale: Locale
): Promise<{
	data?: Article
	error?: string
	success: boolean
}> {
	try {
		// Verify admin access
		const adminUser = await checkAdminAccess()

		if (adminUser == null) {
			return {
				success: false,
				error: 'Unauthorized: Admin access required',
			}
		}

		// Fetch the source article (must be French)
		const sourceArticle = await fetchArticleById(sourceArticleId, true)

		if (sourceArticle == null) {
			return {
				success: false,
				error: 'Source article not found',
			}
		}

		if (sourceArticle.locale !== 'fr') {
			return {
				success: false,
				error: 'Source article must be in French (fr)',
			}
		}

		// Check if translation already exists
		let existingTranslation: Article | null = null
		if (sourceArticle.translationGroup) {
			const translations = await fetchArticlesByTranslationGroup(sourceArticle.translationGroup, true)
			existingTranslation = translations.find(t => t.locale === targetLocale) || null
		}

		// Prepare translation data
		const translationOptions = {
			title: sourceArticle.title,
			description: sourceArticle.description,
			extract: sourceArticle.extract,
			content: sourceArticle.content,
			imageAlt: sourceArticle.expand?.image?.alt || '',
			seoTitle: sourceArticle.expand?.seo?.title || '',
			seoDescription: sourceArticle.expand?.seo?.description || '',
			targetLocale,
		}

		// Generate translation using Gemini
		const translatedContent = await generateArticleTranslation(translationOptions)

		if (!translatedContent) {
			return {
				success: false,
				error: 'Failed to generate translation with Gemini AI',
			}
		}

		// Auto-generate slug from translated title
		const slug = translatedContent.title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim()

		// Create or update image with translated alt text (reuse same image file)
		let imageId = sourceArticle.image
		if (sourceArticle.expand?.image?.image) {
			// Create new image record with translated alt text but same image file
			const imageFile = sourceArticle.expand.image.image
			const pb = await import('@/lib/services/pocketbase').then(m => m.pb)
			
			// Download original image
			const imageUrl = pb.files.getUrl(sourceArticle.expand.image, imageFile)
			const imageResponse = await fetch(imageUrl)
			const imageBlob = await imageResponse.blob()
			const imageFileObj = new File([imageBlob], imageFile, { type: imageBlob.type })
			
			// Create new image record with translated alt
			const newImage = await createImageWithAlt(imageFileObj, translatedContent.imageAlt)
			if (newImage) {
				imageId = newImage.id
			}
		}

		// Create new SEO record with translated metadata
		let seoId = ''
		const seoResult = await createSEO({
			title: translatedContent.seoTitle,
			description: translatedContent.seoDescription,
		})
		if (seoResult) {
			seoId = seoResult.id
		}

		// Create or update the translated article
		let result: Article | null = null
		if (existingTranslation) {
			// Update existing translation
			result = await updateArticleById(existingTranslation.id, {
				title: translatedContent.title,
				slug,
				locale: targetLocale,
				description: translatedContent.description,
				extract: translatedContent.extract,
				content: translatedContent.content,
				image: imageId,
				seo: seoId,
				translationGroup: sourceArticle.translationGroup,
			})
		} else {
			// Create new translation
			result = await createArticle({
				title: translatedContent.title,
				slug,
				locale: targetLocale,
				description: translatedContent.description,
				extract: translatedContent.extract,
				content: translatedContent.content,
				image: imageId,
				seo: seoId,
				translationGroup: sourceArticle.translationGroup || sourceArticle.id,
			})

			// If source article doesn't have translationGroup, update it
			if (!sourceArticle.translationGroup && result) {
				await updateArticleById(sourceArticle.id, {
					translationGroup: result.translationGroup,
				})
			}
		}

		if (result != null) {
			console.info(`Admin ${adminUser.email} generated ${targetLocale} translation for article: ${sourceArticle.title}`)
			return {
				success: true,
				data: result,
			}
		} else {
			throw new Error('Failed to create or update translated article')
		}
	} catch (error) {
		console.error('Error in generateArticleTranslationAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to generate translation',
		}
	}
}

/**
 * Server action to generate all missing translations for a French article (admin only)
 * Generates translations for all languages that don't have existing translations yet
 */
export async function generateAllMissingTranslationsAction(sourceArticleId: string): Promise<{
	successes: string[]
	failures: Array<{ locale: string; error: string }>
	total: number
	error?: string
	success: boolean
}> {
	try {
		// Verify admin access
		const adminUser = await checkAdminAccess()

		if (adminUser == null) {
			return {
				success: false,
				error: 'Unauthorized: Admin access required',
				successes: [],
				failures: [],
				total: 0,
			}
		}

		// Fetch the source article (must be French)
		const sourceArticle = await fetchArticleById(sourceArticleId, true)

		if (sourceArticle == null) {
			return {
				success: false,
				error: 'Source article not found',
				successes: [],
				failures: [],
				total: 0,
			}
		}

		if (sourceArticle.locale !== 'fr') {
			return {
				success: false,
				error: 'Source article must be in French (fr)',
				successes: [],
				failures: [],
				total: 0,
			}
		}

		// Get existing translations
		const existingTranslations = sourceArticle.translationGroup
			? await fetchArticlesByTranslationGroup(sourceArticle.translationGroup, true)
			: [sourceArticle]

		const existingLocales = new Set(existingTranslations.map(t => t.locale))

		// Identify missing locales (all except fr)
		const { i18n } = await import('@/lib/i18n/config')
		const targetLocales = i18n.locales.filter(locale => locale !== 'fr' && !existingLocales.has(locale))

		const successes: string[] = []
		const failures: Array<{ locale: string; error: string }> = []

		// Generate translation for each missing locale
		for (const targetLocale of targetLocales) {
			const result = await generateArticleTranslationAction(sourceArticleId, targetLocale)

			if (result.success) {
				successes.push(targetLocale)
			} else {
				failures.push({
					locale: targetLocale,
					error: result.error || 'Unknown error',
				})
			}
		}

		console.info(
			`Admin ${adminUser.email} generated ${successes.length}/${targetLocales.length} translations for article: ${sourceArticle.title}`
		)

		return {
			success: true,
			successes,
			failures,
			total: targetLocales.length,
		}
	} catch (error) {
		console.error('Error in generateAllMissingTranslationsAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to generate translations',
			successes: [],
			failures: [],
			total: 0,
		}
	}
}
