// Configuration for OpenGraph images across all pages
export const OG_IMAGE_CONFIG = {
	unauthorized: {
		title: 'Access Denied',
		secondary: 'You do not have permission to access this page',
		path: '/auth/unauthorized',
		alt: 'Beswib Unauthorized Access Open Graph Image',
	},

	terms: {
		title: 'title',
		secondary: 'descriptionOG',
		path: '/legals/terms',
		alt: 'Beswib Terms Open Graph Image',
	},
	signUp: {
		title: 'Sign Up',
		secondary: 'Join Beswib and start buying or selling race bibs safely',
		path: '/auth/sign-up',
		alt: 'Beswib Sign Up Open Graph Image',
	},

	// Auth pages
	signIn: {
		title: 'Sign In',
		secondary: 'Access your Beswib dashboard and manage your race bibs',
		path: '/auth/sign-in',
		alt: 'Beswib Sign In Open Graph Image',
	},
	purchaseSuccess: {
		title: 'success.title',
		secondary: 'success.thanks',
		path: '/purchase/success',
		alt: 'Beswib Purchase Success Open Graph Image',
	},

	profile: {
		title: 'profile.title',
		secondary: 'profile.description',
		path: '/profile',
		alt: 'Beswib Profile Open Graph Image',
	},
	privacyPolicy: {
		title: 'title',
		secondary: 'descriptionOG',
		path: '/legals/privacy-policy',
		alt: 'Beswib Privacy Policy Open Graph Image',
	},

	notFound: {
		title: 'Page Not Found',
		secondary: 'The page you are looking for does not exist',
		path: '', // Page racine not-found
		alt: 'Beswib Page Not Found Open Graph Image',
	},

	marketplaceItem: {
		title: 'title',
		secondary: 'ctaOG',
		path: '/marketplace/[id]',
		dynamic: true,
		alt: 'Beswib Marketplace Item Open Graph Image',
	},
	// Marketplace
	marketplace: {
		title: 'title',
		secondary: 'descriptionOG',
		path: '/marketplace',
		alt: 'Beswib Marketplace Open Graph Image',
	},
	// Legal pages
	legalNotice: {
		title: 'title',
		secondary: 'descriptionOG',
		path: '/legals/legal-notice',
		alt: 'Beswib Legal Notice Open Graph Image',
	},
	// Main pages
	home: {
		title: 'OG.Main',
		secondary: 'OG.Secondary',
		path: '/',
		alt: 'Beswib Open Graph Image',
	},

	forgotPassword: {
		title: 'Forgot Password',
		secondary: 'Reset your Beswib account password securely',
		path: '/auth/forgot-password',
		alt: 'Beswib Forgot Password Open Graph Image',
	},
	faq: {
		title: 'title',
		secondary: 'descriptionOG',
		path: '/faq',
		alt: 'Beswib FAQ Open Graph Image',
	},
	// Events
	events: {
		title: 'events.OG.titleOG',
		secondary: 'events.OG.descriptionOG',
		path: '/events',
		alt: 'Beswib Events Open Graph Image',
	},

	eventDetail: {
		title: 'event.title',
		secondary: 'ctaOG',
		path: '/events/[id]',
		dynamic: true,
		alt: 'Beswib Event Detail Open Graph Image',
	},
	// Error pages
	error: {
		title: 'Something went wrong',
		secondary: 'An error occurred. Please try again or contact support.',
		path: '/error',
		alt: 'Beswib Error Page Open Graph Image',
	},
	dataDeletion: {
		title: 'title',
		secondary: 'descriptionOG',
		path: '/legals/data-deletion',
		alt: 'Beswib Data Deletion Open Graph Image',
	},
	// Dashboard & Profile
	dashboard: {
		title: 'dashboard.title',
		secondary: 'dashboard.chooseHowToUse',
		path: '/dashboard',
		alt: 'Beswib Dashboard Open Graph Image',
	},

	// Other pages
	contact: {
		title: 'title',
		secondary: 'descriptionOG',
		path: '/contact',
		alt: 'Beswib Contact Open Graph Image',
	},
	// Admin
	admin: {
		title: 'dashboard.title',
		secondary: 'dashboard.subtitle',
		path: '/admin',
		alt: 'Beswib Admin Dashboard Open Graph Image',
	},
} as const

// Type for page paths
export type OGPagePath = keyof typeof OG_IMAGE_CONFIG

// Helper function to get OG image config for a specific page
export function getOGImageConfig(pagePath: OGPagePath) {
	return OG_IMAGE_CONFIG[pagePath]
}

// Helper function to get all available OG image paths
export function getAllOGImagePaths(): string[] {
	return Object.values(OG_IMAGE_CONFIG).map(config => config.path)
}

// Helper function to check if a page has dynamic OG image generation
export function isDynamicOGImage(pagePath: OGPagePath): boolean {
	return OG_IMAGE_CONFIG[pagePath].dynamic === true
}
