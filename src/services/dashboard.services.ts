import type { EventCreationRequest } from '@/models/eventCreationRequest.model'
import type { DashboardStats } from '@/models/dashboard.model'
import type { Transaction } from '@/models/transaction.model'
import type { Event } from '@/models/event.model'
import type { User } from '@/models/user.model'
import type { Bib } from '@/models/bib.model'

import { pb } from '@/lib/services/pocketbase'

/**
 * Gets comprehensive dashboard statistics from all collections
 */
export async function getDashboardStats(): Promise<DashboardStats> {
	try {
		// Run all queries in parallel for better performance 🚀
		const [events, bibs, users, transactions, eventCreationRequests] = await Promise.all([
			// Events 🎉
			pb.collection('events').getFullList<Event>({
				fields: 'id,isPartnered',
			}),

			// Bibs 🏷️
			pb.collection('bibs').getFullList<Bib>({
				fields: 'id,status,validated',
			}),

			// Users 👤
			pb.collection('users').getFullList<User>({
				fields: 'id',
			}),

			// Transactions 💰
			pb.collection('transactions').getFullList<Transaction>({
				fields: 'id,amount,transactionDate,status',
			}),

			// Event Creation Requests 📝
			pb.collection('eventCreationRequests').getFullList<EventCreationRequest>({
				fields: 'id,status',
			}),
		])

		// Calculate today's date for filtering 📅
		const today = new Date()
		const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

		// Process bibs statistics 📊
		const bibStats = {
			totalBibs: bibs.length,
			soldBibs: bibs.filter(bib => bib.status === 'sold').length,
			pendingBibs: bibs.filter(bib => !bib.validated).length,
			availableBibs: bibs.filter(bib => bib.status === 'available').length,
		}

		// Process transactions statistics 📊
		const todaysTransactionsList = transactions.filter(transaction => {
			const transactionDate = new Date(transaction.transactionDate)
			return transactionDate >= todayStart
		})

		const transactionStats = {
			totalTransactions: transactions.length,
			todaysTransactions: todaysTransactionsList.length,
			todaysRevenue: todaysTransactionsList.filter(t => t.status === 'succeeded').reduce((sum, t) => sum + t.amount, 0),
		}

		// Process event creation requests statistics 📊
		const eventCreationStats = {
			waiting: eventCreationRequests.filter(req => req.status === 'waiting').length,
			total: eventCreationRequests.length,
			rejected: eventCreationRequests.filter(req => req.status === 'rejected').length,
			accepted: eventCreationRequests.filter(req => req.status === 'accepted').length,
		}

		// Assemble final stats 📈
		const stats: DashboardStats = {
			// Events 🎉
			totalEvents: events.length,
			pendingEvents: eventCreationStats.waiting, // Events waiting for approval 🙏

			// Bibs 🏷️
			...bibStats,

			// Users 👤
			totalUsers: users.length,

			// Transactions 💰
			...transactionStats,

			// Event Creation Requests 📝
			eventCreationRequests: eventCreationStats,
		}

		return stats
	} catch (error: unknown) {
		console.error('Error fetching dashboard stats:', error)
		throw new Error('Error fetching dashboard statistics: ' + (error instanceof Error ? error.message : String(error)))
	}
}

/**
 * Gets recent activity for the dashboard
 */
export async function getRecentActivity(): Promise<
	Array<{
		id: string
		status: 'completed' | 'failed' | 'pending'
		timestamp: Date
		title: string
		type: 'bib_validation' | 'event_creation' | 'transaction' | 'user_registration'
	}>
> {
	try {
		const [recentBibs, recentEventRequests, recentUsers, recentTransactions] = await Promise.all([
			// Recent bibs needing validation ✅
			pb.collection('bibs').getList<Bib & { expand?: { eventId: Event } }>(1, 5, {
				sort: '-created',
				filter: 'validated = false',
				expand: 'eventId',
			}),

			// Recent event creation requests 🙏
			pb.collection('eventCreationRequests').getList<EventCreationRequest>(1, 5, {
				sort: '-created',
				filter: 'status = "waiting"',
			}),

			// Recent user registrations (last 24h) 🆕
			pb.collection('users').getList<User>(1, 5, {
				sort: '-created',
			}),

			// Recent transactions 💰
			pb.collection('transactions').getList<Transaction>(1, 5, {
				sort: '-created',
			}),
		])

		const activities: Array<{
			id: string
			status: 'completed' | 'failed' | 'pending'
			timestamp: Date
			title: string
			type: 'bib_validation' | 'event_creation' | 'transaction' | 'user_registration'
		}> = []

		// Add bib validation activities ✅
		recentBibs.items.forEach(bib => {
			const eventName = bib.expand?.eventId?.name ?? 'Unknown Event'
			activities.push({
				type: 'bib_validation',
				title: `Bib #${bib.registrationNumber} for ${eventName} needs validation`,
				timestamp: new Date(),
				status: 'pending',
				id: `bib-${bib.id}`,
			})
		})

		// Add event creation activities 🎉
		recentEventRequests.items.forEach(request => {
			activities.push({
				type: 'event_creation',
				title: `New event "${request.name}" requested for approval`,
				timestamp: new Date(),
				status: 'pending',
				id: `event-${request.id}`,
			})
		})

		// Add user registration activities 👤
		recentUsers.items.forEach(user => {
			activities.push({
				type: 'user_registration',
				title: `New user registered: ${user.firstName ?? 'Anonymous'} ${user.lastName ?? ''}`,
				timestamp: new Date(user.created),
				status: 'completed',
				id: `user-${user.id}`,
			})
		})

		// Add transaction activities 💰
		recentTransactions.items.forEach(transaction => {
			const status =
				transaction.status === 'succeeded' ? 'completed' : transaction.status === 'failed' ? 'failed' : 'pending'
			activities.push({
				type: 'transaction',
				title: `Transaction of €${transaction.amount} - ${transaction.status}`,
				timestamp: new Date(transaction.transactionDate),
				status,
				id: `transaction-${transaction.id}`,
			})
		})

		// Sort by timestamp (most recent first) 🕒
		activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

		// Return top 10 activities 🏆
		return activities.slice(0, 10)
	} catch (error: unknown) {
		console.error('Error fetching recent activity:', error)
		throw new Error('Error fetching recent activity: ' + (error instanceof Error ? error.message : String(error)))
	}
}
