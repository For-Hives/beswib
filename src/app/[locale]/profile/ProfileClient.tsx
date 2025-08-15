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
					<div className="mb-12 space-y-2 text-center">
						<h1 className="text-foreground text-4xl font-bold tracking-tight">{t.profile.title}</h1>
						<p className="text-muted-foreground text-lg">{t.profile.description}</p>
					</div>

					<div className="grid gap-8 lg:grid-cols-3">
						<div className="lg:col-span-2">
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
										<p className="text-muted-foreground text-sm">Please complete your profile first.</p>
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
											<p className="text-muted-foreground text-sm">
												This action will redirect you to our contact form where you can submit a deletion request. Our
												support team will process your request and confirm when your account has been permanently
												deleted.
											</p>
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
