// Export all SEO utilities and components

export * from './constants/opengraph-config'
export { default as seoLocales } from './constants/seo-locales.json'
export * from './constants/seo-translations'
export * from './metadata-generators'
// Convenience re-exports for common use cases
export {
	generateAdminMetadata,
	generateAuthMetadata,
	generateBaseMetadata,
	generateDashboardMetadata,
	generateErrorMetadata,
	generateEventMetadata,
	generateEventsMetadata,
	generateFAQMetadata,
	generateHomeMetadata,
	generateLegalMetadata,
	generateMarketplaceMetadata,
	generateProfileMetadata,
} from './metadata-generators'
export * from './utils/seo-generators'

export {
	generateAlternateLanguages,
	generateCanonicalUrl,
	generateEventDescription,
	generateEventKeywords,
	generateEventTitle,
	generateOGImageConfig,
} from './utils/seo-generators'
