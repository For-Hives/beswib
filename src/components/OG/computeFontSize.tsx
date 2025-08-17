type TextProps = {
	text: string // The text string that needs to fit within a box
	maxWidth: number // Maximum allowed width for the text
	maxHeight: number // Maximum allowed height for the text
	initialFontSize?: number // Optional starting font size, defaults to 16
}

// This function computes the largest possible font size for a given text
// so that it fits within the specified width and height constraints.
// It also splits the text into multiple lines if necessary.
export default function computeFontSize({ text, maxWidth, maxHeight, initialFontSize = 16 }: TextProps) {
	if (!text) text = '' // Ensure text is a string

	let fontSize = initialFontSize
	let fits = true
	let lines: string[] = []

	do {
		// Estimate maximum characters per line based on font size and width
		const maxCharsPerLine = Math.floor(maxWidth / (0.55 * fontSize))
		const words = text.split(' ')
		lines = []
		let currentLine = ''

		// Build lines by adding words until maxCharsPerLine is reached
		for (const w of words) {
			if ((currentLine + ' ' + w).trim().length > maxCharsPerLine) {
				if (currentLine) lines.push(currentLine.trim())
				currentLine = w
			} else {
				currentLine += ' ' + w
			}
		}
		if (currentLine) lines.push(currentLine.trim())

		// Calculate total height required by the current font size
		const totalHeight = lines.length * fontSize * 1.1
		fits = totalHeight <= maxHeight

		// If it still fits, try increasing the font size
		if (fits) fontSize += 2
	} while (fits)

	// Step back one increment to get the largest fitting font size
	fontSize = Math.max(fontSize - 2, 1)

	return { fontSize, text: lines.join('\n') } // Return the final font size and formatted text
}
