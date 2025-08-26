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
	let mockedPb: { collection: ReturnType<typeof vi.fn> }
	let mockGetFullList: ReturnType<typeof vi.fn>
	let mockCreate: ReturnType<typeof vi.fn>
	let mockUpdate: ReturnType<typeof vi.fn>
	let mockGetOne: ReturnType<typeof vi.fn>

	beforeEach(async () => {
		vi.clearAllMocks()

		// Get references to the mocked functions
		const { pb } = await import('@/lib/services/pocketbase')
		mockedPb = pb as unknown as { collection: ReturnType<typeof vi.fn> }

		// Set up the mock return values for collection methods
		mockGetFullList = vi.fn()
		mockCreate = vi.fn()
		mockUpdate = vi.fn()
		mockGetOne = vi.fn()

		mockedPb.collection.mockReturnValue({
			update: mockUpdate,
			getOne: mockGetOne,
			getFullList: mockGetFullList,
			create: mockCreate,
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
			expect(result.success).toBe(true)
			expect(result.data?.id).toBe('test-id')
			// Intentionally avoid asserting on pb.collection due to unbound-method lint rule
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

			expect(result.success).toBe(false)
			expect(result.error).toContain('wait')
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

			expect(result.success).toBe(true)
			expect(result.data).toBe(true)
			expect(mockGetOne).toHaveBeenCalledWith('test-id')
			expect(mockUpdate).toHaveBeenCalled()
			expect(mockSendVerificationEmail).toHaveBeenCalled()
		})
	})
})
