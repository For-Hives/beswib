import { vi } from 'vitest'

export const mockPocketbaseCollection = {
	update: vi.fn(),
	getOne: vi.fn(),
	getFullList: vi.fn(),
	getFirstListItem: vi.fn(),
	delete: vi.fn(),
	create: vi.fn(),
}

export const mockPocketbase = {
	collection: vi.fn().mockReturnValue(mockPocketbaseCollection),
	...mockPocketbaseCollection,
}
