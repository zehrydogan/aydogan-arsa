'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, MapPin, Bed, Bath, Square, Heart, Eye, Grid, List } from 'lucide-react'
import { useFavoriteStatus } from '@/hooks/useFavorites'

interface Property {
    id: string
    title: string
    price: string
    currency: string
    latitude: number
    longitude: number
    address: string
    details: {
        rooms?: number
        bathrooms?: number
        area?: number
    }
    category: string
    status: string
    images: Array<{
        url: string
        alt?: string
    }>
    location: {
        name: string
    }
}

interface SearchFilters {
    search?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    rooms?: string
    location?: string
    sortBy?: string
    sortOrder?: string
}

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<SearchFilters>({
        sortBy: 'createdAt',
        sortOrder: 'desc'
    })
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
    })

    useEffect(() => {
        fetchProperties()
    }, [filters, pagination.page])

    const fetchProperties = async () => {
        setLoading(true)
        try {
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                status: 'PUBLiSHED',
                ...filters
            })

            const response = await fetch(`http://localhost:3001/api/properties?${queryParams}`)
            if (response.ok) {
                const data = await response.json()
                setProperties(data.properties || [])
                setPagination(prev => ({
                    ...prev,
                    total: data.total || 0,
                    totalPages: data.totalPages || 0
                }))
            }
        } catch (error) {
            console.error('Error fetching properties:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (key: keyof SearchFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value || undefined
        }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const formatPrice = (price: string, currency: string) => {
        const numPrice = parseFloat(price)
        const displayCurrency = currency === 'TRY' ? 'TL' : currency
        return `${numPrice.toLocaleString('tr-TR')} ${displayCurrency}`
    }

    const getCategoryName = (category: string) => {
        const categories: { [key: string]: string } = {
            'APARTMENT': 'Daire',
            'HOUSE': 'Müstakil Ev',
            'VILLA': 'Villa',
            'OFFICE': 'Ofis',
            'COMMERCIAL': 'Ticari',
            'LAND': 'Arsa'
        }
        return categories[category] || category
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Emlak İlanları</h1>
                            <p className="text-gray-600 mt-1">
                                {pagination.total} ilan bulundu
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filtreler</span>
                            </button>

                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>

                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Arama
                                </label>
                                <input
                                    type="text"
                                    value={filters.search || ''}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Başlık, açıklama veya konum..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Emlak Türü
                                </label>
                                <select
                                    value={filters.category || ''}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Tüm Türler</option>
                                    <option value="APARTMENT">Daire</option>
                                    <option value="HOUSE">Müstakil Ev</option>
                                    <option value="VILLA">Villa</option>
                                    <option value="OFFICE">Ofis</option>
                                    <option value="COMMERCIAL">Ticari</option>
                                    <option value="LAND">Arsa</option>
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fiyat Aralığı
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        value={filters.minPrice || ''}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        placeholder="Min"
                                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <input
                                        type="number"
                                        value={filters.maxPrice || ''}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        placeholder="Max"
                                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Rooms */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Oda Sayısı
                                </label>
                                <select
                                    value={filters.rooms || ''}
                                    onChange={(e) => handleFilterChange('rooms', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Tüm Odalar</option>
                                    <option value="1">1 Oda</option>
                                    <option value="2">2 Oda</option>
                                    <option value="3">3 Oda</option>
                                    <option value="4">4 Oda</option>
                                    <option value="5">5+ Oda</option>
                                </select>
                            </div>

                            {/* Sort */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sıralama
                                </label>
                                <select
                                    value={`${filters.sortBy}-${filters.sortOrder}`}
                                    onChange={(e) => {
                                        const [sortBy, sortOrder] = e.target.value.split('-')
                                        handleFilterChange('sortBy', sortBy)
                                        handleFilterChange('sortOrder', sortOrder)
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="createdAt-desc">En Yeni</option>
                                    <option value="createdAt-asc">En Eski</option>
                                    <option value="price-asc">Fiyat (Düşük-Yüksek)</option>
                                    <option value="price-desc">Fiyat (Yüksek-Düşük)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Properties List */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                                        <div className="h-48 bg-gray-300"></div>
                                        <div className="p-6">
                                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-6 bg-gray-300 rounded mb-4"></div>
                                            <div className="h-4 bg-gray-300 rounded mb-4"></div>
                                            <div className="flex justify-between">
                                                <div className="h-4 bg-gray-300 rounded w-20"></div>
                                                <div className="h-4 bg-gray-300 rounded w-16"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : properties.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <Search className="w-16 h-16 mx-auto" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    İlan bulunamadı
                                </h3>
                                <p className="text-gray-600">
                                    Arama kriterlerinizi değiştirerek tekrar deneyin.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className={viewMode === 'grid'
                                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    : "space-y-6"
                                }>
                                    {properties.map((property) => (
                                        <div key={property.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                                            <div className="relative">
                                                <div className="h-48 bg-gray-200 flex items-center justify-center">
                                                    {property.images && property.images.length > 0 ? (
                                                        <img
                                                            src={property.images[0].url}
                                                            alt={property.images[0].alt || property.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="text-gray-400 text-center">
                                                            <Eye className="w-12 h-12 mx-auto mb-2" />
                                                            <span>Fotoğraf Yok</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute top-4 left-4">
                                                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                        {getCategoryName(property.category)}
                                                    </span>
                                                </div>
                                                <button className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                                                    <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                                                </button>
                                            </div>

                                            <div className="p-6">
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                                                    {property.title}
                                                </h3>

                                                <div className="flex items-center text-gray-600 mb-4">
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    <span className="text-sm">{property.location.name}</span>
                                                </div>

                                                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                                    {property.details.rooms && (
                                                        <div className="flex items-center">
                                                            <Bed className="w-4 h-4 mr-1" />
                                                            <span>{property.details.rooms}</span>
                                                        </div>
                                                    )}
                                                    {property.details.bathrooms && (
                                                        <div className="flex items-center">
                                                            <Bath className="w-4 h-4 mr-1" />
                                                            <span>{property.details.bathrooms}</span>
                                                        </div>
                                                    )}
                                                    {property.details.area && (
                                                        <div className="flex items-center">
                                                            <Square className="w-4 h-4 mr-1" />
                                                            <span>{property.details.area}m²</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {formatPrice(property.price, property.currency)}
                                                    </div>
                                                    <Link
                                                        href={`/ilanlar/${property.id}`}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                    >
                                                        Detaylar
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="flex justify-center mt-12">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                                disabled={pagination.page === 1}
                                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Önceki
                                            </button>

                                            {[...Array(pagination.totalPages)].map((_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                                                    className={`px-4 py-2 border rounded-lg ${pagination.page === i + 1
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}

                                            <button
                                                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                                                disabled={pagination.page === pagination.totalPages}
                                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Sonraki
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
