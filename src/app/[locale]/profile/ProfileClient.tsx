'use client'

import { LogOut, Trash2, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

import { useClerk } from '@clerk/nextjs'

import type { User } from '@/models/user.model'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import profileTranslations from '@/app/[locale]/profile/locales.json'
import PayPalOnboarding from '@/components/profile/PayPalOnboarding'
import ModernRunnerForm from '@/components/profile/modernRunnerForm'
import UserHeader from '@/components/dashboard/user-header'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Locale } from '@/lib/i18n/config'

interface ProfileClientProps {
	clerkUser: SerializedClerkUser
	locale: Locale
	user: null | User
}

interface SerializedClerkUser {
	emailAddresses: { emailAddress: string; id: string }[]
	firstName: null | string
	id: string
	imageUrl: string
	lastName: null | string
	username: null | string
}

interface ProfileCompletionChecklistProps {
	user: User
	locale: Locale
}

function ProfileCompletionChecklist({ user, locale }: ProfileCompletionChecklistProps) {
	const t = getTranslations(locale, profileTranslations)

	// Tâches obligatoires
	const requiredTasks = [
		{
			label: t.profile?.completion?.basicInfo?.title ?? 'Informations de base',
			id: 'basic-info',
			description: t.profile?.completion?.basicInfo?.description ?? 'Nom, prénom et email',
			completed: Boolean(
				user.firstName !== null &&
					user.firstName.length > 0 &&
					user.lastName !== null &&
					user.lastName.length > 0 &&
					user.email !== null &&
					user.email.length > 0
			),
		},
		{
			label: t.profile?.completion?.contactInfo?.title ?? 'Informations de contact',
			id: 'contact-info',
			description: t.profile?.completion?.contactInfo?.description ?? 'Téléphone et adresse',
			completed: Boolean(
				user.phoneNumber !== null &&
					user.phoneNumber.length > 0 &&
					user.address !== null &&
					user.address.length > 0 &&
					user.postalCode !== null &&
					user.postalCode.length > 0 &&
					user.city !== null &&
					user.city.length > 0 &&
					user.country !== null &&
					user.country.length > 0
			),
		},
		{
			label: t.profile?.completion?.runnerProfile?.title ?? 'Profil runner',
			id: 'runner-profile',
			description: t.profile?.completion?.runnerProfile?.description ?? 'Informations sportives',
			completed: Boolean(user.birthDate !== null && user.birthDate.toString().length > 0 && user.gender !== null),
		},
	]

	// Tâches optionnelles
	const optionalTasks = [
		{
			label: t.profile?.completion?.emergencyContact?.title ?? "Contact d'urgence",
			id: 'emergency-contact',
			description: t.profile?.completion?.emergencyContact?.description ?? "Contact en cas d'urgence",
			completed: Boolean(
				user.emergencyContactName !== null &&
					user.emergencyContactName.length > 0 &&
					user.emergencyContactPhone !== null &&
					user.emergencyContactPhone.length > 0 &&
					user.emergencyContactRelationship !== null &&
					user.emergencyContactRelationship.length > 0
			),
		},
		{
			label: t.profile?.completion?.medicalInfo?.title ?? 'Informations médicales',
			id: 'medical-info',
			description: t.profile?.completion?.medicalInfo?.description ?? 'Certificat médical et licence',
			completed: Boolean(
				user.medicalCertificateUrl !== null &&
					user.medicalCertificateUrl.length > 0 &&
					user.licenseNumber !== null &&
					user.licenseNumber.length > 0
			),
		},
		{
			label: t.profile?.completion?.paypalSetup?.title ?? 'Configuration PayPal',
			id: 'paypal-setup',
			description: t.profile?.completion?.paypalSetup?.description ?? 'Pour recevoir des paiements',
			completed: user.paypal_kyc === true,
		},
	]

	const completedRequiredTasks = requiredTasks.filter(task => task.completed).length
	const completedOptionalTasks = optionalTasks.filter(task => task.completed).length
	const totalRequiredTasks = requiredTasks.length
	const totalOptionalTasks = optionalTasks.length

	const requiredCompletionPercentage = Math.round((completedRequiredTasks / totalRequiredTasks) * 100)

	return (
		<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							{t.profile?.completion?.title ?? 'Complétez votre profil'}
						</CardTitle>
						<CardDescription>
							{t.profile?.completion?.description ?? 'Remplissez ces informations pour optimiser votre expérience'}
						</CardDescription>
					</div>
					<div className="flex flex-col items-center gap-1">
						<div className="text-muted-foreground text-sm font-medium">
							{t.profile?.completion?.required ?? 'Obligatoire'}
						</div>
						<div className="flex items-center gap-2">
							<div className="text-primary text-lg font-bold">{requiredCompletionPercentage}%</div>
							<Progress value={requiredCompletionPercentage} className="h-2 w-12" />
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Message de félicitations si tout est complet */}
				{requiredTasks.every(task => task.completed) && optionalTasks.every(task => task.completed) && (
					<div className="py-8 text-center">
						<div className="mb-2 text-4xl text-green-600 dark:text-green-400">✓</div>
						<div className="text-foreground mb-1 text-lg font-medium">
							{t.profile?.completion?.congratulations ?? 'Profil complet !'}
						</div>
						<div className="text-muted-foreground text-sm">
							{t.profile?.completion?.allComplete ?? 'Toutes vos informations sont à jour.'}
						</div>
					</div>
				)}

				{/* Section Obligatoire - seulement si des tâches sont incomplètes */}
				{requiredTasks.some(task => !task.completed) && (
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<div className="h-1 w-1 rounded-full bg-red-500"></div>
							<span className="text-foreground text-sm font-medium">
								{t.profile?.completion?.required ?? 'Obligatoire'}
							</span>
							<span className="text-muted-foreground text-xs">
								{completedRequiredTasks}/{totalRequiredTasks}
							</span>
						</div>
						<div className="ml-3 space-y-2">
							{requiredTasks
								.filter(task => !task.completed)
								.map(task => (
									<div key={task.id} className="flex items-start space-x-3">
										<Checkbox checked={task.completed} disabled className="mt-0.5" />
										<div className="flex-1">
											<div className="text-foreground text-sm font-medium">{task.label}</div>
											<div className="text-muted-foreground text-xs">{task.description}</div>
										</div>
									</div>
								))}
						</div>
					</div>
				)}

				{/* Section Optionnelle - seulement si des tâches sont incomplètes */}
				{optionalTasks.some(task => !task.completed) && (
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<div className="h-1 w-1 rounded-full bg-blue-500"></div>
							<span className="text-foreground text-sm font-medium">
								{t.profile?.completion?.optional ?? 'Optionnel'}
							</span>
							<span className="text-muted-foreground text-xs">
								{completedOptionalTasks}/{totalOptionalTasks}
							</span>
						</div>
						<div className="ml-3 space-y-2">
							{optionalTasks
								.filter(task => !task.completed)
								.map(task => (
									<div key={task.id} className="flex items-start space-x-3">
										<Checkbox checked={task.completed} disabled className="mt-0.5" />
										<div className="flex-1">
											<div className="text-foreground text-sm font-medium">{task.label}</div>
											<div className="text-muted-foreground text-xs">{task.description}</div>
										</div>
									</div>
								))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default function ProfileClient({ user, locale, clerkUser }: ProfileClientProps) {
	const t = getTranslations(locale, profileTranslations)
	const { signOut } = useClerk()
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)

	const handleDeleteAccount = () => {
		// Create the deletion request message template
		const deleteRequestTemplate = encodeURIComponent(`Hello Beswib Support,

I would like to request the complete deletion of my account and all associated data from your platform.

Account details:
- Email: ${clerkUser.emailAddresses[0]?.emailAddress || 'N/A'}
- User ID: ${clerkUser.id}
- Name: ${clerkUser.firstName} ${clerkUser.lastName}

I understand that this action is irreversible and will permanently remove:
- My profile and account information
- All listing history 
- Payment information
- Any other personal data associated with my account

Please confirm the deletion process and let me know when it has been completed.

Thank you,
${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`)

		// Redirect to contact page with pre-filled form
		const contactUrl = `/${locale}/contact?name=${encodeURIComponent(`${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim())}&email=${encodeURIComponent(clerkUser.emailAddresses[0]?.emailAddress ?? '')}&message=${deleteRequestTemplate}`

		window.location.href = contactUrl
	}

	if (!user) {
		return null
	}

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
			<UserHeader clerkUser={clerkUser} user={user} locale={locale} />

			<div className="relative pb-12 md:pt-12">
				<div className="container mx-auto max-w-6xl p-6">
					<div className="mb-8 space-y-2 text-center">
						<h1 className="text-foreground text-4xl font-bold tracking-tight">{t.profile.title}</h1>
						<p className="text-muted-foreground text-lg">{t.profile.description}</p>
					</div>

					{/* Profile Completion Checklist */}
					<div className="mb-8">
						<ProfileCompletionChecklist user={user} locale={locale} />
					</div>

					<div className="grid gap-8 lg:grid-cols-3">
						<div className="space-y-8 lg:col-span-2">
							<ModernRunnerForm user={user} locale={locale} />
						</div>
						<div>
							<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
								<CardHeader>
									<CardTitle>{t.profile.sellerInfo.title}</CardTitle>
									<CardDescription>{t.profile.sellerInfo.description}</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{user != null ? (
										<PayPalOnboarding locale={locale} userId={user.id} />
									) : (
										<p className="text-muted-foreground text-sm">{t.profile.sellerInfo.completeProfileFirst}</p>
									)}
								</CardContent>
							</Card>

							{/* Danger Zone */}
							<Card className="border-destructive/40 bg-destructive/5 mt-8">
								<CardHeader>
									<CardTitle className="text-destructive flex items-center gap-2">
										<AlertTriangle className="h-5 w-5" />
										{t.profile?.dangerZone?.title ?? 'Danger Zone'}
									</CardTitle>
									<CardDescription className="text-muted-foreground">
										{t.profile?.dangerZone?.description ??
											'Sign out from your account or permanently delete your data.'}
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									<Button variant="outline" onClick={() => void signOut({ redirectUrl: '/' })} className="w-full">
										<LogOut className="h-4 w-4" />
										<span>{t.profile?.dangerZone?.signOut ?? 'Sign Out'}</span>
									</Button>

									<div className="border-destructive/20 border-t pt-2">
										<p className="text-muted-foreground mb-3 text-sm">
											{t.profile?.dangerZone?.deleteDescription ??
												'Permanently delete your account and all associated data. This action cannot be undone.'}
										</p>
										<Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="w-full">
											<Trash2 className="h-4 w-4" />
											<span>{t.profile?.dangerZone?.deleteAccount ?? 'Delete Account'}</span>
										</Button>
									</div>
								</CardContent>
							</Card>

							{/* Delete Account Dialog */}
							<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
								<DialogContent className="sm:max-w-[425px]">
									<DialogHeader>
										<DialogTitle className="text-destructive flex items-center gap-2">
											<AlertTriangle className="h-5 w-5" />
											{t.profile?.dangerZone?.deleteAccount ?? 'Delete Account'}
										</DialogTitle>
										<DialogDescription>
											{t.profile?.dangerZone?.deleteWarning ?? 'This will delete your account forever. Are you sure?'}
										</DialogDescription>
									</DialogHeader>
									<div className="py-4">
										<div className="bg-destructive/10 border-destructive/20 rounded-lg border p-4">
											<p className="text-muted-foreground text-sm">{t.profile.dangerZone.deleteDialogDescription}</p>
										</div>
									</div>
									<DialogFooter>
										<Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
											{t.profile?.dangerZone?.cancelDelete ?? 'Cancel'}
										</Button>
										<Button variant="destructive" onClick={handleDeleteAccount}>
											<Trash2 className="mr-2 h-4 w-4" />
											{t.profile?.dangerZone?.confirmDelete ?? 'Yes, delete my account'}
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
