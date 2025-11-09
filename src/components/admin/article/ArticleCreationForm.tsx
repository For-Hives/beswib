'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { Sparkles } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as v from 'valibot'
import { createArticleAction, generateAltTextAction, generateSEOAction } from '@/app/[locale]/admin/article/actions'
import ArticleTranslationTabs from '@/components/admin/article/ArticleTranslationTabs'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/ui/file-upload'
import { Input } from '@/components/ui/inputAlt'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { i18n, type Locale, localeFlags, localeNames } from '@/lib/i18n/config'

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

interface ArticleCreationFormProps {
	locale: Locale
	onCancel?: () => void
	onSuccess?: (article: Article) => void
}

import type { Article } from '@/models/article.model'

export default function ArticleCreationForm({ locale, onCancel, onSuccess }: ArticleCreationFormProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isGeneratingAlt, setIsGeneratingAlt] = useState(false)
	const [isGeneratingSEO, setIsGeneratingSEO] = useState(false)
	const [content, setContent] = useState('')
	const [localeState, setLocaleState] = useState<string>('fr')
	const [seoTitle, setSeoTitle] = useState('')
	const [seoDescription, setSeoDescription] = useState('')
	const [translationGroup, setTranslationGroup] = useState<string | undefined>(undefined)
	const [currentArticleId, setCurrentArticleId] = useState<string | undefined>(undefined)

	// Check URL parameters for translationGroup and locale
	useEffect(() => {
		const urlTranslationGroup = searchParams.get('translationGroup')
		const urlLocale = searchParams.get('locale')

		if (urlTranslationGroup) {
			setTranslationGroup(urlTranslationGroup)
			toast.info('Creating translation for existing article')
		}

		if (urlLocale) {
			setLocaleState(urlLocale)
			setValue('locale', urlLocale, { shouldValidate: true })
		}
	}, [searchParams])

	const {
		setValue,
		register,
		handleSubmit,
		getValues,
		formState: { errors, dirtyFields },
	} = useForm<ArticleFormValues>({
		resolver: valibotResolver(articleFormSchema),
		defaultValues: {
			title: '',
			slug: '',
			locale: 'fr', // Default to French
			description: '',
			extract: '',
			content: '',
			imageAlt: '',
			seoTitle: '',
			seoDescription: '',
		},
	})

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

	const handleGenerateAltText = async () => {
		const imageFile = getValues('imageFile')

		if (!imageFile || !(imageFile instanceof File)) {
			toast.error('Please upload an image first')
			return
		}

		setIsGeneratingAlt(true)
		try {
			const formData = new FormData()
			formData.append('image', imageFile)
			formData.append('language', getValues('locale') || 'fr')

			const result = await generateAltTextAction(formData)

			if (result.success && result.altText) {
				setValue('imageAlt', result.altText, { shouldValidate: true })
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
		const title = getValues('title')
		const description = getValues('description')
		const extract = getValues('extract')

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
			formData.append('locale', getValues('locale') || 'fr')

			const result = await generateSEOAction(formData)

			if (result.success && result.seoTitle && result.seoDescription) {
				setSeoTitle(result.seoTitle)
				setSeoDescription(result.seoDescription)
				setValue('seoTitle', result.seoTitle, { shouldValidate: true })
				setValue('seoDescription', result.seoDescription, { shouldValidate: true })
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
			// Generate or use existing translationGroup
			let groupId = translationGroup
			if (!groupId) {
				// Generate a new UUID for the translation group
				groupId = crypto.randomUUID()
				setTranslationGroup(groupId)
			}

			// Create FormData for file upload
			const formData = new FormData()
			formData.append('title', data.title)
			formData.append('slug', data.slug)
			formData.append('locale', data.locale)
			formData.append('description', data.description)
			formData.append('extract', data.extract)
			formData.append('content', data.content)
			formData.append('translationGroup', groupId)

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
				if (result.data) {
					// Set the translation group from the created article
					if (result.data.translationGroup) {
						setTranslationGroup(result.data.translationGroup)
					}
					setCurrentArticleId(result.data.id)
				}
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

	// Handle locale change and load article data if it exists
	const handleLocaleChange = (newLocale: Locale, article?: Article) => {
		setLocaleState(newLocale)
		setValue('locale', newLocale, { shouldValidate: true })

		if (article) {
			// Load existing translation data
			setCurrentArticleId(article.id)
			setValue('title', article.title)
			setValue('slug', article.slug)
			setValue('description', article.description)
			setValue('extract', article.extract)
			setContent(article.content)
			setValue('content', article.content)
			// Note: We don't load image and SEO for now as they require separate handling
			toast.success(`Loaded ${newLocale.toUpperCase()} translation`)
		} else {
			// Clear form for new translation
			setCurrentArticleId(undefined)
			setValue('title', '')
			setValue('slug', '')
			setValue('description', '')
			setValue('extract', '')
			setContent('')
			setValue('content', '')
			setValue('imageFile', undefined)
			setValue('imageAlt', '')
			setSeoTitle('')
			setSeoDescription('')
			setValue('seoTitle', '')
			setValue('seoDescription', '')
			toast.info(`Creating new ${newLocale.toUpperCase()} translation`)
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

					{/* Translation Tabs */}
					<ArticleTranslationTabs
						translationGroup={translationGroup}
						currentLocale={localeState as Locale}
						onLocaleChange={handleLocaleChange}
					/>

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

								{/* Language */}
								<div className="col-span-full sm:col-span-3">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="locale">
										Language *
									</Label>
									<Select
										value={localeState}
										onValueChange={value => {
											setLocaleState(value)
											setValue('locale', value, { shouldValidate: true })
										}}
									>
										<SelectTrigger id="locale">
											<SelectValue placeholder="Select language" />
										</SelectTrigger>
										<SelectContent>
											{i18n.locales.map(loc => (
												<SelectItem key={loc} value={loc}>
													<span className="flex items-center gap-2">
														<span>{localeFlags[loc]}</span>
														<span>{localeNames[loc]}</span>
													</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<p className="text-muted-foreground mt-1 text-sm">Select the language for this article</p>
									{errors.locale && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.locale.message}</p>
									)}
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
										content={content}
										onChange={value => {
											setContent(value)
											setValue('content', value, { shouldValidate: true })
										}}
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
									<div className="flex gap-2">
										<Input
											id="imageAlt"
											{...register('imageAlt')}
											placeholder="Describe the image"
											type="text"
											className="flex-1"
										/>
										<Button
											type="button"
											variant="outline"
											onClick={handleGenerateAltText}
											disabled={isGeneratingAlt || !getValues('imageFile')}
											className="shrink-0"
										>
											<Sparkles className="mr-2 h-4 w-4" />
											{isGeneratingAlt ? 'Generating...' : 'Generate AI'}
										</Button>
									</div>
									<p className="text-muted-foreground mt-1 text-sm">
										Alternative text for accessibility and SEO (AI-generated with Forvoyez)
									</p>
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
								{/* Generate SEO Button */}
								<div className="col-span-full">
									<Button
										type="button"
										variant="outline"
										onClick={handleGenerateSEO}
										disabled={isGeneratingSEO || !getValues('title')}
										className="w-full sm:w-auto"
									>
										<Sparkles className="mr-2 h-4 w-4" />
										{isGeneratingSEO ? 'Generating SEO...' : 'Generate SEO with AI'}
									</Button>
									<p className="text-muted-foreground mt-2 text-sm">
										Automatically generate SEO title and description using AI based on your article content
									</p>
								</div>

								{/* SEO Title */}
								<div className="col-span-full">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="seoTitle">
										SEO Title
									</Label>
									<Input
										id="seoTitle"
										{...register('seoTitle')}
										onChange={e => {
											setSeoTitle(e.target.value)
											setValue('seoTitle', e.target.value, { shouldValidate: true })
										}}
										placeholder="Enter SEO title (max 60 characters)"
										type="text"
										maxLength={60}
									/>
									<p className="text-muted-foreground mt-1 text-sm">
										{seoTitle?.length || 0}/60 characters - Appears in search engine results
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
										onChange={e => {
											setSeoDescription(e.target.value)
											setValue('seoDescription', e.target.value, { shouldValidate: true })
										}}
										placeholder="Enter SEO description (max 160 characters)"
										className="min-h-[100px]"
										maxLength={160}
									/>
									<p className="text-muted-foreground mt-1 text-sm">
										{seoDescription?.length || 0}/160 characters - Brief description for search results
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
