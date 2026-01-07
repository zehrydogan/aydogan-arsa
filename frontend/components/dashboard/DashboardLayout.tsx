'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home,
    MessageSquare,
    Settings,
    BarChart3,
    Plus,
    User,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useUnreadContactCount } from '@/hooks/useContact'
import { useMessages } from '@/hooks/useMessages'

interface DashboardLayoutProps {
    children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const { user, logout } = useAuthStore()
    const { data: unreadData } = useUnreadContactCount()
    const { unreadCount: messageUnreadCount } = useMessages()

    const unreadCount = unreadData?.unreadCount || 0

    const navigation = [
        {
            name: 'Panel',
            href: '/panel',
            icon: Home,
            current: pathname === '/panel'
        },
        {
            name: 'İlanlarım',
            href: '/panel/ilanlar',
            icon: BarChart3,
            current: pathname.startsWith('/panel/ilanlar')
        },
        {
            name: 'Yeni İlan',
            href: '/panel/ilanlar/yeni',
            icon: Plus,
            current: pathname === '/panel/ilanlar/yeni'
        },
        {
            name: 'İletişim',
            href: '/panel/iletisim',
            icon: MessageSquare,
            current: pathname.startsWith('/panel/iletisim'),
            badge: unreadCount > 0 ? unreadCount : undefined
        },
        {
            name: 'Mesajlar',
            href: '/panel/mesajlar',
            icon: MessageSquare,
            current: pathname.startsWith('/panel/mesajlar'),
            badge: messageUnreadCount > 0 ? messageUnreadCount : undefined
        },
        {
            name: 'Ayarlar',
            href: '/panel/ayarlar',
            icon: Settings,
            current: pathname.startsWith('/panel/ayarlar')
        }
    ]

    const handleLogout = () => {
        logout()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
                    <div className="flex h-16 items-center justify-between px-4 border-b">
                        <Link href="/" className="flex items-center space-x-2">
                            <img src="/logo.png" alt="Aydoğan Arsa" className="h-10 w-auto" />
                            <span className="text-xl font-bold text-gray-900">Aydoğan Arsa</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${item.current
                                    ? 'bg-green-50 text-green-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <div className="flex items-center space-x-3">
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </div>
                                {item.badge && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>
                    <div className="border-t p-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">
                                    {user?.firstName} {user?.lastName}
                                </div>
                                <div className="text-xs text-gray-500">{user?.email}</div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Çıkış Yap</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-grow bg-white border-r">
                    <div className="flex h-16 items-center px-4 border-b">
                        <Link href="/" className="flex items-center space-x-2">
                            <img src="/logo.png" alt="Aydoğan Arsa" className="h-10 w-auto" />
                            <span className="text-xl font-bold text-gray-900">Aydoğan Arsa</span>
                        </Link>
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${item.current
                                    ? 'bg-green-50 text-green-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </div>
                                {item.badge && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>
                    <div className="border-t p-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">
                                    {user?.firstName} {user?.lastName}
                                </div>
                                <div className="text-xs text-gray-500">{user?.email}</div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Çıkış Yap</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Mobile header */}
                <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <Link href="/" className="flex items-center space-x-2">
                        <img src="/logo.png" alt="Aydoğan Arsa" className="h-10 w-auto" />
                        <span className="text-xl font-bold text-gray-900">Aydoğan Arsa</span>
                    </Link>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Page content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    )
}