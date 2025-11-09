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
import { generateSEOContent } from '@/services/gemini.services'
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
