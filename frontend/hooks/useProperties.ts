import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, endpoints } from '@/lib/api'
import { Property, SearchFilters, PaginatedResponse } from '@/lib/types'

// Query keys
export const propertyKeys = {
    all: ['properties'] as const,
    lists: () => [...propertyKeys.all, 'list'] as const,
    list: (filters: SearchFilters, page: number) => [...propertyKeys.lists(), { filters, page }] as const,
    details: () => [...propertyKeys.all, 'detail'] as const,
    detail: (id: string) => [...propertyKeys.details(), id] as const,
    suggestions: (filters: SearchFilters) => [...propertyKeys.all, 'suggestions', filters] as const,
    nearby: (lat: number, lng: number, radius: number) => [...propertyKeys.all, 'nearby', { lat, lng, radius }] as const,
}

// Fetch properties with filters and pagination
export function useProperties(filters: SearchFilters = {}, page: number = 1, limit: number = 12) {
    return useQuery({
        queryKey: propertyKeys.list(filters, page),
        queryFn: async (): Promise<PaginatedResponse<Property>> => {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                status: 'PUBLISHED',
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value && value !== '')
                )
            })

            const response = await apiClient.get<{
                properties: Property[]
                total: number
                page: number
                limit: number
                totalPages: number
            }>(`${endpoints.properties.list}?${queryParams}`)

            return {
                data: response.properties,
                total: response.total,
                page: response.page,
                limit: response.limit,
                totalPages: response.totalPages,
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}

// Fetch single property
export function useProperty(id: string) {
    return useQuery({
        queryKey: propertyKeys.detail(id),
        queryFn: () => apiClient.get<Property>(endpoints.properties.detail(id)),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    })
}

// Fetch search suggestions
export function useSearchSuggestions(filters: SearchFilters) {
    return useQuery({
        queryKey: propertyKeys.suggestions(filters),
        queryFn: () => apiClient.get(`${endpoints.properties.suggestions}?${new URLSearchParams(
            Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value && value !== '')
            )
        )}`),
        enabled: Object.keys(filters).length > 0,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

// Fetch nearby properties
export function useNearbyProperties(lat: number, lng: number, radius: number = 5000) {
    return useQuery({
        queryKey: propertyKeys.nearby(lat, lng, radius),
        queryFn: () => apiClient.get<Property[]>(`${endpoints.properties.nearby}?lat=${lat}&lng=${lng}&radius=${radius}`),
        enabled: !!(lat && lng),
        staleTime: 5 * 60 * 1000,
    })
}

// Create property mutation
export function useCreateProperty() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (propertyData: Partial<Property>) =>
            apiClient.post<Property>(endpoints.properties.create, propertyData),
        onSuccess: () => {
            // Invalidate and refetch properties list
            queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
        },
    })
}

// Update property mutation
export function useUpdateProperty() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Property> }) =>
            apiClient.put<Property>(endpoints.properties.update(id), data),
        onSuccess: (data) => {
            // Update the property in cache
            queryClient.setQueryData(propertyKeys.detail(data.id), data)
            // Invalidate lists to ensure consistency
            queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
        },
    })
}

// Delete property mutation
export function useDeleteProperty() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) =>
            apiClient.delete(endpoints.properties.delete(id)),
        onSuccess: (_, id) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: propertyKeys.detail(id) })
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
        },
    })
}

// Prefetch property details
export function usePrefetchProperty() {
    const queryClient = useQueryClient()

    return (id: string) => {
        queryClient.prefetchQuery({
            queryKey: propertyKeys.detail(id),
            queryFn: () => apiClient.get<Property>(endpoints.properties.detail(id)),
            staleTime: 5 * 60 * 1000,
        })
    }
}