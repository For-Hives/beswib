'use client'

import { LayoutDashboard, Settings, ShoppingBag, Tag, User } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

import { DropdownMenuAnimated } from '@/components/ui/dropdown-menu-animated'
import { getTranslations } from '@/lib/getDictionary'
import { Locale } from '@/lib/i18n-config'

import { checkIsCurrentUserAdmin } from './adminActions'

interface DashboardDropdownProps {
	locale: Locale
}

import pageTranslationsData from './locales.json'

export default function DashboardDropdown({ locale }: Readonly<DashboardDropdownProps>) {
	const t = getTranslations(locale, pageTranslationsData)

	const { user: clerkUser, isLoaded } = useUser()
	const [isAdmin, setIsAdmin] = useState(false)
	const router = useRouter()

	useEffect(() => {
		if (!isLoaded || !clerkUser) {
			setIsAdmin(false)
			return
		}

		async function checkAdminStatus() {
			try {
				const adminStatus = await checkIsCurrentUserAdmin()
				setIsAdmin(adminStatus)
			} catch (error) {
				console.error('Error checking admin status:', error)
				setIsAdmin(false)
			}
		}

		void checkAdminStatus()
	}, [clerkUser, isLoaded])

	const baseOptions = [
		{
			onClick: () => router.push(`/${locale}/dashboard`),
			label: t.navbar.dashboardLink,
			Icon: <LayoutDashboard className="h-4 w-4" />,
		},
		{
			onClick: () => router.push(`/${locale}/profile`),
			label: t.navbar.profileLink,
			Icon: <User className="h-4 w-4" />,
		},
		{
			onClick: () => router.push(`/${locale}/marketplace`),
			label: t.navbar.buyBibLink,
			Icon: <ShoppingBag className="h-4 w-4" />,
		},
		{
			onClick: () => router.push(`/${locale}/dashboard/seller/sell-bib`),
			label: t.navbar.sellBibLink,
			Icon: <Tag className="h-4 w-4" />,
		},
	]

	// Add admin option if user is admin
	const options = isAdmin
		? [
				...baseOptions,
				{
					onClick: () => router.push(`/${locale}/admin`),
					label: t.navbar.adminLink,
					Icon: <Settings className="h-4 w-4" />,
				},
			]
		: baseOptions

	return <DropdownMenuAnimated options={options}>{t.navbar.dashboardLink}</DropdownMenuAnimated>
}
