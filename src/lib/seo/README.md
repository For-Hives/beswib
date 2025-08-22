# 🔍 Centralized SEO Architecture

A modern, type-safe, multilingual SEO system for Beswib built with Next.js 13+ App Router best practices.

## 🌍 Supported Languages

This system supports all 9 Beswib languages:

- 🇺🇸 **English** (`en`) - Default
- 🇫🇷 **French** (`fr`)
- 🇪🇸 **Spanish** (`es`)
- 🇮🇹 **Italian** (`it`)
- 🇩🇪 **German** (`de`)
- 🇷🇴 **Romanian** (`ro`)
- 🇵🇹 **Portuguese** (`pt`)
- 🇳🇱 **Dutch** (`nl`)
- 🇰🇷 **Korean** (`ko`)

## 🚀 Quick Start

```tsx
// In your page.tsx
import { generateEventMetadata, StructuredData } from '@/lib/seo'

// Generate metadata for Next.js
export async function generateMetadata({ params }) {
	const event = await getEvent(params.id)
	return generateEventMetadata(params.locale, event)
}

// Add structured data to your page
export default function EventPage({ params }) {
	return (
		<>
			<StructuredData locale={params.locale} type="event" event={event} breadcrumbs={breadcrumbs} />
			{/* Your page content */}
		</>
	)
}
```

## 📚 API Reference

### Metadata Generators

| Function                                    | Description                 | Returns    |
| ------------------------------------------- | --------------------------- | ---------- |
| `generateBaseMetadata(locale)`              | Base metadata for all pages | `Metadata` |
| `generateHomeMetadata(locale)`              | Home page metadata          | `Metadata` |
| `generateEventsMetadata(locale)`            | Events listing page         | `Metadata` |
| `generateEventMetadata(locale, event)`      | Single event page           | `Metadata` |
| `generateMarketplaceMetadata(locale)`       | Marketplace page            | `Metadata` |
| `generateLegalMetadata(locale, type, name)` | Legal pages                 | `Metadata` |
| `generateFAQMetadata(locale)`               | FAQ page                    | `Metadata` |
| `generateErrorMetadata(locale, type)`       | Error pages                 | `Metadata` |

### Utility Functions

| Function                                      | Description                 | Returns                  |
| --------------------------------------------- | --------------------------- | ------------------------ |
| `generateEventKeywords(locale, event)`        | SEO keywords for events     | `string`                 |
| `generateEventTitle(locale, event)`           | Page title for events       | `string`                 |
| `generateEventDescription(locale, event)`     | Meta description for events | `string`                 |
| `generateCanonicalUrl(locale, path)`          | Canonical URL               | `string`                 |
| `generateAlternateLanguages(path)`            | Alternate language links    | `Record<string, string>` |
| `generateOGImageConfig(event?, customImage?)` | Open Graph image config     | `object`                 |

### Structured Data Components

| Component                | Description                            | Props                                                   |
| ------------------------ | -------------------------------------- | ------------------------------------------------------- |
| `<StructuredData />`     | Main component for all structured data | `locale, type, event?, organizer?, breadcrumbs?, faqs?` |
| `<OrganizationSchema />` | Beswib organization data               | None                                                    |
| `<WebsiteSchema />`      | Website schema                         | `locale`                                                |
| `<EventSchema />`        | Event structured data                  | `locale, event, organizer?`                             |
| `<BreadcrumbSchema />`   | Breadcrumb navigation                  | `locale, items`                                         |
| `<FAQSchema />`          | FAQ page schema                        | `faqs`                                                  |
| `<ServiceSchema />`      | Service description                    | `locale`                                                |

## 🏗️ Architecture

```
src/lib/seo/
├── constants/
│   └── seo-translations.ts    # All translations for 9 languages
├── utils/
│   └── seo-generators.ts      # Utility functions
├── components/
│   └── StructuredData.tsx     # JSON-LD components
├── metadata-generators.ts     # Next.js Metadata functions
├── index.ts                   # Main exports
├── README.md                  # This file
└── MIGRATION_GUIDE.md         # Migration guide
```

## 🎯 Key Features

### ✅ Complete Multilingual Support

- All 9 languages have identical SEO structure
- Language-specific keywords, titles, and descriptions
- Proper locale-specific Open Graph and Twitter metadata
- Automatic alternate language link generation

### ✅ Next.js 13+ App Router Optimized

- Uses `generateMetadata` API for optimal performance
- Server-side rendering compatible
- Proper caching and performance optimization

### ✅ Type Safety

- Full TypeScript support with proper interfaces
- Compile-time checking for language completeness
- IDE autocomplete for all SEO functions

### ✅ Schema.org Structured Data

- Event schema for race events
- Organization schema for Beswib
- Breadcrumb navigation schema
- FAQ schema for help pages
- Service schema for race bib transfer

### ✅ SEO Best Practices

- Canonical URLs for all pages
- Proper Open Graph and Twitter Card metadata
- Mobile-optimized meta tags
- Rich snippets support
- Search engine optimization

### ✅ Developer Experience

- Simple, intuitive API
- Comprehensive documentation
- Migration guide from legacy system
- Reusable components

## 🌐 SEO Content Structure

### Keywords by Language

Each language has specific keywords for:

- **Global keywords**: Race bibs, running, trail, triathlon, cycling
- **Race types**: Localized names for different race types
- **Actions**: Buy, sell, transfer, participate in local language

### Titles by Language

Template-based titles that include:

- Site name (Beswib)
- Page-specific content
- Location information (for events)
- Consistent branding across languages

### Descriptions by Language

Comprehensive descriptions featuring:

- Service description
- Call-to-action in local language
- Event-specific details (distance, elevation, etc.)
- Brand messaging

## 🔧 Configuration

### Adding a New Language

1. Add the locale to `@/lib/i18n/config.ts`
2. Add translations to `seo-translations.ts`:
   - `SEO_KEYWORDS[newLocale]`
   - `SEO_TITLES[newLocale]`
   - `SEO_DESCRIPTIONS[newLocale]`
3. Update utility functions if needed
4. Test all metadata generators

### Customizing SEO Content

- Edit translations in `constants/seo-translations.ts`
- Modify generation logic in `utils/seo-generators.ts`
- Update metadata templates in `metadata-generators.ts`

### Adding New Page Types

1. Create metadata generator in `metadata-generators.ts`
2. Add structured data component if needed
3. Update exports in `index.ts`
4. Add documentation

## 🧪 Testing

### Metadata Testing

```bash
# Check metadata generation
npm run dev
# Visit pages and inspect <head> in dev tools
```

### Structured Data Testing

- Use [Google's Rich Results Test](https://search.google.com/test/rich-results)
- Validate with [Schema.org validator](https://validator.schema.org/)

### Social Media Testing

- Test Open Graph with [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- Test Twitter Cards with [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## 📈 Performance

### Benefits

- Server-side metadata generation
- Optimized for Core Web Vitals
- Minimal runtime JavaScript for SEO
- Efficient caching with Next.js

### Monitoring

- Use Google Search Console for SEO performance
- Monitor Core Web Vitals in production
- Track Rich Results performance

## 🔗 Related Documentation

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

---

_Built with ❤️ for optimal SEO performance across all 9 Beswib languages_
