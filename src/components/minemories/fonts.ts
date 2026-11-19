import { Atkinson_Hyperlegible_Next, Pixelify_Sans } from 'next/font/google'

// The two voices of Minemories (its brand guidelines, § 5): a pixel font for titles and buttons,
// Atkinson Hyperlegible Next for what is read. Minemories' own game font is derived from Mojang
// files, so it stays on minemories.net: Pixelify Sans (OFL) is the free replacement its guidelines
// list. Neither font is preloaded: the browser fetches them when the promotion first opens.

export const pixelFont = Pixelify_Sans({
	variable: '--font-mm-pixel',
	subsets: ['latin', 'latin-ext'],
	weight: ['400', '600'],
	preload: false,
	display: 'swap',
})

export const readingFont = Atkinson_Hyperlegible_Next({
	variable: '--font-mm-read',
	subsets: ['latin', 'latin-ext'],
	weight: ['400'],
	preload: false,
	display: 'swap',
})
