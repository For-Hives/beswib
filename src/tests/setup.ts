import { beforeEach, vi } from 'vitest'

// Forcer l'utilisation des mocks en désactivant les vraies connexions réseau
beforeEach(() => {
	// Mock des variables d'environnement pour éviter les vraies connexions
	vi.stubEnv('POCKETBASE_URL', 'http://mock-pocketbase.test')
	vi.stubEnv('POCKETBASE_TOKEN', 'mock-token')
})
