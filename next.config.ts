import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

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
						key: 'X-Robots-Tag',
						value: 'noindex, nofollow, noarchive, nosnippet, noimageindex, nocache',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'Content-Security-Policy',
						value: csp,
					},
					{
						key: 'Content-Security-Policy-Report-Only',
						value: csp,
					},
				],
			},
		]
	},
}

export default withSentryConfig(nextConfig, {
	// For all available options, see:
	// https://www.npmjs.com/package/@sentry/webpack-plugin#options

	org: 'neova-s5',
	project: 'beswib',

	// Only print logs for uploading source maps in CI
	silent: !process.env.CI,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	tunnelRoute: '/monitoring',

	// Automatically tree-shake Sentry logger statements to reduce bundle size
	disableLogger: true,

	// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
	// See the following for more information:
	// https://docs.sentry.io/product/crons/
	// https://vercel.com/docs/cron-jobs
	automaticVercelMonitors: true,
})
