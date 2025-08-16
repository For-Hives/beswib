import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createVerifiedEmail, resendVerificationCode } from '@/services/verifiedEmail.services'

// Mock the notification service
vi.mock('@/services/notification.service', () => ({
	sendVerificationEmail: vi.fn().mockResolvedValue(true),
}))

// Mock the PocketBase service
const mockGetFullList = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockGetOne = vi.fn()
const mockCollection = vi.fn().mockReturnValue({
	create: mockCreate,
	getFullList: mockGetFullList,
	getOne: mockGetOne,
	update: mockUpdate,
})

vi.mock('@/lib/services/pocketbase', () => ({
	pb: {
		collection: mockCollection,
	},
}))

// Mock the date utility
vi.mock('@/lib/utils/date', () => ({
	pbDateToLuxon: vi.fn().mockReturnValue({
		toJSDate: vi.fn().mockReturnValue(new Date()),
	}),
}))

describe('verifiedEmail.services', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('createVerifiedEmail', () => {
		it('should create and send verification email for new email', async () => {
			const mockSendVerificationEmail = (await import('@/services/notification.service')).sendVerificationEmail

			// Mock spam check - no recent attempts
			mockGetFullList.mockResolvedValueOnce([]) // Recent attempts check
			mockGetFullList.mockResolvedValueOnce([]) // Daily attempts check
			mockGetFullList.mockResolvedValueOnce([]) // Existing email check
			mockCreate.mockResolvedValueOnce({
				created: new Date().toISOString(),
				email: 'test@example.com',
				expiresAt: new Date().toISOString(),
				id: 'test-id',
				isVerified: false,
				updated: new Date().toISOString(),
				userId: 'user-123',
				verificationCode: '123456',
				verifiedAt: null,
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
			mockGetFullList.mockResolvedValueOnce([{ id: 'recent-record', updated: new Date().toISOString() }])

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
				created: new Date().toISOString(),
				email: 'test@example.com',
				expiresAt: new Date().toISOString(),
				id: 'test-id',
				isVerified: false,
				updated: new Date().toISOString(),
				userId: 'user-123',
				verificationCode: '123456',
				verifiedAt: null,
			})

			// Mock spam check - no recent attempts
			mockGetFullList.mockResolvedValueOnce([]) // Recent attempts check
			mockGetFullList.mockResolvedValueOnce([]) // Daily attempts check

			mockUpdate.mockResolvedValueOnce({
				created: new Date().toISOString(),
				email: 'test@example.com',
				expiresAt: new Date().toISOString(),
				id: 'test-id',
				isVerified: false,
				updated: new Date().toISOString(),
				userId: 'user-123',
				verificationCode: '654321',
				verifiedAt: null,
			})

			const result = await resendVerificationCode('test-id')

			expect(result).toBe(true)
			expect(mockGetOne).toHaveBeenCalledWith('test-id')
			expect(mockUpdate).toHaveBeenCalled()
			expect(mockSendVerificationEmail).toHaveBeenCalled()
		})
	})
})
