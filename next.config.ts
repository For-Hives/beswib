import type { NextConfig } from 'next'

import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
	trailingSlash: true,
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'images.unsplash.com' },
			{ protocol: 'https', hostname: 'loremflickr.com' },
			{ protocol: 'https', hostname: 'picsum.photos' },
			{ protocol: 'https', hostname: '*.andy-cinquin.fr' },
			{ protocol: 'https', hostname: '*.beswib.com' },
		],
	},
	async headers() {
		const scriptSrc = [
			"'self'",
			"'unsafe-inline'",
			"'unsafe-eval'",
			'wasm-unsafe-eval',
			'https://www.paypal.com',
			'https://www.sandbox.paypal.com',
			'https://*.clerk.accounts.dev',
			'https://clerk.com',
			'https://challenges.cloudflare.com',
			'https://umami.wadefade.fr',
			'https://browser.sentry-cdn.com',
			'https://*.ingest.sentry.io',
		].join(' ')

		const connectSrc = [
			"'self'",
			'https://api-m.sandbox.paypal.com',
			'https://api-m.paypal.com',
			'https://www.sandbox.paypal.com',
			'https://www.paypal.com',
			'https://*.clerk.accounts.dev',
			'https://clerk.com',
			'https://umami.wadefade.fr',
			'https://*.ingest.sentry.io',
			'https://sentry.io',
		].join(' ')

		const frameSrc = [
			'https://www.paypal.com',
			'https://www.sandbox.paypal.com',
			'https://*.clerk.accounts.dev',
			'https://clerk.com',
			'https://challenges.cloudflare.com',
		].join(' ')

		const csp = [
			`default-src 'self'`,
			`script-src ${scriptSrc}`,
			`object-src 'none'`,
			`frame-src ${frameSrc}`,
			`connect-src ${connectSrc}`,
			`img-src 'self' https://img.clerk.com data:`,
			`style-src 'self' 'unsafe-inline'`,
			`worker-src 'self' blob:`,
			`form-action 'self'`,
		].join('; ')

		return [
			{
				source: '/(.*)',
				headers: [
					{
						value: 'noindex, nofollow, noarchive, nosnippet, noimageindex, nocache',
						key: 'X-Robots-Tag',
					},
					{
						value: 'nosniff',
						key: 'X-Content-Type-Options',
					},
					{
						value: csp,
						key: 'Content-Security-Policy',
					},
					{
						value: csp,
						key: 'Content-Security-Policy-Report-Only',
					},
				],
			},
		]
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
	silent: !process.env.CI,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	project: 'beswib',

	org: 'neova-s5',

	// Automatically tree-shake Sentry logger statements to reduce bundle size
	disableLogger: true,
})
