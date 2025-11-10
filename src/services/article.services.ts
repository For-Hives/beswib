'use server'

import { pb } from '@/lib/services/pocketbase'
import type { Article } from '@/models/article.model'
import type { ImageWithAlt } from '@/models/imageWithAlt.model'
import type { SEO } from '@/models/seo.model'

/**
 * Creates a new article.
 * @param articleData Data for the new article.
 */
export async function createArticle(articleData: Omit<Article, 'id' | 'created' | 'updated'>): Promise<Article | null> {
	if (!articleData.title || !articleData.slug) {
		console.error('Article title and slug are required.')
		return null
	}

	try {
		const dataToCreate = {
			title: articleData.title,
			description: articleData.description ?? '',
			slug: articleData.slug,
			locale: articleData.locale,
			image: articleData.image ?? '',
			extract: articleData.extract ?? '',
			content: articleData.content ?? '',
			seo: articleData.seo ?? '',
			translationGroup: articleData.translationGroup ?? '',
			isDraft: articleData.isDraft ?? true, // Default to draft
		}

		const record = await pb.collection('articles').create<Article>(dataToCreate)

		console.info('Article created successfully:', record.id)
		return record
	} catch (error: unknown) {
		console.error('PocketBase error details:', error)
		throw new Error(`Error creating article: ${error instanceof Error ? error.message : String(error)}`)
	}
}

/**
 * Fetches all articles.
 * @param expandRelations Whether to expand image and seo relations
 */
export async function getAllArticles(
	expandRelations = false
): Promise<(Article & { expand?: { image?: ImageWithAlt; seo?: SEO } })[]> {
	try {
		const records = await pb
			.collection('articles')
			.getFullList<Article & { expand?: { image?: ImageWithAlt; seo?: SEO } }>({
				sort: '-created',
				expand: expandRelations ? 'image,seo' : undefined,
			})
		return records
	} catch (error: unknown) {
		throw new Error(`Error fetching all articles: ${error instanceof Error ? error.message : String(error)}`)
	}
}

/**
 * Fetches a single article by its ID.
 * @param id The ID of the article to fetch.
 * @param expandRelations Whether to expand image and seo relations
 */
export async function fetchArticleById(
	id: string,
	expandRelations = false
): Promise<(Article & { expand?: { image?: ImageWithAlt; seo?: SEO } }) | null> {
	try {
		const record = await pb
			.collection('articles')
			.getOne<Article & { expand?: { image?: ImageWithAlt; seo?: SEO } }>(id, {
				expand: expandRelations ? 'image,seo' : undefined,
			})
		return record
	} catch (error: unknown) {
		console.error(`Error fetching article with ID "${id}":`, error)
		return null
	}
}

/**
 * Fetches a single article by its slug.
 * @param slug The slug of the article to fetch.
 * @param expandRelations Whether to expand image and seo relations
 */
export async function fetchArticleBySlug(
	slug: string,
	expandRelations = false
): Promise<(Article & { expand?: { image?: ImageWithAlt; seo?: SEO } }) | null> {
	try {
		const records = await pb
			.collection('articles')
			.getFullList<Article & { expand?: { image?: ImageWithAlt; seo?: SEO } }>({
				filter: `slug = "${slug}"`,
				expand: expandRelations ? 'image,seo' : undefined,
			})
		return records.length > 0 ? records[0] : null
	} catch (error: unknown) {
		console.error(`Error fetching article with slug "${slug}":`, error)
		return null
	}
}

/**
 * Updates an article by its ID.
 * @param id The ID of the article to update
 * @param articleData Partial data to update the article with
 * @returns Updated article record if successful, null otherwise
 */
export async function updateArticleById(id: string, articleData: Partial<Article>): Promise<Article | null> {
	if (!id || typeof id !== 'string') {
		throw new Error('Valid article ID is required to update an article')
	}

	try {
		const dataToUpdate: Record<string, unknown> = {}

		if (articleData.title !== undefined) dataToUpdate.title = articleData.title
		if (articleData.description !== undefined) dataToUpdate.description = articleData.description
		if (articleData.slug !== undefined) dataToUpdate.slug = articleData.slug
		if (articleData.locale !== undefined) dataToUpdate.locale = articleData.locale
		if (articleData.image !== undefined) dataToUpdate.image = articleData.image
		if (articleData.extract !== undefined) dataToUpdate.extract = articleData.extract
		if (articleData.content !== undefined) dataToUpdate.content = articleData.content
		if (articleData.seo !== undefined) dataToUpdate.seo = articleData.seo
		if (articleData.translationGroup !== undefined) dataToUpdate.translationGroup = articleData.translationGroup
		if (articleData.isDraft !== undefined) dataToUpdate.isDraft = articleData.isDraft

		const record = await pb.collection('articles').update<Article>(id, dataToUpdate)

		console.info('Article updated successfully:', record.id)
		return record
	} catch (error: unknown) {
		console.error('PocketBase error details:', error)
		throw new Error(`Error updating article: ${error instanceof Error ? error.message : String(error)}`)
	}
}

/**
 * Deletes an article by its ID.
 * @param id The ID of the article to delete
 * @returns true if deletion succeeded, otherwise throws
 */
export async function deleteArticleById(id: string): Promise<boolean> {
	if (!id || typeof id !== 'string') {
		throw new Error('Valid article ID is required to delete an article')
	}
	try {
		await pb.collection('articles').delete(id)
		return true
	} catch (error: unknown) {
		throw new Error(`Error deleting article: ${error instanceof Error ? error.message : String(error)}`)
	}
}

/**
 * Creates a new image with alt text.
 * @param imageFile The image file to upload
 * @param alt The alt text for the image
 */
export async function createImageWithAlt(imageFile: File, alt: string): Promise<ImageWithAlt | null> {
	try {
		const formData = new FormData()
		formData.append('image', imageFile)
		formData.append('alt', alt)

		const record = await pb.collection('image_with_alt').create<ImageWithAlt>(formData)

		console.info('Image created successfully:', record.id)
		return record
	} catch (error: unknown) {
		console.error('PocketBase error details:', error)
		throw new Error(`Error creating image: ${error instanceof Error ? error.message : String(error)}`)
	}
}

/**
 * Fetches an image with alt by its ID.
 * @param id The ID of the image to fetch.
 */
export async function fetchImageWithAltById(id: string): Promise<ImageWithAlt | null> {
	try {
		const record = await pb.collection('image_with_alt').getOne<ImageWithAlt>(id)
		return record
	} catch (error: unknown) {
		console.error(`Error fetching image with ID "${id}":`, error)
		return null
	}
}

/**
 * Updates an image with alt by its ID.
 * @param id The ID of the image to update.
 * @param alt The new alt text.
 */
export async function updateImageWithAltById(id: string, alt: string): Promise<ImageWithAlt | null> {
	try {
		const record = await pb.collection('image_with_alt').update<ImageWithAlt>(id, { alt })
		console.info('Image alt text updated successfully:', record.id)
		return record
	} catch (error: unknown) {
		console.error('PocketBase error details:', error)
		throw new Error(`Error updating image alt text: ${error instanceof Error ? error.message : String(error)}`)
	}
}

/**
 * Fetches all articles that share the same translationGroup.
 * @param translationGroup The UUID of the translation group
 * @param expandRelations Whether to expand image and seo relations
 * @returns Array of articles in the same translation group
 */
export async function fetchArticlesByTranslationGroup(
	translationGroup: string,
	expandRelations = false
): Promise<(Article & { expand?: { image?: ImageWithAlt; seo?: SEO } })[]> {
	if (!translationGroup) {
		return []
	}

	try {
		const records = await pb
			.collection('articles')
			.getFullList<Article & { expand?: { image?: ImageWithAlt; seo?: SEO } }>({
				filter: `translationGroup = "${translationGroup}"`,
				sort: '-created',
				expand: expandRelations ? 'image,seo' : undefined,
			})
		return records
	} catch (error: unknown) {
		console.error(`Error fetching articles with translationGroup "${translationGroup}":`, error)
		return []
	}
}

/**
 * Fetches all articles for a specific locale.
 * @param locale The locale to filter articles by
 * @param expandRelations Whether to expand image and seo relations
 * @returns Array of articles in the specified locale
 */
export async function fetchArticlesByLocale(
	locale: string,
	expandRelations = false
): Promise<(Article & { expand?: { image?: ImageWithAlt; seo?: SEO } })[]> {
	if (!locale) {
		return []
	}

	try {
		const records = await pb
			.collection('articles')
			.getFullList<Article & { expand?: { image?: ImageWithAlt; seo?: SEO } }>({
				filter: `locale = "${locale}"`,
				sort: '-created',
				expand: expandRelations ? 'image,seo' : undefined,
			})
		return records
	} catch (error: unknown) {
		console.error(`Error fetching articles with locale "${locale}":`, error)
		return []
	}
}

/**
 * Fetches the slug of a translated article given the current slug and target locale.
 * @param currentSlug The slug of the current article
 * @param targetLocale The locale to get the translated slug for
 * @returns The slug of the translated article, or null if not found
 */
export async function getTranslatedArticleSlug(currentSlug: string, targetLocale: string): Promise<string | null> {
	if (!currentSlug || !targetLocale) {
		return null
	}

	try {
		// First, get the current article to find its translationGroup
		const currentArticle = await fetchArticleBySlug(currentSlug, false)
		if (!currentArticle || !currentArticle.translationGroup) {
			return null
		}

		// Then, find the article in the target locale with the same translationGroup
		const translatedArticles = await fetchArticlesByTranslationGroup(currentArticle.translationGroup, false)
		const translatedArticle = translatedArticles.find(article => article.locale === targetLocale && !article.isDraft)

		return translatedArticle ? translatedArticle.slug : null
	} catch (error: unknown) {
		console.error(`Error fetching translated article slug for "${currentSlug}" to locale "${targetLocale}":`, error)
		return null
	}
}
