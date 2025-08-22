# SEO Architecture Migration Guide

This guide explains how to migrate from the old SEO system to the new centralized architecture.

## 🚀 Benefits of the New Architecture

- **Centralized translations** for all 9 supported languages
- **Type-safe SEO generation** with proper TypeScript support
- **Consistent metadata** across all pages
- **Next.js 13+ App Router optimized** with proper `generateMetadata` usage
- **Clean separation of concerns** between translations, utilities, and metadata
- **Reusable structured data components**

## 📁 New Structure

```
src/lib/seo/
├── constants/
│   └── seo-translations.ts    # All SEO text content for 9 languages
├── utils/
│   └── seo-generators.ts      # Utility functions for generating SEO content
├── components/
│   └── StructuredData.tsx     # JSON-LD structured data components
├── metadata-generators.ts     # Next.js Metadata generators
├── index.ts                   # Exports everything
└── MIGRATION_GUIDE.md         # This file
```

## 🔄 Migration Steps

### 1. Update Page Metadata Generation

**Before (Old approach):**

```tsx
// page.tsx
import { getEventMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({ params }: { params: { locale: Locale; id: string } }) {
	const event = await getEvent(params.id)
	return getEventMetadata(params.locale, event) // Legacy function
}
```

**After (New approach):**

```tsx
// page.tsx
import { generateEventMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: { locale: Locale; id: string } }) {
	const event = await getEvent(params.id)
	return generateEventMetadata(params.locale, event) // Modern function
}
```

### 2. Replace SEO Components

**Before (Old EventPageSEO):**

```tsx
import { EventPageSEO } from '@/components/seo/EventPageSEO'
;<EventPageSEO event={event} organizer={organizer} locale={locale} />
```

**After (New StructuredData):**

```tsx
import { StructuredData } from '@/lib/seo'
;<StructuredData
	locale={locale}
	type="event"
	event={event}
	organizer={organizer}
	breadcrumbs={[
		{ name: 'Home', item: '/' },
		{ name: 'Events', item: '/events' },
		{ name: event.name, item: `/events/${event.id}` },
	]}
/>
```

### 3. Use Centralized Functions

**Available Functions:**

- `generateHomeMetadata(locale)` - Home page metadata
- `generateEventsMetadata(locale)` - Events listing page
- `generateEventMetadata(locale, event)` - Single event page
- `generateMarketplaceMetadata(locale)` - Marketplace page
- `generateLegalMetadata(locale, pageType, pageName)` - Legal pages
- `generateFAQMetadata(locale)` - FAQ page
- `generateErrorMetadata(locale, errorType)` - Error pages

**Available Utilities:**

- `generateEventKeywords(locale, event)` - SEO keywords
- `generateEventTitle(locale, event)` - Page title
- `generateEventDescription(locale, event)` - Meta description
- `generateCanonicalUrl(locale, path)` - Canonical URLs
- `generateAlternateLanguages(path)` - Alternate language links

## 📝 Examples by Page Type

### Home Page

```tsx
// app/[locale]/page.tsx
import { generateHomeMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: { locale: Locale } }) {
	return generateHomeMetadata(params.locale)
}

export default function HomePage() {
	return (
		<>
			<StructuredData locale={params.locale} type="home" />
			{/* Your page content */}
		</>
	)
}
```

### Events Listing

```tsx
// app/[locale]/events/page.tsx
import { generateEventsMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: { locale: Locale } }) {
	return generateEventsMetadata(params.locale)
}
```

### Single Event

```tsx
// app/[locale]/events/[id]/page.tsx
import { generateEventMetadata, StructuredData } from '@/lib/seo'

export async function generateMetadata({ params }: { params: { locale: Locale; id: string } }) {
	const event = await getEvent(params.id)
	return generateEventMetadata(params.locale, event)
}

export default function EventPage({ params }: { params: { locale: Locale; id: string } }) {
	const event = await getEvent(params.id)
	const organizer = await getOrganizer(event.organizer)

	return (
		<>
			<StructuredData
				locale={params.locale}
				type="event"
				event={event}
				organizer={organizer}
				breadcrumbs={[
					{ name: 'Home', item: '/' },
					{ name: 'Events', item: '/events' },
					{ name: event.name, item: `/events/${event.id}` },
				]}
			/>
			{/* Your page content */}
		</>
	)
}
```

### Legal Pages

```tsx
// app/[locale]/legals/terms/page.tsx
import { generateLegalMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: { locale: Locale } }) {
	return generateLegalMetadata(params.locale, 'terms', 'Terms of Service')
}
```

### FAQ Page

```tsx
// app/[locale]/faq/page.tsx
import { generateFAQMetadata, StructuredData } from '@/lib/seo'

export async function generateMetadata({ params }: { params: { locale: Locale } }) {
	return generateFAQMetadata(params.locale)
}

export default function FAQPage({ params }: { params: { locale: Locale } }) {
	const faqs = await getFAQs(params.locale)

	return (
		<>
			<StructuredData locale={params.locale} type="faq" faqs={faqs} />
			{/* Your page content */}
		</>
	)
}
```

## 🗑️ Files to Remove After Migration

Once migration is complete, you can remove these legacy files:

- `src/lib/seo/metadata.ts` (deprecated)
- `src/lib/seo/legalMetadata.ts` (deprecated)
- `src/components/seo/EventPageSEO.tsx` (replaced by StructuredData)
- `src/components/seo/EventSchema.tsx` (replaced by StructuredData)
- `src/components/seo/SocialMeta.tsx` (replaced by metadata generators)

## 🎯 Benefits After Migration

1. **Consistency**: All 9 languages have the same SEO structure
2. **Maintainability**: Central location for all SEO translations
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Performance**: Optimized for Next.js 13+ App Router
5. **SEO Best Practices**: Following latest Next.js and search engine guidelines
6. **Developer Experience**: Clear, documented API with examples

## ⚠️ Important Notes

- The old functions are kept for backward compatibility but marked as deprecated
- New Event model is used - legacy events are automatically converted
- All OG images use placeholder until the image generation system is ready
- Structured data follows Schema.org best practices
- All metadata includes proper canonical URLs and alternate language links

## 🔧 Testing Your Migration

1. Check that all pages generate proper metadata in the browser dev tools
2. Verify JSON-LD structured data with [Google's Rich Results Test](https://search.google.com/test/rich-results)
3. Test that all 9 languages have complete translations
4. Ensure canonical URLs and alternate language links are correct
5. Validate Open Graph tags with [Facebook's Sharing Debugger](https://developers.facebook.com/tools/debug/)
