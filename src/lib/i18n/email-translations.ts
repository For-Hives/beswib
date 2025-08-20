/**
 * EMAIL TRANSLATIONS SYSTEM (i18n) 📧
 * =================================== ✨
 *
 * This file provides type-safe email translations for server-side email rendering.
 * It works with React Email (Resend) and server actions.
 *
 * FEATURES: 🌟
 * - Full TypeScript type safety
 * - Automatic fallback to English if translation missing
 * - Deep type inference from locales.json structure
 * - Optimized for server-side email rendering
 */

import { type Locale } from './config'
import constantsLocales from '@/constants/locales.json'

// ==========================================
// TYPE DEFINITIONS 🧐
// ==========================================

// Extract the email translations structure from locales.json
type EmailTranslationsContent = (typeof constantsLocales)[keyof typeof constantsLocales]['emails']

// Define the full structure we expect
export interface EmailTranslations {
	layout: {
		copyright: string
	}
	welcome: {
		title: string
		preheader: string
		body1: string
		heroSubtitle: string
		cta: string
		nextStepsTitle: string
		nextStep1: string
		nextStep2: string
		nextStep3: string
		help: string
		steps: {
			marketplace: {
				title: string
				description: string
			}
			profile: {
				title: string
				description: string
			}
			sell: {
				title: string
				description: string
			}
			community: {
				title: string
				description: string
			}
		}
		quickLinks: {
			support: {
				title: string
				description: string
			}
			guide: {
				title: string
				description: string
			}
			events: {
				title: string
				description: string
			}
		}
		footer: {
			happyRunning: string
			team: string
			usefulLinks: string
			managePreferences: string
			unsubscribe: string
			learnMore: string
			platformDescription: string
		}
	}
	bibApproval: {
		subject: string
		greeting: string
		mainMessage: string
		canNowSell: string
		approvalDetails: string
		bibDetails: string
		event: string
		date: string
		location: string
		distance: string
		category: string
		price: string
		organizerValidation: string
		approvedBy: string
		nextSteps: string
		step1: string
		step2: string
		step3: string
		step4: string
		sellNowButton: string
		helpText: string
		helpDescription: string
		contactSupport: string
		footer: string
		teamSignature: string
		congratulations: string
	}
	purchaseApproval: {
		subject: string
		greeting: string
		mainMessage: string
		readyToRun: string
		validationDetails: string
		purchaseDetails: string
		event: string
		date: string
		location: string
		distance: string
		category: string
		pricePaid: string
		orderId: string
		organizerValidation: string
		validatedBy: string
		finalSteps: string
		step1: string
		step2: string
		step3: string
		step4: string
		viewEventButton: string
		preparationTips: string
		tip1: string
		tip2: string
		tip3: string
		helpText: string
		helpDescription: string
		contactSupport: string
		footer: string
		teamSignature: string
		congratulations: string
	}
	purchaseConfirmation: {
		subject: string
		title: string
		subtitle: string
		purchaseDetails: string
		event: string
		category: string
		distance: string
		date: string
		location: string
		seller: string
		orderId: string
		paymentSummary: string
		bibPrice: string
		processingFee: string
		included: string
		totalPaid: string
		congratulations: string
		nextSteps: string
		step1: string
		step2: string
		step3: string
		step4: string
		ourSite: string
		contact: string
		dashboard: string
		privacy: string
		tagline: string
	}
	saleConfirmation: {
		subject: string
		title: string
		subtitle: string
		saleDetails: string
		event: string
		date: string
		location: string
		buyer: string
		orderId: string
		financialBreakdown: string
		salePrice: string
		platformFee: string
		totalReceived: string
		congratulations: string
		nextSteps: string
		step1: string
		step2: string
		step3: string
		ourSite: string
		contact: string
		dashboard: string
		privacy: string
		tagline: string
	}
	waitlistAlert: {
		subject: string
		title: string
		subtitle: string
		urgencyMessage: string
		eventDetails: string
		event: string
		category: string
		date: string
		location: string
		price: string
		seller: string
		personalMessage: string
		ctaButton: string
		quickActions: string
		browseOtherEvents: string
		manageDashboard: string
		unsubscribe: string
		ourSite: string
		contact: string
		dashboard: string
		privacy: string
		tagline: string
	}
	verifiedEmail: {
		subject: string
		title: string
		greeting: string
		codeIntro: string
		expires: string
		ignore: string
		regards: string
		team: string
	}
	saleAlert: {
		title: string
		preheader: string
		body: string
		order: string
		bib: string
		amount: string
	}
	contact: {
		title: string
		preheader: string
		from: string
		email: string
		anonymous: string
		na: string
	}
}

// ==========================================
// MAIN FUNCTION: getEmailTranslations ✨
// ==========================================

/**
 * Get type-safe email translations for the specified locale.
 * 
 * @param locale - The locale code (e.g., 'en', 'fr', 'es')
 * @param defaultLocale - Fallback locale if requested locale not found
 * @returns Fully typed email translations object
 */
export function getEmailTranslations(
	locale: Locale | string,
	defaultLocale: Locale = 'en'
): EmailTranslations {
	// Type-safe access to constantsLocales
	const typedLocales = constantsLocales as Record<string, { emails: EmailTranslations }>
	
	// Get the requested locale's translations
	let emailTranslations = typedLocales[locale]?.emails
	
	// Fallback to default locale if not found
	if (!emailTranslations) {
		emailTranslations = typedLocales[defaultLocale]?.emails
	}
	
	// Final fallback to English if default locale not found
	if (!emailTranslations) {
		emailTranslations = typedLocales['en']?.emails
	}
	
	// Last resort fallback with empty strings
	if (!emailTranslations) {
		throw new Error(`No email translations found for locale: ${locale}`)
	}
	
	return emailTranslations
}

// ==========================================
// HELPER FUNCTION: getEmailText ✨
// ==========================================

/**
 * Get a specific email translation text with type safety and fallback.
 * 
 * @param locale - The locale code
 * @param path - Dot-notation path to the translation (e.g., 'welcome.title')
 * @param fallback - Fallback text if translation not found
 * @returns The translated text or fallback
 */
export function getEmailText(
	locale: Locale | string,
	path: string,
	fallback: string = ''
): string {
	try {
		const translations = getEmailTranslations(locale)
		
		// Navigate the path (e.g., 'welcome.title' -> translations.welcome.title)
		const keys = path.split('.')
		let value: any = translations
		
		for (const key of keys) {
			value = value?.[key]
		}
		
		return typeof value === 'string' ? value : fallback
	} catch {
		return fallback
	}
}

// ==========================================
// UTILITY TYPES FOR COMPONENT PROPS ✨
// ==========================================

// Helper type to get deep paths from EmailTranslations
type PathImpl<T, Key extends keyof T> = Key extends string
	? T[Key] extends Record<string, any>
		? T[Key] extends ArrayLike<any>
			? Key | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>>}`
			: Key | `${Key}.${PathImpl<T[Key], keyof T[Key]>}`
		: Key
	: never

type Path<T> = PathImpl<T, keyof T> | keyof T

// Email translation path type for autocompletion
export type EmailTranslationPath = Path<EmailTranslations>

// Props type for email components
export interface EmailComponentProps {
	locale?: Locale | string
}

// ==========================================
// LEGACY COMPATIBILITY LAYER ✨
// ==========================================

/**
 * Legacy compatibility function that matches the existing getTranslations signature
 * but provides type-safe email translations.
 * 
 * @deprecated Use getEmailTranslations instead for better type safety
 */
export function getTranslations(
	locale: Locale | string,
	localesData: typeof constantsLocales
): { emails: EmailTranslations } & Record<string, any> {
	const emailTranslations = getEmailTranslations(locale)
	
	// Return in the expected format for backward compatibility
	return {
		emails: emailTranslations,
		// Add other fields from the locales if they exist
		...((localesData[locale as keyof typeof localesData] || localesData.en) as any)
	}
}
