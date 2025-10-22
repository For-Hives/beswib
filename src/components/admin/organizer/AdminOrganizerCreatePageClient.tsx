'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import organizerCreateTranslations from '@/app/[locale]/admin/organizer/create/locales.json'
import organizerCommonTranslations from '@/app/[locale]/admin/organizer/locales.json'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import type { Organizer } from '@/models/organizer.model'
import type { User } from '@/models/user.model'

import OrganizerCreationForm from './OrganizerCreationForm'

interface AdminOrganizerCreatePageClientProps {
	currentUser: null | User
	locale: Locale
}

export default function AdminOrganizerCreatePageClient({
	locale,
	currentUser,
}: Readonly<AdminOrganizerCreatePageClientProps>) {
	const t = getTranslations(locale, organizerCreateTranslations)
	const tCommon = getTranslations(locale, organizerCommonTranslations)

	const router = useRouter()
	const [isSuccess, setIsSuccess] = useState(false)
	const [createdOrganizer, setCreatedOrganizer] = useState<null | Organizer>(null)

	const handleSuccess = (organizer: Organizer) => {
		setCreatedOrganizer(organizer)
		setIsSuccess(true)
	}

	const handleCancel = () => {
		router.push('/admin/')
	}

	// Safety check - if currentUser is null, show error
	if (!currentUser) {
		return (
			<div className="from-background via-destructive/5 to-background relative min-h-screen bg-gradient-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-black/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--destructive)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--destructive)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl text-red-600 dark:text-red-400">⚠</div>
						<h1 className="text-foreground mb-4 text-3xl font-bold">{tCommon.organizers.ui.accessError}</h1>
						<p className="text-muted-foreground mb-6 text-lg">{tCommon.organizers.ui.accessErrorDescription}</p>
						<button
							className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white"
							onClick={() => router.push('/auth/sign-in')}
							type="button"
						>
							{tCommon.organizers.ui.signIn}
						</button>
					</div>
				</div>
			</div>
		)
	}

	if (isSuccess && createdOrganizer) {
		return (
			<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-black/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl text-green-600 dark:text-green-400">✓</div>
						<h1 className="text-foreground mb-4 text-3xl font-bold">{t.organizers.create.success.title}</h1>
						<p className="text-muted-foreground mb-6 text-lg">
							{t.organizers.create.success.message.replace('{organizerName}', createdOrganizer.name)}
						</p>
						<button
							className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white"
							onClick={() => router.push('/admin/organizer')}
							type="button"
						>
							{t.organizers.create.success.backButton}
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div>
			{/* Admin header with user info */}
			<div className="bg-card/25 border-border/30 absolute top-0 right-0 left-0 z-20 mx-4 mt-12 mb-6 rounded-2xl border p-4 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-muted-foreground text-sm">{tCommon.organizers.ui.connectedAs}</p>
						<p className="text-foreground font-medium">
							{currentUser.firstName ?? 'Anonymous'} {currentUser.lastName ?? ''} ({currentUser.email})
						</p>
					</div>
					<div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
						{currentUser.role.toUpperCase()}
					</div>
				</div>
			</div>
			<OrganizerCreationForm locale={locale} onCancel={handleCancel} onSuccess={handleSuccess} />
		</div>
	)
}
