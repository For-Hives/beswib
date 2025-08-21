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
	title: 'Beswib - Marketplace de revente de dossards sportifs | Course à pied, Trail, Triathlon',
	description: 'Plateforme sécurisée de revente de dossards pour courses de running, trail, triathlon et cyclisme. Revendez ou achetez des dossards en toute légalité avec protection PayPal.',
	keywords: 'dossard course, revente dossard, course à pied, trail running, triathlon, cyclisme, marketplace sport, bib transfer',
	authors: [{ name: 'Beswib Team' }],
	creator: 'Beswib',
	publisher: 'Beswib',
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	robots: {
		index: true,
		follow: true,
		nocache: false,
		googleBot: {
			index: true,
			follow: true,
			noimageindex: false,
			'max-video-preview': 0,
			'max-snippet': -1,
			'max-image-preview': 'large',
		},
	},
	alternates: {
		canonical: 'https://beswib.com',
		languages: {
			'en': 'https://beswib.com/en',
			'fr': 'https://beswib.com/fr',
			'es': 'https://beswib.com/es',
			'it': 'https://beswib.com/it',
			'de': 'https://beswib.com/de',
			'pt': 'https://beswib.com/pt',
			'nl': 'https://beswib.com/nl',
			'ko': 'https://beswib.com/ko',
			'ro': 'https://beswib.com/ro',
		},
	},
	openGraph: {
		title: 'Beswib - Marketplace de revente de dossards sportifs',
		description: 'Plateforme sécurisée de revente de dossards pour courses de running, trail, triathlon et cyclisme. Revendez ou achetez des dossards en toute légalité.',
		url: 'https://beswib.com',
		siteName: 'Beswib',
		images: [
			{
				url: '/og-image.jpg',
				width: 1200,
				height: 630,
				alt: 'Beswib - Marketplace de dossards sportifs',
			},
		],
		locale: 'fr_FR',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Beswib - Marketplace de revente de dossards sportifs',
		description: 'Plateforme sécurisée de revente de dossards pour courses de running, trail, triathlon et cyclisme.',
		images: ['/og-image.jpg'],
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
	appleWebApp: {
		title: 'Beswib',
	},
	other: {
		'google-site-verification': 'your-google-verification-code',
	},
}

// Generate static params for all locales 🌐
export function generateStaticParams() {
	return generateLocaleParams()
}

export default async function RootLayout(props: { params: Promise<LocaleParams>; children: ReactNode }) {
	const localeParams = await props.params
	const { locale } = localeParams
	const clerkLocalization = getClerkLocalization(locale)

	const version: string = getVersion()

	return (
		<ClerkProvider
			appearance={{
				baseTheme: shadcn,
			}}
			localization={clerkLocalization}
			signInUrl={`/${locale}/sign-in`}
			signUpUrl={`/${locale}/auth/sign-up`}
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
									<Header localeParams={props.params} />
									<PageTransition>{props.children}</PageTransition>
									{/* Ensure Sentry client init runs on the browser */}
									<SentryClientInit />
									<CookieBanner />
									<ConsentManagerDialog />
									<Footer localeParams={props.params} />
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
