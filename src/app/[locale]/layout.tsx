import type { Metadata } from 'next'

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

export const metadata: Metadata = {
	twitter: {
		title: 'Beswib - Transfer Race Bibs | Buy & Sell Running, Trail, Triathlon Bibs',
		site: '@beswib',
		images: ['/og-image.jpg'],
		description:
			'Transfer race bibs safely with Beswib. Buy and sell running, trail, triathlon, and cycling race bibs. Join thousands of athletes worldwide.',
		creator: '@beswib',
		card: 'summary_large_image',
	},
	title: 'Beswib - Transfer Race Bibs | Buy & Sell Running, Trail, Triathlon Bibs',
	robots: {
		index: true,
		googleBot: {
			'max-video-preview': -1,
			'max-snippet': -1,
			'max-image-preview': 'large',
			index: true,
			follow: true,
		},
		follow: true,
	},
	referrer: 'origin-when-cross-origin',
	openGraph: {
		url: 'https://beswib.com',
		type: 'website',
		title: 'Beswib - Transfer Race Bibs | Buy & Sell Running, Trail, Triathlon Bibs',
		siteName: 'Beswib',
		locale: 'en_US',
		images: [
			{
				width: 1200,
				url: '/og-image.jpg',
				height: 630,
				alt: 'Beswib - Transfer Race Bibs',
			},
		],
		description:
			'Transfer race bibs safely with Beswib. Buy and sell running, trail, triathlon, and cycling race bibs. Join thousands of athletes worldwide.',
		alternateLocale: ['fr_FR', 'de_DE', 'es_ES', 'it_IT', 'pt_PT', 'nl_NL', 'ro_RO', 'ko_KR'],
	},
	manifest: '/site.webmanifest',
	keywords:
		'race bibs, running bibs, trail running, triathlon, cycling, race transfer, buy bibs, sell bibs, marathon, ultra trail',
	icons: {
		shortcut: '/favicon.ico',
		icon: [
			{ url: '/favicon.ico', sizes: 'any' },
			{ url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
			{ url: '/favicon.svg', type: 'image/svg+xml' },
		],
		apple: {
			url: '/apple-touch-icon.png',
			type: 'image/png',
			sizes: '180x180',
		},
	},
	description:
		'Transfer race bibs safely with Beswib. Buy and sell running, trail, triathlon, and cycling race bibs. Join thousands of athletes worldwide.',
	classification: 'Race Bib Marketplace',
	category: 'Sports & Recreation',
	alternates: {
		languages: {
			ro: '/ro',
			pt: '/pt',
			nl: '/nl',
			ko: '/ko',
			it: '/it',
			fr: '/fr',
			es: '/es',
			en: '/en',
			de: '/de',
		},
		canonical: 'https://beswib.com',
	},
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

// Generate static params for all locales 🌐
export function generateStaticParams() {
	return generateLocaleParams()
}

export default async function RootLayout(props: { params: Promise<{ locale: string }>; children: ReactNode }) {
	const localeParams = await props.params
	const { locale } = localeParams as LocaleParams
	const clerkLocalization = getClerkLocalization(locale)

	// Create properly typed localeParams for components
	const typedLocaleParams: Promise<LocaleParams> = Promise.resolve({ locale })

	const version: string = getVersion()

	return (
		<>
			<OrganizationSchema />

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
					<head>
						{/* Apply persisted/system theme BEFORE paint to prevent flash */}
						<script
							dangerouslySetInnerHTML={{
								__html: `(function(){try{var s=localStorage.getItem("theme"),e=null;if(s)try{var t=JSON.parse(s);e=t&&t.state&&t.state.theme}catch(r){e=s}e||(e=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var o=document.documentElement;o.classList.remove("light","dark"),o.classList.add(e),o.style.colorScheme=e}catch(r){}})();`,
							}}
						/>
						<Script
							async
							id="umami-script"
							data-domains={'beswib.com'}
							data-website-id="e9168017-b73b-491b-b7b0-fee64f07c847"
							src="https://umami.wadefade.fr/script.js"
							data-tag={version}
							data-before-send="beforeSendHandler"
							strategy="afterInteractive"
						></Script>
						{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID != null && (
							<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
						)}
					</head>
					<body
						className={`${geistSans.variable} ${geistMono.variable} ${bowlbyOneSC.variable} bg-background text-foreground font-geist antialiased`}
					>
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
		</>
	)
}
