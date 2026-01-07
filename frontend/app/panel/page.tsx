'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, Home, Settings, BarChart3, Users, Bell, Plus, TrendingUp, Eye } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUnreadContactCount } from '@/hooks/useContact'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default function DashboardPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuthStore()
    const { data: unreadData } = useUnreadContactCount()

    useEffect(() => {
        console.log('Panel Auth Check:', { isLoading, isAuthenticated, user: !!user })
        if (isLoading) return // Loading durumunda bekle

        if (!isAuthenticated || !user) {
            console.log('Panel: Redirecting to login')
            router.push('/giris')
            return
        }

        if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
            console.log('Panel: Redirecting to home - wrong role:', user.role)
            router.push('/')
            return
        }
    }, [isAuthenticated, user, router, isLoading])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-48 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>
            </div>
        )
    }

    if (!isAuthenticated || !user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
        return null // Redirect edilirken hiçbir şey gösterme
    }

    const unreadCount = unreadData?.unreadCount || 0

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Hoş Geldiniz, {user.firstName}!
                    </h1>
                    <p className="text-gray-600">
                        Arsa yönetim panelinize hoş geldiniz. Buradan arsa ilanlarınızı ve mesajlarınızı yönetebilirsiniz.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Home className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Toplam İlan</p>
                                <p className="text-2xl font-bold text-gray-900">-</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-200 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-700" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Aktif İlan</p>
                                <p className="text-2xl font-bold text-gray-900">-</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-300 rounded-lg">
                                <MessageSquare className="w-6 h-6 text-green-800" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Yeni Mesaj</p>
                                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-400 rounded-lg">
                                <Eye className="w-6 h-6 text-green-900" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Görüntülenme</p>
                                <p className="text-2xl font-bold text-gray-900">-</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Link
                        href="/panel/ilanlar/yeni"
                        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200 group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                <Plus className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Yeni Arsa İlanı Ekle</h3>
                        <p className="text-gray-600">
                            Yeni arsa ilanı oluşturun ve yayınlayın
                        </p>
                    </Link>

                    <Link
                        href="/panel/iletisim"
                        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200 group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-200 rounded-lg group-hover:bg-green-300 transition-colors">
                                <MessageSquare className="w-8 h-8 text-green-700" />
                            </div>
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">İletişim Talepleri</h3>
                        <p className="text-gray-600">
                            Gelen mesajları görüntüleyin ve yanıtlayın
                        </p>
                    </Link>

                    <Link
                        href="/panel/ilanlar"
                        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200 group"
                    >
                        <div className="p-3 bg-green-300 rounded-lg mb-4 group-hover:bg-green-400 transition-colors">
                            <BarChart3 className="w-8 h-8 text-green-800" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Arsa İlanlarım</h3>
                        <p className="text-gray-600">
                            Mevcut arsa ilanlarınızı görüntüleyin ve düzenleyin
                        </p>
                    </Link>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
                    <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Henüz aktivite bulunmuyor</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Arsa ilanı eklediğinizde ve mesaj aldığınızda burada görünecek
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
