import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createVerifiedEmail, resendVerificationCode } from '@/services/verifiedEmail.services'

// Mock the notification service
vi.mock('@/services/notification.service', () => ({
	sendUserEmail: vi.fn().mockResolvedValue(true),
}))

// Mock the PocketBase service
vi.mock('@/lib/services/pocketbase', () => ({
	pb: {
		collection: vi.fn().mockReturnValue({
			getFullList: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			getOne: vi.fn(),
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
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('createVerifiedEmail', () => {
		it('should create and send verification email for new email', async () => {
			const mockPb = (await import('@/lib/services/pocketbase')).pb
			const mockSendUserEmail = (await import('@/services/notification.service')).sendUserEmail

			// Mock no existing records (new email)
			mockPb.collection().getFullList.mockResolvedValueOnce([])
			mockPb.collection().create.mockResolvedValueOnce({
				id: 'test-id',
				userId: 'user-123',
				email: 'test@example.com',
				verificationCode: '123456',
				isVerified: false,
				verifiedAt: null,
				expiresAt: new Date().toISOString(),
				created: new Date().toISOString(),
				updated: new Date().toISOString(),
			})

			const result = await createVerifiedEmail({
				userId: 'user-123',
				email: 'test@example.com',
			})

			expect(result).toBeTruthy()
			expect(mockPb.collection().create).toHaveBeenCalled()
			expect(mockSendUserEmail).toHaveBeenCalledWith(
				'test@example.com',
				expect.objectContaining({
					subject: expect.stringContaining('Verify your email'),
					text: expect.stringContaining('verification code'),
					html: expect.stringContaining('verification code'),
				})
			)
		})

		it('should enforce spam protection', async () => {
			const mockPb = (await import('@/lib/services/pocketbase')).pb

			// Mock recent record (within cooldown period)
			const recentTime = new Date()
			recentTime.setMinutes(recentTime.getMinutes() - 2) // 2 minutes ago, within 5-minute cooldown

			mockPb
				.collection()
				.getFullList.mockResolvedValueOnce([]) // First call for existing email check
				.mockResolvedValueOnce([{ id: 'recent-record', updated: recentTime.toISOString() }]) // Second call for spam check

			const result = await createVerifiedEmail({
				userId: 'user-123',
				email: 'test@example.com',
			})

			expect(result).toBeNull()
			expect(mockPb.collection().create).not.toHaveBeenCalled()
		})
	})

	describe('resendVerificationCode', () => {
		it('should enforce spam protection on resend', async () => {
			const mockPb = (await import('@/lib/services/pocketbase')).pb

			// Mock getting the record
			mockPb.collection().getOne.mockResolvedValueOnce({
				id: 'test-id',
				userId: 'user-123',
				email: 'test@example.com',
				isVerified: false,
			})

			// Mock recent record (within cooldown period)
			const recentTime = new Date()
			recentTime.setMinutes(recentTime.getMinutes() - 2) // 2 minutes ago, within 5-minute cooldown

			mockPb
				.collection()
				.getFullList.mockResolvedValueOnce([{ id: 'recent-record', updated: recentTime.toISOString() }])

			const result = await resendVerificationCode('test-id')

			expect(result).toBe(false)
			expect(mockPb.collection().update).not.toHaveBeenCalled()
		})
	})
})
