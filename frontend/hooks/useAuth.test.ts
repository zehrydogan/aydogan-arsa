import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'

describe('useAuthStore', () => {
    beforeEach(() => {
        // Reset store before each test
        useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
        })
        localStorage.clear()
    })

    it('should initialize with no user', () => {
        const { result } = renderHook(() => useAuthStore())

        expect(result.current.user).toBeNull()
        expect(result.current.token).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
    })

    it('should set user and token on login', () => {
        const { result } = renderHook(() => useAuthStore())

        const mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'VISITOR' as const,
        }
        const mockToken = 'mock-token-123'

        act(() => {
            result.current.setUser(mockUser, mockToken)
        })

        expect(result.current.user).toEqual(mockUser)
        expect(result.current.token).toBe(mockToken)
        expect(result.current.isAuthenticated).toBe(true)
        expect(localStorage.getItem('token')).toBe(mockToken)
    })

    it('should clear user and token on logout', () => {
        const { result } = renderHook(() => useAuthStore())

        const mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'VISITOR' as const,
        }

        act(() => {
            result.current.setUser(mockUser, 'token-123')
        })

        expect(result.current.isAuthenticated).toBe(true)

        act(() => {
            result.current.logout()
        })

        expect(result.current.user).toBeNull()
        expect(result.current.token).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
        expect(localStorage.getItem('token')).toBeNull()
    })

    it('should update user profile', () => {
        const { result } = renderHook(() => useAuthStore())

        const mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'VISITOR' as const,
        }

        act(() => {
            result.current.setUser(mockUser, 'token-123')
        })

        const updates = {
            firstName: 'Updated',
            lastName: 'Name',
        }

        act(() => {
            result.current.updateUser(updates)
        })

        expect(result.current.user?.firstName).toBe('Updated')
        expect(result.current.user?.lastName).toBe('Name')
        expect(result.current.user?.email).toBe('test@example.com')
    })

    it('should check if user has specific role', () => {
        const { result } = renderHook(() => useAuthStore())

        const sellerUser = {
            id: 'user-123',
            email: 'seller@example.com',
            firstName: 'Seller',
            lastName: 'User',
            role: 'SELLER' as const,
        }

        act(() => {
            result.current.setUser(sellerUser, 'token-123')
        })

        expect(result.current.hasRole('SELLER')).toBe(true)
        expect(result.current.hasRole('ADMIN')).toBe(false)
        expect(result.current.hasRole('VISITOR')).toBe(false)
    })

    it('should check if user is admin', () => {
        const { result } = renderHook(() => useAuthStore())

        const adminUser = {
            id: 'admin-123',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN' as const,
        }

        act(() => {
            result.current.setUser(adminUser, 'token-123')
        })

        expect(result.current.isAdmin()).toBe(true)
    })
})
