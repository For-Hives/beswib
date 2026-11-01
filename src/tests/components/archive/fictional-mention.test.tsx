// @vitest-environment node
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ArchivedClosedCard } from '@/components/archive/ArchivedClosedCard'
import translations from '@/components/global/locales.json'

// Until the real records are replaced, saying the data is fictional would be false.

const FLAG = 'NEXT_PUBLIC_ARCHIVE_DATA_FICTIONAL'
const { fictionalListing } = translations.en.archive

afterEach(() => {
	vi.unstubAllEnvs()
})

describe('the fictional mention of a bib', () => {
	it.each([undefined, '', 'false'])('stays off while the flag is %j', value => {
		vi.stubEnv(FLAG, value)

		expect(renderToStaticMarkup(<ArchivedClosedCard locale="en" flow="purchase" />)).not.toContain(fictionalListing)
	})

	it('shows once the flag is set', () => {
		vi.stubEnv(FLAG, 'true')

		expect(renderToStaticMarkup(<ArchivedClosedCard locale="en" flow="purchase" />)).toContain(fictionalListing)
	})

	it('only belongs on a bib', () => {
		vi.stubEnv(FLAG, 'true')

		expect(renderToStaticMarkup(<ArchivedClosedCard locale="en" flow="waitlist" />)).not.toContain(fictionalListing)
	})

	it.each(Object.keys(translations))('has its text in %s, away from the sentence that is always shown', locale => {
		const { archive } = translations[locale as keyof typeof translations]

		expect(archive.fictionalListing).not.toBe('')
		expect(archive.closed.purchase.body).not.toContain(archive.fictionalListing)
	})
})
