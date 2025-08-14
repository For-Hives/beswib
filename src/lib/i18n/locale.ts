'use server'
import { i18n, type Locale } from './config'

/**
 * @deprecated Use getLocaleFromParams in your pages/layouts instead ⚠️
 * This function is kept for backward compatibility only 🕰️
 *
 * For SSG with [locale] routes, the locale should be extracted from route params: 📄
 *
 * @example
 * ```tsx
 * import { getLocaleFromParams } from '@/lib/i18n/localeUtils' 📥
 *
 * export default async function MyPage({ params }: { params: Promise<{ locale: string }> }) {
 *   const locale = getLocaleFromParams(await params)
 *   // ...
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function getLocale(): Promise<Locale> {
	// For SSG, we should not rely on headers/cookies 🍪
	// The locale should come from the route parameters 📄
	console.warn('getLocale() is deprecated. Use getLocaleFromParams() with route params instead.')
	return i18n.defaultLocale
}
