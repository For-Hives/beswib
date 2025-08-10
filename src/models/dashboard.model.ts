export interface DashboardStats {
	availableBibs: number
	// Event Creation Requests
	eventCreationRequests: {
		accepted: number
		rejected: number
		total: number
		waiting: number
	}

	pendingBibs: number
	pendingEvents: number
	soldBibs: number
	todaysRevenue: number

	todaysTransactions: number

	// Bibs
	totalBibs: number
	// Events
	totalEvents: number
	// Transactions
	totalTransactions: number

	// Users
	totalUsers: number
}
