'use client'

import {
	ArrowLeft,
	Calendar,
	MapPin,
	Edit3,
	Eye,
	EyeOff,
	Trash2,
	Save,
	Tag,
	DollarSign,
	Hash,
	AlertTriangle,
	Copy,
	RefreshCw,
	Link as LinkIcon,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

import type { Event } from '@/models/event.model'
import type { Bib } from '@/models/bib.model'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateObjectForDisplay } from '@/lib/utils/date'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/inputAlt'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Locale } from '@/lib/i18n/config'

import {
	handleToggleListingStatus,
	handleUpdateBibDetails,
	handleWithdrawBib,
	handleRegeneratePrivateToken,
} from './actions'
import editBibTranslations from './locales.json'

interface EditBibClientProps {
	bibId: string
	initialBibWithEvent: (Bib & { expand?: { eventId?: Event } }) | null
	initialError?: null | string
	locale: Locale
}

// Status display mapping
const getStatusDisplay = (status: string, locale: Locale) => {
	const t = getTranslations(locale, editBibTranslations)

	switch (status) {
		case 'available':
			return {
				variant: 'secondary' as const,
				label: t.bibStatus.available ?? 'Available',
				color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
			}
		case 'expired':
			return {
				variant: 'secondary' as const,
				label: t.bibStatus.expired ?? 'Expired',
				color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
			}
		case 'sold':
			return {
				variant: 'secondary' as const,
				label: t.bibStatus.sold ?? 'Sold',
				color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
			}
		case 'validation_failed':
			return {
				variant: 'destructive' as const,
				label: t.bibStatus.validationFailed ?? 'Validation Failed',
				color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
			}
		case 'withdrawn':
			return {
				variant: 'secondary' as const,
				label: t.bibStatus.withdrawn ?? 'Withdrawn',
				color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
			}
		default:
			return {
				variant: 'secondary' as const,
				label: status,
				color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
			}
	}
}

export default function EditBibClient({ locale, initialError, initialBibWithEvent, bibId }: EditBibClientProps) {
	const t = getTranslations(locale, editBibTranslations)

	const router = useRouter()
	const [bib, setBib] = useState<(Bib & { expand?: { eventId?: Event } }) | null>(initialBibWithEvent)
	const [isLoading, setIsLoading] = useState(false)
	const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)

	useEffect(() => {
		if (initialError != null) {
			toast.error(initialError)
		}
	}, [initialError])

	function handleUpdateDetailsAction(formData: FormData) {
		setIsLoading(true)

		handleUpdateBibDetails(bibId, formData)
			.then(updatedBib => {
				toast.success(t.successMessages.detailsUpdated ?? 'Details updated successfully!')
				const newEventId = updatedBib.eventId

				const nextState: Bib & { expand?: { eventId?: Event } } = {
					...updatedBib,
					expand: bib?.expand,
					eventId: newEventId,
				}
				setBib(nextState)
				setIsLoading(false)
			})
			.catch((error: unknown) => {
				toast.error(error instanceof Error ? error.message : String(error))
				setIsLoading(false)
			})
	}

	function handleToggleListingStatusAction(newListed: 'private' | 'public') {
		setIsLoading(true)

		handleToggleListingStatus(bibId, newListed)
			.then(updatedBib => {
				toast.success(t.successMessages?.statusUpdated ?? 'Listing status updated successfully!')
				const newEventId = updatedBib.eventId
				const nextState: Bib & { expand?: { eventId?: Event } } = {
					...updatedBib,
					expand: bib?.expand,
					eventId: newEventId,
				}
				setBib(nextState)
				setIsLoading(false)
			})
			.catch((error: unknown) => {
				toast.error(error instanceof Error ? error.message : String(error))
				setIsLoading(false)
			})
	}

	function handleWithdrawAction() {
		setIsLoading(true)
		handleWithdrawBib(bibId)
			.then(() => {
				toast.success(t.successMessages?.bibWithdrawn ?? 'Bib withdrawn successfully!')
				router.push('/dashboard/seller?success=Bib+listing+withdrawn')
			})
			.catch((error: unknown) => {
				toast.error(error instanceof Error ? error.message : String(error))
				setIsLoading(false)
			})
	}

	function handleRegenerateTokenAction() {
		setIsLoading(true)
		handleRegeneratePrivateToken(bibId)
			.then(updatedBib => {
				toast.success(t.successMessages?.tokenRegenerated ?? 'New private token generated successfully!')
				const newEventId = updatedBib.eventId
				const nextState: Bib & { expand?: { eventId?: Event } } = {
					...updatedBib,
					expand: bib?.expand,
					eventId: newEventId,
				}
				setBib(nextState)
				setIsLoading(false)
				setShowRegenerateDialog(false)
			})
			.catch((error: unknown) => {
				toast.error(error instanceof Error ? error.message : String(error))
				setIsLoading(false)
				setShowRegenerateDialog(false)
			})
	}

	const generatePrivateLink = () => {
		if (
			bib?.privateListingToken === undefined ||
			bib?.id === undefined ||
			bib.privateListingToken === '' ||
			bib.id === ''
		)
			return ''
		const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
		const currentLocale = locale || 'fr'
		return `${baseUrl}/${currentLocale}/marketplace/${bib.id}?tkn=${bib.privateListingToken}`
	}

	const copyToClipboard = async (text: string, successMessage: string) => {
		try {
			await navigator.clipboard.writeText(text)
			toast.success(successMessage)
		} catch (error) {
			console.error('Failed to copy to clipboard:', error)
			toast.error('Failed to copy to clipboard')
		}
	}

	const copyToken = () => {
		if (bib?.privateListingToken !== undefined && bib.privateListingToken !== '') {
			copyToClipboard(bib.privateListingToken, t.privateTokenCopySuccess ?? 'Token copied to clipboard!').catch(
				error => {
					console.error('Failed to copy to clipboard:', error)
					toast.error('Failed to copy to clipboard')
				}
			)
		}
	}

	const copyPrivateLink = () => {
		const link = generatePrivateLink()
		if (link && link !== '') {
			copyToClipboard(link, t.privateLinkCopySuccess ?? 'Private link copied to clipboard!').catch(error => {
				console.error('Failed to copy to clipboard:', error)
				toast.error('Failed to copy to clipboard')
			})
		}
	}

	if (bib == null && initialError == null) {
		return (
			<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
						<CardContent className="p-8 text-center">
							<AlertTriangle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
							<p className="text-lg">{t.bibNotFound ?? 'Bib not found.'}</p>
							<Link href={`/${locale}/dashboard/seller`}>
								<Button className="mt-4" variant="outline">
									<ArrowLeft className="mr-2 h-4 w-4" />
									{t.backToDashboard ?? 'Back to Dashboard'}
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	if (initialError != null && bib == null) {
		return (
			<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
						<CardContent className="p-8 text-center">
							<AlertTriangle className="text-destructive mx-auto mb-4 h-12 w-12" />
							<p className="text-destructive mb-4 text-lg">{initialError}</p>
							<Link href={`/${locale}/dashboard/seller`}>
								<Button variant="outline">
									<ArrowLeft className="mr-2 h-4 w-4" />
									{t.backToDashboard ?? 'Back to Dashboard'}
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	if (bib == null) {
		return (
			<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
						<CardContent className="p-8 text-center">
							<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
							<p className="text-lg">Loading bib details...</p>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	const statusDisplay = getStatusDisplay(bib.status, locale)
	const eventName = bib.expand?.eventId?.name ?? 'N/A'
	const eventDate =
		bib.expand?.eventId?.eventDate != null
			? formatDateObjectForDisplay(new Date(bib.expand.eventId.eventDate), locale)
			: 'N/A'
	const eventLocation = bib.expand?.eventId?.location ?? 'N/A'

	const isEditDisabled = bib.status === 'sold' || bib.status === 'expired' || bib.status === 'withdrawn'
	const canEdit = !isEditDisabled

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

			{/* Back Navigation */}
			<div className="bg-card/25 border-border/30 absolute top-0 right-0 left-0 z-20 mx-4 mt-12 mb-6 rounded-2xl border p-4 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link href={`/${locale}/dashboard/seller`}>
							<Button variant="ghost" size="sm">
								<ArrowLeft className="mr-2 h-4 w-4" />
								{t.backToDashboard ?? 'Back to Dashboard'}
							</Button>
						</Link>
						<Separator orientation="vertical" className="h-6" />
						<div>
							<p className="text-muted-foreground text-sm">{t.title ?? 'Edit Bib Listing'}</p>
							<p className="text-foreground flex items-center gap-2 font-medium">
								<Tag className="h-4 w-4" />
								{t.registrationNumber ?? 'Registration'}: {bib.registrationNumber}
							</p>
						</div>
					</div>
					<Badge className={statusDisplay.color}>{statusDisplay.label}</Badge>
				</div>
			</div>

			<div className="relative pt-32 pb-12">
				<div className="container mx-auto max-w-4xl p-6">
					{/* Header */}
					<div className="mb-8 space-y-2 text-center">
						<h1 className="text-foreground text-4xl font-bold tracking-tight">{t.title ?? 'Edit Bib Listing'}</h1>
						<p className="text-muted-foreground text-lg">
							{t.subtitle ?? 'Manage your race bib listing details and settings'}
						</p>
					</div>

					{/* Event Information */}
					<Card className="dark:border-border/50 bg-card/80 mb-8 border-black/50 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5" />
								{t.eventDetails ?? 'Event Details'}
							</CardTitle>
							<CardDescription>{t.eventDescription ?? 'Information about the race event'}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
								<div className="space-y-2">
									<Label className="text-muted-foreground text-sm font-medium">{t.eventName ?? 'Event Name'}</Label>
									<p className="font-semibold">{eventName}</p>
								</div>
								<div className="space-y-2">
									<Label className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
										<Calendar className="h-4 w-4" />
										{t.eventDate ?? 'Event Date'}
									</Label>
									<p className="font-semibold">{eventDate}</p>
								</div>
								<div className="space-y-2">
									<Label className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
										<MapPin className="h-4 w-4" />
										{t.eventLocation ?? 'Location'}
									</Label>
									<p className="font-semibold">{eventLocation}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
						{/* Bib Details Form */}
						<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Edit3 className="h-5 w-5" />
									{t.bibDetails ?? 'Bib Details'}
								</CardTitle>
								<CardDescription>{t.bibDetailsDescription ?? 'Update your bib listing information'}</CardDescription>
							</CardHeader>
							<CardContent>
								<form action={handleUpdateDetailsAction} className="space-y-6">
									<div className="space-y-2">
										<Label htmlFor="registrationNumber" className="text-muted-foreground flex items-center gap-2">
											<Hash className="h-4 w-4" />
											{t.registrationNumber ?? 'Registration Number'}
										</Label>

										<Input
											id="registrationNumber"
											name="registrationNumber"
											defaultValue={bib.registrationNumber}
											disabled
											readOnly
											required
											placeholder="Enter registration number"
											className="bg-muted/50 cursor-not-allowed opacity-75"
										/>
										<p className="text-muted-foreground text-xs">
											{t.registrationNumberReadonly ?? 'Registration number cannot be modified'}
										</p>
									</div>

									<div className="space-y-2">
										<Label htmlFor="price" className="flex items-center gap-2">
											<DollarSign className="h-4 w-4" />
											{t.price ?? 'Price'} (€)
										</Label>
										<Input
											id="price"
											name="price"
											type="number"
											step="0.01"
											min="0.01"
											defaultValue={bib.price}
											disabled={isLoading || isEditDisabled}
											required
											placeholder="0.00"
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="originalPrice" className="flex items-center gap-2">
											<Tag className="h-4 w-4" />
											{t.originalPrice ?? 'Original Price'} (€)
										</Label>
										<Input
											id="originalPrice"
											name="originalPrice"
											type="number"
											step="0.01"
											min="0"
											defaultValue={bib.originalPrice ?? ''}
											disabled={isLoading || isEditDisabled}
											placeholder="0.00"
										/>
									</div>

									<Button type="submit" disabled={isLoading || isEditDisabled} className="w-full">
										{isLoading ? (
											<>
												<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
												{t.updating ?? 'Updating...'}
											</>
										) : (
											<>
												<Save className="mr-2 h-4 w-4" />
												{t.updateDetails ?? 'Update Details'}
											</>
										)}
									</Button>
								</form>
							</CardContent>
						</Card>

						{/* Listing Management */}
						{canEdit && (
							<div className="space-y-8">
								{/* Listing Status */}
								<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											{bib.listed === 'public' ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
											{t.listingStatus ?? 'Listing Status'}
										</CardTitle>
										<CardDescription>
											{t.listingStatusDescription ?? 'Control who can see your bib listing'}
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-6">
										<div className="flex items-center justify-between">
											<span className="font-medium">{t.currentVisibility ?? 'Current Visibility'}:</span>
											<Badge variant={bib.listed === 'public' ? 'default' : 'secondary'}>
												{bib.listed === 'public' ? (
													<>
														<Eye className="mr-1 h-3 w-3" /> {t.public ?? 'Public'}
													</>
												) : (
													<>
														<EyeOff className="mr-1 h-3 w-3" /> {t.private ?? 'Private'}
													</>
												)}
											</Badge>
										</div>

										{/* Display private token information when in private mode */}
										{bib.listed === 'private' && (
											<div className="bg-muted/50 space-y-4 rounded-lg p-4">
												<div className="space-y-2">
													<Label className="text-sm font-medium">
														{t.privateTokenDisplay ?? 'Current Private Token'}
													</Label>
													<div className="flex items-center gap-2">
														<Input
															value={bib.privateListingToken}
															readOnly
															className="bg-background font-mono text-sm"
														/>
														<Button type="button" variant="outline" size="sm" onClick={copyToken} disabled={isLoading}>
															<Copy className="h-4 w-4" />
														</Button>
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={() => setShowRegenerateDialog(true)}
															disabled={isLoading}
														>
															<RefreshCw className="h-4 w-4" />
														</Button>
													</div>
													<p className="text-muted-foreground text-xs">
														{t.privateTokenHelperText ??
															'Share this token with specific buyers to give them access to your private listing.'}
													</p>
												</div>

												<div className="space-y-2">
													<Label className="text-sm font-medium">{t.privateLink ?? 'Private Link'}</Label>
													<div className="flex items-center gap-2">
														<Input value={generatePrivateLink()} readOnly className="bg-background text-sm" />
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={copyPrivateLink}
															disabled={isLoading}
														>
															<LinkIcon className="h-4 w-4" />
														</Button>
													</div>
												</div>
											</div>
										)}

										{bib.listed === 'public' || bib.listed === 'private' ? (
											<form
												action={() => handleToggleListingStatusAction(bib.listed === 'public' ? 'private' : 'public')}
												className="space-y-4"
											>
												<Button type="submit" disabled={isLoading} variant="outline" className="w-full">
													{bib.listed === 'public' ? (
														<>
															<EyeOff className="mr-2 h-4 w-4" /> {t.makePrivate ?? 'Make Private'}
														</>
													) : (
														<>
															<Eye className="mr-2 h-4 w-4" /> {t.makePublic ?? 'Make Public'}
														</>
													)}
												</Button>
											</form>
										) : (
											<div className="grid grid-cols-2 gap-4">
												<form action={() => handleToggleListingStatusAction('public')}>
													<Button type="submit" disabled={isLoading} className="w-full">
														<Eye className="mr-2 h-4 w-4" />
														{t.makePublic ?? 'Make Public'}
													</Button>
												</form>
												<form action={() => handleToggleListingStatusAction('private')}>
													<Button type="submit" disabled={isLoading} variant="outline" className="w-full">
														<EyeOff className="mr-2 h-4 w-4" />
														{t.makePrivate ?? 'Make Private'}
													</Button>
												</form>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Withdraw Listing */}
								<Card className="bg-card/80 border-red-200 backdrop-blur-sm dark:border-red-900/50">
									<CardHeader>
										<CardTitle className="text-destructive flex items-center gap-2">
											<Trash2 className="h-5 w-5" />
											{t.withdrawListing ?? 'Withdraw Listing'}
										</CardTitle>
										<CardDescription>
											{t.withdrawDescription ?? 'Permanently remove this bib from the marketplace'}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<div className="bg-destructive/10 border-destructive/20 rounded-lg border p-4">
												<p className="text-destructive text-sm">
													{t.withdrawWarning ??
														'Warning: This action cannot be undone. Your bib will be removed from the marketplace and buyers will no longer be able to purchase it.'}
												</p>
											</div>
											<Button
												onClick={handleWithdrawAction}
												disabled={isLoading}
												variant="destructive"
												className="w-full"
											>
												{isLoading ? (
													<>
														<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
														{t.withdrawing ?? 'Withdrawing...'}
													</>
												) : (
													<>
														<Trash2 className="mr-2 h-4 w-4" />
														{t.confirmWithdraw ?? 'Confirm Withdraw'}
													</>
												)}
											</Button>
										</div>
									</CardContent>
								</Card>
							</div>
						)}

						{/* Status Information for Non-Editable Bibs */}
						{!canEdit && (
							<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<AlertTriangle className="h-5 w-5" />
										{t.statusInformation ?? 'Status Information'}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<span className="font-medium">{t.currentStatus ?? 'Current Status'}:</span>
											<Badge className={statusDisplay.color}>{statusDisplay.label}</Badge>
										</div>
										<p className="text-muted-foreground text-sm">
											{bib.status === 'sold' &&
												(t.soldDescription ?? 'This bib has been successfully sold and cannot be edited.')}
											{bib.status === 'expired' &&
												(t.expiredDescription ?? 'This bib listing has expired and cannot be edited.')}
											{bib.status === 'withdrawn' &&
												(t.withdrawnDescription ?? 'This bib has been withdrawn from the marketplace.')}
										</p>
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>

			{/* Regenerate Token Confirmation Dialog */}
			<Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<div className="mb-4 flex items-center gap-3">
							<div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
								<RefreshCw className="h-6 w-6 text-orange-600 dark:text-orange-400" />
							</div>
							<DialogTitle className="text-orange-600 dark:text-orange-400">
								{t.regenerateTokenDialog.title ?? 'Regenerate Private Token'}
							</DialogTitle>
						</div>
					</DialogHeader>
					<div className="space-y-4">
						<p className="text-muted-foreground">
							{t.regenerateTokenDialog.description ??
								'This action will generate a new private token and invalidate the current one.'}
						</p>
						<div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800/50 dark:bg-orange-900/20">
							<p className="text-sm text-orange-800 dark:text-orange-200">
								<AlertTriangle className="mr-2 inline h-4 w-4" />
								{t.regenerateTokenDialog.warning ?? 'Any existing private links will stop working immediately.'}
							</p>
						</div>
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setShowRegenerateDialog(false)} disabled={isLoading}>
							{t.regenerateTokenDialog.cancel ?? 'Cancel'}
						</Button>
						<Button
							onClick={handleRegenerateTokenAction}
							disabled={isLoading}
							className="bg-orange-600 hover:bg-orange-700"
						>
							{isLoading ? (
								<>
									<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
									Generating...
								</>
							) : (
								<>
									<RefreshCw className="mr-2 h-4 w-4" />
									{t.regenerateTokenDialog.confirm ?? 'Yes, regenerate token'}
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
