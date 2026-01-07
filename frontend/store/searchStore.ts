import { create } from 'zustand'
import { Property, SearchFilters, SearchState } from '@/lib/types'

interface SearchStore extends SearchState {
    // Actions
    setFilters: (filters: Partial<SearchFilters>) => void
    clearFilters: () => void
    setResults: (results: Property[]) => void
    setLoading: (loading: boolean) => void
    setPagination: (page: number, total: number, totalPages: number) => void
    searchProperties: () => Promise<void>
    resetSearch: () => void
}

const API_BASE_URL = 'http://localhost:3001/api'

const initialFilters: SearchFilters = {
    sortBy: 'createdAt',
    sortOrder: 'desc'
}

export const useSearchStore = create<SearchStore>((set, get) => ({
    // Initial state
    filters: initialFilters,
    results: [],
    loading: false,
    total: 0,
    page: 1,
    totalPages: 0,

    // Actions
    setFilters: (newFilters: Partial<SearchFilters>) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
            page: 1 // Reset to first page when filters change
        }))
    },

    clearFilters: () => {
        set({
            filters: initialFilters,
            page: 1
        })
    },

    setResults: (results: Property[]) => {
        set({ results })
    },

    setLoading: (loading: boolean) => {
        set({ loading })
    },

    setPagination: (page: number, total: number, totalPages: number) => {
        set({ page, total, totalPages })
    },

    searchProperties: async () => {
        const { filters, page } = get()
        set({ loading: true })

        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                status: 'PUBLISHED',
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value && value !== '')
                )
            })

            const response = await fetch(`${API_BASE_URL}/properties?${queryParams}`)

            if (!response.ok) {
                throw new Error('Search failed')
            }

            const data = await response.json()

            set({
                results: data.properties || [],
                total: data.total || 0,
                totalPages: data.totalPages || 0,
                loading: false
            })
        } catch (error) {
            console.error('Search error:', error)
            set({
                results: [],
                total: 0,
                totalPages: 0,
                loading: false
            })
        }
    },

    resetSearch: () => {
        set({
            filters: initialFilters,
            results: [],
            loading: false,
            total: 0,
            page: 1,
            totalPages: 0
        })
    }
}))