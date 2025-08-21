import type { MetadataRoute } from 'next'
import type { Locale } from '@/lib/i18n/config'
import { generateLocaleParams } from '@/lib/generation/staticParams'
import { fetchAllEvents } from '@/services/event.services'

// Configuration des langues supportées
const supportedLocales: Locale[] = ['en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'ro', 'ko']

// Pages statiques principales
const staticPages = [
  '',
  'events',
  'marketplace',
  'faq',
  'contact',
  'legals/terms',
  'legals/privacy',
  'legals/cookies',
  'legals/legal-notice'
]

// Priorités SEO pour différentes pages
const pagePriorities = {
  '': 1.0,           // Page d'accueil
  'events': 0.9,     // Liste des événements
  'marketplace': 0.8, // Marketplace
  'faq': 0.6,        // FAQ
  'contact': 0.5,    // Contact
  'legals/terms': 0.3, // Conditions
  'legals/privacy': 0.3, // Confidentialité
  'legals/cookies': 0.3, // Cookies
  'legals/legal-notice': 0.3 // Mentions légales
}

// Fréquences de mise à jour
const changeFreq = {
  '': 'daily',
  'events': 'hourly',
  'marketplace': 'hourly',
  'faq': 'weekly',
  'contact': 'monthly',
  'legals/terms': 'monthly',
  'legals/privacy': 'monthly',
  'legals/cookies': 'monthly',
  'legals/legal-notice': 'monthly'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = []
  const baseUrl = 'https://beswib.com'
  
  try {
    // Récupérer tous les événements pour les inclure dans le sitemap
    const allEvents = await fetchAllEvents()
    
    // Générer les entrées pour chaque langue et page
    for (const locale of supportedLocales) {
      // Pages statiques
      for (const page of staticPages) {
        const url = page === '' ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}/${page}`
        const lastModified = new Date()
        
        sitemap.push({
          url,
          lastModified,
          changeFrequency: changeFreq[page as keyof typeof changeFreq] as any,
          priority: pagePriorities[page as keyof typeof pagePriorities] || 0.5,
          alternates: {
            languages: Object.fromEntries(
              supportedLocales.map(loc => [
                loc,
                page === '' ? `${baseUrl}/${loc}` : `${baseUrl}/${loc}/${page}`
              ])
            )
          }
        })
      }
      
      // Pages d'événements dynamiques
      if (allEvents && allEvents.length > 0) {
        for (const event of allEvents) {
          const eventUrl = `${baseUrl}/${locale}/events/${event.id}`
          const eventLastModified = event.updatedAt ? new Date(event.updatedAt) : new Date()
          
          sitemap.push({
            url: eventUrl,
            lastModified: eventLastModified,
            changeFrequency: 'daily',
            priority: 0.7,
            alternates: {
              languages: Object.fromEntries(
                supportedLocales.map(loc => [
                  loc,
                  `${baseUrl}/${loc}/events/${event.id}`
                ])
              )
            }
          })
        }
      }
    }
    
    // Ajouter des pages spéciales
    sitemap.push({
      url: `${baseUrl}/sitemap.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.1
    })
    
    sitemap.push({
      url: `${baseUrl}/robots.txt`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.1
    })
    
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error)
    
    // En cas d'erreur, générer au moins les pages statiques
    for (const locale of supportedLocales) {
      for (const page of staticPages) {
        const url = page === '' ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}/${page}`
        sitemap.push({
          url,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.5
        })
      }
    }
  }
  
  return sitemap
}