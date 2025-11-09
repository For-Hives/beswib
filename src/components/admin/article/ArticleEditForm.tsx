'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as v from 'valibot'

import { generateAltTextAction, generateSEOAction, updateArticleAction } from '@/app/[locale]/admin/article/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/ui/file-upload'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Sparkles } from 'lucide-react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { i18n, localeFlags, localeNames, type Locale } from '@/lib/i18n/config'
import type { Article } from '@/models/article.model'

const articleFormSchema = v.object({
	title: v.pipe(v.string(), v.minLength(1, 'Title is required')),
	slug: v.pipe(
		v.string(),
		v.minLength(1, 'Slug is required'),
		v.regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
	),
	locale: v.pipe(v.string(), v.minLength(1, 'Language is required')),
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
	const [isGeneratingAlt, setIsGeneratingAlt] = useState(false)
	const [isGeneratingSEO, setIsGeneratingSEO] = useState(false)

	const form = useForm<ArticleFormValues>({
		resolver: valibotResolver(articleFormSchema),
		defaultValues: {
			title: article.title,
			slug: article.slug,
			locale: article.locale,
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

	const handleGenerateAltText = async () => {
		const imageFile = form.watch('imageFile')

		if (!imageFile || !(imageFile instanceof File)) {
			toast.error('Please upload an image first')
			return
		}

		setIsGeneratingAlt(true)
		try {
			const formData = new FormData()
			formData.append('image', imageFile)
			formData.append('language', form.watch('locale') || 'fr')

			const result = await generateAltTextAction(formData)

			if (result.success && result.altText) {
				form.setValue('imageAlt', result.altText, { shouldValidate: true })
				toast.success('Alt text generated successfully!')
			} else {
				toast.error(result.error || 'Failed to generate alt text')
			}
		} catch (error) {
			console.error('Error generating alt text:', error)
			toast.error('An error occurred while generating alt text')
		} finally {
			setIsGeneratingAlt(false)
		}
	}

	const handleGenerateSEO = async () => {
		const title = form.watch('title')
		const description = form.watch('description')
		const extract = form.watch('extract')
		const articleLocale = form.watch('locale')

		if (!title) {
			toast.error('Please enter an article title first')
			return
		}

		setIsGeneratingSEO(true)
		try {
			const formData = new FormData()
			formData.append('title', title)
			if (description) formData.append('description', description)
			if (extract) formData.append('extract', extract)
			formData.append('locale', articleLocale || 'fr')

			const result = await generateSEOAction(formData)

			if (result.success && result.seoTitle && result.seoDescription) {
				form.setValue('seoTitle', result.seoTitle, { shouldValidate: true })
				form.setValue('seoDescription', result.seoDescription, { shouldValidate: true })
				toast.success('SEO content generated successfully!')
			} else {
				toast.error(result.error || 'Failed to generate SEO content')
			}
		} catch (error) {
			console.error('Error generating SEO:', error)
			toast.error('An error occurred while generating SEO content')
		} finally {
			setIsGeneratingSEO(false)
		}
	}

	const onSubmit = async (data: ArticleFormValues) => {
		setIsSubmitting(true)
		try {
			// Create FormData for file upload
			const formData = new FormData()
			formData.append('articleId', article.id)
			formData.append('title', data.title)
			formData.append('slug', data.slug)
			formData.append('locale', data.locale)
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
								name="locale"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Language</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select language" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{i18n.locales.map((loc) => (
													<SelectItem key={loc} value={loc}>
														<span className="flex items-center gap-2">
															<span>{localeFlags[loc]}</span>
															<span>{localeNames[loc]}</span>
														</span>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormDescription>The language for this article</FormDescription>
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
										<div className="flex gap-2">
											<FormControl>
												<Input placeholder="Describe the image" {...field} className="flex-1" />
											</FormControl>
											<Button
												type="button"
												variant="outline"
												onClick={handleGenerateAltText}
												disabled={isGeneratingAlt || !form.watch('imageFile')}
												className="shrink-0"
											>
												<Sparkles className="mr-2 h-4 w-4" />
												{isGeneratingAlt ? 'Generating...' : 'Generate AI'}
											</Button>
										</div>
										<FormDescription>Alternative text for accessibility and SEO (AI-generated with Forvoyez)</FormDescription>
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

							<div>
								<Button
									type="button"
									variant="outline"
									onClick={handleGenerateSEO}
									disabled={isGeneratingSEO || !form.watch('title')}
									className="w-full sm:w-auto"
								>
									<Sparkles className="mr-2 h-4 w-4" />
									{isGeneratingSEO ? 'Generating SEO...' : 'Generate SEO with AI'}
								</Button>
								<p className="text-muted-foreground mt-2 text-sm">
									Automatically generate SEO title and description using AI based on your article content
								</p>
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
