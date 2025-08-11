export {}

declare global {
	// Use the official global umami type if present and extend with identify (available in recent Umami versions)
	namespace umami {}

	interface Window {
		umami?: umami.umami & {
			identify?: (
				userId: string,
				data?: Record<string, string | number | boolean | null>
			) => Promise<string> | undefined
		}
		// Hook for the data-before-send attribute on the Umami <script> tag
		beforeSendHandler?: (type: string, payload: Record<string, unknown>) => Record<string, unknown> | false
	}
}
