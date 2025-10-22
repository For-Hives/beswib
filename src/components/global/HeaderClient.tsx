'use client'

import { SignedIn, SignedOut, useClerk, useUser } from '@clerk/nextjs'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { LayoutDashboard, LogOut, Settings, ShoppingBag, Tag, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import LanguageSwitcher, { LanguageSwitcherMobile } from '@/components/seo/LanguageSwitcher'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'

import { checkIsCurrentUserAdmin } from './adminActions'
import DashboardDropdown from './DashboardDropdown'
import LocaleSynchronizer from './LocaleSynchronizer'
import { ThemeToggle } from './ThemeToggle'

// import { LaunchBanner } from './LaunchBanner'

interface HeaderClientProps {
	locale: Locale
}

import pageTranslationsData from './locales.json'

export default function HeaderClient({ locale }: Readonly<HeaderClientProps>) {
	const t = getTranslations(locale, pageTranslationsData)
	const currentPath = usePathname()
	const [bannerLoading, setBannerLoading] = useState(true)

	// Check banner state on mount to prevent header flash
	useEffect(() => {
		const checkBannerState = () => {
			const bannerDismissed = localStorage.getItem('banner_dismissed') === 'true'
			const cookieDismissed = document.cookie.split(';').some(cookie => cookie.trim().startsWith('banner_dismissed='))

			// If banner is dismissed, we can show header immediately
			if (bannerDismissed || cookieDismissed) {
				setBannerLoading(false)
			} else {
				// If banner should show, wait a bit to prevent flash
				setTimeout(() => setBannerLoading(false), 100)
			}
		}

		checkBannerState()
	}, [])

	// Navigation links data with dynamic current state 🧭
	const navigationLinks = useMemo(
		() => [
			{
				label: t.navbar.homeLink,
				href: `/${locale}`,
				current: currentPath === `/${locale}` || currentPath === `/${locale}/`,
			},
			{
				label: t.navbar.racesLink,
				href: `/${locale}/events`,
				current: currentPath.startsWith(`/${locale}/events`),
			},
			{
				label: t.navbar.marketplaceLink,
				href: `/${locale}/marketplace`,
				current: currentPath.startsWith(`/${locale}/marketplace`),
			},
			{
				label: t.navbar.faqLink,
				href: `/${locale}/faq`,
				current: currentPath.startsWith(`/${locale}/faq`),
			},
			{
				label: t.navbar.contactLink,
				href: `/${locale}/contact`,
				current: currentPath.startsWith(`/${locale}/contact`),
			},
		],
		[t, locale, currentPath]
	)

	// Don't render header while banner is loading to prevent flash
	if (bannerLoading) {
		return null
	}

	return (
		<>
			{/* Locale synchronization for authenticated users */}
			<LocaleSynchronizer />
			{/* Spacer div to prevent content from going under fixed header 📏 */}
			<div className="h-16" />

			<Disclosure
				as="nav"
				className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-0 z-[100] w-full border-b backdrop-blur"
			>
				{/* <LaunchBanner locale={locale} /> */}

				<div className="mx-auto max-w-7xl px-4 xl:px-0">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center">
							<div className="">
								<Link href={`/${locale}`}>
									<Image alt="Beswib" className="h-8 w-auto" height={32} src="/beswib.svg" width={32} />
								</Link>
							</div>
							<div className="hidden lg:ml-6 lg:block">
								<div className="flex space-x-4">
									{navigationLinks.map(link => (
										<Link
											className={`text-md rounded-md px-3 py-2 font-medium transition-colors ${
												link.current
													? 'bg-accent text-accent-foreground'
													: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
											}`}
											href={link.href}
											key={link.href}
										>
											{link.label}
										</Link>
									))}
								</div>
							</div>
						</div>
						<div className="hidden lg:ml-6 lg:block">
							<div className="text-foreground flex items-center">
								<div className="flex items-center gap-4">
									<ThemeToggle />
									<SignedIn>
										{/* Dashboard Dropdown Menu 📊 */}
										<DashboardDropdown locale={locale} />
									</SignedIn>
									<SignedOut>
										<Link
											href={`/${locale}/auth/sign-in`}
											className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
										>
											{t.navbar.signIn}
										</Link>
										<Link
											href={`/${locale}/auth/sign-up`}
											className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 text-sm font-medium transition-colors"
										>
											{t.navbar.signUp}
										</Link>
									</SignedOut>
									{/* Language Switcher */}
									<LanguageSwitcher currentLocale={locale} currentPath={currentPath} className="mr-2" />
								</div>
							</div>
						</div>
						<div className="-mr-2 flex gap-4 lg:hidden">
							<div className="flex items-center gap-3">
								<ThemeToggle />
							</div>

							{/* Mobile menu button 📱 */}
							<DisclosureButton className="group text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:ring-ring relative inline-flex items-center justify-center rounded-md p-2 transition-colors focus:ring-2 focus:outline-none focus:ring-inset">
								<span className="absolute -inset-0.5" />
								<span className="sr-only">Open main menu</span>
								<Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
								<XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
							</DisclosureButton>
						</div>
					</div>
				</div>

				<DisclosurePanel className="border-border bg-background absolute z-[101] max-h-[calc(100vh-4rem)] w-full overflow-y-auto border-b shadow-lg lg:hidden">
					<div className="space-y-1 px-2 pt-2 pb-3">
						{/* Language Switcher for Mobile 🌐 - More compact */}
						<div className="border-border mb-3 border-b pb-3">
							<LanguageSwitcherMobile currentLocale={locale} currentPath={currentPath} />
						</div>

						{/* Main Navigation Links 🔗 */}
						{navigationLinks.map(link => (
							<DisclosureButton
								as={Link}
								className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
									link.current
										? 'bg-accent text-accent-foreground'
										: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
								}`}
								href={link.href}
								key={link.href}
							>
								{link.label}
							</DisclosureButton>
						))}

						{/* Auth Section 🔒 */}
						<div className="border-border border-t pt-4 pb-3">
							<div className="flex flex-col space-y-2 px-2">
								<SignedIn>
									<MobileDashboardLinks locale={locale} />
								</SignedIn>
								<SignedOut>
									<Link
										href={`/${locale}/auth/sign-in`}
										className="text-muted-foreground hover:bg-accent hover:text-accent-foreground block w-full rounded-md px-3 py-2 text-left text-base font-medium transition-colors"
									>
										{t.navbar.signIn}
									</Link>
									<Link
										href={`/${locale}/auth/sign-up`}
										className="bg-primary text-primary-foreground hover:bg-primary/90 block w-full rounded-md px-3 py-2 text-left text-base font-medium transition-colors"
									>
										{t.navbar.signUp}
									</Link>
								</SignedOut>
							</div>
						</div>
					</div>
				</DisclosurePanel>
			</Disclosure>
		</>
	)
}

// Mobile Dashboard Component 📱
function MobileDashboardLinks({ locale }: Readonly<{ locale: Locale }>) {
	const t = getTranslations(locale, pageTranslationsData)
	const currentPath = usePathname()

	const { user: clerkUser, isLoaded } = useUser()
	const { signOut } = useClerk()
	const [isAdmin, setIsAdmin] = useState(false)

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

	return (
		<>
			{/* Dashboard Section Header 📜 */}
			<div className="text-muted-foreground px-3 py-2 text-xs font-semibold tracking-wide uppercase">
				{t.navbar.dashboardLink}
			</div>

			{/* Dashboard Main Link 🏠 */}
			<DisclosureButton
				as={Link}
				className={`flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors ${
					currentPath.startsWith('/dashboard') &&
					!currentPath.startsWith('/dashboard/seller') &&
					!currentPath.startsWith('/profile')
						? 'bg-accent text-accent-foreground'
						: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
				}`}
				href={`/${locale}/dashboard`}
			>
				<LayoutDashboard className="h-4 w-4" />
				{t.navbar.dashboardLink}
			</DisclosureButton>

			{/* Profile Link */}
			<DisclosureButton
				as={Link}
				className={`flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors ${
					currentPath.startsWith('/profile')
						? 'bg-accent text-accent-foreground'
						: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
				}`}
				href={`/${locale}/profile`}
			>
				<User className="h-4 w-4" />
				{t.navbar.profileLink}
			</DisclosureButton>

			{/* Buy Bib Link 🛍️ */}
			<DisclosureButton
				as={Link}
				className={`flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors ${
					currentPath.startsWith('/marketplace')
						? 'bg-accent text-accent-foreground'
						: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
				}`}
				href="/marketplace"
			>
				<ShoppingBag className="h-4 w-4" />
				{t.navbar.buyBibLink}
			</DisclosureButton>

			{/* Sell Bib Link 🏷️ */}
			<DisclosureButton
				as={Link}
				className={`flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors ${
					currentPath.startsWith('/dashboard/seller/sell-bib')
						? 'bg-accent text-accent-foreground'
						: 'bg-primary text-primary-foreground hover:bg-primary/90'
				}`}
				href={`/${locale}/dashboard/seller/sell-bib`}
			>
				<Tag className="h-4 w-4" />
				{t.navbar.sellBibLink}
			</DisclosureButton>

			{/* Admin Link - Only show if user is admin 👑 */}
			{isAdmin && (
				<DisclosureButton
					as={Link}
					className={`flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors ${
						currentPath.startsWith('/admin')
							? 'bg-accent text-accent-foreground'
							: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
					}`}
					href="/admin"
				>
					<Settings className="h-4 w-4" />
					{t.navbar.adminLink}
				</DisclosureButton>
			)}

			{/* Sign Out Button 🚪 */}
			<DisclosureButton
				as="button"
				onClick={() => void signOut({ redirectUrl: '/' })}
				className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors"
			>
				<LogOut className="h-4 w-4" />
				{t.navbar.signOut}
			</DisclosureButton>
		</>
	)
}
