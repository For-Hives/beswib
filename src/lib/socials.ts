export const SOCIALS = {
	twitter: 'https://twitter.com/beswib',
	x: 'https://x.com/beswib',
	facebook: 'https://www.facebook.com/beswib',
	instagram: 'https://www.instagram.com/beswib',
} as const

export type SocialKey = keyof typeof SOCIALS
