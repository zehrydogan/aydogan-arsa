'use client'

import { useState } from 'react'
import { Building2, Search, Filter, Eye, Edit, Trash2, MapPin, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function AdminPropertiesPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [filterCategory, setFilterCategory] = useState('ALL')

    // Mock data - gerçek uygulamada API'den gelecek
    const properties = [
        {
            id: 1,
            title: 'Bozüyük Merkez İmarlı Arsa',
            category: 'IMARLIARSA',
            price: 850000,
            area: 500,
            location: 'Bozüyük, Bilecik',
            status: 'ACTIVE',
            views: 245,
            createdAt: '2024-01-15',
            owner: 'Arsa Sahibi',
            images: 5
        },
        {
            id: 2,
            title: 'Söke Zeytinlik Arazi',
            category: 'ZEYTINLIK',
            price: 1200000,
            area: 2500,
            location: 'Söke, Aydın',
            status: 'ACTIVE',
            views: 189,
            createdAt: '2024-01-20',
            owner: 'Arsa Sahibi',
            images: 8
        },
        {
            id: 3,
            title: 'Didim Tarla Arazisi',
            category: 'TARLA',
            price: 750000,
            area: 1800,
            location: 'Didim, Aydın',
            status: 'PENDING',
            views: 156,
            createdAt: '2024-02-01',
            owner: 'Arsa Sahibi',
            images: 3
        }
    ]

    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.location.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'ALL' || property.status === filterStatus
        const matchesCategory = filterCategory === 'ALL' || property.category === filterCategory
        return matchesSearch && matchesStatus && matchesCategory
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800'
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800'
            case 'REJECTED':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'Aktif'
            case 'PENDING':
                return 'Beklemede'
            case 'REJECTED':
                return 'Reddedildi'
            default:
                return status
        }
    }

    const getCategoryText = (category: string) => {
        switch (category) {
            case 'IMARLIARSA':
                return 'İmarlı Arsa'
            case 'TARLA':
                return 'Tarla'
            case 'ZEYTINLIK':
                return 'Zeytinlik'
            case 'BAHCE':
                return 'Bahçe'
            case 'SANAYI':
                return 'Sanayi Arsası'
            case 'TICARI':
                return 'Ticari Arsa'
            default:
                return category
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR').format(price) + ' TL'
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">İlan Yönetimi</h1>
                <p className="text-gray-600">Sistemdeki tüm ilanları görüntüleyin ve yönetin</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Building2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Toplam İlan</p>
                            <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
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
                            <p className="text-2xl font-bold text-gray-900">
                                {properties.filter(p => p.status === 'ACTIVE').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Bekleyen İlanlar</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {properties.filter(p => p.status === 'PENDING').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Eye className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Toplam Görüntülenme</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {properties.reduce((sum, p) => sum + p.views, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="İlan ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="lg:w-48">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="ALL">Tüm Durumlar</option>
                                <option value="ACTIVE">Aktif</option>
                                <option value="PENDING">Beklemede</option>
                                <option value="REJECTED">Reddedildi</option>
                            </select>
                        </div>
                        <div className="lg:w-48">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="ALL">Tüm Kategoriler</option>
                                <option value="IMARLIARSA">İmarlı Arsa</option>
                                <option value="TARLA">Tarla</option>
                                <option value="ZEYTINLIK">Zeytinlik</option>
                                <option value="BAHCE">Bahçe</option>
                                <option value="SANAYI">Sanayi Arsası</option>
                                <option value="TICARI">Ticari Arsa</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Properties Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İlan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kategori
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fiyat
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Alan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Görüntülenme
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
                            {filteredProperties.map((property) => (
                                <tr key={property.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-gray-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {property.title}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {property.location}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {property.images} fotoğraf • {property.owner}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {getCategoryText(property.category)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatPrice(property.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {property.area.toLocaleString('tr-TR')} m²
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {property.views}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                                            {getStatusText(property.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link
                                                href={`/ilanlar/${property.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
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