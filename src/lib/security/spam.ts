/**
 * Spotting robot submissions on the contact form.
 *
 * The robots seen on other contact forms in November 2026 fill the name and the message with random letters
 * (« FzEwOOmxoOoDAyMmIDdgBtPG », « oKcQzvnDkccQlIuC »...). The rules stay conservative: a real visitor must
 * never be dropped. A dropped submission gets the usual success answer, so the robot has no reason to work
 * around the filter.
 *
 * Imported by the contact form (field name) and by its server action: no server-only code here.
 */

/** Name of the trap field, hidden from visitors: only a robot fills it in. */
export const HONEYPOT_FIELD = 'website'

/**
 * A random "word": at least 10 letters with no space or punctuation, and at least 3 capitals after the first
 * letter. No real name or message has this shape (« McDonald », « DUPONT » or « Jean-Pierre » do not match).
 */
export function isRandomLetters(value: unknown): boolean {
	if (typeof value !== 'string') return false
	const text = value.trim()
	if (text.length < 10 || !/^[A-Za-z]+$/.test(text)) return false
	if (text === text.toUpperCase()) return false
	const innerCapitals = text.slice(1).replace(/[^A-Z]/g, '').length
	return innerCapitals >= 3
}

/** true when the trap field is filled in. */
export function isHoneypotFilled(value: unknown): boolean {
	return typeof value === 'string' && value.trim() !== ''
}

/**
 * true when the name AND the message are random letters (the case of every robot seen so far).
 * Both are required: a glued name such as « MarieDUPONT » looks random, and a real visitor dropped here would
 * still see the success message while nobody reads it.
 */
export function looksLikeBotText(fields: { name?: unknown; message?: unknown }): boolean {
	return isRandomLetters(fields.name) && isRandomLetters(fields.message)
}

/** true when the message contains a link (flagged in the e-mail subject: the scams received all had one). */
export function containsLink(value: unknown): boolean {
	return typeof value === 'string' && /(https?:\/\/|www\.)\S+/i.test(value)
}
