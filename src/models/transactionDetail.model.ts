import type { Transaction } from './transaction.model'

// TODO : this table does not exist in the database yet, but is used to store transaction details for runners
export interface TransactionDetail {
	id: string

	address: string
	beneficiaryFirstName: string
	beneficiaryLastName: string
	club?: string
	dateOfBirth: Date
	emergencyContact: {
		name: string
		phone: string
	}
	ffaNumber?: string
	medicalCertificateUrl?: string
	// replicate event options if needed 🏷️
	optionValues: Record<string, string>
	transactionId: Transaction['id']
}
