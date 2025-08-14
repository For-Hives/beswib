import { vi } from 'vitest'

export const mockPocketbaseCollection = {
	getOne: vi.fn(),
	getFullList: vi.fn(),
	getFirstListItem: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
}

export const mockPocketbase = {
	collection: vi.fn().mockReturnValue(mockPocketbaseCollection),
	...mockPocketbaseCollection,
}
