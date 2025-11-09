'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as v from 'valibot'

import { createArticleAction } from '@/app/[locale]/admin/article/actions'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/ui/file-upload'
import { Input } from '@/components/ui/inputAlt'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Textarea } from '@/components/ui/textarea'
import type { Locale } from '@/lib/i18n/config'

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

interface ArticleCreationFormProps {
	locale: Locale
	onCancel?: () => void
	onSuccess?: (article: Article) => void
}

import type { Article } from '@/models/article.model'

export default function ArticleCreationForm({ locale, onCancel, onSuccess }: ArticleCreationFormProps) {
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		watch,
		setValue,
		register,
		handleSubmit,
		formState: { errors, dirtyFields },
	} = useForm<ArticleFormValues>({
		resolver: valibotResolver(articleFormSchema),
		defaultValues: {
			title: '',
			slug: '',
			description: '',
			extract: '',
			content: '',
			imageAlt: '',
			seoTitle: '',
			seoDescription: '',
		},
	})

	const contentValue = watch('content')
	const seoTitleValue = watch('seoTitle')
	const seoDescriptionValue = watch('seoDescription')

	const handleFileUploadWithValidation = (files: File[]) => {
		if (files.length === 0) {
			setValue('imageFile', undefined)
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

		setValue('imageFile', file)
	}

	const onSubmit = async (data: ArticleFormValues) => {
		setIsSubmitting(true)
		try {
			// Create FormData for file upload
			const formData = new FormData()
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

			const result = await createArticleAction(formData)

			if (result.success) {
				toast.success('Article created successfully!')
				if (onSuccess && result.data) {
					onSuccess(result.data)
				} else {
					router.push(`/${locale}/admin/article`)
				}
			} else {
				toast.error(result.error || 'Failed to create article')
			}
		} catch (error) {
			console.error('Error creating article:', error)
			toast.error('An unexpected error occurred')
		} finally {
			setIsSubmitting(false)
		}
	}

	// Auto-generate slug from title
	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setValue('title', value, { shouldValidate: true })
		if (!dirtyFields.slug) {
			const slug = value
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.trim()
			setValue('slug', slug)
		}
	}

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-linear-to-br pt-24">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size:[24px_24px]"></div>
			<div className="relative flex items-center justify-center p-6 md:p-10">
				<form
					className="dark:border-border/50 bg-card/80 relative w-full max-w-7xl rounded-3xl border border-black/50 p-8 shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md md:p-12"
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					onSubmit={handleSubmit(onSubmit)}
				>
					<div className="mb-12 text-left">
						<h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">Create New Article</h1>
						<p className="text-muted-foreground mt-4 text-lg">Add a new blog article to your platform</p>
					</div>

					{/* Global form error */}
					{errors.root && (
						<div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
							{errors.root.message}
						</div>
					)}

					{/* Basic Information Section */}
					<div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-3">
						<div>
							<h2 className="text-foreground text-2xl font-semibold">Basic Information</h2>
							<p className="text-muted-foreground mt-2 text-base leading-7">
								Enter the core details about your article including title, slug, and descriptions.
							</p>
						</div>
						<div className="sm:max-w-4xl md:col-span-2">
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
								{/* Title */}
								<div className="col-span-full sm:col-span-3">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="title">
										Article Title *
									</Label>
									<Input
										id="title"
										{...register('title')}
										onChange={handleTitleChange}
										placeholder="Enter article title"
										type="text"
									/>
									{errors.title && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
									)}
								</div>

								{/* Slug */}
								<div className="col-span-full sm:col-span-3">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="slug">
										URL Slug *
									</Label>
									<Input id="slug" {...register('slug')} placeholder="article-slug" type="text" />
									<p className="text-muted-foreground mt-1 text-sm">URL-friendly version (lowercase, hyphens only)</p>
									{errors.slug && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug.message}</p>}
								</div>

								{/* Description */}
								<div className="col-span-full">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="description">
										Description *
									</Label>
									<Textarea
										id="description"
										{...register('description')}
										placeholder="Enter article description"
										className="min-h-[100px]"
									/>
									<p className="text-muted-foreground mt-1 text-sm">A brief description for SEO and previews</p>
									{errors.description && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
									)}
								</div>

								{/* Extract */}
								<div className="col-span-full">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="extract">
										Extract *
									</Label>
									<Textarea
										id="extract"
										{...register('extract')}
										placeholder="Enter article extract"
										className="min-h-[100px]"
									/>
									<p className="text-muted-foreground mt-1 text-sm">A short excerpt to display in article lists</p>
									{errors.extract && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.extract.message}</p>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Content Section */}
					<div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-3">
						<div>
							<h2 className="text-foreground text-2xl font-semibold">Article Content</h2>
							<p className="text-muted-foreground mt-2 text-base leading-7">
								Write the full content of your article using the rich text editor.
							</p>
						</div>
						<div className="sm:max-w-4xl md:col-span-2">
							<div className="grid grid-cols-1 gap-6">
								<div className="col-span-full">
									<Label className="text-foreground mb-2 block text-base font-medium">Content *</Label>
									<RichTextEditor
										content={contentValue}
										onChange={value => setValue('content', value, { shouldValidate: true })}
										placeholder="Start writing your article..."
									/>
									<p className="text-muted-foreground mt-1 text-sm">
										The full content of your article (supports rich text)
									</p>
									{errors.content && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content.message}</p>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Featured Image Section */}
					<div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-3">
						<div>
							<h2 className="text-foreground text-2xl font-semibold">Featured Image</h2>
							<p className="text-muted-foreground mt-2 text-base leading-7">
								Upload an image to be displayed with your article.
							</p>
						</div>
						<div className="sm:max-w-4xl md:col-span-2">
							<div className="grid grid-cols-1 gap-6">
								{/* Image Upload */}
								<div className="col-span-full">
									<Label className="text-foreground mb-2 block text-base font-medium">Article Image</Label>
									<p className="text-muted-foreground mb-4 text-sm">
										Upload a featured image for your article (max 5MB)
									</p>
									<div className="bg-card/50 border-border/30 rounded-xl border backdrop-blur-sm">
										<FileUpload locale={locale} onChange={handleFileUploadWithValidation} />
									</div>
									{typeof errors.imageFile?.message === 'string' && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.imageFile.message}</p>
									)}
								</div>

								{/* Image Alt Text */}
								<div className="col-span-full">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="imageAlt">
										Image Alt Text
									</Label>
									<Input id="imageAlt" {...register('imageAlt')} placeholder="Describe the image" type="text" />
									<p className="text-muted-foreground mt-1 text-sm">Alternative text for accessibility and SEO</p>
									{errors.imageAlt && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.imageAlt.message}</p>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* SEO Section */}
					<div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-3">
						<div>
							<h2 className="text-foreground text-2xl font-semibold">SEO Settings</h2>
							<p className="text-muted-foreground mt-2 text-base leading-7">
								Optimize your article for search engines with custom meta tags.
							</p>
						</div>
						<div className="sm:max-w-4xl md:col-span-2">
							<div className="grid grid-cols-1 gap-6">
								{/* SEO Title */}
								<div className="col-span-full">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="seoTitle">
										SEO Title
									</Label>
									<Input
										id="seoTitle"
										{...register('seoTitle')}
										placeholder="Enter SEO title (max 60 characters)"
										type="text"
										maxLength={60}
									/>
									<p className="text-muted-foreground mt-1 text-sm">
										{seoTitleValue?.length || 0}/60 characters - Appears in search engine results
									</p>
									{errors.seoTitle && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.seoTitle.message}</p>
									)}
								</div>

								{/* SEO Description */}
								<div className="col-span-full">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="seoDescription">
										SEO Description
									</Label>
									<Textarea
										id="seoDescription"
										{...register('seoDescription')}
										placeholder="Enter SEO description (max 160 characters)"
										className="min-h-[100px]"
										maxLength={160}
									/>
									<p className="text-muted-foreground mt-1 text-sm">
										{seoDescriptionValue?.length || 0}/160 characters - Brief description for search results
									</p>
									{errors.seoDescription && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.seoDescription.message}</p>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Form Actions */}
					<div className="flex items-center justify-end space-x-6 pt-12">
						<Button
							disabled={isSubmitting}
							onClick={onCancel ? onCancel : () => router.push(`/${locale}/admin/article`)}
							size="lg"
							type="button"
							variant="outline"
						>
							Cancel
						</Button>
						<Button disabled={isSubmitting} size="lg" type="submit">
							{isSubmitting ? 'Creating Article...' : 'Create Article'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}
