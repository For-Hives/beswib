// @vitest-environment node
import type { ReactElement } from 'react'
import { render } from 'react-email'
import { describe, expect, it } from 'vitest'

import BeswibBibApproval from '@/components/emails/BeswibBibApproval'
import BeswibEmailVerification from '@/components/emails/BeswibEmailVerification'
import BeswibPurchaseApproval from '@/components/emails/BeswibPurchaseApproval'
import BeswibWaitlistAlert from '@/components/emails/BeswibWaitlistAlert'
import BeswibWelcomeEmail from '@/components/emails/BeswibWelcomeEmail'

// Every transactional e-mail, rendered the way the app sends it. A bump of
// react-email or tailwindcss that breaks a template fails here, not in a
// buyer's inbox.

const event = {
	eventName: 'Marathon de Paris 2026',
	eventLocation: 'Paris, France',
	eventDistance: '42.2 km',
	eventDate: '12 avril 2026',
	bibCategory: 'Marathon',
}

const ORDER_ID = '5O190127TN364715T'

const templates: Array<{ name: string; make: (locale: string) => ReactElement; shows: string[] }> = [
	{
		name: 'BeswibEmailVerification',
		make: locale => <BeswibEmailVerification validationCode="KQ7-M2X" locale={locale} />,
		shows: ['KQ7-M2X'],
	},
	{
		name: 'BeswibWelcomeEmail',
		make: locale => <BeswibWelcomeEmail firstName="Zoé" locale={locale} />,
		shows: ['Zoé'],
	},
	{
		name: 'BeswibWaitlistAlert',
		make: locale => (
			<BeswibWaitlistAlert
				{...event}
				eventId="evt_8f3k2j1"
				bibPrice={149.5}
				sellerName="Marie Dupont"
				timeRemaining="3 jours"
				locale={locale}
			/>
		),
		shows: [event.eventName],
	},
	{
		name: 'BeswibBibApproval',
		make: locale => (
			<BeswibBibApproval
				sellerName="Marie Dupont"
				{...event}
				bibPrice={149.5}
				organizerName="A.S.O. Challenges"
				locale={locale}
			/>
		),
		shows: [event.eventName],
	},
	{
		name: 'BeswibBibApproval, no price',
		make: locale => (
			<BeswibBibApproval sellerName="" {...event} bibPrice={0} organizerName="A.S.O. Challenges" locale={locale} />
		),
		shows: [event.eventName],
	},
	{
		name: 'BeswibPurchaseApproval',
		make: locale => (
			<BeswibPurchaseApproval
				buyerName="Jean Martin"
				{...event}
				bibPrice={149.5}
				organizerName="A.S.O. Challenges"
				orderId={ORDER_ID}
				locale={locale}
			/>
		),
		shows: [event.eventName, ORDER_ID],
	},
]

describe('e-mail templates', () => {
	describe.each(templates)('$name', ({ make, shows }) => {
		it.each(['fr', 'en', 'ko'])('renders in %s', async locale => {
			const html = await render(make(locale))

			expect(html).toContain('<!DOCTYPE html')
			expect(html).toContain('</html>')
			for (const text of shows) expect(html).toContain(text)
			// Tailwind classes are inlined: a template that lost them would ship unstyled
			expect(html).toMatch(/style="[^"]*(font-family|background-color)/)
		})

		it('has a plain-text version', async () => {
			const text = await render(make('fr'), { plainText: true })

			// headings come out in upper case in the text version
			for (const expected of shows) expect(text.toLowerCase()).toContain(expected.toLowerCase())
			expect(text).not.toContain('<')
		})
	})
})
