'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    Search,
    Filter,
    MapPin,
    AlertCircle,
    Check
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useOwnerProperties, useDeleteProperty, useUpdateProperty } from '@/hooks/usePropertyManagement'
import { Property } from '@/lib/types'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default function PropertiesPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, isAuthenticated } = useAuthStore()
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('ALL')
    const [showSuccessMessage, setShowSuccessMessage] = useState(false)

    const { data: propertiesData, isLoading, error } = useOwnerProperties({
        page,
        limit: 20
    })
    const deleteProperty = useDeleteProperty()
    const updateProperty = useUpdateProperty()

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.push('/giris')
            return
        }

        if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
            router.push('/')
            return
        }

        // Check for success message
        if (searchParams.get('success') === 'created') {
            setShowSuccessMessage(true)
            setTimeout(() => setShowSuccessMessage(false), 5000)
        } else if (searchParams.get('success') === 'updated') {
            setShowSuccessMessage(true)
            setTimeout(() => setShowSuccessMessage(false), 5000)
        }
    }, [isAuthenticated, user, router, searchParams])

    const handleDelete = async (property: Property) => {
        if (confirm(`"${property.title}" ilanini silmek istediGinizden emin misiniz?`)) {
            try {
                await deleteProperty.mutateAsync(property.id)
            } catch (error) {
                console.error('Property deletion failed:', error)
            }
        }
    }

    const handleStatusChange = async (property: Property, newStatus: string) => {
        try {
            await updateProperty.mutateAsync({
                id: property.id,
                status: newStatus as any
            })
        } catch (error) {
            console.error('Status update failed:', error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLiSHED':
                return 'bg-green-100 text-green-800'
            case 'DRAFT':
                return 'bg-yellow-100 text-yellow-800'
            case 'SOLD':
                return 'bg-blue-100 text-blue-800'
            case 'RENTED':
                return 'bg-purple-100 text-purple-800'
            case 'iNACTiVE':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PUBLiSHED':
                return 'Yayinda'
            case 'DRAFT':
                return 'Taslak'
            case 'SOLD':
                return 'Satildi'
            case 'RENTED':
                return 'Kiralandi'
            case 'iNACTiVE':
                return 'Pasif'
            default:
                return status
        }
    }

    const formatPrice = (price: string, currency: string) => {
        const numPrice = parseFloat(price)
        const displayCurrency = currency === 'TRY' ? 'TL' : currency
        return `${numPrice.toLocaleString('tr-TR')} ${displayCurrency}`
    }

    if (!isAuthenticated || !user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-48 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-6 border">
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
                    <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Hata Oluştu</h3>
                        <p className="text-gray-600 mb-6">İlanlar yüklenirken bir hata oluştu.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    const properties = propertiesData?.data || []
    const filteredProperties = properties.filter((property: Property) => {
        const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.address.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'ALL' || property.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Success Message */}
                {showSuccessMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Check className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">
                                    {searchParams.get('success') === 'created'
                                        ? 'İlan başarıyla oluşturuldu!'
                                        : 'İlan başarıyla güncellendi!'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">ilanlarim</h1>
                        <p className="text-gray-600">
                            Toplam {propertiesData?.total || 0} ilan
                        </p>
                    </div>
                    <Link
                        href="/panel/ilanlar/yeni"
                        className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Yeni ilan</span>
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="ilan ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            >
                                <option value="ALL">TUm Durumlar</option>
                                <option value="PUBLiSHED">Yayinda</option>
                                <option value="DRAFT">Taslak</option>
                                <option value="SOLD">Satildi</option>
                                <option value="RENTED">Kiralandi</option>
                                <option value="iNACTiVE">Pasif</option>
                            </select>
                        </div>

                        {/* Results Count */}
                        <div className="flex items-center text-sm text-gray-600">
                            <span>{filteredProperties.length} ilan gOsteriliyor</span>
                        </div>
                    </div>
                </div>

                {/* Properties List */}
                {filteredProperties.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchTerm || statusFilter !== 'ALL' ? 'ilan Bulunamadi' : 'HenUz ilan Yok'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || statusFilter !== 'ALL'
                                ? 'Arama kriterlerinize uygun ilan bulunamadı.'
                                : 'İlk ilanınızı oluşturmak için başlayın.'
                            }
                        </p>
                        {!searchTerm && statusFilter === 'ALL' && (
                            <Link
                                href="/panel/ilanlar/yeni"
                                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span>İlk İlanını Oluştur</span>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredProperties.map((property: Property) => (
                            <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Property Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {property.title}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                                                        {getStatusText(property.status)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-gray-600 text-sm">
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    <span>{property.address}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {formatPrice(property.price, property.currency)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(property.createdAt).toLocaleDateString('tr-TR')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Property Details */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            {property.details?.area && (
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-gray-900">{property.details.area}</div>
                                                    <div className="text-xs text-gray-600">m²</div>
                                                </div>
                                            )}
                                            {property.details?.adaNo && (
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-gray-900">{property.details.adaNo}</div>
                                                    <div className="text-xs text-gray-600">Ada No</div>
                                                </div>
                                            )}
                                            {property.details?.parselNo && (
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-gray-900">{property.details.parselNo}</div>
                                                    <div className="text-xs text-gray-600">Parsel No</div>
                                                </div>
                                            )}
                                            {property.details?.tapuDurumu && (
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-gray-900">{property.details.tapuDurumu}</div>
                                                    <div className="text-xs text-gray-600">Tapu</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <div className="flex items-center space-x-4">
                                                <Link
                                                    href={`/ilanlar/${property.id}`}
                                                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span>Görüntüle</span>
                                                </Link>
                                                <Link
                                                    href={`/panel/ilanlar/${property.id}/duzenle`}
                                                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 text-sm"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    <span>Düzenle</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(property)}
                                                    disabled={deleteProperty.isPending}
                                                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Sil</span>
                                                </button>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                {property.status === 'DRAFT' && (
                                                    <button
                                                        onClick={() => handleStatusChange(property, 'PUBLiSHED')}
                                                        disabled={updateProperty.isPending}
                                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                                                    >
                                                        Yayinla
                                                    </button>
                                                )}
                                                {property.status === 'PUBLISHED' && (
                                                    <button
                                                        onClick={() => handleStatusChange(property, 'iNACTiVE')}
                                                        disabled={updateProperty.isPending}
                                                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                                                    >
                                                        PasifleStir
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {propertiesData && propertiesData.totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <div className="flex space-x-2">
                            {Array.from({ length: propertiesData.totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`px-4 py-2 rounded-lg ${page === pageNum
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
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
