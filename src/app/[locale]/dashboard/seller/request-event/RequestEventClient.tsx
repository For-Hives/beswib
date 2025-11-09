'use client'

import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

import { DateInput } from '@/components/ui/date-input'
import { Input } from '@/components/ui/inputAlt'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textareaAlt'
import type { Locale } from '@/lib/i18n/config'

import { handleCreateEventCreationRequest } from './actions'

interface FormData {
	eventDate: string
	location: string
	message: string
	name: string
}

interface FormErrors {
	eventDate?: string
	location?: string
	name?: string
}

interface RequestEventClientProps {
	locale: Locale
}

import requestEventTranslations from '@/app/[locale]/dashboard/seller/request-event/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'

export default function RequestEventClient({ locale }: RequestEventClientProps) {
	const t = getTranslations(locale, requestEventTranslations)

	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)
	const [errors, setErrors] = useState<FormErrors>({})
	const [formData, setFormData] = useState<FormData>({
		name: '',
		message: '',
		location: '',
		eventDate: '',
	})

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {}

		if (!formData.name.trim()) {
			newErrors.name = t.validation.eventNameRequired
		}

		if (!formData.location.trim()) {
			newErrors.location = t.validation.locationRequired
		}

		if (!formData.eventDate) {
			newErrors.eventDate = t.validation.eventDateRequired
		} else {
			const selectedDate = new Date(formData.eventDate)
			const today = new Date()
			today.setHours(0, 0, 0, 0)

			if (selectedDate < today) {
				newErrors.eventDate = t.validation.eventDateInPast
			}
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }))
		// Clear error for this field when user starts typing
		if (errors[field as keyof FormErrors] != null && errors[field as keyof FormErrors] !== undefined) {
			setErrors(prev => ({ ...prev, [field]: undefined }))
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		setIsSubmitting(true)

		try {
			// Create FormData for server action
			const formDataToSubmit = new FormData()
			formDataToSubmit.append('name', formData.name.trim())
			formDataToSubmit.append('location', formData.location.trim())
			formDataToSubmit.append('eventDate', formData.eventDate)
			formDataToSubmit.append('message', formData.message.trim())

			const result = await handleCreateEventCreationRequest(formDataToSubmit)

			if (result.success) {
				setShowSuccess(true)
				setTimeout(() => {
					router.push(`/${locale}/dashboard/seller/sell-bib`)
				}, 3000)
			} else {
				setErrors({ name: result.error ?? t.messages.error })
			}
		} catch (error) {
			console.error('Error submitting event request:', error)
			setErrors({ name: error instanceof Error ? error.message : t.messages.error })
		} finally {
			setIsSubmitting(false)
		}
	}

	if (showSuccess) {
		return (
			<div className="from-background via-primary/5 to-background relative min-h-screen bg-linear-to-br pt-24">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
				<div className="relative flex items-center justify-center p-6 md:p-10">
					<div className="dark:border-border/50 bg-card/80 relative w-full max-w-4xl rounded-3xl border border-black/50 p-8 shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md md:p-12">
						<div className="text-center">
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
								<Send className="h-10 w-10 text-green-600 dark:text-green-300" />
							</div>
							<h2 className="text-foreground mb-4 text-3xl font-bold">{t.title}</h2>
							<p className="text-muted-foreground mb-8 text-lg">{t.messages.success}</p>
							<Link href={`/${locale}/dashboard/seller/sell-bib`}>
								<Button size="lg">
									<ArrowLeft className="mr-2 h-4 w-4" />
									{t.actions.goBack}
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-linear-to-br pt-24">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
			<div className="relative flex items-center justify-center p-6 md:p-10">
				<form
					className="dark:border-border/50 bg-card/80 relative w-full max-w-7xl rounded-3xl border border-black/50 p-8 shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md md:p-12"
					onSubmit={e => void handleSubmit(e)}
				>
					{/* Back Link */}
					<div className="mb-8">
						<Link
							className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
							href={`/${locale}/dashboard/seller/sell-bib`}
						>
							<ArrowLeft className="h-4 w-4" />
							{t.actions.goBack}
						</Link>
					</div>

					{/* Header */}
					<div className="mb-12 text-left">
						<h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">{t.title}</h1>
						<p className="text-muted-foreground mt-4 text-lg">{t.subtitle}</p>
					</div>

					{/* Event Information Section */}
					<div className="grid grid-cols-1 gap-12 md:grid-cols-3">
						<div>
							<h2 className="text-foreground text-2xl font-semibold">{t.sections.eventInformation.title}</h2>
							<p className="text-muted-foreground mt-2 text-base leading-7">
								{t.sections.eventInformation.description}
							</p>
						</div>
						<div className="sm:max-w-4xl md:col-span-2">
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
								{/* Event Name */}
								<div className="col-span-full sm:col-span-3">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="eventName">
										{t.form.eventName} *
									</Label>
									<Input
										id="eventName"
										onChange={e => handleInputChange('name', e.target.value)}
										placeholder={t.form.eventNamePlaceholder}
										type="text"
										value={formData.name}
									/>
									{errors.name != null && errors.name !== undefined && errors.name !== '' && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
									)}
								</div>

								{/* Location */}
								<div className="col-span-full sm:col-span-3">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="location">
										{t.form.location} *
									</Label>
									<Input
										id="location"
										onChange={e => handleInputChange('location', e.target.value)}
										placeholder={t.form.locationPlaceholder}
										type="text"
										value={formData.location}
									/>
									{errors.location != null && errors.location !== undefined && errors.location !== '' && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location}</p>
									)}
								</div>

								{/* Event Date */}
								<div className="col-span-full sm:col-span-3">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="eventDate">
										{t.form.eventDate} *
									</Label>
									<DateInput
										id="eventDate"
										locale={locale}
										min={new Date().toISOString().split('T')[0]}
										onChange={e => handleInputChange('eventDate', e.target.value)}
										showHelper={false}
										value={formData.eventDate}
									/>
									{errors.eventDate != null && errors.eventDate !== undefined && errors.eventDate !== '' && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.eventDate}</p>
									)}
								</div>
							</div>
						</div>
					</div>

					<Separator className="my-12" />

					{/* Additional Information Section */}
					<div className="grid grid-cols-1 gap-12 md:grid-cols-3">
						<div>
							<h2 className="text-foreground text-2xl font-semibold">{t.sections.additionalInformation.title}</h2>
							<p className="text-muted-foreground mt-2 text-base leading-7">
								{t.sections.additionalInformation.description}
							</p>
						</div>
						<div className="sm:max-w-4xl md:col-span-2">
							<div className="grid grid-cols-1 gap-6">
								<div className="col-span-full">
									<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="message">
										{t.form.message}
									</Label>
									<Textarea
										id="message"
										onChange={e => handleInputChange('message', e.target.value)}
										placeholder={t.form.messagePlaceholder}
										rows={4}
										value={formData.message}
									/>
								</div>
							</div>
						</div>
					</div>

					<Separator className="my-12" />

					{/* Form Actions */}
					<div className="flex items-center justify-end space-x-6 pt-8">
						<Link href={`/${locale}/dashboard/seller/sell-bib`}>
							<Button disabled={isSubmitting} size="lg" type="button" variant="outline">
								{t.actions.cancel}
							</Button>
						</Link>
						<Button disabled={isSubmitting} size="lg" type="submit">
							{isSubmitting ? t.messages.loading : t.actions.submit}
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}
