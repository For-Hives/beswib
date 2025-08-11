import type { Metadata } from 'next'

import type { ReactNode } from 'react'

import { Geist, Geist_Mono, Bowlby_One_SC } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ClerkProvider, useAuth, useUser } from '@clerk/nextjs'
import { Toaster } from 'sonner'

import { generateLocaleParams, type LocaleParams } from '@/lib/generateStaticParams'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import QueryProvider from '@/components/providers/QueryProvider'
import PageTransition from '@/components/ui/PageTransition'
import Footer from '@/components/global/footer'
import Header from '@/components/global/Header'

import '@/app/[locale]/globals.css'
import Script from 'next/script'
import { is } from 'valibot'
import { umamiIdentify, umamiTrack } from '@/lib/umami.utils'
import { currentUser } from '@clerk/nextjs/server'
import { Session } from 'inspector/promises'
import { SessionsTracker } from '@/components/global/sessionsTrackers'
import { ConsentManagerProvider, CookieBanner, ConsentManagerDialog } from '@c15t/nextjs'

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

	return (
		<ClerkProvider>
			<html lang={locale} suppressHydrationWarning>
				<head>
					{/* Apply persisted/system theme BEFORE paint to prevent flash */}
					<Script
						dangerouslySetInnerHTML={{
							__html: `!function(){try{var s=localStorage.getItem("theme"),e=null;if(s)try{var t=JSON.parse(s);e=t&&t.state&&t.state.theme}catch(r){e=s}e||(e=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var o=document.documentElement;o.classList.remove("light","dark"),o.classList.add(e),o.style.colorScheme=e}catch(r){}}();`,
						}}
					/>
					{/* Expose the beforeSend hook on window for Umami */}
					<Script
						dangerouslySetInnerHTML={{
							__html: `window.beforeSendHandler||(window.beforeSendHandler=function(t,p){try{if(!p||typeof p!=="object")return!1;var e=p&&p.event_data;if(e){if(Object.prototype.hasOwnProperty.call(e,"email"))e.email="[redacted]";if(Object.prototype.hasOwnProperty.call(e,"name"))e.name="[redacted]"}return p}catch(r){return!1}});`,
						}}
					/>
					<Script
						async
						data-domains={'beswib.com'}
						data-website-id="e9168017-b73b-491b-b7b0-fee64f07c847"
						src="https://umami.wadefade.fr/script.js"
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
