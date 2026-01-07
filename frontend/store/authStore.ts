import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthState, LoginCredentials, RegisterData } from '@/lib/types'

interface AuthStore extends AuthState {
    // Actions
    login: (credentials: LoginCredentials) => Promise<void>
    register: (data: RegisterData) => Promise<void>
    logout: () => void
    refreshAuth: () => Promise<void>
    updateUser: (user: Partial<User>) => void
    setLoading: (loading: boolean) => void
    checkAuth: () => void
    initialize: () => void
    _hasHydrated: boolean
    setHasHydrated: (hasHydrated: boolean) => void
}

const API_BASE_URL = 'http://localhost:3001/api'

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: true,
            _hasHydrated: false,

            // Actions
            setHasHydrated: (hasHydrated: boolean) => {
                set({ _hasHydrated: hasHydrated })
            },

            login: async (credentials: LoginCredentials) => {
                set({ isLoading: true })
                try {
                    const response = await fetch(`${API_BASE_URL}/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(credentials),
                    })

                    const data = await response.json()

                    if (!response.ok) {
                        set({ isLoading: false })
                        throw new Error(data.message || 'Login failed')
                    }

                    set({
                        user: data.user,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    })
                } catch (error) {
                    set({ isLoading: false })
                    throw error
                }
            },

            register: async (data: RegisterData) => {
                set({ isLoading: true })
                try {
                    const response = await fetch(`${API_BASE_URL}/auth/register`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    })

                    const result = await response.json()

                    if (!response.ok) {
                        throw new Error(result.message || 'Registration failed')
                    }

                    set({
                        user: result.user,
                        accessToken: result.accessToken,
                        refreshToken: result.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    })
                } catch (error) {
                    set({ isLoading: false })
                    throw error
                }
            },

            logout: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                })
            },

            refreshAuth: async () => {
                const { refreshToken } = get()
                if (!refreshToken) {
                    get().logout()
                    return
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${refreshToken}`,
                        },
                    })

                    const data = await response.json()

                    if (!response.ok) {
                        throw new Error('Token refresh failed')
                    }

                    set({
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                    })
                } catch (error) {
                    console.error('Token refresh failed:', error)
                    get().logout()
                }
            },

            updateUser: (userData: Partial<User>) => {
                const { user } = get()
                if (user) {
                    set({
                        user: { ...user, ...userData }
                    })
                }
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading })
            },

            checkAuth: () => {
                const { accessToken, refreshToken, user, _hasHydrated } = get()

                // Don't check auth until hydration is complete
                if (!_hasHydrated) {
                    return
                }

                if (accessToken && refreshToken && user) {
                    set({ isAuthenticated: true, isLoading: false })
                } else {
                    set({ isAuthenticated: false, isLoading: false })
                }
            },

            initialize: () => {
                const { _hasHydrated } = get()

                // Only initialize after hydration
                if (_hasHydrated) {
                    get().checkAuth()
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
            onRehydrateStorage: () => (state: any) => {
                return (state: any, error: any) => {
                    if (error) {
                        console.error('Auth rehydration failed:', error)
                        useAuthStore.getState().setHasHydrated(true)
                        return
                    }

                    // Mark as hydrated and check auth
                    useAuthStore.getState().setHasHydrated(true)

                    if (state?.accessToken && state?.refreshToken && state?.user) {
                        useAuthStore.setState({
                            isAuthenticated: true,
                            isLoading: false
                        })
                    } else {
                        useAuthStore.setState({
                            isAuthenticated: false,
                            isLoading: false
                        })
                    }
                }
            },
        }
    )
)