'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, Ruler, FileText, Heart, Eye, Map, List, Filter, X } from 'lucide-react'

interface Property {
    id: string
    title: string
    price: string
    currency: string
    latitude: number
    longitude: number
    address: string
    details: {
        area?: number
        adaParsel?: string
        imarDurumu?: string
    }
    category: string
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
    minArea?: string
    maxArea?: string
    imarDurumu?: string
    location?: string
    features?: string[]
    sortBy?: string
    sortOrder?: string
}

export default function SearchPage() {
    const searchParams = useSearchParams()
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(false)
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
    const [showFilters, setShowFilters] = useState(true)
    const [filters, setFilters] = useState<SearchFilters>({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        location: searchParams.get('location') || '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    })
    const [suggestions, setSuggestions] = useState<any>(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
    })

    useEffect(() => {
        searchProperties()
    }, [filters, pagination.page])

    const searchProperties = async () => {
        setLoading(true)
        try {
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                status: 'PUBLISHED',
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value && value !== '')
                )
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

                // Get search suggestions if no results
                if (data.properties.length === 0) {
                    fetchSearchSuggestions()
                } else {
                    setSuggestions(null)
                }
            }
        } catch (error) {
            console.error('Error searching properties:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchSearchSuggestions = async () => {
        try {
            const queryParams = new URLSearchParams(
                Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value && value !== '')
                )
            )
            const response = await fetch(`http://localhost:3001/api/properties/suggestions?${queryParams}`)
            if (response.ok) {
                const data = await response.json()
                setSuggestions(data)
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error)
        }
    }

    const handleFilterChange = (key: keyof SearchFilters, value: string | string[]) => {
        setFilters(prev => ({
            ...prev,
            [key]: value || undefined
        }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const clearFilters = () => {
        setFilters({
            sortBy: 'createdAt',
            sortOrder: 'desc'
        })
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const applySuggestion = (suggestion: any) => {
        setFilters(prev => ({
            ...prev,
            ...suggestion.filters
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
            'IMARLIARSA': 'İmarlı Arsa',
            'TARLA': 'Tarla',
            'BAHCE': 'Bahçe',
            'ZEYTINLIK': 'Zeytinlik',
            'BAGLIK': 'Bağlık',
            'SANAYI': 'Sanayi Arsası',
            'KONUT': 'Konut Arsası',
            'TICARI': 'Ticari Arsa'
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
                            <h1 className="text-3xl font-bold text-gray-900">Arsa Arama</h1>
                            <p className="text-gray-600 mt-1">
                                {loading ? 'Aranıyor...' : `${pagination.total} ilan bulundu`}
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
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`p-2 ${viewMode === 'map' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Map className="w-4 h-4" />
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
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Arama Filtreleri</h3>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Temizle
                                </button>
                            </div>

                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Arama Terimi
                                </label>
                                <input
                                    type="text"
                                    value={filters.search || ''}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Başlık, açıklama, konum..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Konum
                                </label>
                                <select
                                    value={filters.location || ''}
                                    onChange={(e) => handleFilterChange('location', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Tüm Lokasyonlar</option>
                                    <option value="bilecik">Bilecik</option>
                                    <option value="kutahya">Kütahya</option>
                                    <option value="edirne">Edirne</option>
                                    <option value="afyonkarahisar">Afyonkarahisar</option>
                                    <option value="kirikkale">Kırıkkale</option>
                                    <option value="konya">Konya</option>
                                    <option value="manisa">Manisa</option>
                                    <option value="ordu">Ordu</option>
                                    <option value="kastamonu">Kastamonu</option>
                                    <option value="ankara">Ankara</option>
                                    <option value="bolu">Bolu</option>
                                    <option value="karabuk">Karabük</option>
                                    <option value="cankiri">Çankırı</option>
                                    <option value="isparta">Isparta</option>
                                    <option value="izmir">İzmir</option>
                                    <option value="duzce">Düzce</option>
                                    <option value="corum">Çorum</option>
                                    <option value="sivas">Sivas</option>
                                    <option value="tekirdag">Tekirdağ</option>
                                    <option value="giresun">Giresun</option>
                                </select>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Arsa Tipi
                                </label>
                                <select
                                    value={filters.category || ''}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Tüm Türler</option>
                                    <option value="IMARLIARSA">İmarlı Arsa</option>
                                    <option value="KONUT">Konut Arsası</option>
                                    <option value="TICARI">Ticari Arsa</option>
                                    <option value="SANAYI">Sanayi Arsası</option>
                                    <option value="TARLA">Tarla</option>
                                    <option value="BAHCE">Bahçe</option>
                                    <option value="ZEYTINLIK">Zeytinlik</option>
                                    <option value="BAGLIK">Bağlık</option>
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fiyat Aralığı (TRY)
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        value={filters.minPrice || ''}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        placeholder="Min"
                                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    <input
                                        type="number"
                                        value={filters.maxPrice || ''}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        placeholder="Max"
                                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* İmar Durumu */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    İmar Durumu
                                </label>
                                <select
                                    value={filters.imarDurumu || ''}
                                    onChange={(e) => handleFilterChange('imarDurumu', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Tümü</option>
                                    <option value="Konut İmarlı">Konut İmarlı</option>
                                    <option value="Ticari İmarlı">Ticari İmarlı</option>
                                    <option value="Sanayi İmarlı">Sanayi İmarlı</option>
                                    <option value="Tarım Arazisi">Tarım Arazisi</option>
                                    <option value="İmarsız">İmarsız</option>
                                </select>
                            </div>

                            {/* Area Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alan (m²)
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        value={filters.minArea || ''}
                                        onChange={(e) => handleFilterChange('minArea', e.target.value)}
                                        placeholder="Min m²"
                                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <input
                                        type="number"
                                        value={filters.maxArea || ''}
                                        onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                                        placeholder="Max m²"
                                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
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

                    {/* Results */}
                    <div className="flex-1">
                        {viewMode === 'map' ? (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                <Map className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Harita Görünümü
                                </h3>
                                <p className="text-gray-600">
                                    Harita entegrasyonu yakında eklenecek
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Search Suggestions */}
                                {suggestions && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                                        <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                                            Arama önerilerimiz:
                                        </h3>
                                        <div className="space-y-3">
                                            {suggestions.relaxedPrice && (
                                                <button
                                                    onClick={() => applySuggestion(suggestions.relaxedPrice)}
                                                    className="block w-full text-left p-3 bg-white rounded border hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="font-medium text-gray-900">
                                                        Fiyat aralığını genişletin
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {suggestions.relaxedPrice.description}
                                                    </div>
                                                </button>
                                            )}
                                            {suggestions.nearbyLocations && suggestions.nearbyLocations.length > 0 && (
                                                <div>
                                                    <div className="font-medium text-gray-900 mb-2">Yakın lokasyonlar:</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {suggestions.nearbyLocations.map((location: any, index: number) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => applySuggestion(location)}
                                                                className="px-3 py-1 bg-white border rounded-full text-sm hover:bg-gray-50 transition-colors"
                                                            >
                                                                {location.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Properties Grid */}
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
                                            Arama kriterlerinize uygun ilan bulunamadı
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            Farklı filtreler deneyerek arama yapabilirsiniz.
                                        </p>
                                        <button
                                            onClick={clearFilters}
                                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Filtreleri Temizle
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                                            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
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

                                                        <div className="flex items-center text-sm text-gray-600 mb-4">
                                                            {property.details.area && (
                                                                <div className="flex items-center">
                                                                    <Ruler className="w-4 h-4 mr-1" />
                                                                    <span>{property.details.area.toLocaleString('tr-TR')} m²</span>
                                                                </div>
                                                            )}
                                                            {property.details.imarDurumu && (
                                                                <div className="flex items-center ml-4">
                                                                    <FileText className="w-4 h-4 mr-1" />
                                                                    <span>{property.details.imarDurumu}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="text-2xl font-bold text-green-600">
                                                                {formatPrice(property.price, property.currency)}
                                                            </div>
                                                            <Link
                                                                href={`/ilanlar/${property.id}`}
                                                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
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
                                                        Onceki
                                                    </button>

                                                    {[...Array(pagination.totalPages)].map((_, i) => (
                                                        <button
                                                            key={i + 1}
                                                            onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                                                            className={`px-4 py-2 border rounded-lg ${pagination.page === i + 1
                                                                ? 'bg-green-600 text-white border-green-600'
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
