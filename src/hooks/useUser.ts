import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getCurrentUserData, updateUserProfile } from '@/app/[locale]/profile/actions'
import type { User } from '@/models/user.model'

export function useUpdateUser() {
	const queryClient = useQueryClient()

	return useMutation({
		onSuccess: (updatedUser, { userId }) => {
			// Invalidate and refetch user data
			void queryClient.invalidateQueries({ queryKey: ['user', userId] })
			queryClient.setQueryData(['user', userId], updatedUser)
		},
		// The server saves the profile of the session's user: userId only names the cache entry to refresh
		mutationFn: ({ userData }: { userData: Partial<User>; userId: string }) => updateUserProfile(userData),
	})
}

export function useUser(userId: string) {
	return useQuery({
		staleTime: 0, // Always consider data stale to get fresh merchant ID
		refetchIntervalInBackground: true,
		refetchInterval: 5000, // Poll every 5 seconds to check for merchant ID updates
		queryKey: ['user', userId],
		// The server answers with the record of the session's user: userId only names the cache entry
		queryFn: () => getCurrentUserData(),
		enabled: !!userId,
	})
}
