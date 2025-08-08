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
			'wasm-unsafe-eval',
			'https://www.paypal.com',
			'https://www.sandbox.paypal.com',
			'https://*.clerk.accounts.dev',
			'https://clerk.com',
			'https://challenges.cloudflare.com',
		].join(' ')

		const connectSrc = [
			"'self'",
			'https://api-m.sandbox.paypal.com',
			'https://api-m.paypal.com',
			'https://www.sandbox.paypal.com',
			'https://www.paypal.com',
			'https://*.clerk.accounts.dev',
			'https://clerk.com',
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

export default nextConfig
