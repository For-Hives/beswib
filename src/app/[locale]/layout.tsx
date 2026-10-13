import { ConsentBanner, ConsentDialog, ConsentRoot } from '@c15t/nextjs'
import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/ui/themes'
import { Bowlby_One_SC, Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import SentryClientInit from '@/app/[locale]/SentryClientInit'
import { ConsentedGoogleAnalytics } from '@/components/analytics/ConsentedGoogleAnalytics'
import { UmamiScript } from '@/components/analytics/UmamiScript'
import Footer from '@/components/global/footer'
import { GoBackToTop } from '@/components/global/go-back-to-top'
import Header from '@/components/global/Header'
import LocaleSynchronizer, { GlobalLocaleSynchronizer } from '@/components/global/LocaleSynchronizer'
import QueryProvider from '@/components/providers/QueryProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import OrganizationSchema from '@/components/seo/OrganizationSchema'
import PageTransition from '@/components/ui/PageTransition'
import { getConsentRootProps } from '@/lib/consent/root-props'
import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { getClerkLocalization } from '@/lib/i18n/clerk/localization'
import { getVersion } from '@/lib/utils/version'

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
				theme: shadcn,
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
					<UmamiScript version={version} />
					{/* Apply persisted/system theme BEFORE paint to prevent flash */}
					<Script
						id="theme-script"
						strategy="beforeInteractive"
						dangerouslySetInnerHTML={{
							__html: `(function(){try{var s=localStorage.getItem("theme"),e=null;if(s)try{var t=JSON.parse(s);e=t&&t.state&&t.state.theme}catch(r){e=s}e||(e=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var o=document.documentElement;o.classList.remove("light","dark"),o.classList.add(e),o.style.colorScheme=e}catch(r){}})();`,
						}}
					/>
					{/* Apply persisted locale preference BEFORE paint to prevent flash */}
					<Script
						id="locale-script"
						strategy="beforeInteractive"
						dangerouslySetInnerHTML={{
							__html: `(function(){try{var s=localStorage.getItem("NEXT_LOCALE");if(s&&s.length===2){var c=document.cookie.split(';').some(function(cookie){return cookie.trim().startsWith('NEXT_LOCALE=')});if(!c){document.cookie='NEXT_LOCALE='+s+';path=/;max-age='+(60*60*24*365)+';SameSite=lax'}}}catch(r){}})();`,
						}}
					/>
					{/* Ensure locale consistency between localStorage and cookies */}
					<Script
						id="locale-sync-script"
						strategy="afterInteractive"
						dangerouslySetInnerHTML={{
							__html: `(function(){try{var s=localStorage.getItem("NEXT_LOCALE");var c=document.cookie.split(';').find(function(cookie){return cookie.trim().startsWith('NEXT_LOCALE=')});if(s&&s.length===2&&(!c||c.split('=')[1]!==s)){document.cookie='NEXT_LOCALE='+s+';path=/;max-age='+(60*60*24*365)+';SameSite=lax'}}catch(r){}})();`,
						}}
					/>
					<ThemeProvider>
						<ConsentRoot {...getConsentRootProps(locale)}>
							{/* Google Analytics waits for the visitor's consent, which only exists inside the consent root */}
							{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID != null && (
								<ConsentedGoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
							)}
							{/* Ahead of the page in the DOM: the banner is the first stop of the Tab key (c15t 3 no longer
							    moves the focus to it). The c15t credit stays in the dialog only, as before the upgrade. */}
							<ConsentBanner hideBranding />
							<ConsentDialog />
							<QueryProvider>
								<NuqsAdapter>
									<LocaleSynchronizer />
									<GlobalLocaleSynchronizer />
									<Header localeParams={typedLocaleParams} />
									<PageTransition>{props.children}</PageTransition>
									{/* Ensure Sentry client init runs on the browser */}
									<SentryClientInit />
									<Footer localeParams={typedLocaleParams} />
									<GoBackToTop locale={locale} />
									<Toaster />
								</NuqsAdapter>
							</QueryProvider>
						</ConsentRoot>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	)
}
