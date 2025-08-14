import type { Metadata } from 'next'

import type { ReactNode } from 'react'

import { ConsentManagerProvider, CookieBanner, ConsentManagerDialog } from '@c15t/nextjs'
import { Geist, Geist_Mono, Bowlby_One_SC } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/themes'
import { Toaster } from 'sonner'
import Script from 'next/script'

import { generateLocaleParams, type LocaleParams } from '@/lib/generateStaticParams'
import { SessionsTracker } from '@/components/global/sessionsTrackers'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { getClerkLocalization } from '@/lib/i18n/clerk/localization'
import QueryProvider from '@/components/providers/QueryProvider'
import SentryClientInit from '@/app/[locale]/SentryClientInit'
import PageTransition from '@/components/ui/PageTransition'
import Footer from '@/components/global/footer'
import Header from '@/components/global/Header'

import '@/lib/umami.utils'
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
	title: 'Beswib - Application in development',
	robots: {
		nocache: true,
		index: false,
		googleBot: {
			noimageindex: true,
			'max-video-preview': -1,
			'max-snippet': -1,
			'max-image-preview': 'none',
			index: false,
			follow: false,
		},
		follow: false,
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
	description: 'Application in development - Not accessible to the public',
	appleWebApp: {
		title: 'BeSwib',
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

	return (
		<ClerkProvider
			appearance={{
				baseTheme: shadcn,
			}}
			localization={clerkLocalization}
			signInUrl={`/${locale}/sign-in`}
			signUpUrl={`/${locale}/sign-up`}
			afterSignInUrl={`/${locale}/dashboard`}
			afterSignUpUrl={`/${locale}/dashboard`}
		>
			<html lang={locale}>
				<head>
					{/* Apply persisted/system theme BEFORE paint to prevent flash */}
					<Script
						id="theme-init"
						dangerouslySetInnerHTML={{
							__html: `!function(){try{var s=localStorage.getItem("theme"),e=null;if(s)try{var t=JSON.parse(s);e=t&&t.state&&t.state.theme}catch(r){e=s}e||(e=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var o=document.documentElement;o.classList.remove("light","dark"),o.classList.add(e),o.style.colorScheme=e}catch(r){}}();`,
						}}
					/>
					<Script
						async
						id="umami-script"
						// data-domains={'beswib.com'}
						data-website-id="e9168017-b73b-491b-b7b0-fee64f07c847"
						src="https://umami.wadefade.fr/script.js"
						data-tag="alpha"
						data-before-send="beforeSendHandler"
						strategy="afterInteractive"
					></Script>
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
