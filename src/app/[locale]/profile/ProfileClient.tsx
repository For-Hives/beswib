'use client'

import { LogOut } from 'lucide-react'

import { useClerk } from '@clerk/nextjs'

import type { User } from '@/models/user.model'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import profileTranslations from '@/app/[locale]/profile/locales.json'
import PayPalOnboarding from '@/components/profile/PayPalOnboarding'
import ModernRunnerForm from '@/components/profile/modernRunnerForm'
import UserHeader from '@/components/dashboard/user-header'
import { getTranslations } from '@/lib/getDictionary'
import { Button } from '@/components/ui/button'
import { Locale } from '@/lib/i18n-config'

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

	if (!user) {
		return null
	}

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
			<UserHeader clerkUser={clerkUser} user={user} locale={locale} />

			<div className="relative pt-48 pb-12">
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
									<CardTitle className="text-destructive">{t.profile?.dangerZone?.title ?? 'Danger Zone'}</CardTitle>
									<CardDescription className="text-muted-foreground">
										{t.profile?.dangerZone?.description ?? 'Sign out from your account. You can sign back in anytime.'}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button variant="destructive" onClick={() => void signOut({ redirectUrl: '/' })} className="w-full">
										<LogOut className="h-4 w-4" />
										<span>{t.profile?.dangerZone?.signOut ?? 'Disconnect'}</span>
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
