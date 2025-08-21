import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  locale: Locale
  className?: string
}

export default function Breadcrumbs({ items, locale, className = '' }: BreadcrumbsProps) {
  if (items.length === 0) return null
  
  return (
    <nav
      className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {/* Accueil */}
        <li>
          <Link
            href={`/${locale}`}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        
        {/* Séparateur */}
        {items.length > 0 && (
          <li>
            <ChevronRight className="h-4 w-4" />
          </li>
        )}
        
        {/* Items de navigation */}
        {items.map((item, index) => (
          <li key={index}>
            {item.current ? (
              <span
                className="text-foreground font-medium"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
            
            {/* Séparateur (sauf pour le dernier item) */}
            {index < items.length - 1 && (
              <ChevronRight className="h-4 w-4 ml-1" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Composant spécialisé pour les pages d'événements
export function EventBreadcrumbs({ 
  eventName, 
  locale, 
  className = '' 
}: { 
  eventName: string
  locale: Locale
  className?: string 
}) {
  const items: BreadcrumbItem[] = [
    {
      label: 'Events',
      href: `/${locale}/events`
    },
    {
      label: eventName,
      current: true
    }
  ]
  
  return <Breadcrumbs items={items} locale={locale} className={className} />
}

// Composant spécialisé pour les pages de marketplace
export function MarketplaceBreadcrumbs({ 
  locale, 
  className = '' 
}: { 
  locale: Locale
  className?: string 
}) {
  const items: BreadcrumbItem[] = [
    {
      label: 'Marketplace',
      current: true
    }
  ]
  
  return <Breadcrumbs items={items} locale={locale} className={className} />
}

// Composant spécialisé pour les pages légales
export function LegalBreadcrumbs({ 
  pageName, 
  locale, 
  className = '' 
}: { 
  pageName: string
  locale: Locale
  className?: string 
}) {
  const items: BreadcrumbItem[] = [
    {
      label: 'Legal',
      href: `/${locale}/legals`
    },
    {
      label: pageName,
      current: true
    }
  ]
  
  return <Breadcrumbs items={items} locale={locale} className={className} />
}