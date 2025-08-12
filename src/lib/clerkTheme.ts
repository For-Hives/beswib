import { Appearance } from '@clerk/types'

export type ClerkTheme = 'light' | 'dark'

export function getClerkAppearance(theme: ClerkTheme): Appearance {
	return {
		variables: {
			spacingUnit: '1rem',
			fontWeight: '400',
			fontSize: '0.875rem',
			fontFamily: 'var(--font-geist-sans)',
			colorWarning: 'hsl(38 92% 50%)',
			colorTextSecondary: 'hsl(var(--muted-foreground))',
			colorText: 'hsl(var(--foreground))',
			colorSuccess: 'hsl(142 76% 36%)',
			colorShimmer: 'hsl(var(--muted))',
			colorPrimary: 'hsl(var(--primary))',
			colorNeutral: 'hsl(var(--muted-foreground))',
			colorInputText: 'hsl(var(--foreground))',
			colorInputBackground: 'hsl(var(--card))',
			colorDanger: 'hsl(var(--destructive))',
			colorBackground: 'transparent',
			borderRadius: '0.5rem',
		},

		elements: {
			userPreviewTextContainer: 'text-foreground',
			userPreviewSecondaryIdentifier: 'text-muted-foreground text-sm',

			// UserButton and popover
			userButtonTrigger: 'text-foreground hover:bg-card/50 rounded-full transition-all duration-200 hover:scale-105',
			userButtonPopoverFooter: 'bg-muted/30 border-t border-border/50',
			userButtonPopoverCard: 'bg-card/95 border border-border shadow-xl rounded-xl backdrop-blur-md',
			userButtonPopoverActionButtonText: 'text-foreground',

			userButtonPopoverActionButtonIcon: 'text-muted-foreground',
			userButtonPopoverActionButton:
				'text-foreground hover:bg-muted/80 rounded-lg px-3 py-2 text-sm transition-all duration-200',

			socialButtonsProviderIcon: 'text-foreground',

			// Social buttons - harmonized with input and button style
			socialButtonsBlockButton:
				'shadow-input bg-background hover:bg-muted text-foreground border-input rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:bg-zinc-800 dark:shadow-[0px_0px_1px_1px_#404040]',
			// Root and layout
			rootBox: 'w-full',

			// Profile sections
			profileSectionTitle: 'text-foreground text-lg font-semibold mb-3',
			profileSectionContent: 'text-muted-foreground text-sm',
			// OTP and alternative methods - harmonized with main input style
			otpCodeFieldInput:
				'shadow-input dark:placeholder-text-neutral-600 bg-background text-foreground placeholder:text-foreground/50 focus-visible:ring-ring border-input text-center font-mono text-lg rounded-md border px-3 py-2 transition duration-400 focus-visible:ring-[2px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600 hover:shadow-md',

			organizationSwitcherTriggerIcon: 'text-muted-foreground',
			// Organization components - harmonized with input style
			organizationSwitcherTrigger:
				'shadow-input bg-background hover:bg-muted text-foreground border-input rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:bg-zinc-800 dark:shadow-[0px_0px_1px_1px_#404040]',
			menuItem: 'text-foreground hover:bg-muted/80 rounded-md px-3 py-2 text-sm transition-all duration-200',

			// Menu and dropdowns
			menuButton:
				'text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md px-2 py-1 text-sm transition-all duration-200',
			// Identity preview
			identityPreviewText: 'text-foreground',
			identityPreviewEditButton: 'text-primary hover:text-primary/80 text-sm transition-colors duration-200',

			// Headers and text
			headerTitle: 'text-foreground text-2xl font-bold tracking-tight mb-2',
			headerSubtitle: 'text-muted-foreground text-sm mb-6',

			formHeaderTitle: 'text-foreground text-xl font-semibold mb-2',
			formHeaderSubtitle: 'text-muted-foreground text-sm mb-4',

			// Error/warning states
			formFieldWarningText: 'text-amber-600 dark:text-amber-400 text-xs mt-1',
			formFieldSuccessText: 'text-emerald-600 dark:text-emerald-400 text-xs mt-1',

			formFieldLabel: 'text-foreground mb-2 block text-base font-medium',
			// Form fields - match your input styling
			// Match src/components/ui/inputAlt.tsx as closely as possible (without the motion wrapper)
			formFieldInput:
				'shadow-input dark:placeholder-text-neutral-600 bg-background text-foreground placeholder:text-foreground/50 focus-visible:ring-ring border-input h-10 w-full rounded-md border px-3 py-2 text-sm transition duration-400 group-hover/input:shadow-none focus-visible:ring-[2px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600 hover:shadow-md',
			formFieldErrorText: 'text-destructive text-xs mt-1',

			// Additional form elements for consistency
			formFieldTextarea:
				'shadow-input dark:placeholder-text-neutral-600 bg-background text-foreground placeholder:text-foreground/50 focus-visible:ring-ring border-input min-h-[80px] w-full rounded-md border px-3 py-2 text-sm transition duration-400 focus-visible:ring-[2px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600 hover:shadow-md resize-vertical',

			formFieldSelect:
				'shadow-input dark:placeholder-text-neutral-600 bg-background text-foreground placeholder:text-foreground/50 focus-visible:ring-ring border-input h-10 w-full rounded-md border px-3 py-2 text-sm transition duration-400 focus-visible:ring-[2px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600 hover:shadow-md',

			formFieldCheckbox:
				'shadow-input border-input bg-background text-primary focus-visible:ring-ring h-4 w-4 rounded border transition duration-400 focus-visible:ring-[2px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600',

			formFieldRadio:
				'shadow-input border-input bg-background text-primary focus-visible:ring-ring h-4 w-4 rounded-full border transition duration-400 focus-visible:ring-[2px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600',

			// Primary action buttons
			formButtonPrimary:
				'bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',

			// Secondary buttons - harmonized with input style
			formButtonSecondary:
				'shadow-input bg-background hover:bg-muted text-foreground border-input rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:bg-zinc-800 dark:shadow-[0px_0px_1px_1px_#404040]',
			// Links and actions
			footerActionLink:
				'text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200 underline-offset-4 hover:underline',
			dividerText: 'text-muted-foreground text-xs uppercase tracking-wider',

			dividerRow: 'text-muted-foreground text-xs',
			// Dividers
			dividerLine: 'bg-border/50',

			card: 'bg-card/80 border border-border rounded-xl shadow-xl backdrop-blur-sm',
			breadcrumbsItemCurrent: 'text-foreground text-sm font-medium',

			// Navigation and breadcrumbs
			breadcrumbsItem: 'text-muted-foreground text-sm hover:text-foreground transition-colors',
			// Badges and alerts
			badge: 'bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full font-medium',
			backButton: 'text-muted-foreground hover:text-foreground text-sm transition-colors duration-200',

			alternativeMethodsBlockButton:
				'shadow-input bg-background hover:bg-muted text-foreground border-input rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:bg-zinc-800 dark:shadow-[0px_0px_1px_1px_#404040]',
			alertText: 'text-foreground text-sm',
			alert: 'border border-border bg-card/50 text-foreground rounded-lg p-4 backdrop-blur-sm',
		},
		baseTheme: theme,
	}
}
