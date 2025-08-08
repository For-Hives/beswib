import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Geist, Geist_Mono } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'

import { generateLocaleParams, type LocaleParams } from '@/lib/generateStaticParams'
import QueryProvider from '@/components/providers/QueryProvider'
import PageTransition from '@/components/ui/PageTransition'
import Footer from '@/components/global/footer'
import Header from '@/components/global/Header'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

// import '/globals.css' 💅
import '@/app/[locale]/globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
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
            <html lang={locale}>
                <head>
                    {/* Apply persisted/system theme BEFORE paint to prevent flash */}
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `(() => { try { 
  var stored = localStorage.getItem('theme');
  var theme = null;
  if (stored) { 
    try { var parsed = JSON.parse(stored); theme = parsed && parsed.state && parsed.state.theme; } catch (_) { theme = stored; }
  }
  if (!theme) { theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  var d = document.documentElement; d.classList.remove('light','dark'); d.classList.add(theme); d.style.colorScheme = theme;
} catch (e) {} })();`,
                        }}
                    />
                </head>
				<body className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}>
					<ThemeProvider>
						<QueryProvider>
							<NuqsAdapter>
								<Header localeParams={props.params} />
								<PageTransition>{props.children}</PageTransition>
								<Footer localeParams={props.params} />
								<Toaster />
							</NuqsAdapter>
						</QueryProvider>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	)
}
