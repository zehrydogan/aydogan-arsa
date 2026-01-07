'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function AuthInitializer() {
    const { initialize, _hasHydrated } = useAuthStore()

    useEffect(() => {
        // Only initialize after hydration is complete
        if (_hasHydrated) {
            initialize()
        }
    }, [initialize, _hasHydrated])

    return null
}