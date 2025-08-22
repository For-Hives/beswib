import { beforeEach, vi } from 'vitest'

// Mock Resend to prevent API key errors in tests
vi.mock('resend', () => ({
	Resend: vi.fn().mockImplementation(() => ({
		emails: {
			sendBatch: vi.fn().mockResolvedValue([{ id: 'mock-email-id', error: null }]),
			send: vi.fn().mockResolvedValue({ id: 'mock-email-id', error: null }),
		},
	})),
}))

// Forcer l'utilisation des mocks en désactivant les vraies connexions réseau
beforeEach(() => {
	// Mock des variables d'environnement pour éviter les vraies connexions
	vi.stubEnv('POCKETBASE_URL', 'http://mock-pocketbase.test')
	vi.stubEnv('POCKETBASE_TOKEN', 'mock-token')
	vi.stubEnv('RESEND_API_KEY', 'mock-resend-key')
})
