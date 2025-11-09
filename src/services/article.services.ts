'use server'

import { pb } from '@/lib/services/pocketbase'
import type { Article } from '@/models/article.model'
import type { ImageWithAlt } from '@/models/imageWithAlt.model'

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
 * @param expandImage Whether to expand image data
 */
export async function getAllArticles(
	expandImage = false
): Promise<(Article & { expand?: { image?: ImageWithAlt } })[]> {
	try {
		const records = await pb.collection('articles').getFullList<Article & { expand?: { image?: ImageWithAlt } }>({
			sort: '-created',
			expand: expandImage ? 'image' : undefined,
		})
		return records
	} catch (error: unknown) {
		throw new Error(`Error fetching all articles: ${error instanceof Error ? error.message : String(error)}`)
	}
}

/**
 * Fetches a single article by its ID.
 * @param id The ID of the article to fetch.
 * @param expandImage Whether to expand image data
 */
export async function fetchArticleById(
	id: string,
	expandImage = false
): Promise<(Article & { expand?: { image?: ImageWithAlt } }) | null> {
	try {
		const record = await pb.collection('articles').getOne<Article & { expand?: { image?: ImageWithAlt } }>(id, {
			expand: expandImage ? 'image' : undefined,
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
 * @param expandImage Whether to expand image data
 */
export async function fetchArticleBySlug(
	slug: string,
	expandImage = false
): Promise<(Article & { expand?: { image?: ImageWithAlt } }) | null> {
	try {
		const records = await pb.collection('articles').getFullList<Article & { expand?: { image?: ImageWithAlt } }>({
			filter: `slug = "${slug}"`,
			expand: expandImage ? 'image' : undefined,
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
