import type { User } from './user.model'

export interface VerifiedEmail {
	id: string
	userId: User['id']
	email: string
	verificationCode: string
	isVerified: boolean
	verifiedAt?: Date | string | null // RFC3399 Date format
	expiresAt: Date | string // RFC3399 Date format
	created: Date | string // RFC3399 Date format
	updated: Date | string // RFC3399 Date format
}

// PocketBase verified email record minimal shape used by services mapping
export interface PbVerifiedEmailRecordMinimal {
	id: string
	userId: string
	email: string
	verificationCode: string
	isVerified: boolean
	verifiedAt: string | null
	expiresAt: string
	created: string
	updated: string
}

export interface CreateVerifiedEmailRequest {
	userId: string
	email: string
}

export interface VerifyEmailRequest {
	verifiedEmailId: string
	verificationCode: string
}
