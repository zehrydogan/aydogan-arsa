'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, Instagram, Facebook } from 'lucide-react'

export default function IletisimPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSuccess(true)
        setLoading(false)
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-green-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">İletişim</h1>
                    <p className="text-xl text-green-100">Sorularınız için bize ulaşın</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">İletişim Bilgileri</h2>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Adres</h3>
                                        <p className="text-gray-600 text-sm">Türkiye Geneli Hizmet</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Telefon</h3>
                                        <p className="text-gray-600 text-sm">+90 212 XXX XX XX</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">E-posta</h3>
                                        <p className="text-gray-600 text-sm">info@aydoganarsa.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Çalışma Saatleri</h3>
                                        <p className="text-gray-600 text-sm">Pazartesi - Cumartesi: 09:00 - 18:00</p>
                                        <p className="text-gray-600 text-sm">Pazar: Kapalı</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Sosyal Medya</h2>
                            <div className="flex space-x-4">
                                <a href="https://www.instagram.com/aydoganarsa/" target="_blank" rel="noopener noreferrer"
                                    className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors">
                                    <Instagram className="w-5 h-5 text-green-600" />
                                </a>
                                <a href="https://www.facebook.com/aydoganarsa" target="_blank" rel="noopener noreferrer"
                                    className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors">
                                    <Facebook className="w-5 h-5 text-green-600" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Bize Mesaj Gönderin</h2>

                            {success ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-green-800 mb-2">Mesajınız Gönderildi!</h3>
                                    <p className="text-green-600">En kısa sürede size dönüş yapacağız.</p>
                                    <button onClick={() => setSuccess(false)} className="mt-4 text-green-600 hover:underline">
                                        Yeni mesaj gönder
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Adınız Soyadınız"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">E-posta *</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="ornek@email.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="05XX XXX XX XX"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Konu *</label>
                                            <select
                                                required
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            >
                                                <option value="">Konu Seçin</option>
                                                <option value="arsa">Arsa Hakkında Bilgi</option>
                                                <option value="satis">Arsa Satmak İstiyorum</option>
                                                <option value="fiyat">Fiyat Bilgisi</option>
                                                <option value="randevu">Randevu Talebi</option>
                                                <option value="diger">Diğer</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mesajınız *</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                            placeholder="Mesajınızı buraya yazın..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {loading ? (
                                            <span>Gönderiliyor...</span>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 mr-2" />
                                                Mesaj Gönder
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
