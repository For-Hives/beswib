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
import QueryProvider from '@/components/providers/QueryProvider'
import { GoBackToTop } from '@/components/global/go-back-to-top'
import SentryClientInit from '@/app/[locale]/SentryClientInit'
import PageTransition from '@/components/ui/PageTransition'
import { getVersion } from '@/lib/utils/version'
import Footer from '@/components/global/footer'
import Header from '@/components/global/Header'
import OrganizationSchema from '@/components/seo/OrganizationSchema'

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
	title: 'Beswib - Transfer Race Bibs | Buy & Sell Running, Trail, Triathlon Bibs',
	description: 'Transfer race bibs safely with Beswib. Buy and sell running, trail, triathlon, and cycling race bibs. Join thousands of athletes worldwide.',
	keywords: 'race bibs, running bibs, trail running, triathlon, cycling, race transfer, buy bibs, sell bibs, marathon, ultra trail',
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	manifest: '/site.webmanifest',
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
	openGraph: {
		type: 'website',
		locale: 'en_US',
		alternateLocale: ['fr_FR', 'de_DE', 'es_ES', 'it_IT', 'pt_PT', 'nl_NL', 'pl_PL', 'sv_SE', 'ko_KR'],
		siteName: 'Beswib',
		title: 'Beswib - Transfer Race Bibs | Buy & Sell Running, Trail, Triathlon Bibs',
		description: 'Transfer race bibs safely with Beswib. Buy and sell running, trail, triathlon, and cycling race bibs. Join thousands of athletes worldwide.',
		url: 'https://beswib.com',
		images: [
			{
				url: '/og-image.jpg',
				width: 1200,
				height: 630,
				alt: 'Beswib - Transfer Race Bibs',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Beswib - Transfer Race Bibs | Buy & Sell Running, Trail, Triathlon Bibs',
		description: 'Transfer race bibs safely with Beswib. Buy and sell running, trail, triathlon, and cycling race bibs. Join thousands of athletes worldwide.',
		images: ['/og-image.jpg'],
		creator: '@beswib',
		site: '@beswib',
	},
	alternates: {
		canonical: 'https://beswib.com',
		languages: {
			'en': '/en',
			'fr': '/fr',
			'de': '/de',
			'es': '/es',
			'it': '/it',
			'pt': '/pt',
			'nl': '/nl',
			'pl': '/pl',
			'sv': '/sv',
			'ko': '/ko'
		},
	},
	verification: {
		google: 'your-google-verification-code',
		yandex: 'your-yandex-verification-code',
		yahoo: 'your-yahoo-verification-code',
	},
	category: 'Sports & Recreation',
	classification: 'Race Bib Marketplace',
	referrer: 'origin-when-cross-origin',
	colorScheme: 'light dark',
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
		{ media: '(prefers-color-scheme: dark)', color: '#000000' },
	],
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
			{/* Schema.org pour l'organisation */}
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
