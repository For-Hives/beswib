export {}

declare global {
	// The global `umami` type comes from @types/umami (see "types" in tsconfig.json)
	namespace umami {}

	interface Window {
		// Created by the tracker script. Only src/lib/analytics/client.ts calls it.
		umami?: umami.umami
		// Hook named by the data-before-send attribute of the tracker <script>, registered by
		// src/lib/analytics/before-send.ts. The tracker calls it as (type, payload) before every
		// send; a falsy result cancels the send.
		beswibBeforeSend?: (type: unknown, payload: unknown) => Record<string, unknown> | false
	}
}
