export const SOCIALS = {
	x: 'https://x.com/beswib',
	twitter: 'https://twitter.com/beswib',
	instagram: 'https://www.instagram.com/beswib',
	facebook: 'https://www.facebook.com/beswib',
} as const

export type SocialKey = keyof typeof SOCIALS
