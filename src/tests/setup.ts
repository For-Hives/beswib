import { beforeEach, vi } from 'vitest'

// Mock global de PocketBase pour éviter toute connexion réseau
vi.mock('pocketbase', () => {
	const mockCollection = {
		create: vi.fn().mockResolvedValue({ id: 'test_id_123456' }),
		getOne: vi.fn().mockResolvedValue({ id: 'test_id_123456' }),
		getFullList: vi.fn().mockResolvedValue([]),
		getFirstListItem: vi.fn().mockResolvedValue(null),
		update: vi.fn().mockResolvedValue({ id: 'test_id_123456' }),
		delete: vi.fn().mockResolvedValue(true),
	}

	return {
		default: vi.fn().mockImplementation(() => ({
			collection: vi.fn().mockReturnValue(mockCollection),
			authStore: {
				token: 'mock-token',
				isValid: true,
			},
		})),
	}
})

// Forcer l'utilisation des mocks en désactivant les vraies connexions réseau
beforeEach(() => {
	// Mock des variables d'environnement pour éviter les vraies connexions
	vi.stubEnv('POCKETBASE_URL', 'http://mock-pocketbase.test')
	vi.stubEnv('POCKETBASE_TOKEN', 'mock-token')
})