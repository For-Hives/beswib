import type { ReactNode } from 'react'

import { ConsentManagerProvider, CookieBanner, ConsentManagerDialog } from '@c15t/nextjs'
import { Geist, Geist_Mono, Bowlby_One_SC } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/themes'
import { Toaster } from 'sonner'
import Script from 'next/script'

import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import LocaleSynchronizer from '@/components/global/LocaleSynchronizer'
import { SessionsTracker } from '@/components/global/sessionsTrackers'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { getClerkLocalization } from '@/lib/i18n/clerk/localization'
import OrganizationSchema from '@/components/seo/OrganizationSchema'
import QueryProvider from '@/components/providers/QueryProvider'
import { GoBackToTop } from '@/components/global/go-back-to-top'
import SentryClientInit from '@/app/[locale]/SentryClientInit'
import PageTransition from '@/components/ui/PageTransition'
import { getVersion } from '@/lib/utils/version'
import Footer from '@/components/global/footer'
import Header from '@/components/global/Header'

import '@/lib/utils/umami'
import '@/app/[locale]/globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

const bowlbyOneSC = Bowlby_One_SC({
	weight: '400',
	variable: '--font-bowlby-one-sc',
	subsets: ['latin'],
})

// Generate static params for all locales 🌐
export function generateStaticParams() {
	return generateLocaleParams()
}

// Generate viewport metadata for theme and color scheme 🎨
export function generateViewport() {
	return {
		themeColor: [
			{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
			{ media: '(prefers-color-scheme: dark)', color: '#000000' },
		],
		colorScheme: 'light dark',
	}
}

export default async function RootLayout(props: { params: Promise<{ locale: string }>; children: ReactNode }) {
	const localeParams = await props.params
	const { locale } = localeParams as LocaleParams
	const clerkLocalization = getClerkLocalization(locale)

	// Create properly typed localeParams for components
	const typedLocaleParams: Promise<LocaleParams> = Promise.resolve({ locale })

	const version: string = getVersion()

	return (
		<ClerkProvider
			appearance={{
				baseTheme: shadcn,
			}}
			localization={clerkLocalization}
			signInUrl={`/${locale}/sign-in`}
			signUpUrl={`/${locale}/dashboard`}
			signInFallbackRedirectUrl={`/${locale}/dashboard`}
		>
			<html lang={locale} suppressHydrationWarning>
				<body
					className={`${geistSans.variable} ${geistMono.variable} ${bowlbyOneSC.variable} bg-background text-foreground font-geist antialiased`}
				>
					{/* Organization Schema moved to body to avoid head conflicts */}
					<OrganizationSchema locale={locale} />

					{/* Scripts moved to body to avoid head conflicts */}
					<Script
						async
						id="umami-script"
						data-domains={'beswib.com'}
						data-website-id="e9168017-b73b-491b-b7b0-fee64f07c847"
						src="https://umami.wadefade.fr/script.js"
						data-tag={version}
						data-before-send="beforeSendHandler"
						strategy="afterInteractive"
					/>
					{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID != null && (
						<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
					)}
					{/* Apply persisted/system theme BEFORE paint to prevent flash */}
					<Script
						id="theme-script"
						strategy="beforeInteractive"
						dangerouslySetInnerHTML={{
							__html: `(function(){try{var s=localStorage.getItem("theme"),e=null;if(s)try{var t=JSON.parse(s);e=t&&t.state&&t.state.theme}catch(r){e=s}e||(e=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var o=document.documentElement;o.classList.remove("light","dark"),o.classList.add(e),o.style.colorScheme=e}catch(r){}})();`,
						}}
					/>
					<ThemeProvider>
						<ConsentManagerProvider
							options={{
								mode: 'offline',
							}}
						>
							<QueryProvider>
								<NuqsAdapter>
									<SessionsTracker />
									<LocaleSynchronizer />
									<Header localeParams={typedLocaleParams} />
									<PageTransition>{props.children}</PageTransition>
									{/* Ensure Sentry client init runs on the browser */}
									<SentryClientInit />
									<CookieBanner />
									<ConsentManagerDialog />
									<Footer localeParams={typedLocaleParams} />
									<GoBackToTop locale={locale} />
									<Toaster />
								</NuqsAdapter>
							</QueryProvider>
						</ConsentManagerProvider>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	)
}
