import { withSentryConfig } from '@sentry/nextjs/config'
import type { NextConfig } from 'next'

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
		// Phase 1: Basic security headers that shouldn't interfere with PayPal
		await Promise.resolve() // Satisfy async requirement
		return [
			{
				source: '/(.*)',
				headers: [
					{
						value: 'nosniff',
						key: 'X-Content-Type-Options',
					},
					{
						value: 'strict-origin-when-cross-origin',
						key: 'Referrer-Policy',
					},
					{
						value: '1; mode=block',
						key: 'X-XSS-Protection',
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

// Since Sentry 11 the source maps are uploaded by the `sentry` CLI package, which reports its own usage and errors
// to Sentry: a channel @sentry/cli did not have, and one the `telemetry` option of withSentryConfig does not reach.
// It stays off, as before the upgrade, unless the build environment sets the variable to something else.
process.env.SENTRY_CLI_NO_TELEMETRY ??= '1'

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

	// Tree-shake the Sentry SDK debug statements to reduce bundle size. Since Sentry 11 this also applies to
	// Turbopack builds: while it is on, `debug: true` in the Sentry config files prints nothing.
	bundleSizeOptimizations: { excludeDebugStatements: true },
})
