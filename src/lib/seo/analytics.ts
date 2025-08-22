// Google Analytics 4
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-XXXXXXXXXX'

// Google site verification
export const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION ?? 'your-google-verification-code'

// Social media configuration
export const SOCIAL_CONFIG = {
	strava: {
		url: 'https://www.strava.com/clubs/1590099?share_sig=EE3575891750401205',
		clubId: '1590099',
	},
	linkedin: {
		url: 'https://www.linkedin.com/company/beswib',
		companyId: process.env.LINKEDIN_COMPANY_ID ?? 'your-linkedin-company-id',
	},
	instagram: {
		username: 'beswib_official',
		url: 'https://www.instagram.com/beswib_official',
	},
}

// Monitoring configuration
export const MONITORING_CONFIG = {
	sentry: {
		dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? 'your-sentry-dsn',
	},
}
