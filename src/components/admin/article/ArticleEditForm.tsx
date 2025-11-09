'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as v from 'valibot'

import { updateArticleAction } from '@/app/[locale]/admin/article/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/ui/file-upload'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import type { Locale } from '@/lib/i18n/config'
import type { Article } from '@/models/article.model'

const articleFormSchema = v.object({
	title: v.pipe(v.string(), v.minLength(1, 'Title is required')),
	slug: v.pipe(
		v.string(),
		v.minLength(1, 'Slug is required'),
		v.regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
	),
	description: v.pipe(v.string(), v.minLength(1, 'Description is required')),
	extract: v.pipe(v.string(), v.minLength(1, 'Extract is required')),
	content: v.pipe(v.string(), v.minLength(1, 'Content is required')),
	imageFile: v.optional(v.any()),
	imageAlt: v.optional(v.string()),
	seoTitle: v.optional(v.pipe(v.string(), v.maxLength(60, 'SEO title should be max 60 characters'))),
	seoDescription: v.optional(v.pipe(v.string(), v.maxLength(160, 'SEO description should be max 160 characters'))),
})

type ArticleFormValues = v.InferOutput<typeof articleFormSchema>

interface ArticleEditFormProps {
	article: Article
	locale: Locale
}

export default function ArticleEditForm({ article, locale }: ArticleEditFormProps) {
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<ArticleFormValues>({
		resolver: valibotResolver(articleFormSchema),
		defaultValues: {
			title: article.title,
			slug: article.slug,
			description: article.description,
			extract: article.extract,
			content: article.content,
			imageAlt: '',
			seoTitle: '',
			seoDescription: '',
		},
	})

	const handleFileUploadWithValidation = (files: File[]) => {
		if (files.length === 0) {
			form.setValue('imageFile', undefined)
			return
		}

		const file = files[0]
		const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
		const maxSize = 5 * 1024 * 1024 // 5MB

		if (!allowedTypes.includes(file.type)) {
			toast.error('Invalid file type. Please upload PNG, JPG, or WEBP files only.')
			return
		}

		if (file.size > maxSize) {
			toast.error('File size too large. Maximum size is 5MB.')
			return
		}

		form.setValue('imageFile', file)
	}

	const onSubmit = async (data: ArticleFormValues) => {
		setIsSubmitting(true)
		try {
			// Create FormData for file upload
			const formData = new FormData()
			formData.append('articleId', article.id)
			formData.append('title', data.title)
			formData.append('slug', data.slug)
			formData.append('description', data.description)
			formData.append('extract', data.extract)
			formData.append('content', data.content)

			if (data.imageFile != null && data.imageFile instanceof File) {
				formData.append('imageFile', data.imageFile)
			}
			if (data.imageAlt) {
				formData.append('imageAlt', data.imageAlt)
			}
			if (data.seoTitle) {
				formData.append('seoTitle', data.seoTitle)
			}
			if (data.seoDescription) {
				formData.append('seoDescription', data.seoDescription)
			}

			const result = await updateArticleAction(article.id, formData)

			if (result.success) {
				toast.success('Article updated successfully!')
				router.push(`/${locale}/admin/article`)
			} else {
				toast.error(result.error || 'Failed to update article')
			}
		} catch (error) {
			console.error('Error updating article:', error)
			toast.error('An unexpected error occurred')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Edit Article</CardTitle>
				<CardDescription>Update your blog article</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						{/* Basic Information */}
						<div className="space-y-6">
							<h3 className="text-lg font-semibold">Basic Information</h3>

							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input placeholder="Enter article title" {...field} />
										</FormControl>
										<FormDescription>The main title of your article</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="slug"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Slug</FormLabel>
										<FormControl>
											<Input placeholder="article-slug" {...field} />
										</FormControl>
										<FormDescription>URL-friendly version of the title (lowercase, hyphens only)</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea placeholder="Enter article description" className="min-h-[100px]" {...field} />
										</FormControl>
										<FormDescription>A brief description for SEO and previews</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="extract"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Extract</FormLabel>
										<FormControl>
											<Textarea placeholder="Enter article extract" className="min-h-[100px]" {...field} />
										</FormControl>
										<FormDescription>A short excerpt to display in article lists</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Separator />

						{/* Featured Image */}
						<div className="space-y-6">
							<h3 className="text-lg font-semibold">Featured Image</h3>

							<div>
								<FormLabel>Article Image</FormLabel>
								<div className="bg-card/50 border-border/30 rounded-xl border backdrop-blur-sm">
									<FileUpload locale={locale} onChange={handleFileUploadWithValidation} />
								</div>
								<p className="text-muted-foreground text-sm mt-2">
									Upload a new featured image for your article (max 5MB, PNG/JPG/WEBP) - leave empty to keep existing
									image
								</p>
							</div>

							<FormField
								control={form.control}
								name="imageAlt"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Image Alt Text</FormLabel>
										<FormControl>
											<Input placeholder="Describe the image" {...field} />
										</FormControl>
										<FormDescription>Alternative text for accessibility and SEO</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Separator />

						{/* Content */}
						<div className="space-y-6">
							<h3 className="text-lg font-semibold">Content</h3>

							<FormField
								control={form.control}
								name="content"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Article Content</FormLabel>
										<FormControl>
											<RichTextEditor
												content={field.value}
												onChange={field.onChange}
												placeholder="Start writing your article..."
											/>
										</FormControl>
										<FormDescription>The full content of your article (supports rich text)</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Separator />

						{/* SEO Settings */}
						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold">SEO Settings</h3>
								<p className="text-muted-foreground text-sm">Optimize your article for search engines</p>
							</div>

							<FormField
								control={form.control}
								name="seoTitle"
								render={({ field }) => (
									<FormItem>
										<FormLabel>SEO Title</FormLabel>
										<FormControl>
											<Input placeholder="Enter SEO title (max 60 characters)" {...field} maxLength={60} />
										</FormControl>
										<FormDescription>
											{field.value?.length || 0}/60 characters - Appears in search engine results
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="seoDescription"
								render={({ field }) => (
									<FormItem>
										<FormLabel>SEO Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter SEO description (max 160 characters)"
												className="min-h-[100px]"
												{...field}
												maxLength={160}
											/>
										</FormControl>
										<FormDescription>
											{field.value?.length || 0}/160 characters - Brief description for search results
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Separator />

						<div className="flex gap-4">
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Updating...' : 'Update Article'}
							</Button>
							<Button type="button" variant="outline" onClick={() => router.push(`/${locale}/admin/article`)}>
								Cancel
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
