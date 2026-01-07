import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { ContactRequest, CreateContactRequestDto } from '@/lib/types'

// Create contact request
export const useCreateContactRequest = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CreateContactRequestDto): Promise<ContactRequest> => {
            const response = await apiClient.post<ContactRequest>('/contact', data)
            return response
        },
        onSuccess: () => {
            // Invalidate contact-related queries
            queryClient.invalidateQueries({ queryKey: ['contact'] })
        },
        onError: (error: any) => {
            console.error('Contact request creation failed:', error)
            throw error
        }
    })
}

// Get contact requests for owner (dashboard)
export const useOwnerContactRequests = (page = 1, limit = 20) => {
    return useQuery({
        queryKey: ['contact', 'owner', page, limit],
        queryFn: async () => {
            const response = await apiClient.get<any>(`/contact/owner?page=${page}&limit=${limit}`)
            return response
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Get unread contact count
export const useUnreadContactCount = () => {
    return useQuery({
        queryKey: ['contact', 'unread-count'],
        queryFn: async () => {
            const response = await apiClient.get<{ unreadCount: number }>('/contact/unread-count')
            return response
        },
        refetchInterval: 30 * 1000, // Refetch every 30 seconds
        staleTime: 10 * 1000, // 10 seconds
    })
}

// Get single contact request
export const useContactRequest = (id: string) => {
    return useQuery({
        queryKey: ['contact', id],
        queryFn: async () => {
            const response = await apiClient.get<ContactRequest>(`/contact/${id}`)
            return response
        },
        enabled: !!id,
    })
}

// Update contact status
export const useUpdateContactStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, status, isRead }: { id: string; status?: string; isRead?: boolean }) => {
            const response = await apiClient.patch<ContactRequest>(`/contact/${id}/status`, { status, isRead })
            return response
        },
        onSuccess: (data, variables) => {
            // Update the specific contact request in cache
            queryClient.setQueryData(['contact', variables.id], data)

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['contact', 'owner'] })
            queryClient.invalidateQueries({ queryKey: ['contact', 'unread-count'] })
        },
    })
}

// Mark as read
export const useMarkContactAsRead = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.patch<ContactRequest>(`/contact/${id}/read`)
            return response
        },
        onSuccess: (data, id) => {
            // Update the specific contact request in cache
            queryClient.setQueryData(['contact', id], data)

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['contact', 'owner'] })
            queryClient.invalidateQueries({ queryKey: ['contact', 'unread-count'] })
        },
    })
}

// Delete contact request
export const useDeleteContactRequest = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.delete<{ message: string }>(`/contact/${id}`)
            return response
        },
        onSuccess: () => {
            // Invalidate contact-related queries
            queryClient.invalidateQueries({ queryKey: ['contact'] })
        },
    })
}