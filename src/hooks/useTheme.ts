import { persist, createJSONStorage } from 'zustand/middleware'
import { create } from 'zustand'

type Theme = 'light' | 'dark'

type ThemeState = {
	theme: Theme
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
	persist(
		set => ({
			toggleTheme: () => set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
			theme: 'light',
			setTheme: (next: Theme) => set({ theme: next }),
		}),
		{
			storage: createJSONStorage(() =>
				typeof window !== 'undefined' ? window.localStorage : (undefined as unknown as Storage)
			),
			name: 'theme',
		}
	)
)
