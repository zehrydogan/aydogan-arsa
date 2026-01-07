'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, MapPin, Save, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function ProfilPage() {
    const router = useRouter()
    const { user, isAuthenticated, checkAuth, isLoading } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    })

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    useEffect(() => {
        if (isLoading) return // Loading durumunda bekle

        if (!isAuthenticated) {
            router.push('/giris')
        } else if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || ''
            })
        }
    }, [isAuthenticated, user, router, isLoading])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // Simulate update
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSuccess('Profil bilgileriniz güncellendi.')
        setLoading(false)
        setTimeout(() => setSuccess(''), 3000)
    }

    if (isLoading || !isAuthenticated || !user) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Yükleniyor...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Profil Ayarları</h1>

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                        {success}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                        <User className="w-5 h-5 mr-2 text-green-600" />
                        Kişisel Bilgiler
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="05XX XXX XX XX"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Lock className="w-5 h-5 mr-2 text-green-600" />
                        Hesap Bilgileri
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600">Hesap Türü</span>
                            <span className="font-medium text-gray-900">
                                {user.role === 'ADMIN' ? 'Yönetici' : user.role === 'OWNER' ? 'Arsa Sahibi' : 'Ziyaretçi'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600">Kayıt Tarihi</span>
                            <span className="font-medium text-gray-900">
                                {new Date(user.createdAt || Date.now()).toLocaleDateString('tr-TR')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
