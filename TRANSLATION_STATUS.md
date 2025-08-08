# Statut des Traductions - Projet Beswib

Ce fichier liste tous les fichiers du projet et leur statut de traduction. Un fichier est marqué comme traduit uniquement si toutes les langues sont complètement traduites et qu'aucune string non traduite n'est présente.

## Structure du Projet

### 📁 App Directory

#### Pages et Composants

- [ ] `src/app/[locale]/page.tsx`
- [ ] `src/app/[locale]/layout.tsx`
- [ ] `src/app/[locale]/globals.css`
- [ ] `src/app/[locale]/locales.json`
- [ ] `src/app/[locale]/middleware.ts`

#### Admin

- [ ] `src/app/[locale]/admin/page.tsx`
- [ ] `src/app/[locale]/admin/actions.ts`
- [ ] `src/app/[locale]/admin/locales.json`
- [ ] `src/app/[locale]/admin/loading.tsx`
- [ ] `src/app/[locale]/admin/event/create/page.tsx`
- [ ] `src/app/[locale]/admin/event/create/locales.json`
- [ ] `src/app/[locale]/admin/event/page.tsx`
- [ ] `src/app/[locale]/admin/event/locales.json`
- [ ] `src/app/[locale]/admin/organizer/create/page.tsx`
- [ ] `src/app/[locale]/admin/organizer/create/locales.json`
- [ ] `src/app/[locale]/admin/organizer/page.tsx`
- [ ] `src/app/[locale]/admin/organizer/locales.json`
- [ ] `src/app/[locale]/admin/organizer/validate/page.tsx`

#### Dashboard

- [ ] `src/app/[locale]/dashboard/page.tsx`
- [ ] `src/app/[locale]/dashboard/locales.json`
- [ ] `src/app/[locale]/dashboard/DashboardClient.tsx`
- [ ] `src/app/[locale]/dashboard/loading.tsx`
- [ ] `src/app/[locale]/dashboard/buyer/page.tsx`
- [ ] `src/app/[locale]/dashboard/buyer/locales.json`
- [ ] `src/app/[locale]/dashboard/buyer/BuyerDashboardClient.tsx`
- [ ] `src/app/[locale]/dashboard/seller/page.tsx`
- [ ] `src/app/[locale]/dashboard/seller/locales.json`
- [ ] `src/app/[locale]/dashboard/seller/SellerDashboardClient.tsx`
- [ ] `src/app/[locale]/dashboard/seller/edit-bib/[bibId]/page.tsx`
- [ ] `src/app/[locale]/dashboard/seller/edit-bib/[bibId]/EditBibClient.tsx`
- [ ] `src/app/[locale]/dashboard/seller/edit-bib/[bibId]/loading.tsx`
- [ ] `src/app/[locale]/dashboard/seller/edit-bib/[bibId]/actions.ts`
- [ ] `src/app/[locale]/dashboard/seller/sell-bib/page.tsx`
- [ ] `src/app/[locale]/dashboard/seller/sell-bib/locales.json`
- [ ] `src/app/[locale]/dashboard/seller/sell-bib/SellBibClient.tsx`
- [ ] `src/app/[locale]/dashboard/seller/request-event/page.tsx`
- [ ] `src/app/[locale]/dashboard/seller/request-event/locales.json`
- [ ] `src/app/[locale]/dashboard/seller/request-event/actions.ts`

#### Events

- [ ] `src/app/[locale]/events/page.tsx`
- [ ] `src/app/[locale]/events/locales.json`
- [ ] `src/app/[locale]/events/loading.tsx`
- [ ] `src/app/[locale]/events/EventListClient.tsx`
- [ ] `src/app/[locale]/events/[id]/page.tsx`

#### Marketplace

- [ ] `src/app/[locale]/marketplace/page.tsx`
- [ ] `src/app/[locale]/marketplace/locales.json`
- [ ] `src/app/[locale]/marketplace/[id]/page.tsx`

#### PayPal

- [ ] `src/app/[locale]/paypal/page.tsx`
- [ ] `src/app/[locale]/paypal/callback/page.tsx`
- [ ] `src/app/[locale]/paypal/callback/PayPalCallbackHandler.tsx`

#### Profile

- [ ] `src/app/[locale]/profile/page.tsx`
- [ ] `src/app/[locale]/profile/locales.json`
- [ ] `src/app/[locale]/profile/ProfileClient.tsx`
- [ ] `src/app/[locale]/profile/actions.ts`

#### Purchase

- [ ] `src/app/[locale]/purchase/actions.ts`
- [ ] `src/app/[locale]/purchase/[bibId]/page.tsx`
- [ ] `src/app/[locale]/purchase/[bibId]/locales.json`
- [ ] `src/app/[locale]/purchase/success/page.tsx`
- [ ] `src/app/[locale]/purchase/success/locales.json`
- [ ] `src/app/[locale]/purchase/success/purchaseSuccessClient.tsx`
- [ ] `src/app/[locale]/purchase/failure/page.tsx`

#### Autres Pages

- [ ] `src/app/[locale]/contact/page.tsx`
- [ ] `src/app/[locale]/contact/contact-page-client.tsx`
- [ ] `src/app/[locale]/faq/page.tsx`
- [ ] `src/app/[locale]/legals/legal-notice/page.tsx`
- [ ] `src/app/[locale]/legals/privacy-policy/page.tsx`
- [ ] `src/app/[locale]/legals/terms/page.tsx`
- [ ] `src/app/[locale]/sign-in/[[...sign-in]]/page.tsx`
- [ ] `src/app/[locale]/sitemap.xml/route.ts`
- [ ] `src/app/[locale]/unauthorized/page.tsx`

#### API Routes

- [ ] `src/app/api/lanyard/basic-texture/route.tsx`
- [ ] `src/app/api/lanyard/price/route.tsx`
- [ ] `src/app/api/webhooks/clerk/route.ts`
- [ ] `src/app/api/webhooks/paypal/route.ts`

### 📁 Components

#### Admin Components

- [ ] `src/components/admin/dashboard/AdminDashboardClient.tsx`
- [ ] `src/components/admin/dashboard/sell-bib/BibDetailsStep.tsx`
- [ ] `src/components/admin/dashboard/sell-bib/ConfirmationStep.tsx`
- [ ] `src/components/admin/dashboard/sell-bib/EventSelectionStep.tsx`
- [ ] `src/components/admin/dashboard/sell-bib/EventSelectionStep.tsx`
- [ ] `src/components/admin/dashboard/sell-bib/EventSelectionStep.tsx`
- [ ] `src/components/admin/dashboard/sell-bib/EventSelectionStep.tsx`
- [ ] `src/components/admin/dashboard/sell-bib/EventSelectionStep.tsx`
- [ ] `src/components/admin/event/AdminEventPageClient.tsx`
- [ ] `src/components/admin/event/AdminEventsPageClient.tsx`
- [ ] `src/components/admin/event/BibPickupSection.tsx`
- [ ] `src/components/admin/event/event-creation-form.tsx`
- [ ] `src/components/admin/event/EventDetailsSection.tsx`
- [ ] `src/components/admin/event/EventInformationSection.tsx`
- [ ] `src/components/admin/event/EventOptionCard.tsx`
- [ ] `src/components/admin/event/EventOptionsSection.tsx`
- [ ] `src/components/admin/event/FakerButton.tsx`
- [ ] `src/components/admin/event/OrganizerSection.tsx`
- [ ] `src/components/admin/event/types.ts`
- [ ] `src/components/admin/organizer/AdminOrganizerCreatePageClient.tsx`
- [ ] `src/components/admin/organizer/AdminOrganizersPageClient.tsx`
- [ ] `src/components/admin/organizer/AdminOrganizerValidatePageClient.tsx`
- [ ] `src/components/admin/organizer/AdminOrganizerValidatePageClient.tsx`
- [ ] `src/components/admin/organizer/AdminOrganizerValidatePageClient.tsx`
- [ ] `src/components/admin/organizer/AdminOrganizerValidatePageClient.tsx`

#### Bits Components

- [ ] `src/components/bits/SpotlightCard/SpotlightCard.tsx`

#### Calendar Components

- [ ] `src/components/calendar/CalendarEventList.tsx`
- [ ] `src/components/calendar/calendarHeader.tsx`
- [ ] `src/components/calendar/calendarMain.tsx`
- [ ] `src/components/calendar/calendarSidebar.tsx`
- [ ] `src/components/calendar/dayView.tsx`
- [ ] `src/components/calendar/eventView.tsx`
- [ ] `src/components/calendar/locales.json`
- [ ] `src/components/calendar/monthView.tsx`
- [ ] `src/components/calendar/weekView.tsx`
- [ ] `src/components/calendar/yearView.tsx`

#### Contact Components

- [ ] `src/components/contact/bento-grid.tsx`
- [ ] `src/components/contact/contact-form.tsx`

#### Dashboard Components

- [ ] `src/components/dashboard/seller/locales.json`
- [ ] `src/components/dashboard/seller/SellerProfileValidation.tsx`
- [ ] `src/components/dashboard/user-header.tsx`

#### Global Components

- [ ] `src/components/global/adminActions.ts`
- [ ] `src/components/global/AdminLinkWrapper.tsx`
- [ ] `src/components/global/DashboardDropdown.tsx`
- [ ] `src/components/global/footer.tsx`
- [ ] `src/components/global/Header.tsx`
- [ ] `src/components/global/HeaderClient.tsx`
- [ ] `src/components/global/LanguageSelector.tsx`
- [ ] `src/components/global/locales.json`
- [ ] `src/components/global/ThemeToggle.tsx`

#### Icons

- [ ] `src/components/icons/RaceTypeIcons.tsx`

#### Landing Components

- [ ] `src/components/landing/bib-stats/BibStats.tsx`
- [ ] `src/components/landing/bib-stats/BibStatsClient.tsx`
- [ ] `src/components/landing/bib-stats/locales.json`
- [ ] `src/components/landing/CardMarketSimplified.tsx`
- [x] `src/components/landing/cta/CTASection.tsx` - Utilise les traductions
- [ ] `src/components/landing/cta/CTAWithRectangle.tsx`
- [x] `src/components/landing/cta/locales.json` - Traduit dans 9 langues (en, fr, ko, es, it, de, ro, pt, nl)
- [ ] `src/components/landing/faq/FAQ.tsx`
- [ ] `src/components/landing/faq/FAQClient.tsx`
- [ ] `src/components/landing/faq/locales.json`
- [x] `src/components/landing/features/Features.tsx` - Utilise les traductions
- [x] `src/components/landing/features/locales.json` - Traduit dans 9 langues (en, fr, ko, es, it, de, ro, pt, nl)
- [x] `src/components/landing/hero/Hero.tsx` - Utilise les traductions
- [ ] `src/components/landing/hero/HeroAnimation.tsx`
- [x] `src/components/landing/hero/locales.json` - Traduit dans 9 langues (en, fr, ko, es, it, de, ro, pt, nl)
- [ ] `src/components/landing/journey-tabs/JourneyTabs.tsx`
- [ ] `src/components/landing/journey-tabs/JourneyTabsClient.tsx`
- [ ] `src/components/landing/journey-tabs/locales.json`
- [ ] `src/components/landing/MarketplaceGrid.tsx`
- [x] `src/components/landing/security-process/locales.json` - Traduit dans 9 langues (en, fr, ko, es, it, de, ro, pt, nl)
- [x] `src/components/landing/security-process/SecurityProcess.tsx` - Utilise les traductions
- [x] `src/components/landing/security-process/SecurityProcessClient.tsx` - Utilise les traductions

#### Marketplace Components

- [ ] `src/components/marketplace/ActiveFiltersBadges.tsx`
- [ ] `src/components/marketplace/CardMarket.tsx`
- [ ] `src/components/marketplace/EmptyResultsRive.tsx`
- [x] `src/components/marketplace/locales.json` - Traduit dans 9 langues (en, fr, es, it, de, ro, pt, nl, ko)
- [ ] `src/components/marketplace/MarketplaceClient.tsx`
- [ ] `src/components/marketplace/MarketplaceSidebar.tsx`
- [ ] `src/components/marketplace/offerCounter.tsx`
- [ ] `src/components/marketplace/searchbar.tsx`
- [ ] `src/components/marketplace/purchase/components/ActionButtons.tsx`
- [ ] `src/components/marketplace/purchase/components/ContentTabs.tsx`
- [ ] `src/components/marketplace/purchase/components/EventDetails.tsx`
- [ ] `src/components/marketplace/purchase/components/EventDetails.tsx`
- [ ] `src/components/marketplace/purchase/components/EventDetails.tsx`
- [ ] `src/components/marketplace/purchase/components/EventDetails.tsx`
- [ ] `src/components/marketplace/purchase/components/EventDetails.tsx`
- [ ] `src/components/marketplace/purchase/PayPalProvider.tsx`
- [ ] `src/components/marketplace/purchase/PayPalPurchaseClient.tsx`

#### PayPal Components

- [ ] `src/components/paypal/locales.json`
- [ ] `src/components/paypal/paypal-c2c.tsx`

#### Profile Components

- [ ] `src/components/profile/locales.json`
- [ ] `src/components/profile/modernRunnerForm.tsx`
- [ ] `src/components/profile/PayPalOnboarding.tsx`
- [ ] `src/components/profile/PayPalOnboardingSkeleton.tsx`

#### Providers

- [ ] `src/components/providers/QueryProvider.tsx`
- [ ] `src/components/providers/ThemeProvider.tsx`

#### UI Components

- [ ] `src/components/ui/accordion.tsx`
- [ ] `src/components/ui/alert-dialog.tsx`
- [ ] `src/components/ui/alert.tsx`
- [ ] `src/components/ui/avatar.tsx`
- [ ] `src/components/ui/badge.tsx`
- [ ] `src/components/ui/badgeAlt.tsx`
- [ ] `src/components/ui/button.tsx`
- [ ] `src/components/ui/calendar.tsx`
- [ ] `src/components/ui/card.tsx`
- [ ] `src/components/ui/checkbox.tsx`
- [ ] `src/components/ui/command.tsx`
- [ ] `src/components/ui/date-input.tsx`
- [ ] `src/components/ui/dialog.tsx`
- [ ] `src/components/ui/dropdown-menu-animated.tsx`
- [ ] `src/components/ui/dropdown-menu.tsx`
- [ ] `src/components/ui/FeatureSteps.tsx`
- [ ] `src/components/ui/file-upload-demo.tsx`
- [ ] `src/components/ui/file-upload.tsx`
- [ ] `src/components/ui/form.tsx`
- [ ] `src/components/ui/input.tsx`
- [ ] `src/components/ui/inputAlt.tsx`
- [ ] `src/components/ui/label.tsx`
- [ ] `src/components/ui/PageTransition.tsx`
- [ ] `src/components/ui/pagination.tsx`
- [ ] `src/components/ui/popover.tsx`
- [ ] `src/components/ui/PriceLanyard.tsx`
- [ ] `src/components/ui/progress.tsx`
- [ ] `src/components/ui/radial-orbital-timeline.tsx`
- [ ] `src/components/ui/radio-group.tsx`
- [ ] `src/components/ui/select-animated.tsx`
- [ ] `src/components/ui/select.tsx`
- [ ] `src/components/ui/selectAlt.tsx`
- [ ] `src/components/ui/separator.tsx`
- [ ] `src/components/ui/SimplePriceLanyard.tsx`
- [ ] `src/components/ui/skeleton.tsx`
- [ ] `src/components/ui/SkeletonBase.tsx`
- [ ] `src/components/ui/slider.tsx`
- [ ] `src/components/ui/SlidingPanel.tsx`
- [ ] `src/components/ui/table.tsx`
- [ ] `src/components/ui/tabs.tsx`
- [ ] `src/components/ui/textarea.tsx`
- [ ] `src/components/ui/textareaAlt.tsx`
- [ ] `src/components/ui/timeline.tsx`

### 📁 Guard

- [ ] `src/guard/adminGuard.ts`

### 📁 Hooks

- [ ] `src/hooks/useTheme.ts`
- [ ] `src/hooks/usePayPalDisconnect.ts`
- [ ] `src/hooks/usePayPalOnboarding.ts`
- [ ] `src/hooks/useUser.ts`

### 📁 Lib

- [ ] `src/lib/socials.ts`
- [ ] `src/lib/userValidation.ts`
- [ ] `src/lib/i18n-config.ts`
- [ ] `src/lib/globalLocales.json`
- [ ] `src/lib/bibTransformers.ts`
- [ ] `src/lib/dateUtils.ts`
- [ ] `src/lib/generateStaticParams.ts`
- [ ] `src/lib/getDictionary.ts`
- [ ] `src/lib/getLocale.ts`
- [ ] `src/lib/pocketbaseClient.ts`
- [ ] `src/lib/utils.ts`

### 📁 Models

- [ ] `src/models/event.model.ts`
- [ ] `src/models/user.model.ts`
- [ ] `src/models/bib.model.ts`
- [ ] `src/models/eventCreationRequest.model.ts`
- [ ] `src/models/eventOption.model.ts`
- [ ] `src/models/organizer.model.ts`
- [ ] `src/models/transaction.model.ts`
- [ ] `src/models/transactionDetail.model.ts`
- [ ] `src/models/waitlist.model.ts`

### 📁 Services

- [ ] `src/services/user.services.ts`
- [ ] `src/services/bib.services.ts`
- [ ] `src/services/organizer.services.ts`
- [ ] `src/services/paypal-onboarding.services.ts`
- [ ] `src/services/paypal.services.ts`
- [ ] `src/services/transaction.services.ts`
- [ ] `src/services/waitlist.services.ts`
- [ ] `src/services/dashboard.services.ts`
- [ ] `src/services/event.services.ts`
- [ ] `src/services/eventCreationRequest.services.ts`

### 📁 Tests

- [ ] `src/tests/lib/bibTransformers.test.ts`
- [ ] `src/tests/lib/dateUtils.test.ts`
- [ ] `src/tests/lib/utils.test.ts`
- [ ] `src/tests/services/user-profile-validation.test.ts`
- [ ] `src/tests/services/user.services.test.ts`
- [ ] `src/tests/services/waitlist.services.test.ts`
- [ ] `src/tests/mocks/data.ts`
- [ ] `src/tests/mocks/pocketbase.ts`

## Légende

- [ ] = Fichier non traduit ou traduction incomplète
- [x] = Fichier complètement traduit dans toutes les langues

## Notes

- Les fichiers de configuration (`.ts`, `.js`, `.json`) peuvent contenir des strings à traduire
- Les composants React/TSX sont les plus susceptibles de contenir du texte à traduire
- Les services et modèles peuvent contenir des messages d'erreur ou des textes à traduire
- Les tests peuvent contenir des strings de test qui nécessitent une traduction

## Prochaines Étapes

1. Vérifier chaque fichier un par un pour identifier les strings à traduire
2. Créer les fichiers de traduction manquants
3. Traduire toutes les strings dans toutes les langues supportées
4. Marquer les fichiers comme traduits une fois terminé
