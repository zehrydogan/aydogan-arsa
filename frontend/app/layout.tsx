import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import QueryProvider from '@/providers/QueryProvider'
import AuthInitializer from '@/components/AuthInitializer'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

export const metadata: Metadata = {
    title: 'Aydoğan Arsa - Arsa Satış Platformu',
    description: 'Türkiye genelinde arsa, tarla, zeytinlik ve bahçe satışı. Bilecik, Kütahya, Edirne, Afyonkarahisar ve daha birçok ilde güvenilir arsa satışının adresi.',
    keywords: 'arsa, tarla, zeytinlik, bahçe, satılık arsa, imarlı arsa, sanayi arsası, ticari arsa, bilecik, kütahya, edirne, afyon, konya',
    authors: [{ name: 'Aydoğan Arsa' }],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="tr">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body className={inter.className}>
                <QueryProvider>
                    <AuthInitializer />
                    <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-1">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </QueryProvider>
            </body>
        </html>
    )
}
