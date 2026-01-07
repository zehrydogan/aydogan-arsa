'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Heart, MapPin, Bed, Bath, Square, Trash2, Eye, Search } from 'lucide-react'
import { useFavorites, useRemoveFavorite } from '@/hooks/useFavorites'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

export default function FavoritesPage() {
    const router = useRouter()
    const { isAuthenticated, user } = useAuthStore()
    const { data: favorites, isLoading, error } = useFavorites()
    const removeFavorite = useRemoveFavorite()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/giris')
        }
    }, [isAuthenticated, router])

    const handleRemoveFavorite = async (propertyid: string) => {
        try {
            await removeFavorite.mutateAsync(propertyid)
        } catch (error) {
            console.error('Error removing favorite:', error)
        }
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

    if (!isAuthenticated) {
        return null // Will redirect to login
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-64 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Bir hata oluştu</h1>
                    <p className="text-gray-600 mb-6">Favorileriniz yüklenirken bir sorun yaşandı.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <Heart className="w-8 h-8 text-red-500 mr-3" />
                                Favorilerim
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {favorites?.length || 0} favori emlak
                            </p>
                        </div>

                        <Link
                            href="/ilanlar"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <Search className="w-5 h-5" />
                            <span>Yeni İlan Ara</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {!favorites || favorites.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-gray-400 mb-6">
                            <Heart className="w-24 h-24 mx-auto mb-4" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Henüz favori emlak yok
                        </h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Beğendiğiniz emlakları favorilerinize ekleyerek daha sonra kolayca ulaşabilirsiniz.
                        </p>
                        <div className="space-y-4">
                            <Link
                                href="/ilanlar"
                                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Emlak İlanlarını Keşfet
                            </Link>
                            <div className="text-sm text-gray-500">
                                <p>💡 İpucu: İlan sayfalarındaki kalp simgesine tıklayarak favorilere ekleyebilirsiniz</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Favorites Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favorites.map((favorite) => (
                                <div key={favorite.propertyid} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                                    <div className="relative">
                                        <div className="h-48 bg-gray-200 flex items-center justify-center">
                                            {favorite.property.images && favorite.property.images.length > 0 ? (
                                                <img
                                                    src={favorite.property.images[0].url}
                                                    alt={favorite.property.images[0].alt || favorite.property.title}
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
                                                {getCategoryName(favorite.property.category)}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveFavorite(favorite.propertyid)}
                                            disabled={removeFavorite.isPending}
                                            className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                                            title="Favorilerden Çıkar"
                                        >
                                            {removeFavorite.isPending ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            ) : (
                                                <Trash2 className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                                            {favorite.property.title}
                                        </h3>

                                        <div className="flex items-center text-gray-600 mb-4">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            <span className="text-sm">{favorite.property.location.name}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                            {favorite.property.details?.rooms && (
                                                <div className="flex items-center">
                                                    <Bed className="w-4 h-4 mr-1" />
                                                    <span>{favorite.property.details?.rooms}</span>
                                                </div>
                                            )}
                                            {favorite.property.details?.bathrooms && (
                                                <div className="flex items-center">
                                                    <Bath className="w-4 h-4 mr-1" />
                                                    <span>{favorite.property.details?.bathrooms}</span>
                                                </div>
                                            )}
                                            {favorite.property.details?.area && (
                                                <div className="flex items-center">
                                                    <Square className="w-4 h-4 mr-1" />
                                                    <span>{favorite.property.details?.area}m²</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {formatPrice(favorite.property.price, favorite.property.currency)}
                                            </div>
                                            <Link
                                                href={`/ilanlar/${favorite.property.id}`}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                Detaylar
                                            </Link>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="text-xs text-gray-500">
                                                Favorilere eklendi: {new Date(favorite.createdAt).toLocaleDateString('tr-TR')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-12 bg-white rounded-xl shadow-sm p-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Hızlı İşlemler
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link
                                    href="/arama"
                                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Search className="w-6 h-6 text-blue-600 mr-3" />
                                    <div>
                                        <div className="font-medium text-gray-900">Gelişmiş Arama</div>
                                        <div className="text-sm text-gray-600">Filtrelerle detaylı arama yapın</div>
                                    </div>
                                </Link>

                                <Link
                                    href="/kayitli-aramalar"
                                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Heart className="w-6 h-6 text-red-500 mr-3" />
                                    <div>
                                        <div className="font-medium text-gray-900">Kayıtlı Aramalar</div>
                                        <div className="text-sm text-gray-600">Arama kriterlerinizi kaydedin</div>
                                    </div>
                                </Link>

                                <Link
                                    href="/ilanlar"
                                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Eye className="w-6 h-6 text-green-600 mr-3" />
                                    <div>
                                        <div className="font-medium text-gray-900">Tüm İlanlar</div>
                                        <div className="text-sm text-gray-600">Yeni emlakları keşfedin</div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
