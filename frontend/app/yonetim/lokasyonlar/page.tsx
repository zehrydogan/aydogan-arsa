'use client'

import { useState } from 'react'
import { MapPin, Search, Plus, Edit, Trash2, Building2, TrendingUp } from 'lucide-react'

export default function AdminLocationsPage() {
    const [searchTerm, setSearchTerm] = useState('')

    // Mock data - gerçek uygulamada API'den gelecek
    const locations = [
        {
            id: 1,
            city: 'Bilecik',
            district: 'Bozüyük',
            propertyCount: 15,
            activeCount: 12,
            averagePrice: 850000,
            isActive: true
        },
        {
            id: 2,
            city: 'Bilecik',
            district: 'Gölpazarı',
            propertyCount: 8,
            activeCount: 6,
            averagePrice: 650000,
            isActive: true
        },
        {
            id: 3,
            city: 'Kütahya',
            district: 'Simav',
            propertyCount: 22,
            activeCount: 18,
            averagePrice: 750000,
            isActive: true
        },
        {
            id: 4,
            city: 'Edirne',
            district: 'Keşan',
            propertyCount: 12,
            activeCount: 10,
            averagePrice: 950000,
            isActive: true
        },
        {
            id: 5,
            city: 'Afyonkarahisar',
            district: 'Merkez',
            propertyCount: 18,
            activeCount: 15,
            averagePrice: 680000,
            isActive: true
        }
    ]

    const filteredLocations = locations.filter(location => {
        const searchText = `${location.city} ${location.district}`.toLowerCase()
        return searchText.includes(searchTerm.toLowerCase())
    })

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR').format(price) + ' TL'
    }

    const totalProperties = locations.reduce((sum, loc) => sum + loc.propertyCount, 0)
    const totalActive = locations.reduce((sum, loc) => sum + loc.activeCount, 0)
    const averagePrice = locations.reduce((sum, loc) => sum + loc.averagePrice, 0) / locations.length

    return (
        <div className="p-6">
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lokasyon Yönetimi</h1>
                        <p className="text-gray-600">Sistemdeki lokasyonları görüntüleyin ve yönetin</p>
                    </div>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Yeni Lokasyon</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <MapPin className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Toplam Lokasyon</p>
                            <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Toplam İlan</p>
                            <p className="text-2xl font-bold text-gray-900">{totalProperties}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Aktif İlanlar</p>
                            <p className="text-2xl font-bold text-gray-900">{totalActive}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Ortalama Fiyat</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatPrice(Math.round(averagePrice))}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Lokasyon ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lokasyon
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Toplam İlan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aktif İlan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ortalama Fiyat
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Durum
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLocations.map((location) => (
                                <tr key={location.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <MapPin className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {location.district}
                                                </div>
                                                <div className="text-sm text-gray-500">{location.city}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {location.propertyCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {location.activeCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatPrice(location.averagePrice)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${location.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {location.isActive ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button className="text-green-600 hover:text-green-900">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="text-red-600 hover:text-red-900">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}