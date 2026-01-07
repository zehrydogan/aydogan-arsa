'use client'

import Link from 'next/link'
import { MapPin, Ruler, FileText, Heart, Eye } from 'lucide-react'
import { useFavoriteStatus } from '@/hooks/useFavorites'
import { Property } from '@/lib/types'

interface PropertyCardProps {
    property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
    const { isFavorite, toggle: toggleFavorite, isLoading: favoriteLoading } = useFavoriteStatus(property.id)

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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
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
                <button
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isFavorite
                        ? 'bg-red-500 text-white'
                        : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                        } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {favoriteLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    ) : (
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    )}
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
                    {property.details?.area && (
                        <div className="flex items-center">
                            <Ruler className="w-4 h-4 mr-1" />
                            <span>{property.details.area.toLocaleString()} m²</span>
                        </div>
                    )}
                    {property.details?.imarDurumu && (
                        <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            <span>{property.details.imarDurumu}</span>
                        </div>
                    )}
                    {property.details?.adaParsel && (
                        <div className="flex items-center text-xs text-gray-500">
                            <span>Ada/Parsel: {property.details.adaParsel}</span>
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
    )
}