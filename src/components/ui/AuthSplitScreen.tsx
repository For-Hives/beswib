'use client'

import { ReactNode } from 'react'

import { useParams } from 'next/navigation'
import Link from 'next/link'

import { getTranslations } from '@/lib/i18n/dictionary'
import mainLocales from '@/app/[locale]/locales.json'
import { Locale } from '@/lib/i18n/config'

import MountainShader from './MountainShader'

/**
 * Props interface for the AuthSplitScreen component
 * @param children - React components to render in the right panel (typically Clerk auth forms)
 */
interface AuthSplitScreenProps {
	children: ReactNode
}

/**
 * AuthSplitScreen - Layout component that creates a split-screen authentication interface
 *
 * This component creates a visually appealing authentication page with:
 * - Left side: Animated mountain shader background for visual appeal
 * - Right side: Form container for authentication components
 * - Responsive design that works on mobile and desktop
 * - Internationalization support for multiple languages
 * - Legal links (Terms of Service, Privacy Policy) at the bottom
 *
 * Used for sign-in, sign-up, and other authentication pages to provide
 * a consistent, branded experience across the application.
 */
export default function AuthSplitScreen({ children }: Readonly<AuthSplitScreenProps>) {
	// Extract locale from URL parameters for internationalization
	const params = useParams()
	const locale = (params?.locale as Locale) || 'en'

	// Get translated text for the current locale
	const t = getTranslations(locale, mainLocales).auth

	return (
		// Main container: full height, centered, with padding and overflow handling
		<div className="flex min-h-screen items-center justify-center overflow-hidden">
			{/* Card container: max width, rounded corners, shadow for depth */}
			<div className="relative w-full max-w-6xl overflow-hidden rounded-3xl shadow-xl">
				{/* Grid Layout: 12-column grid system for responsive design */}
				<div className="grid md:grid-cols-12">
					{/* Left Side - Visual Panel with Mountain Shader Animation */}
					<div className="relative h-full overflow-hidden md:col-span-6">
						{/* Mountain Shader Animation Layer */}
						{/*
							This layer contains the animated mountain shader that provides
							the visual background. It's positioned absolutely to fill the
							entire left panel and uses z-index layering for proper stacking.
						*/}
						<div className="pointer-events-none absolute inset-0 z-10 w-full">
							<MountainShader className="absolute top-0 left-0 h-full w-full" />
						</div>

						{/* Light Overlay Layer */}
						{/*
							Subtle white overlay to soften the shader animation and ensure
							text readability if any content is placed over the background.
							Higher z-index (20) than the shader (10) to appear on top.
						*/}
						<div className="absolute inset-0 z-20 bg-white/20" />
					</div>

					{/* Right Side - Form Panel for Authentication Components */}
					<div className="bg-background/95 flex flex-col justify-center backdrop-blur-sm md:col-span-6 md:p-12">
						{/* Form Container: centered with max width for optimal UX */}
						<div className="mx-auto w-full max-w-md">
							{/* Clerk Authentication Form Container */}
							{/*
								This is where Clerk (authentication service) components are rendered.
								The children prop contains the actual sign-in/sign-up forms.
								Spacing between form elements for better visual hierarchy.
							*/}
							<div className="space-y-6">{children}</div>

							{/* Legal Information Section */}
							{/*
								Required legal text and links that must be displayed on
								authentication pages for compliance and user transparency.
								Links to Terms of Service and Privacy Policy pages.
							*/}
							<div className="mt-8 text-center">
								<p className="text-muted-foreground text-xs">
									{t.legal.termsText}{' '}
									<Link href={`/${locale}/legals/terms`} className="text-primary hover:underline">
										{t.legal.termsOfService}
									</Link>{' '}
									{t.legal.and}{' '}
									<Link href={`/${locale}/legals/privacy-policy`} className="text-primary hover:underline">
										{t.legal.privacyPolicy}
									</Link>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
