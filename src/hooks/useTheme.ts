import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type Theme = 'light' | 'dark'

type ThemeState = {
	theme: Theme
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
	persist(
		set => ({
			theme: 'light',
			setTheme: (next: Theme) => set({ theme: next }),
			toggleTheme: () => set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
		}),
		{
			name: 'theme',
			storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : undefined as unknown as Storage)),
		}
	)
)
