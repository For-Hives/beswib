import { Appearance } from '@clerk/types'

export type ClerkTheme = 'light' | 'dark'

export function getClerkAppearance(theme: ClerkTheme): Appearance {
  return {
    baseTheme: theme,
    elements: {
      // Root and layout
      rootBox: "w-full",
      card: "bg-card/80 border border-border rounded-xl shadow-xl backdrop-blur-sm",
      
      // Headers and text
      headerTitle: "text-foreground text-2xl font-bold tracking-tight mb-2",
      headerSubtitle: "text-muted-foreground text-sm mb-6",
      formHeaderTitle: "text-foreground text-xl font-semibold mb-2",
      formHeaderSubtitle: "text-muted-foreground text-sm mb-4",
      
      // Social buttons - style them like your project's buttons
      socialButtonsBlockButton: "bg-card/80 hover:bg-card border border-border text-foreground rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 backdrop-blur-sm hover:shadow-md",
      socialButtonsProviderIcon: "text-foreground",
      
      // Primary action buttons
      formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
      
      // Form fields - match your input styling
      // Match src/components/ui/inputAlt.tsx as closely as possible (without the motion wrapper)
      formFieldInput:
        "shadow-input dark:placeholder-text-neutral-600 bg-background text-foreground placeholder:text-foreground/50 focus-visible:ring-ring border-input h-10 w-full rounded-md border px-3 py-2 text-sm transition duration-400 focus-visible:ring-[2px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600",
      formFieldLabel: "text-foreground mb-2 block text-base font-medium",
      
      // Links and actions
      footerActionLink: "text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200 underline-offset-4 hover:underline",
      identityPreviewEditButton: "text-primary hover:text-primary/80 text-sm transition-colors duration-200",
      backButton: "text-muted-foreground hover:text-foreground text-sm transition-colors duration-200",
      
      // Error/warning states
      formFieldWarningText: "text-amber-600 dark:text-amber-400 text-xs mt-1",
      formFieldErrorText: "text-destructive text-xs mt-1",
      formFieldSuccessText: "text-emerald-600 dark:text-emerald-400 text-xs mt-1",
      
      // Dividers
      dividerLine: "bg-border/50",
      dividerText: "text-muted-foreground text-xs uppercase tracking-wider",
      dividerRow: "text-muted-foreground text-xs",
      
      // OTP and alternative methods
      otpCodeFieldInput: "border border-border text-foreground bg-card/50 rounded-lg text-center font-mono text-lg transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary/20",
      alternativeMethodsBlockButton: "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-sm transition-all duration-200",
      
      // Navigation and breadcrumbs
      breadcrumbsItem: "text-muted-foreground text-sm hover:text-foreground transition-colors",
      breadcrumbsItemCurrent: "text-foreground text-sm font-medium",
      
      // Menu and dropdowns
      menuButton: "text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md px-2 py-1 text-sm transition-all duration-200",
      menuItem: "text-foreground hover:bg-muted/80 rounded-md px-3 py-2 text-sm transition-all duration-200",
      
      // UserButton and popover
      userButtonTrigger: "text-foreground hover:bg-card/50 rounded-full transition-all duration-200 hover:scale-105",
      userButtonPopoverCard: "bg-card/95 border border-border shadow-xl rounded-xl backdrop-blur-md",
      userButtonPopoverActionButton: "text-foreground hover:bg-muted/80 rounded-lg px-3 py-2 text-sm transition-all duration-200",
      userButtonPopoverActionButtonIcon: "text-muted-foreground",
      userButtonPopoverActionButtonText: "text-foreground",
      userButtonPopoverFooter: "bg-muted/30 border-t border-border/50",
      
      // Organization components
      organizationSwitcherTrigger: "text-foreground hover:bg-card/50 border border-border rounded-lg px-3 py-2 transition-all duration-200",
      organizationSwitcherTriggerIcon: "text-muted-foreground",
      
      // Profile sections
      profileSectionTitle: "text-foreground text-lg font-semibold mb-3",
      profileSectionContent: "text-muted-foreground text-sm",
      
      // Badges and alerts
      badge: "bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full font-medium",
      alert: "border border-border bg-card/50 text-foreground rounded-lg p-4 backdrop-blur-sm",
      alertText: "text-foreground text-sm",
      
      // Identity preview
      identityPreviewText: "text-foreground",
      userPreviewTextContainer: "text-foreground",
      userPreviewSecondaryIdentifier: "text-muted-foreground text-sm"
    },
    variables: {
      colorPrimary: 'hsl(var(--primary))',
      colorDanger: 'hsl(var(--destructive))',
      colorSuccess: 'hsl(142 76% 36%)',
      colorWarning: 'hsl(38 92% 50%)',
      colorNeutral: 'hsl(var(--muted-foreground))',
      colorBackground: 'transparent',
      colorInputBackground: 'hsl(var(--card))',
      colorInputText: 'hsl(var(--foreground))',
      colorText: 'hsl(var(--foreground))',
      colorTextSecondary: 'hsl(var(--muted-foreground))',
      colorShimmer: 'hsl(var(--muted))',
      fontFamily: 'var(--font-geist-sans)',
      fontSize: '0.875rem',
      fontWeight: '400',
      borderRadius: '0.5rem',
      spacingUnit: '1rem'
    }
  }
}