'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, TreePine } from 'lucide-react'

export default function HeroSection() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [propertyType, setPropertyType] = useState('')
    const [location, setLocation] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (searchQuery) params.set('search', searchQuery)
        if (propertyType) params.set('category', propertyType)
        if (location) params.set('city', location)
        router.push(`/arama?${params.toString()}`)
    }

    return (
        <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative container mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Hayalinizdeki Arsayı
                        <span className="block text-yellow-400">Bulun</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
                        Türkiye genelinde satılık arsa, tarla, zeytinlik ve bahçe ilanları.
                        Güvenilir ve şeffaf arsa satışı.
                    </p>
                </div>

                {/* Search Form */}
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            {/* Location */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    Konum
                                </label>
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                                >
                                    <option value="">Tüm Lokasyonlar</option>
                                    <option value="bilecik">Bilecik</option>
                                    <option value="kutahya">Kütahya</option>
                                    <option value="edirne">Edirne</option>
                                    <option value="afyonkarahisar">Afyonkarahisar</option>
                                    <option value="konya">Konya</option>
                                    <option value="ankara">Ankara</option>
                                    <option value="manisa">Manisa</option>
                                    <option value="ordu">Ordu</option>
                                    <option value="kastamonu">Kastamonu</option>
                                    <option value="bolu">Bolu</option>
                                </select>
                            </div>

                            {/* Property Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center">
                                    <TreePine className="w-4 h-4 mr-1" />
                                    Arsa Tipi
                                </label>
                                <select
                                    value={propertyType}
                                    onChange={(e) => setPropertyType(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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

                            {/* Search Input */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center">
                                    <Search className="w-4 h-4 mr-1" />
                                    Arama
                                </label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Mahalle, ilçe veya özellik arayın..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                            <Search className="w-5 h-5" />
                            <span>Arsa Ara</span>
                        </button>
                    </form>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">100+</div>
                        <div className="text-green-100">Aktif İlan</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">20+</div>
                        <div className="text-green-100">İl</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">500+</div>
                        <div className="text-green-100">Mutlu Müşteri</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">7/24</div>
                        <div className="text-green-100">Destek</div>
                    </div>
                </div>
            </div>
        </section>
    )
}