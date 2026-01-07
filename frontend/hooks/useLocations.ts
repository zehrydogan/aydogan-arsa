import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export interface Location {
    id: string
    name: string
    type: 'CITY' | 'DISTRICT' | 'NEIGHBORHOOD'
    parentId?: string
    children?: Location[]
}

// Get all locations with hierarchy
export const useLocations = () => {
    return useQuery({
        queryKey: ['locations'],
        queryFn: async (): Promise<Location[]> => {
            const response = await apiClient.get<Location[]>('/locations')
            return response
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}

// Get location hierarchy (nested structure)
export const useLocationHierarchy = () => {
    return useQuery({
        queryKey: ['locations', 'hierarchy'],
        queryFn: async (): Promise<Location[]> => {
            const response = await apiClient.get<Location[]>('/locations/hierarchy')
            return response
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}