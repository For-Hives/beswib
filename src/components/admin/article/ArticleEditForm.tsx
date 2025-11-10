'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { Languages, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as v from 'valibot'
import {
	generateAllMissingTranslationsAction,
	generateAltTextAction,
	generateArticleTranslationAction,
	generateSEOAction,
	updateArticleAction,
} from '@/app/[locale]/admin/article/actions'
import ArticleTranslationTabs from '@/components/admin/article/ArticleTranslationTabs'
import translations from '@/components/admin/article/locales/article-form.locales.json'
import ProcessLoader from '@/components/admin/article/ProcessLoader'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/ui/file-upload'
import { Input } from '@/components/ui/inputAlt'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { i18n, type Locale, localeFlags, localeNames } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { pb } from '@/lib/services/pocketbase'
import type { Article } from '@/models/article.model'
import type { ImageWithAlt } from '@/models/imageWithAlt.model'
import type { SEO } from '@/models/seo.model'

const createArticleFormSchema = (t: ReturnType<typeof getTranslations<typeof translations.en, Locale>>) =>
	v.object({
		title: v.pipe(v.string(), v.minLength(1, t.form.validation.titleRequired)),
		slug: v.pipe(
			v.string(),
			v.minLength(1, t.form.validation.slugRequired),
			v.regex(/^[a-z0-9-]+$/, t.form.validation.slugFormat)
		),
		locale: v.pipe(v.string(), v.minLength(1, t.form.validation.localeRequired)),
		description: v.pipe(v.string(), v.minLength(1, t.form.validation.descriptionRequired)),
		extract: v.pipe(v.string(), v.minLength(1, t.form.validation.extractRequired)),
		content: v.pipe(v.string(), v.minLength(1, t.form.validation.contentRequired)),
		imageFile: v.optional(v.any()),
		imageAlt: v.optional(v.string()),
		seoTitle: v.optional(v.pipe(v.string(), v.maxLength(60, t.form.validation.seoTitleMax))),
		seoDescription: v.optional(v.pipe(v.string(), v.maxLength(160, t.form.validation.seoDescriptionMax))),
	})

interface ArticleEditFormProps {
	article: Article & { expand?: { image?: ImageWithAlt; seo?: SEO } }
	locale: Locale
}

export default function ArticleEditForm({ article, locale }: ArticleEditFormProps) {
	const t = getTranslations(locale, translations)
	const articleFormSchema = createArticleFormSchema(t)
	type ArticleFormValues = v.InferOutput<typeof articleFormSchema>

	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isGeneratingAlt, setIsGeneratingAlt] = useState(false)
	const [isGeneratingSEO, setIsGeneratingSEO] = useState(false)
	const [isGeneratingTranslation, setIsGeneratingTranslation] = useState<string | null>(null)
	const [isGeneratingAllTranslations, setIsGeneratingAllTranslations] = useState(false)
	const [content, setContent] = useState(article.content || '')
	const [refreshTranslations, setRefreshTranslations] = useState(0)
	const [processProgress, setProcessProgress] = useState({ current: 0, total: 10, message: '' })
	const [localeState, setLocaleState] = useState<string>(article.locale || 'fr')
	const [seoTitle, setSeoTitle] = useState(article.expand?.seo?.title || '')
	const [seoDescription, setSeoDescription] = useState(article.expand?.seo?.description || '')

	// Generate current image URL if exists
	const currentImageUrl = article.expand?.image?.image
		? pb.files.getUrl(article.expand.image, article.expand.image.image)
		: null

	const {
		setValue,
		register,
		handleSubmit,
		getValues,
		formState: { errors, dirtyFields },
	} = useForm<ArticleFormValues>({
		resolver: valibotResolver(articleFormSchema),
		defaultValues: {
			title: article.title,
			slug: article.slug,
			locale: article.locale,
			description: article.description,
			extract: article.extract,
			content: article.content,
			imageAlt: article.expand?.image?.alt || '',
			seoTitle: article.expand?.seo?.title || '',
			seoDescription: article.expand?.seo?.description || '',
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
			toast.error(t.form.messages.error.invalidFileType)
			return
		}

		if (file.size > maxSize) {
			toast.error(t.form.messages.error.fileTooLarge)
			return
		}

		setValue('imageFile', file)
	}

	const handleGenerateAltText = async () => {
		const imageFile = getValues('imageFile')

		if (!imageFile || !(imageFile instanceof File)) {
			toast.error(t.form.messages.error.uploadFirst)
			return
		}

		setIsGeneratingAlt(true)
		setProcessProgress({ current: 0, total: 3, message: t.form.process.generatingAlt })

		try {
			const formData = new FormData()
			formData.append('image', imageFile)
			formData.append('language', getValues('locale') || 'fr')

			setProcessProgress({ current: 1, total: 3, message: t.form.process.callingForvoyez })
			const result = await generateAltTextAction(formData)

			setProcessProgress({ current: 2, total: 3, message: t.form.process.processingResult })

			if (result.success && result.altText) {
				setValue('imageAlt', result.altText, { shouldValidate: true })
				setProcessProgress({ current: 3, total: 3, message: t.form.process.complete })
				setTimeout(() => setProcessProgress({ current: 0, total: 3, message: '' }), 500)
				toast.success(t.form.messages.success.altGenerated)
			} else {
				toast.error(result.error || t.form.messages.error.altGenerate)
			}
		} catch (error) {
			console.error('Error generating alt text:', error)
			toast.error(t.form.messages.error.altGenerate)
		} finally {
			setIsGeneratingAlt(false)
		}
	}

	const handleGenerateSEO = async () => {
		const title = getValues('title')
		const description = getValues('description')
		const extract = getValues('extract')

		if (!title) {
			toast.error(t.form.messages.error.titleRequired)
			return
		}

		setIsGeneratingSEO(true)
		setProcessProgress({ current: 0, total: 3, message: t.form.process.generatingSEO })

		try {
			const formData = new FormData()
			formData.append('title', title)
			if (description) formData.append('description', description)
			if (extract) formData.append('extract', extract)
			formData.append('locale', getValues('locale') || 'fr')

			setProcessProgress({ current: 1, total: 3, message: t.form.process.callingGemini })
			const result = await generateSEOAction(formData)

			setProcessProgress({ current: 2, total: 3, message: t.form.process.processingResult })

			if (result.success && result.seoTitle && result.seoDescription) {
				setSeoTitle(result.seoTitle)
				setSeoDescription(result.seoDescription)
				setValue('seoTitle', result.seoTitle, { shouldValidate: true })
				setValue('seoDescription', result.seoDescription, { shouldValidate: true })
				setProcessProgress({ current: 3, total: 3, message: t.form.process.complete })
				setTimeout(() => setProcessProgress({ current: 0, total: 3, message: '' }), 500)
				toast.success(t.form.messages.success.seoGenerated)
			} else {
				toast.error(result.error || t.form.messages.error.seoGenerate)
			}
		} catch (error) {
			console.error('Error generating SEO:', error)
			toast.error(t.form.messages.error.seoGenerate)
		} finally {
			setIsGeneratingSEO(false)
		}
	}

	const onSubmit = async (data: ArticleFormValues) => {
		setIsSubmitting(true)
		try {
			// Create FormData for file upload
			const formData = new FormData()
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
			if (article.translationGroup) {
				formData.append('translationGroup', article.translationGroup)
			}

			const result = await updateArticleAction(article.id, formData)

			if (result.success) {
				toast.success(t.form.messages.success.updated)
				router.push(`/${locale}/admin/article`)
			} else {
				toast.error(result.error || t.form.messages.error.update)
			}
		} catch (error) {
			console.error('Error updating article:', error)
			toast.error(t.form.messages.error.unexpected)
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
	const handleLocaleChange = (newLocale: Locale, translatedArticle?: Article) => {
		if (translatedArticle) {
			// Navigate to the edit page of the translation
			router.push(`/${locale}/admin/article/edit/${translatedArticle.id}`)
		} else {
			// Navigate to create page with the translationGroup preset
			const translationGroup = article.translationGroup
			if (translationGroup) {
				router.push(`/${locale}/admin/article/create?translationGroup=${translationGroup}&locale=${newLocale}`)
			} else {
				toast.info(t.form.messages.info.createTranslation.replace('{locale}', newLocale.toUpperCase()))
			}
		}
	}

	// Handle translation generation for a single language
	const handleGenerateTranslation = async (targetLocale: Locale) => {
		setIsGeneratingTranslation(targetLocale)
		setProcessProgress({
			current: 0,
			total: 10,
			message: t.form.process.translatingTo.replace('{locale}', localeNames[targetLocale]),
		})

		try {
			// Simulate progress based on expected steps
			const progressSteps = [
				{ step: 1, message: t.form.process.loadingSource },
				{ step: 2, message: t.form.process.extractingImages },
				{ step: 4, message: t.form.process.callingGemini },
				{ step: 6, message: t.form.process.processingTranslation },
				{ step: 7, message: t.form.process.creatingImage },
				{ step: 8, message: t.form.process.creatingSEO },
				{ step: 9, message: t.form.process.creatingArticle },
			]

			// Update progress incrementally
			const progressInterval = setInterval(() => {
				setProcessProgress(prev => {
					const nextStep = progressSteps.find(s => s.step > prev.current)
					if (nextStep && prev.current < 9) {
						return { current: nextStep.step, total: 10, message: nextStep.message }
					}
					return prev
				})
			}, 800)

			const result = await generateArticleTranslationAction(article.id, targetLocale)
			clearInterval(progressInterval)

			setProcessProgress({ current: 10, total: 10, message: t.form.process.complete })
			setTimeout(() => setProcessProgress({ current: 0, total: 10, message: '' }), 500)

			if (result.success && result.data) {
				toast.success(
					t.form.messages.success.translationGenerated.replace('{locale}', localeNames[targetLocale])
				)
				setRefreshTranslations(prev => prev + 1)
			} else {
				toast.error(
					result.error || t.form.messages.error.translationGenerate.replace('{locale}', localeNames[targetLocale])
				)
			}
		} catch (error) {
			console.error(`Error generating ${targetLocale} translation:`, error)
			toast.error(t.form.messages.error.translationGenerate.replace('{locale}', localeNames[targetLocale]))
		} finally {
			setIsGeneratingTranslation(null)
		}
	}

	// Handle generation of all missing translations
	const handleGenerateAllTranslations = async () => {
		setIsGeneratingAllTranslations(true)
		try {
			toast.info(`🚀 ${t.form.translation.startingBatch}`)
			const result = await generateAllMissingTranslationsAction(article.id)

			if (result.success) {
				if (result.successes.length > 0) {
					toast.success(
						`✓ ${t.form.translation.successCount.replace('{count}', result.successes.length.toString()).replace('{locales}', result.successes.map(l => l.toUpperCase()).join(', '))}`,
						{ duration: 5000 }
					)
				}
				if (result.failures.length > 0) {
					toast.error(
						`✗ ${t.form.translation.failureCount.replace('{count}', result.failures.length.toString()).replace('{locales}', result.failures.map(f => f.locale.toUpperCase()).join(', '))}`,
						{ duration: 5000 }
					)
				}
				if (result.total === 0) {
					toast.info(t.form.translation.allExist)
				}
				// Refresh translations display
				setRefreshTranslations(prev => prev + 1)
			} else {
				toast.error(result.error || t.form.messages.error.translationGenerate.replace('{locale}', ''))
			}
		} catch (error) {
			console.error('Error generating all translations:', error)
			toast.error(t.form.messages.error.unexpected)
		} finally {
			setIsGeneratingAllTranslations(false)
		}
	}

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-linear-to-br pt-24">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
			<div className="relative flex items-center justify-center p-6 md:p-10">
				<form
					className="dark:border-border/50 bg-card/80 relative w-full max-w-7xl rounded-3xl border border-black/50 p-8 shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md md:p-12"
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					onSubmit={handleSubmit(onSubmit)}
				>
					<div className="mb-12 text-left">
						<h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">{t.form.edit.title}</h1>
						<p className="text-muted-foreground mt-4 text-lg">{t.form.edit.subtitle}</p>
					</div>

					{/* Translation Tabs */}
					<ArticleTranslationTabs
						translationGroup={article.translationGroup}
						currentLocale={article.locale}
						onLocaleChange={handleLocaleChange}
						refreshTrigger={refreshTranslations}
					/>

					{/* Translation Generation Section - Only shown for French articles */}
					{article.locale === 'fr' && (
						<div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-3">
							<div>
								<h2 className="text-foreground flex items-center gap-2 text-2xl font-semibold">
									<Languages className="h-6 w-6" />
									{t.form.sections.translation.title}
								</h2>
								<p className="text-muted-foreground mt-2 text-base leading-7">
									{t.form.sections.translation.description}
								</p>
							</div>
							<div className="sm:max-w-4xl md:col-span-2">
								<div className="grid grid-cols-1 gap-6">
									{/* Generate All Button */}
									<div className="col-span-full">
										<Button
											type="button"
											variant="default"
											onClick={handleGenerateAllTranslations}
											disabled={isGeneratingAllTranslations || isGeneratingTranslation != null}
											className="w-full sm:w-auto"
											size="lg"
										>
											<Sparkles className="mr-2 h-5 w-5" />
											{isGeneratingAllTranslations
												? t.form.actions.generateAllTranslations.generating
												: t.form.actions.generateAllTranslations.label}
										</Button>
										<p className="text-muted-foreground mt-2 text-sm">
											{t.form.translation.automaticDescription}
										</p>
									</div>

									{/* Individual Language Buttons */}
									<div className="col-span-full">
										<Label className="text-foreground mb-3 block text-base font-medium">
											{t.form.actions.generateTranslation.orGenerate}
										</Label>
										<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
											{i18n.locales
												.filter(loc => loc !== 'fr')
												.map(targetLocale => {
													const isGenerating = isGeneratingTranslation === targetLocale
													return (
														<Button
															key={targetLocale}
															type="button"
															variant="outline"
															onClick={() => handleGenerateTranslation(targetLocale)}
															disabled={isGeneratingTranslation != null || isGeneratingAllTranslations}
															className="flex items-center justify-center gap-2"
														>
															<span className="text-lg">{localeFlags.fr}</span>
															<span>→</span>
															<span className="text-lg">{localeFlags[targetLocale]}</span>
															<span className="uppercase">{targetLocale}</span>
															{isGenerating && <Sparkles className="ml-1 h-4 w-4 animate-pulse" />}
														</Button>
													)
												})}
										</div>
										<p className="text-muted-foreground mt-2 text-sm">{t.form.translation.regenerateWarning}</p>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Global form error */}
					{errors.root && (
						<div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
							{errors.root.message}
						</div>
					)}

					{/* Basic Information Section */}
					<div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-3">
						<div>
							<h2 className="text-foreground text-2xl font-semibold">{t.form.sections.basicInfo.title}</h2>
							<p className="text-muted-foreground mt-2 text-base leading-7">{t.form.sections.basicInfo.description}</p>
						</div>
						<div className="sm:max-w-4xl md:col-span-2">
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
								{/* Title */}
								<div className="col-span-full sm:col-span-3">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="title">
										{t.form.fields.title.label} *
									</Label>
									<Input
										id="title"
										{...register('title')}
										onChange={handleTitleChange}
										placeholder={t.form.fields.title.placeholder}
										type="text"
									/>
									{errors.title && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
									)}
								</div>

								{/* Slug */}
								<div className="col-span-full sm:col-span-3">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="slug">
										{t.form.fields.slug.label} *
									</Label>
									<Input id="slug" {...register('slug')} placeholder={t.form.fields.slug.placeholder} type="text" />
									<p className="text-muted-foreground mt-1 text-sm">{t.form.fields.slug.helper}</p>
									{errors.slug && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug.message}</p>}
								</div>

								{/* Language */}
								<div className="col-span-full sm:col-span-3">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="locale">
										{t.form.fields.locale.label} *
									</Label>
									<Select
										value={localeState}
										onValueChange={value => {
											setLocaleState(value)
											setValue('locale', value, { shouldValidate: true })
										}}
									>
										<SelectTrigger id="locale">
											<SelectValue placeholder={t.form.fields.locale.placeholder} />
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
									<p className="text-muted-foreground mt-1 text-sm">{t.form.fields.locale.helper}</p>
									{errors.locale && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.locale.message}</p>
									)}
								</div>

								{/* Description */}
								<div className="col-span-full">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="description">
										{t.form.fields.description.label} *
									</Label>
									<Textarea
										id="description"
										{...register('description')}
										placeholder={t.form.fields.description.placeholder}
										className="min-h-[100px]"
									/>
									<p className="text-muted-foreground mt-1 text-sm">{t.form.fields.description.helper}</p>
									{errors.description && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
									)}
								</div>

								{/* Extract */}
								<div className="col-span-full">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="extract">
										{t.form.fields.extract.label} *
									</Label>
									<Textarea
										id="extract"
										{...register('extract')}
										placeholder={t.form.fields.extract.placeholder}
										className="min-h-[100px]"
									/>
									<p className="text-muted-foreground mt-1 text-sm">{t.form.fields.extract.helper}</p>
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
							<h2 className="text-foreground text-2xl font-semibold">{t.form.sections.content.title}</h2>
							<p className="text-muted-foreground mt-2 text-base leading-7">{t.form.sections.content.description}</p>
						</div>
						<div className="sm:max-w-4xl md:col-span-2">
							<div className="grid grid-cols-1 gap-6">
								<div className="col-span-full">
									<Label className="text-foreground mb-2 block text-base font-medium">
										{t.form.fields.content.label} *
									</Label>
									<RichTextEditor
										content={content}
										onChange={value => {
											setContent(value)
											setValue('content', value, { shouldValidate: true })
										}}
										placeholder={t.form.fields.content.placeholder}
									/>
									<p className="text-muted-foreground mt-1 text-sm">{t.form.fields.content.helper}</p>
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
							<h2 className="text-foreground text-2xl font-semibold">{t.form.sections.featuredImage.title}</h2>
							<p className="text-muted-foreground mt-2 text-base leading-7">
								{t.form.sections.featuredImage.description}
							</p>
						</div>
						<div className="sm:max-w-4xl md:col-span-2">
							<div className="grid grid-cols-1 gap-6">
								{/* Current Image Display */}
								{currentImageUrl && (
									<div className="col-span-full">
										<Label className="text-foreground mb-2 block text-base font-medium">
											{t.form.fields.currentImage.label}
										</Label>
										<div className="bg-card/50 border-border/30 rounded-xl border p-4 backdrop-blur-sm">
											<div className="relative h-64 w-full max-w-md">
												<Image
													src={currentImageUrl}
													alt={article.expand?.image?.alt || 'Article image'}
													fill
													className="rounded-lg object-cover"
												/>
											</div>
											{article.expand?.image?.alt && (
												<p className="text-muted-foreground mt-2 text-sm">
													<span className="font-medium">{t.form.fields.currentImage.altLabel}:</span>{' '}
													{article.expand.image.alt}
												</p>
											)}
										</div>
									</div>
								)}

								{/* Image Upload */}
								<div className="col-span-full">
									<Label className="text-foreground mb-2 block text-base font-medium">
										{currentImageUrl ? t.form.fields.image.labelReplace : t.form.fields.image.label}
									</Label>
									<p className="text-muted-foreground mb-4 text-sm">{t.form.fields.image.helper}</p>
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
										{t.form.fields.imageAlt.label}
									</Label>
									<div className="flex gap-2">
										<Input
											id="imageAlt"
											{...register('imageAlt')}
											placeholder={t.form.fields.imageAlt.placeholder}
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
											{isGeneratingAlt ? t.form.actions.generateAlt.generating : t.form.actions.generateAlt.label}
										</Button>
									</div>
									<p className="text-muted-foreground mt-1 text-sm">{t.form.fields.imageAlt.helper}</p>
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
							<h2 className="text-foreground text-2xl font-semibold">{t.form.sections.seo.title}</h2>
							<p className="text-muted-foreground mt-2 text-base leading-7">{t.form.sections.seo.description}</p>
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
										{isGeneratingSEO ? t.form.actions.generateSEO.generating : t.form.actions.generateSEO.label}
									</Button>
									<p className="text-muted-foreground mt-2 text-sm">{t.form.fields.seoTitle.helper}</p>
								</div>

								{/* SEO Title */}
								<div className="col-span-full">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="seoTitle">
										{t.form.fields.seoTitle.label}
									</Label>
									<Input
										id="seoTitle"
										{...register('seoTitle')}
										onChange={e => {
											setSeoTitle(e.target.value)
											setValue('seoTitle', e.target.value, { shouldValidate: true })
										}}
										placeholder={t.form.fields.seoTitle.placeholder}
										type="text"
										maxLength={60}
									/>
									<p className="text-muted-foreground mt-1 text-sm">
										{seoTitle?.length || 0}/60 {t.form.fields.seoTitle.charactersCount} - {t.form.fields.seoTitle.helper}
									</p>
									{errors.seoTitle && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.seoTitle.message}</p>
									)}
								</div>

								{/* SEO Description */}
								<div className="col-span-full">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="seoDescription">
										{t.form.fields.seoDescription.label}
									</Label>
									<Textarea
										id="seoDescription"
										{...register('seoDescription')}
										onChange={e => {
											setSeoDescription(e.target.value)
											setValue('seoDescription', e.target.value, { shouldValidate: true })
										}}
										placeholder={t.form.fields.seoDescription.placeholder}
										className="min-h-[100px]"
										maxLength={160}
									/>
									<p className="text-muted-foreground mt-1 text-sm">
										{seoDescription?.length || 0}/160 {t.form.fields.seoDescription.charactersCount} -{' '}
										{t.form.fields.seoDescription.helper}
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
							onClick={() => router.push(`/${locale}/admin/article`)}
							size="lg"
							type="button"
							variant="outline"
						>
							{t.form.actions.cancel}
						</Button>
						<Button disabled={isSubmitting} size="lg" type="submit">
							{isSubmitting ? t.form.actions.submit.updating : t.form.actions.submit.update}
						</Button>
					</div>
				</form>
			</div>

			{/* Process Loader - Fixed bottom right */}
			<ProcessLoader
				isLoading={processProgress.current > 0}
				currentStep={processProgress.current}
				totalSteps={processProgress.total}
				message={processProgress.message}
			/>
		</div>
	)
}
