// Export all SEO utilities and components
export * from './constants/seo-translations'
export { default as seoLocales } from './constants/seo-locales.json'
export * from './utils/seo-generators'
export * from './metadata-generators'

// Convenience re-exports for common use cases
export {
	generateBaseMetadata,
	generateHomeMetadata,
	generateEventsMetadata,
	generateEventMetadata,
	generateMarketplaceMetadata,
	generateLegalMetadata,
	generateFAQMetadata,
	generateErrorMetadata,
} from './metadata-generators'

export {
	generateEventKeywords,
	generateEventTitle,
	generateEventDescription,
	generateOGImageConfig,
	generateCanonicalUrl,
	generateAlternateLanguages,
	generateDashboardAlternateLanguages,
} from './utils/seo-generators'
