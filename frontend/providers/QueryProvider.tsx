'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Time before data is considered stale
                        staleTime: 60 * 1000, // 1 minute
                        // Time before inactive queries are garbage collected
                        gcTime: 5 * 60 * 1000, // 5 minutes
                        // Retry failed requests
                        retry: (failureCount, error: any) => {
                            // Don't retry on 4xx errors (client errors)
                            if (error?.status >= 400 && error?.status < 500) {
                                return false
                            }
                            // Retry up to 3 times for other errors
                            return failureCount < 3
                        },
                        // Refetch on window focus
                        refetchOnWindowFocus: false,
                        // Refetch on reconnect
                        refetchOnReconnect: true,
                    },
                    mutations: {
                        // Retry failed mutations
                        retry: (failureCount, error: any) => {
                            // Don't retry on 4xx errors
                            if (error?.status >= 400 && error?.status < 500) {
                                return false
                            }
                            // Retry up to 2 times for other errors
                            return failureCount < 2
                        },
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}