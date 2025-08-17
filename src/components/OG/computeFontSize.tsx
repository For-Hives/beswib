// Define the props for the computeFontSize function
type TextProps = {
	text: string // The text content to measure
	maxWidth: number // Maximum allowed width for the text
	maxHeight: number // Maximum allowed height for the text
	initialFontSize?: number // Optional starting font size (default is 16)
}

// Main function to compute the largest possible font size that fits within maxWidth and maxHeight
export default function computeFontSize({ text, maxWidth, maxHeight, initialFontSize = 16 }: TextProps) {
	// Ensure text is defined
	if (!text) text = ''

	// Start with the initial font size
	let fontSize = initialFontSize
	const charWidthCoef = 0.6 // Approximate width of a character relative to font size
	let lines: string[] = [] // Array to hold lines after wrapping

	// Helper function to check if the text fits within the given dimensions at a specific font size
	const fitsText = (size: number) => {
		const words = text.split(' ') // Split text into words
		lines = [] // Reset lines array
		let currentLine = '' // Current line being built

		// Iterate through each word to build lines
		for (const w of words) {
			const wordWidth = w.length * charWidthCoef * size // Approximate width of the word
			if (wordWidth > maxWidth * 0.9) return false // Word is too long to fit

			// Check if adding the word exceeds the max width
			if ((currentLine + ' ' + w).trim().length * charWidthCoef * size > maxWidth * 0.8) {
				if (currentLine) lines.push(currentLine.trim()) // Push current line
				currentLine = w // Start new line with current word
			} else {
				currentLine += ' ' + w // Add word to current line
			}
		}

		// Push any remaining line
		if (currentLine) lines.push(currentLine.trim())

		// Compute total height required for all lines
		const totalHeight = lines.length * size * 1.1 // 1.1 = line height multiplier
		return totalHeight <= maxHeight // Return true if fits within maxHeight
	}

	// Increase font size while the text still fits
	while (fitsText(fontSize + 1)) {
		fontSize += 1
	}

	// Decrease font size if it doesn't fit
	while (!fitsText(fontSize) && fontSize > 1) {
		fontSize -= 1
	}

	// Return the computed font size and wrapped text
	return { fontSize, text: lines.join('\n') }
}
