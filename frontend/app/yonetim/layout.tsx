'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Users,
    Building2,
    MapPin,
    Settings,
    LogOut,
    Menu,
    X,
    Shield
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isLoading } = useAuthStore();

    // Admin kontrolü
    useEffect(() => {
        if (isLoading) return; // Loading durumunda bekle

        if (!user || user.role !== 'ADMIN') {
            router.push('/');
        }
    }, [user, router, isLoading]);

    const navigation = [
        {
            name: 'Dashboard',
            href: '/yonetim',
            icon: Home,
            current: pathname === '/yonetim'
        },
        {
            name: 'Kullanıcılar',
            href: '/yonetim/kullanicilar',
            icon: Users,
            current: pathname.startsWith('/yonetim/kullanicilar')
        },
        {
            name: 'İlanlar',
            href: '/yonetim/ilanlar',
            icon: Building2,
            current: pathname.startsWith('/yonetim/ilanlar')
        },
        {
            name: 'Lokasyonlar',
            href: '/yonetim/lokasyonlar',
            icon: MapPin,
            current: pathname.startsWith('/yonetim/lokasyonlar')
        },
        {
            name: 'Sistem Ayarları',
            href: '/yonetim/ayarlar',
            icon: Settings,
            current: pathname.startsWith('/yonetim/ayarlar')
        }
    ];

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return null; // Redirect edilirken hiçbir şey gösterme
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gray-900">
                    <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
                        <div className="flex items-center space-x-2">
                            <Shield className="w-8 h-8 text-green-500" />
                            <span className="text-xl font-bold text-white">Admin Panel</span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${item.current
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                    <div className="border-t border-gray-800 p-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">
                                    {user?.firstName} {user?.lastName}
                                </div>
                                <div className="text-xs text-gray-400">Admin</div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Çıkış Yap</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-grow bg-gray-900">
                    <div className="flex h-16 items-center px-4 border-b border-gray-800">
                        <div className="flex items-center space-x-2">
                            <Shield className="w-8 h-8 text-green-500" />
                            <span className="text-xl font-bold text-white">Admin Panel</span>
                        </div>
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${item.current
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                    <div className="border-t border-gray-800 p-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">
                                    {user?.firstName} {user?.lastName}
                                </div>
                                <div className="text-xs text-gray-400">Admin</div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
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
                    <div className="flex items-center space-x-2">
                        <Shield className="w-6 h-6 text-green-600" />
                        <span className="text-lg font-bold text-gray-900">Admin</span>
                    </div>
                    <div className="w-10" />
                </div>

                {/* Page content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}