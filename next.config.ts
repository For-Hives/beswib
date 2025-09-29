import type { NextConfig } from 'next'

import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
	trailingSlash: false,
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'images.unsplash.com' },
			{ protocol: 'https', hostname: 'loremflickr.com' },
			{ protocol: 'https', hostname: 'picsum.photos' },
			{ protocol: 'https', hostname: '*.andy-cinquin.fr' },
			{ protocol: 'https', hostname: '*.beswib.com' },
			{ protocol: 'https', hostname: 'cdnjs.cloudflare.com' },
		],
		qualities: [75, 90, 100], // Add quality configurations
	},
	async headers() {
		// Using async to satisfy Next.js type requirements
		await Promise.resolve()

		const scriptSrc = [
			"'self'",
			"'unsafe-inline'",
			"'unsafe-eval'",
			'wasm-unsafe-eval',
			'https://www.paypal.com',
			'https://paypalobjects.com',
			'https://*.paypalobjects.com',
			'https://www.sandbox.paypal.com',
			'https://clerk.com',
			'https://clerk-telemetry.com',
			'https://clerk.accounts.dev',
			'https://*.clerk.accounts.dev',
			'https://*.clerk-telemetry.com',
			'https://*.clerk.com',
			'https://challenges.cloudflare.com',
			'https://*.cloudflare.com',
			'https://cloudflare-turnstile.com',
			'https://*.cloudflare-turnstile.com',
			'https://js.stripe.com',
			'https://*.js.stripe.com',
			'https://maps.googleapis.com',
			'https://umami.wadefade.fr',
			'https://browser.sentry-cdn.com',
			'https://*.ingest.sentry.io',
			'https://www.googletagmanager.com',
			'https://www.googletagmanager.com/gtag/js',
			'https://*.beswib.com',
			'https://clerk.beswib.com',
			'https://*.paypal.com',
			'https://cdnjs.cloudflare.com',
		].join(' ')

		const connectSrc = [
			"'self'",
			'https://api-m.sandbox.paypal.com',
			'https://api-m.paypal.com',
			'https://paypalobjects.com',
			'https://*.paypalobjects.com',
			'https://www.sandbox.paypal.com',
			'https://www.paypal.com',
			'https://*.cloudflare.com',
			'https://*.clerk.com',
			'https://*.clerk.accounts.dev',
			'https://challenges.cloudflare.com',
			'https://clerk-telemetry.com',
			'https://*.clerk-telemetry.com',
			'https://api.stripe.com',
			'https://maps.googleapis.com',
			'https://umami.wadefade.fr',
			'https://*.ingest.sentry.io',
			'https://sentry.io',
			'https://cloudflare-turnstile.com',
			'https://*.cloudflare-turnstile.com',
			'https://www.googletagmanager.com',
			'https://www.googletagmanager.com/gtag/js',
			'https://*.beswib.com',
			'https://clerk.beswib.com',
			'https://*.paypal.com',
			'https://cdnjs.cloudflare.com',
			'https://nominatim.openstreetmap.org',
			'https://latest.currency-api.pages.dev',
		].join(' ')

		const frameSrc = [
			'https://www.paypal.com',
			'https://www.sandbox.paypal.com',
			'https://*.cloudflare.com',
			'https://*.clerk.com',
			'https://*.clerk.accounts.dev',
			'https://challenges.cloudflare.com',
			'https://js.stripe.com',
			'https://*.js.stripe.com',
			'https://hooks.stripe.com',
			'https://cloudflare-turnstile.com',
			'https://*.cloudflare-turnstile.com',
			'https://www.googletagmanager.com',
			'https://www.googletagmanager.com/gtag/js',
			'https://*.beswib.com',
			'https://clerk.beswib.com',
			'https://*.paypal.com',
			'https://paypalobjects.com',
			'https://*.paypalobjects.com',
			'https://cdnjs.cloudflare.com',
			'https://umami.wadefade.fr',
		].join(' ')

		const imgSrc = [
			"'self'",
			'https://img.clerk.com',
			'https://challenges.cloudflare.com',
			'data:',
			'https://images.unsplash.com',
			'https://loremflickr.com',
			'https://picsum.photos',
			'https://cdnjs.cloudflare.com',
			'https://paypalobjects.com',
			'https://*.paypalobjects.com',
			'https://www.paypalobjects.com',
			'https://*.paypal.com',
			'https://www.paypal.com',
			'https://googleads.g.doubleclick.net',
			'https://www.google.com',
			'https://www.google-analytics.com',
			'https://www.facebook.com',
			'https://px.ads.linkedin.com',
		].join(' ')

		const formAction = [
			"'self'",
			'https://www.paypal.com',
			'https://www.sandbox.paypal.com',
			'https://*.paypal.com',
			'https://paypalobjects.com',
			'https://*.paypalobjects.com',
		].join(' ')

		const csp = [
			`default-src 'self'`,
			`script-src ${scriptSrc}`,
			`object-src 'none'`,
			`frame-src ${frameSrc}`,
			`frame-ancestors 'none'`,
			`connect-src ${connectSrc}`,
			`img-src ${imgSrc}`,
			`style-src 'self' 'unsafe-inline'`,
			`worker-src 'self' blob:`,
			`form-action ${formAction}`,
			`base-uri 'self'`,
			`manifest-src 'self'`,
		].join('; ')

		return [
			{
				source: '/(.*)',
				headers: [
					{
						value: 'nosniff',
						key: 'X-Content-Type-Options',
					},
					{
						value: 'DENY',
						key: 'X-Frame-Options',
					},
					{
						value: 'max-age=63072000; includeSubDomains; preload',
						key: 'Strict-Transport-Security',
					},
					{
						value: 'strict-origin-when-cross-origin',
						key: 'Referrer-Policy',
					},
					{
						value: csp,
						key: 'Content-Security-Policy',
					},
					{
						value: '1; mode=block',
						key: 'X-XSS-Protection',
					},
					{
						value: 'same-origin',
						key: 'Cross-Origin-Embedder-Policy',
					},
					{
						value: 'same-origin',
						key: 'Cross-Origin-Opener-Policy',
					},
				],
			},
		]
	},
	experimental: {
		serverActions: {
			bodySizeLimit: '10mb',
		},
	},
}

export default withSentryConfig(nextConfig, {
	// For all available options, see:
	// https://www.npmjs.com/package/@sentry/webpack-plugin#options

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,
	// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	tunnelRoute: '/monitoring',

	// Only print logs for uploading source maps in CI
	silent: !Boolean(process.env.CI),

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	project: 'beswib',

	org: 'neova-s5',

	// Automatically tree-shake Sentry logger statements to reduce bundle size
	disableLogger: true,
})
