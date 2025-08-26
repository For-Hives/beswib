/**
 * Result types for proper error handling in Next.js 15
 * Prevents server-side errors from being exposed in production
 */
export interface ServiceResult<T = unknown> {
	success: boolean
	data?: T
	error?: string
}

/**
 * Helper function to create success result
 */
export function createSuccessResult<T>(data: T): ServiceResult<T> {
	return {
		success: true,
		data,
	}
}

/**
 * Helper function to create error result
 */
export function createErrorResult<T = unknown>(error: string): ServiceResult<T> {
	return {
		success: false,
		error,
	}
}
