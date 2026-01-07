import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export interface Feature {
    id: string
    name: string
    category: string
    icon?: string
}

export interface FeatureCategory {
    category: string
    features: Feature[]
}

// Get all features
export const useFeatures = () => {
    return useQuery({
        queryKey: ['features'],
        queryFn: async (): Promise<Feature[]> => {
            const response = await apiClient.get<Feature[]>('/features')
            return response
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}

// Get features grouped by category
export const useFeatureCategories = () => {
    return useQuery({
        queryKey: ['features', 'categories'],
        queryFn: async (): Promise<FeatureCategory[]> => {
            const response = await apiClient.get<FeatureCategory[]>('/features/categories')
            return response
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}