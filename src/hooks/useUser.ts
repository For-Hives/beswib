import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { User } from '@/models/user.model'

import { getUserData, updateUser } from '@/services/user.services'

export function useUpdateUser() {
	const queryClient = useQueryClient()

	return useMutation({
		onSuccess: (updatedUser, { userId }) => {
			// Invalidate and refetch user data
			queryClient.invalidateQueries({ queryKey: ['user', userId] })
			queryClient.setQueryData(['user', userId], updatedUser)
		},
		mutationFn: ({ userId, userData }: { userData: Partial<User>; userId: string }) => updateUser(userId, userData),
	})
}

export function useUser(userId: string) {
	return useQuery({
		staleTime: 0, // Always consider data stale to get fresh merchant ID
		refetchIntervalInBackground: true,
		refetchInterval: 5000, // Poll every 5 seconds to check for merchant ID updates
		queryKey: ['user', userId],
		queryFn: () => getUserData(userId),
		enabled: !!userId,
	})
}
