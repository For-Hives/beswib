import { Copy, ExternalLink, CheckCircle } from 'lucide-react'

import { toast } from 'sonner'

import type { Organizer } from '@/models/organizer.model'
import type { BibSale } from '@/models/marketplace.model'
import type { Event } from '@/models/event.model'
import type { User } from '@/models/user.model'
import type { Bib } from '@/models/bib.model'

import { mapEventTypeToBibSaleType } from '@/lib/transformers/bib'
import CardMarket from '@/components/marketplace/CardMarket'
import { getOrganizerImageUrl } from '@/lib/utils/images'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/inputAlt'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface ConfirmationStepProps {
	createdBib: Bib | null
	errors: Record<string, string>
	formData: {
		acceptedTerms: boolean
		listingType: 'private' | 'public'
		originalPrice: string
		registrationNumber: string
		selectedEvent: (Event & { expand?: { organizer?: Organizer } }) | null
		sellingPrice: string
	}
	locale: Locale
	onChange: (data: Partial<ConfirmationStepProps['formData']>) => void
	user: User
}

import Link from 'next/link'

import sellBibTranslations from '@/app/[locale]/dashboard/seller/sell-bib/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Locale } from '@/lib/i18n/config'

export default function ConfirmationStep({
	user,
	onChange,
	locale,
	formData,
	errors,
	createdBib,
}: Readonly<ConfirmationStepProps>) {
	const t = getTranslations(locale, sellBibTranslations)

	const generatePrivateLink = () => {
		if (
			createdBib?.privateListingToken == null ||
			createdBib?.privateListingToken === undefined ||
			createdBib?.privateListingToken === ''
		)
			return ''
		const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
		// Get current locale from URL or default to 'fr'
		const currentLocale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'fr' : 'fr'
		return `${baseUrl}/${currentLocale}/marketplace/${createdBib.id}?tkn=${createdBib.privateListingToken}`
	}

	const generatePublicLink = () => {
		if (createdBib?.id == null) return ''
		const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
		// Get current locale from URL or default to 'fr'
		const currentLocale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'fr' : 'fr'
		return `${baseUrl}/${currentLocale}/marketplace/${createdBib.id}`
	}

	const copyPrivateLink = async () => {
		const link = generatePrivateLink()
		try {
			await navigator.clipboard.writeText(link)
			toast.success('Link copied to clipboard!')
		} catch (error) {
			console.error('Failed to copy link:', error)
		}
	}

	const copyPublicLink = async () => {
		const link = generatePublicLink()
		try {
			await navigator.clipboard.writeText(link)
			toast.success('Link copied to clipboard!')
		} catch (error) {
			console.error('Failed to copy link:', error)
		}
	}

	// Transform data for CardMarket component
	const getBibSaleForPreview = (): BibSale | null => {
		if (!formData.selectedEvent) return null

		// Get organizer logo URL or fallback to default image
		const organizerLogoUrl = formData.selectedEvent.expand?.organizer
			? getOrganizerImageUrl(formData.selectedEvent.expand.organizer)
			: null

		return {
			user: {
				lastName: user.lastName ?? '',
				id: user.id,
				firstName: user.firstName ?? 'Anonymous',
			},
			status: 'available' as const,
			price: parseFloat(formData.sellingPrice) ?? 0,
			originalPrice: formData.originalPrice
				? parseFloat(formData.originalPrice)
				: parseFloat(formData.sellingPrice) + 10,
			lockedAt: null,
			id: createdBib?.id ?? 'preview',
			event: {
				type: mapEventTypeToBibSaleType(formData.selectedEvent.typeCourse),
				participantCount: formData.selectedEvent.participants ?? 0,
				name: formData.selectedEvent.name,
				location: formData.selectedEvent.location,
				image: organizerLogoUrl ?? '/landing/background.jpg', // Use organizer logo or fallback
				id: formData.selectedEvent.id,
				distanceUnit: 'km' as const,
				distance: formData.selectedEvent.distanceKm ?? 0,
				date: new Date(formData.selectedEvent.eventDate),
			},
		}
	}

	const bibSalePreview = getBibSaleForPreview()

	return (
		<div className="space-y-8">
			{/* Success Message - Only after creation */}
			{createdBib != null && createdBib !== undefined && (
				<div className="space-y-6">
					<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
						<CardContent className="p-6">
							<div className="flex items-center space-x-4">
								<div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
									<CheckCircle className="h-6 w-6" />
								</div>
								<div className="flex-1">
									<h3 className="text-foreground text-lg font-semibold">{t.form.confirmation.successTitle}</h3>
									<p className="text-muted-foreground text-sm">{t.form.confirmation.successMessage}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Link sharing section */}
					<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
						<CardContent className="space-y-4 p-6">
							<div className="space-y-2">
								<Label className="text-foreground text-base font-medium">
									{formData.listingType === 'private'
										? t.form.confirmation.privateLink
										: t.form.confirmation.publicLink}
								</Label>
								<p className="text-muted-foreground text-sm">
									{formData.listingType === 'private'
										? t.form.confirmation.privateLinkMessage
										: t.form.confirmation.publicLinkMessage}
								</p>
							</div>
							<div className="flex gap-2">
								<Input
									className="flex-1"
									readOnly
									value={formData.listingType === 'private' ? generatePrivateLink() : generatePublicLink()}
								/>
								<Button
									onClick={() => void (formData.listingType === 'private' ? copyPrivateLink() : copyPublicLink())}
									size="sm"
									variant="outline"
								>
									<Copy className="h-4 w-4" />
								</Button>
								<Button asChild size="sm" variant="outline">
									<Link
										href={formData.listingType === 'private' ? generatePrivateLink() : generatePublicLink()}
										rel="noopener noreferrer"
										target="_blank"
									>
										<ExternalLink className="h-4 w-4" />
									</Link>
								</Button>
							</div>
							<p className="text-muted-foreground text-sm">
								{formData.listingType === 'private'
									? t.form.confirmation.privateLinkHelp
									: t.form.confirmation.publicLinkHelp}
							</p>
						</CardContent>
					</Card>
				</div>
			)}

			<div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
				{/* Left Column - Summary */}
				<div>
					<h2 className="text-foreground mb-6 text-2xl font-semibold">
						{createdBib != null && createdBib !== undefined
							? t.form.confirmation.successTitle
							: t.form.confirmation.reviewTitle}
					</h2>

					<Card className="dark:border-border/50 bg-card/80 mb-8 border-black/50 backdrop-blur-sm">
						<CardContent className="space-y-6 p-6">
							<div className="grid grid-cols-1 gap-6">
								<div className="space-y-2">
									<Label className="text-muted-foreground text-sm font-medium">{t.form.confirmation.event}</Label>
									<p className="text-foreground font-semibold">{formData.selectedEvent?.name}</p>
								</div>
								<div className="space-y-2">
									<Label className="text-muted-foreground text-sm font-medium">{t.form.confirmation.bibNumber}</Label>
									<p className="text-foreground font-semibold">{formData.registrationNumber}</p>
								</div>
								{formData.originalPrice != null &&
									formData.originalPrice !== undefined &&
									formData.originalPrice !== '' && (
										<div className="space-y-2">
											<Label className="text-muted-foreground text-sm font-medium">
												{t.form.confirmation.originalPrice}
											</Label>
											<p className="text-foreground font-semibold">
												{t.form.pricing.currency}
												{parseFloat(formData.originalPrice).toFixed(2)}
											</p>
										</div>
									)}
								<div className="space-y-2">
									<Label className="text-muted-foreground text-sm font-medium">{t.form.pricing.sellingPrice}</Label>
									<p className="text-primary text-lg font-semibold">
										{t.form.pricing.currency}
										{parseFloat(formData.sellingPrice).toFixed(2)}
									</p>
								</div>
								<div className="space-y-2">
									<Label className="text-muted-foreground text-sm font-medium">{t.form.pricing.listingType}</Label>
									<p className="text-foreground font-semibold">
										{formData.listingType === 'public' ? t.form.confirmation.public : t.form.confirmation.private}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Terms */}
					<div className="bg-card/50 dark:border-border/50 space-y-4 rounded-lg border border-black/50 p-4">
						<div className="flex items-start space-x-3">
							<Checkbox
								checked={formData.acceptedTerms}
								id="terms"
								onCheckedChange={checked => onChange({ acceptedTerms: checked === true })}
							/>
							<Label className="text-foreground text-sm leading-relaxed" htmlFor="terms">
								{t.form.confirmation.terms}
							</Label>
						</div>
						{errors.acceptedTerms && <p className="text-sm text-red-600 dark:text-red-400">{errors.acceptedTerms}</p>}
					</div>

					{errors.submit && (
						<div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
							<p className="text-sm font-medium text-red-700 dark:text-red-400">{errors.submit}</p>
						</div>
					)}
				</div>

				{/* Right Column - Preview */}
				<div>
					<h3 className="text-foreground mb-6 text-xl font-semibold">{t.form.confirmation.marketplacePreview}</h3>
					<div className="pointer-events-none flex justify-center">
						{bibSalePreview != null && bibSalePreview !== undefined && (
							<CardMarket bibSale={bibSalePreview} locale={locale} />
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
