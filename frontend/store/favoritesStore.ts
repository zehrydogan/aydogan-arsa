import { create } from 'zustand'
import { Favorite, Property } from '@/lib/types'
import { useAuthStore } from './authStore'

interface FavoritesStore {
    favorites: Favorite[]
    favoriteIds: Set<string>
    loading: boolean

    // Actions
    fetchFavorites: () => Promise<void>
    addFavorite: (propertyId: string) => Promise<void>
    removeFavorite: (propertyId: string) => Promise<void>
    toggleFavorite: (propertyId: string) => Promise<void>
    isFavorite: (propertyId: string) => boolean
    setLoading: (loading: boolean) => void
    clearFavorites: () => void
}

const API_BASE_URL = 'http://localhost:3001/api'

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
    // Initial state
    favorites: [],
    favoriteIds: new Set(),
    loading: false,

    // Actions
    fetchFavorites: async () => {
        const { accessToken } = useAuthStore.getState()
        if (!accessToken) return

        set({ loading: true })
        try {
            const response = await fetch(`${API_BASE_URL}/favorites`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            })

            if (!response.ok) {
                throw new Error('Failed to fetch favorites')
            }

            const data = await response.json()
            const favorites = data.favorites || []
            const favoriteIds = new Set<string>(favorites.map((fav: Favorite) => fav.propertyId))

            set({
                favorites,
                favoriteIds,
                loading: false
            })
        } catch (error) {
            console.error('Error fetching favorites:', error)
            set({ loading: false })
        }
    },

    addFavorite: async (propertyId: string) => {
        const { accessToken } = useAuthStore.getState()
        if (!accessToken) return

        try {
            const response = await fetch(`${API_BASE_URL}/favorites/${propertyId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            })

            if (!response.ok) {
                throw new Error('Failed to add favorite')
            }

            // Update local state
            set((state) => ({
                favoriteIds: new Set<string>(Array.from(state.favoriteIds).concat(propertyId))
            }))

            // Refresh favorites list
            get().fetchFavorites()
        } catch (error) {
            console.error('Error adding favorite:', error)
            throw error
        }
    },

    removeFavorite: async (propertyId: string) => {
        const { accessToken } = useAuthStore.getState()
        if (!accessToken) return

        try {
            const response = await fetch(`${API_BASE_URL}/favorites/${propertyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            })

            if (!response.ok) {
                throw new Error('Failed to remove favorite')
            }

            // Update local state
            set((state) => {
                const newFavoriteIds = new Set(state.favoriteIds)
                newFavoriteIds.delete(propertyId)
                return {
                    favoriteIds: newFavoriteIds,
                    favorites: state.favorites.filter(fav => fav.propertyId !== propertyId)
                }
            })
        } catch (error) {
            console.error('Error removing favorite:', error)
            throw error
        }
    },

    toggleFavorite: async (propertyId: string) => {
        const { isFavorite } = get()

        if (isFavorite(propertyId)) {
            await get().removeFavorite(propertyId)
        } else {
            await get().addFavorite(propertyId)
        }
    },

    isFavorite: (propertyId: string) => {
        return get().favoriteIds.has(propertyId)
    },

    setLoading: (loading: boolean) => {
        set({ loading })
    },

    clearFavorites: () => {
        set({
            favorites: [],
            favoriteIds: new Set(),
            loading: false
        })
    }
}))