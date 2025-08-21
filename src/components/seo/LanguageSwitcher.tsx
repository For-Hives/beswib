import Link from 'next/link'
import { Globe } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'

interface LanguageSwitcherProps {
  currentLocale: Locale
  currentPath: string
  className?: string
}

// Configuration des langues avec leurs noms natifs
const languages = {
  en: { name: 'English', native: 'English', flag: '🇺🇸' },
  fr: { name: 'French', native: 'Français', flag: '🇫🇷' },
  de: { name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  es: { name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  it: { name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  nl: { name: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
  pl: { name: 'Polish', native: 'Polski', flag: '🇵🇱' },
  sv: { name: 'Swedish', native: 'Svenska', flag: '🇸🇪' },
  ko: { name: 'Korean', native: '한국어', flag: '🇰🇷' }
}

export default function LanguageSwitcher({ currentLocale, currentPath, className = '' }: LanguageSwitcherProps) {
  // Extraire le chemin sans la langue
  const pathWithoutLocale = currentPath.replace(`/${currentLocale}`, '') || '/'
  
  return (
    <div className={`relative group ${className}`}>
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-accent/10 transition-colors"
        aria-label="Select language"
        aria-expanded="false"
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{languages[currentLocale].native}</span>
        <span className="sm:hidden">{languages[currentLocale].flag}</span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground px-3 py-2 border-b border-border">
            Select Language / Choisir la langue
          </div>
          
          <div className="py-2 space-y-1">
            {Object.entries(languages).map(([code, lang]) => {
              const isCurrent = code === currentLocale
              const href = code === 'en' ? pathWithoutLocale : `/${code}${pathWithoutLocale}`
              
              return (
                <Link
                  key={code}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isCurrent
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-accent/10 text-foreground'
                  }`}
                  lang={code}
                  hreflang={code}
                  rel={isCurrent ? undefined : 'alternate'}
                  aria-current={isCurrent ? 'true' : undefined}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{lang.native}</div>
                    <div className="text-xs text-muted-foreground">{lang.name}</div>
                  </div>
                  {isCurrent && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant alternatif pour les petits écrans (dropdown)
export function LanguageSwitcherMobile({ currentLocale, currentPath }: LanguageSwitcherProps) {
  const pathWithoutLocale = currentPath.replace(`/${currentLocale}`, '') || '/'
  
  return (
    <div className="flex flex-wrap gap-2 p-4 border-t border-border">
      <div className="text-xs font-medium text-muted-foreground w-full mb-2">
        Language / Langue
      </div>
      
      {Object.entries(languages).map(([code, lang]) => {
        const isCurrent = code === currentLocale
        const href = code === 'en' ? pathWithoutLocale : `/${code}${pathWithoutLocale}`
        
        return (
          <Link
            key={code}
            href={href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              isCurrent
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:bg-accent/10'
            }`}
            lang={code}
            hreflang={code}
            rel={isCurrent ? undefined : 'alternate'}
            aria-current={isCurrent ? 'true' : undefined}
          >
            <span>{lang.flag}</span>
            <span className="text-sm font-medium">{lang.native}</span>
          </Link>
        )
      })}
    </div>
  )
}