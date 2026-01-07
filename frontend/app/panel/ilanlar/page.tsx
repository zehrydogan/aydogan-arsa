'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Eye, Trash2, Search, Filter } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useOwnerProperties, useDeleteProperty } from '@/hooks/usePropertyManagement'
import { Property } from '@/lib/types'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default function PropertiesPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading, _hasHydrated } = useAuthStore()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<string>('')

    const { data: propertiesData, isLoading, error, refetch } = useOwnerProperties({
        page,
        limit: 10,
        search,
        status: status || undefined
    })
    const deleteProperty = useDeleteProperty()

    // Auth check with proper hydration handling
    useEffect(() => {
        // Don't redirect until hydration is complete
        if (!_hasHydrated) return

        // If not loading and not authenticated, redirect to login
        if (!authLoading && !isAuthenticated) {
            router.push('/giris')
            return
        }

        // If authenticated but not owner/admin, redirect to home
        if (isAuthenticated && user && user.role !== 'OWNER' && user.role !== 'ADMIN') {
            router.push('/')
            return
        }
    }, [isAuthenticated, user, authLoading, _hasHydrated, router])

    const handleDelete = async (property: Property) => {
        if (confirm(`"${property.title}" ilanını silmek istediğinizden emin misiniz?`)) {
            try {
                await deleteProperty.mutateAsync(property.id)
                // Refresh the list after deletion
                refetch()
            } catch (error) {
                console.error('Failed to delete property:', error)
            }
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return 'bg-green-100 text-green-800'
            case 'DRAFT':
                return 'bg-yellow-100 text-yellow-800'
            case 'ARCHIVED':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return 'Yayında'
            case 'DRAFT':
                return 'Taslak'
            case 'ARCHIVED':
                return 'Arşivlendi'
            default:
                return status
        }
    }

    const formatPrice = (price: number | string, currency: string = 'TRY') => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price
        return new Intl.NumberFormat('tr-TR').format(numPrice) + ' TL'
    }

    // Show loading while auth is being determined
    if (!_hasHydrated || authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-48 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>
            </div>
        )
    }

    // Don't render if not authenticated or wrong role
    if (!isAuthenticated || !user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
        return null
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-6">
                                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Hata Oluştu</h1>
                        <p className="text-gray-600 mb-6">İlanlar yüklenirken bir hata oluştu.</p>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">Hata detayı: {error.message}</p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => refetch()}
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Tekrar Dene
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Sayfayı Yenile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    const properties = propertiesData?.data || propertiesData?.properties || []
    const total = propertiesData?.total || propertiesData?.pagination?.total || 0
    const totalPages = propertiesData?.totalPages || propertiesData?.pagination?.totalPages || 1

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Arsa İlanlarım</h1>
                        <p className="text-gray-600">
                            Toplam {total} ilan
                        </p>
                    </div>
                    <Link
                        href="/panel/ilanlar/yeni"
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Yeni İlan</span>
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Arama
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="İlan başlığı veya açıklama..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Durum
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Tüm Durumlar</option>
                                <option value="PUBLISHED">Yayında</option>
                                <option value="DRAFT">Taslak</option>
                                <option value="ARCHIVED">Arşivlendi</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSearch('')
                                    setStatus('')
                                }}
                                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                            >
                                <Filter className="w-5 h-5" />
                                <span>Temizle</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Properties List */}
                {properties.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Henüz İlan Yok
                        </h3>
                        <p className="text-gray-600 mb-6">
                            İlk arsa ilanınızı oluşturun ve potansiyel alıcılara ulaşın.
                        </p>
                        <Link
                            href="/panel/ilanlar/yeni"
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>İlk İlanınızı Oluşturun</span>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {properties.map((property: Property) => (
                            <div
                                key={property.id}
                                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {property.title}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                                                {getStatusText(property.status)}
                                            </span>
                                        </div>

                                        <p className="text-gray-600 mb-3 line-clamp-2">
                                            {property.description}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                            <div>
                                                <span className="font-medium">Fiyat:</span> {formatPrice(property.price, property.currency)}
                                            </div>
                                            <div>
                                                <span className="font-medium">Kategori:</span> {property.category}
                                            </div>
                                            <div>
                                                <span className="font-medium">Konum:</span> {property.address}
                                            </div>
                                            <div>
                                                <span className="font-medium">Oluşturulma:</span> {new Date(property.createdAt).toLocaleDateString('tr-TR')}
                                            </div>
                                        </div>

                                        {property.details?.area && (
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">Alan:</span> {property.details.area} m²
                                                {property.price && property.details.area && (
                                                    <span className="ml-4">
                                                        <span className="font-medium">m² Fiyatı:</span> {formatPrice(Math.round((typeof property.price === 'string' ? parseFloat(property.price) : property.price) / property.details.area))}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2 ml-4">
                                        <Link
                                            href={`/ilanlar/${property.id}`}
                                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                            title="İlanı Görüntüle"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                        <Link
                                            href={`/panel/ilanlar/${property.id}/duzenle`}
                                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                            title="İlanı Düzenle"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(property)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            title="İlanı Sil"
                                            disabled={deleteProperty.isPending}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <div className="flex space-x-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`px-4 py-2 rounded-lg ${page === pageNum
                                        ? 'bg-green-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}