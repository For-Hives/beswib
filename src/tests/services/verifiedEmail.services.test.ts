import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createVerifiedEmail, resendVerificationCode } from '@/services/verifiedEmail.services'

// Mock the notification service
vi.mock('@/services/notification.service', () => ({
	sendVerificationEmail: vi.fn().mockResolvedValue(true),
}))

// Mock the PocketBase service
vi.mock('@/lib/services/pocketbase', () => ({
	pb: {
		collection: vi.fn().mockReturnValue({
			update: vi.fn(),
			getOne: vi.fn(),
			getFullList: vi.fn(),
			create: vi.fn(),
		}),
	},
}))

// Mock the date utility
vi.mock('@/lib/utils/date', () => ({
	pbDateToLuxon: vi.fn().mockReturnValue({
		toJSDate: vi.fn().mockReturnValue(new Date()),
	}),
}))

describe('verifiedEmail.services', () => {
	let mockCollection: ReturnType<typeof vi.fn>
	let mockGetFullList: ReturnType<typeof vi.fn>
	let mockCreate: ReturnType<typeof vi.fn>
	let mockUpdate: ReturnType<typeof vi.fn>
	let mockGetOne: ReturnType<typeof vi.fn>

	beforeEach(async () => {
		vi.clearAllMocks()
		
		// Get references to the mocked functions
		const { pb } = await import('@/lib/services/pocketbase')
		mockCollection = vi.mocked(pb.collection)
		
		// Set up the mock return values for collection methods
		mockGetFullList = vi.fn()
		mockCreate = vi.fn()
		mockUpdate = vi.fn()
		mockGetOne = vi.fn()
		
		mockCollection.mockReturnValue({
			create: mockCreate,
			getFullList: mockGetFullList,
			getOne: mockGetOne,
			update: mockUpdate,
		})
	})

	describe('createVerifiedEmail', () => {
		it('should create and send verification email for new email', async () => {
			const mockSendVerificationEmail = (await import('@/services/notification.service')).sendVerificationEmail

			// Mock spam check - no recent attempts
			mockGetFullList.mockResolvedValueOnce([]) // Recent attempts check
			mockGetFullList.mockResolvedValueOnce([]) // Daily attempts check
			mockGetFullList.mockResolvedValueOnce([]) // Existing email check
			mockCreate.mockResolvedValueOnce({
				verifiedAt: null,
				verificationCode: '123456',
				userId: 'user-123',
				updated: new Date().toISOString(),
				isVerified: false,
				id: 'test-id',
				expiresAt: new Date().toISOString(),
				email: 'test@example.com',
				created: new Date().toISOString(),
			})

			const result = await createVerifiedEmail({
				userId: 'user-123',
				email: 'test@example.com',
			})

			expect(result).not.toBeNull()
			expect(result?.id).toBe('test-id')
			expect(mockCollection).toHaveBeenCalledWith('verifiedEmails')
			expect(mockCreate).toHaveBeenCalled()
			expect(mockSendVerificationEmail).toHaveBeenCalled()
		})

		it('should enforce spam protection for recent attempts', async () => {
			// Mock spam check - recent attempt found
			mockGetFullList.mockResolvedValueOnce([{ updated: new Date().toISOString(), id: 'recent-record' }])

			const result = await createVerifiedEmail({
				userId: 'user-123',
				email: 'test@example.com',
			})

			expect(result).toBeNull()
			expect(mockCreate).not.toHaveBeenCalled()
		})
	})

	describe('resendVerificationCode', () => {
		it('should resend verification code for valid request', async () => {
			const mockSendVerificationEmail = (await import('@/services/notification.service')).sendVerificationEmail

			mockGetOne.mockResolvedValueOnce({
				verifiedAt: null,
				verificationCode: '123456',
				userId: 'user-123',
				updated: new Date().toISOString(),
				isVerified: false,
				id: 'test-id',
				expiresAt: new Date().toISOString(),
				email: 'test@example.com',
				created: new Date().toISOString(),
			})

			// Mock spam check - no recent attempts
			mockGetFullList.mockResolvedValueOnce([]) // Recent attempts check
			mockGetFullList.mockResolvedValueOnce([]) // Daily attempts check

			mockUpdate.mockResolvedValueOnce({
				verifiedAt: null,
				verificationCode: '654321',
				userId: 'user-123',
				updated: new Date().toISOString(),
				isVerified: false,
				id: 'test-id',
				expiresAt: new Date().toISOString(),
				email: 'test@example.com',
				created: new Date().toISOString(),
			})

			const result = await resendVerificationCode('test-id')

			expect(result).toBe(true)
			expect(mockGetOne).toHaveBeenCalledWith('test-id')
			expect(mockUpdate).toHaveBeenCalled()
			expect(mockSendVerificationEmail).toHaveBeenCalled()
		})
	})
})
