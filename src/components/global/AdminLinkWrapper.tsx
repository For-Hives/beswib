'use client'

import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { checkIsCurrentUserAdmin } from './adminActions'

interface AdminLinkWrapperProps {
	variant?: 'dropdown' | 'navbar'
}

export default function AdminLinkWrapper({ variant = 'navbar' }: AdminLinkWrapperProps) {
	const { user: clerkUser, isLoaded } = useUser()
	const [isAdmin, setIsAdmin] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		if (!isLoaded || !clerkUser) {
			setIsLoading(false)
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
			} finally {
				setIsLoading(false)
			}
		}

		void checkAdminStatus()
	}, [clerkUser, isLoaded])

	if (isLoading || !isAdmin) {
		return null
	}

	const navbarClasses =
		'text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors'
	const dropdownClasses =
		'text-foreground hover:bg-accent block px-4 py-2 text-sm transition-colors data-[focus]:bg-accent'

	return (
		<Link className={variant === 'navbar' ? navbarClasses : dropdownClasses} href="/admin">
			Admin
		</Link>
	)
}
