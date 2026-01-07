import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, endpoints } from '@/lib/api'
import { Favorite } from '@/lib/types'
import { useAuthStore } from '@/store/authStore'

// Query keys
export const favoriteKeys = {
    all: ['favorites'] as const,
    lists: () => [...favoriteKeys.all, 'list'] as const,
    list: (userId: string) => [...favoriteKeys.lists(), userId] as const,
    ids: (userId: string) => [...favoriteKeys.all, 'ids', userId] as const,
    check: (userId: string, propertyId: string) => [...favoriteKeys.all, 'check', userId, propertyId] as const,
}

// Fetch user's favorites
export function useFavorites() {
    const { user, isAuthenticated } = useAuthStore()

    return useQuery({
        queryKey: favoriteKeys.list(user?.id || ''),
        queryFn: async (): Promise<Favorite[]> => {
            const response = await apiClient.get<{ favorites: Favorite[] }>(endpoints.favorites.list)
            return response.favorites
        },
        enabled: isAuthenticated && !!user,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

// Fetch favorite property IDs (for quick checks)
export function useFavoriteIds() {
    const { user, isAuthenticated } = useAuthStore()

    return useQuery({
        queryKey: favoriteKeys.ids(user?.id || ''),
        queryFn: async (): Promise<string[]> => {
            const response = await apiClient.get<{ favoriteIds: string[] }>(endpoints.favorites.ids)
            return response.favoriteIds
        },
        enabled: isAuthenticated && !!user,
        staleTime: 2 * 60 * 1000,
    })
}

// Check if property is favorited
export function useIsFavorite(propertyId: string) {
    const { user, isAuthenticated } = useAuthStore()

    return useQuery({
        queryKey: favoriteKeys.check(user?.id || '', propertyId),
        queryFn: async (): Promise<boolean> => {
            const response = await apiClient.get<{ isFavorited: boolean }>(
                endpoints.favorites.check(propertyId)
            )
            return response.isFavorited
        },
        enabled: isAuthenticated && !!user && !!propertyId,
        staleTime: 1 * 60 * 1000, // 1 minute
    })
}

// Add to favorites mutation
export function useAddFavorite() {
    const queryClient = useQueryClient()
    const { user } = useAuthStore()

    return useMutation({
        mutationFn: (propertyId: string) =>
            apiClient.post(endpoints.favorites.add(propertyId)),
        onSuccess: (_, propertyId) => {
            if (!user) return

            // Update favorite IDs cache
            queryClient.setQueryData(
                favoriteKeys.ids(user.id),
                (oldIds: string[] = []) => [...oldIds, propertyId]
            )

            // Update individual check cache
            queryClient.setQueryData(
                favoriteKeys.check(user.id, propertyId),
                true
            )

            // Invalidate favorites list to refetch with full data
            queryClient.invalidateQueries({
                queryKey: favoriteKeys.list(user.id)
            })
        },
        onError: (error) => {
            console.error('Error adding favorite:', error)
        },
    })
}

// Remove from favorites mutation
export function useRemoveFavorite() {
    const queryClient = useQueryClient()
    const { user } = useAuthStore()

    return useMutation({
        mutationFn: (propertyId: string) =>
            apiClient.delete(endpoints.favorites.remove(propertyId)),
        onSuccess: (_, propertyId) => {
            if (!user) return

            // Update favorite IDs cache
            queryClient.setQueryData(
                favoriteKeys.ids(user.id),
                (oldIds: string[] = []) => oldIds.filter(id => id !== propertyId)
            )

            // Update individual check cache
            queryClient.setQueryData(
                favoriteKeys.check(user.id, propertyId),
                false
            )

            // Update favorites list cache
            queryClient.setQueryData(
                favoriteKeys.list(user.id),
                (oldFavorites: Favorite[] = []) =>
                    oldFavorites.filter(fav => fav.propertyId !== propertyId)
            )
        },
        onError: (error) => {
            console.error('Error removing favorite:', error)
        },
    })
}

// Toggle favorite mutation
export function useToggleFavorite() {
    const addFavorite = useAddFavorite()
    const removeFavorite = useRemoveFavorite()
    const { user } = useAuthStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (propertyId: string) => {
            if (!user) throw new Error('User not authenticated')

            // Check current favorite status
            const isFavorite = queryClient.getQueryData(
                favoriteKeys.check(user.id, propertyId)
            ) as boolean

            if (isFavorite) {
                return removeFavorite.mutateAsync(propertyId)
            } else {
                return addFavorite.mutateAsync(propertyId)
            }
        },
        onError: (error) => {
            console.error('Error toggling favorite:', error)
        },
    })
}

// Custom hook for favorite status with optimistic updates
export function useFavoriteStatus(propertyId: string) {
    const { data: isFavorite, isLoading } = useIsFavorite(propertyId)
    const toggleFavorite = useToggleFavorite()
    const { user } = useAuthStore()
    const queryClient = useQueryClient()

    const toggle = async () => {
        if (!user || !propertyId) return

        // Optimistic update
        queryClient.setQueryData(
            favoriteKeys.check(user.id, propertyId),
            !isFavorite
        )

        try {
            await toggleFavorite.mutateAsync(propertyId)
        } catch (error) {
            // Revert optimistic update on error
            queryClient.setQueryData(
                favoriteKeys.check(user.id, propertyId),
                isFavorite
            )
            throw error
        }
    }

    return {
        isFavorite: isFavorite || false,
        isLoading: isLoading || toggleFavorite.isPending,
        toggle,
        error: toggleFavorite.error,
    }
}