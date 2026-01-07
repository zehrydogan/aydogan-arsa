'use client'

import { useState } from 'react'
import { Users, Search, Filter, MoreVertical, Edit, Trash2, Shield, User } from 'lucide-react'

export default function AdminUsersPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('ALL')

    // Mock data - gerçek uygulamada API'den gelecek
    const users = [
        {
            id: 1,
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@aydoganarsa.com',
            role: 'ADMIN',
            createdAt: '2024-01-15',
            isActive: true,
            propertyCount: 0
        },
        {
            id: 2,
            firstName: 'Arsa',
            lastName: 'Sahibi',
            email: 'info@aydoganarsa.com',
            role: 'OWNER',
            createdAt: '2024-01-20',
            isActive: true,
            propertyCount: 8
        },
        {
            id: 3,
            firstName: 'Mehmet',
            lastName: 'Yılmaz',
            email: 'mehmet@example.com',
            role: 'VISITOR',
            createdAt: '2024-02-01',
            isActive: true,
            propertyCount: 0
        }
    ]

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = filterRole === 'ALL' || user.role === filterRole
        return matchesSearch && matchesRole
    })

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Shield className="w-4 h-4 text-red-500" />
            case 'OWNER':
                return <User className="w-4 h-4 text-green-500" />
            default:
                return <User className="w-4 h-4 text-gray-500" />
        }
    }

    const getRoleText = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'Yönetici'
            case 'OWNER':
                return 'Arsa Sahibi'
            case 'VISITOR':
                return 'Ziyaretçi'
            default:
                return role
        }
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Kullanıcı Yönetimi</h1>
                <p className="text-gray-600">Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Shield className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Yöneticiler</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.role === 'ADMIN').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <User className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Arsa Sahipleri</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.role === 'OWNER').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Ziyaretçiler</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.role === 'VISITOR').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Kullanıcı ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="sm:w-48">
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="ALL">Tüm Roller</option>
                                <option value="ADMIN">Yönetici</option>
                                <option value="OWNER">Arsa Sahibi</option>
                                <option value="VISITOR">Ziyaretçi</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kullanıcı
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İlan Sayısı
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kayıt Tarihi
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
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getRoleIcon(user.role)}
                                            <span className="ml-2 text-sm text-gray-900">
                                                {getRoleText(user.role)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.propertyCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {user.isActive ? 'Aktif' : 'Pasif'}
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