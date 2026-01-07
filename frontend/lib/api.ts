import { useAuthStore } from '@/store/authStore'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// API Client with automatic token handling
class ApiClient {
    private baseURL: string

    constructor(baseURL: string) {
        this.baseURL = baseURL
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const { accessToken } = useAuthStore.getState()

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
                ...options.headers,
            },
            ...options,
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, config)

        // Handle token expiration
        if (response.status === 401) {
            const { refreshAuth, logout } = useAuthStore.getState()
            try {
                await refreshAuth()
                // Retry the request with new token
                const { accessToken: newToken } = useAuthStore.getState()
                if (newToken) {
                    config.headers = {
                        ...config.headers,
                        Authorization: `Bearer ${newToken}`,
                    }
                    const retryResponse = await fetch(`${this.baseURL}${endpoint}`, config)
                    if (!retryResponse.ok) {
                        throw new Error(`HTTP error! status: ${retryResponse.status}`)
                    }
                    return retryResponse.json()
                }
            } catch (error) {
                logout()
                throw new Error('Authentication failed')
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        return response.json()
    }

    // GET request
    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' })
    }

    // POST request
    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        })
    }

    // PUT request
    async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        })
    }

    // PATCH request
    async patch<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        })
    }

    // DELETE request
    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' })
    }

    // File upload
    async upload<T>(endpoint: string, formData: FormData): Promise<T> {
        const { accessToken } = useAuthStore.getState()

        const config: RequestInit = {
            method: 'POST',
            headers: {
                ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            },
            body: formData,
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, config)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        return response.json()
    }
}

export const apiClient = new ApiClient(API_BASE_URL)

// API endpoints
export const endpoints = {
    // Auth
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        refresh: '/auth/refresh',
        logout: '/auth/logout',
        profile: '/auth/profile',
    },

    // Properties
    properties: {
        list: '/properties',
        detail: (id: string) => `/properties/${id}`,
        create: '/properties',
        update: (id: string) => `/properties/${id}`,
        delete: (id: string) => `/properties/${id}`,
        suggestions: '/properties/suggestions',
        nearby: '/properties/nearby',
    },

    // Favorites
    favorites: {
        list: '/favorites',
        add: (propertyId: string) => `/favorites/${propertyId}`,
        remove: (propertyId: string) => `/favorites/${propertyId}`,
        check: (propertyId: string) => `/favorites/check/${propertyId}`,
        ids: '/favorites/ids',
    },

    // Saved Searches
    savedSearches: {
        list: '/saved-searches',
        detail: (id: string) => `/saved-searches/${id}`,
        create: '/saved-searches',
        update: (id: string) => `/saved-searches/${id}`,
        delete: (id: string) => `/saved-searches/${id}`,
        execute: (id: string) => `/saved-searches/${id}/execute`,
        count: (id: string) => `/saved-searches/${id}/count`,
        toggleNotification: (id: string) => `/saved-searches/${id}/toggle-notification`,
    },

    // Contact
    contact: {
        create: '/contact',
        list: '/contact',
        detail: (id: string) => `/contact/${id}`,
        markRead: (id: string) => `/contact/${id}/read`,
    },

    // Features
    features: {
        list: '/features',
        categories: '/features/categories',
    },

    // Locations
    locations: {
        list: '/locations',
        hierarchy: '/locations/hierarchy',
    },

    // Upload
    upload: {
        single: '/upload/single',
        multiple: '/upload/multiple',
        delete: (publicId: string) => `/upload/${publicId}`,
    },

    // Geographic
    geo: {
        nearby: '/geo/nearby',
        boundingBox: '/geo/bounding-box',
        cluster: '/geo/cluster',
        distance: '/geo/distance',
        route: '/geo/route',
        statistics: '/geo/statistics',
    },
}