import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Property } from '@/lib/types'

export interface CreatePropertyData {
    title: string
    description: string
    price: string
    currency: string
    latitude: number
    longitude: number
    address: string
    locationId: string
    details: {
        area?: number
        adaNo?: string
        parselNo?: string
        paftaNo?: string
        imarDurumu?: string
        gabari?: string
        katSayisi?: number
        emsal?: string
        taks?: string
        tapuDurumu?: string
        krediyeUygun?: boolean
        tapiCinsi?: string
        yolCephesi?: number
        derinlik?: number
        sekil?: string
        egim?: string
        zeminYapisi?: string
        elektrik?: boolean
        su?: boolean
        dogalgaz?: boolean
        kanalizasyon?: boolean
        telefon?: boolean
        zeminEtudu?: boolean
        yoluAcilmis?: boolean
        sondajKuyu?: boolean
        aritma?: boolean
        sanayiElektrik?: boolean
        anaYolaYakin?: boolean
        denizeSifir?: boolean
        denizeYakin?: boolean
        topluUlasimaYakin?: boolean
        havaalaninaYakin?: boolean
        merkezeYakin?: boolean
        ifrazli?: boolean
        parselli?: boolean
        projeli?: boolean
        koseParsel?: boolean
        manzaraSehir?: boolean
        manzaraDeniz?: boolean
        manzaraDoga?: boolean
        manzaraGol?: boolean
        manzaraDag?: boolean
        tapiSuresi?: string
        takas?: boolean
    }
    category: 'IMARLIARSA' | 'TARLA' | 'BAHCE' | 'ZEYTINLIK' | 'BAGLIK' | 'SANAYI' | 'KONUT' | 'TICARI'
    status?: 'DRAFT' | 'PUBLISHED'
    featureIds?: string[]
}

export interface UpdatePropertyData extends Partial<Omit<CreatePropertyData, 'status'>> {
    id: string
    status?: 'DRAFT' | 'PUBLISHED' | 'SOLD' | 'INACTIVE'
}

// Create property
export const useCreateProperty = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CreatePropertyData): Promise<Property> => {
            const response = await apiClient.post<Property>('/properties', data)
            return response
        },
        onSuccess: () => {
            // Invalidate property-related queries
            queryClient.invalidateQueries({ queryKey: ['properties'] })
            queryClient.invalidateQueries({ queryKey: ['owner-properties'] })
        },
        onError: (error: any) => {
            console.error('Property creation failed:', error)
            throw error
        }
    })
}

// Update property
export const useUpdateProperty = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: UpdatePropertyData): Promise<Property> => {
            const { id, ...updateData } = data
            const response = await apiClient.patch<Property>(`/properties/${id}`, updateData)
            return response
        },
        onSuccess: (data, variables) => {
            // Update the specific property in cache
            queryClient.setQueryData(['properties', variables.id], data)

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['properties'] })
            queryClient.invalidateQueries({ queryKey: ['owner-properties'] })
        },
    })
}

// Delete property
export const useDeleteProperty = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string): Promise<{ message: string }> => {
            const response = await apiClient.delete<{ message: string }>(`/properties/${id}`)
            return response
        },
        onSuccess: () => {
            // Invalidate property-related queries
            queryClient.invalidateQueries({ queryKey: ['properties'] })
            queryClient.invalidateQueries({ queryKey: ['owner-properties'] })
        },
    })
}

// Get owner's properties
export const useOwnerProperties = (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
}) => {
    const { page = 1, limit = 20, search, status } = params || {}

    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    })

    if (search) queryParams.append('search', search)
    if (status) queryParams.append('status', status)

    return useQuery({
        queryKey: ['owner-properties', page, limit, search, status],
        queryFn: async () => {
            const response = await apiClient.get<any>(`/properties/owner?${queryParams.toString()}`)
            return response
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Get owner's properties statistics
export const useOwnerPropertyStats = () => {
    return useQuery({
        queryKey: ['owner-property-stats'],
        queryFn: async () => {
            const response = await apiClient.get<any>('/properties/owner/stats')
            return response
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Get single property by ID
export const useProperty = (id: string) => {
    return useQuery({
        queryKey: ['properties', id],
        queryFn: async () => {
            const response = await apiClient.get<Property>(`/properties/${id}`)
            return response
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}
export const useUploadPropertyImages = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ propertyId, files }: { propertyId: string; files: File[] }): Promise<any> => {
            const formData = new FormData()
            files.forEach((file) => {
                formData.append('images', file)
            })
            formData.append('propertyId', propertyId)

            const response = await apiClient.upload<any>('/upload/multiple', formData)
            return response
        },
        onSuccess: (_data, variables) => {
            // Invalidate property queries to refresh images
            queryClient.invalidateQueries({ queryKey: ['properties', variables.propertyId] })
            queryClient.invalidateQueries({ queryKey: ['owner-properties'] })
        },
    })
}