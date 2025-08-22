// Export all SEO utilities and components
export * from './constants/seo-translations'
export * from './utils/seo-generators'
export * from './metadata-generators'
export * from './components/StructuredData'

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
	generateEventStructuredData,
} from './utils/seo-generators'

export {
	StructuredData,
	OrganizationSchema,
	WebsiteSchema,
	EventSchema,
	BreadcrumbSchema,
	FAQSchema,
	ServiceSchema,
} from './components/StructuredData'
