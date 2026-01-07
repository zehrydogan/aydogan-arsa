'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, MapPin, Ruler, Heart, Share2, Phone, Mail, Eye, ChevronLeft, ChevronRight, MessageCircle, Check, X } from 'lucide-react'
import { useFavoriteStatus } from '@/hooks/useFavorites'
import { useMessages } from '@/hooks/useMessages'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import ContactForm from '@/components/contact/ContactForm'

const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
)
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
)
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
)
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
)

interface Property {
    id: string
    title: string
    description: string
    price: string
    currency: string
    latitude: number
    longitude: number
    address: string
    details?: {
        area?: number
        metrekareFiyati?: number
        adaNo?: string
        parselNo?: string
        paftaNo?: string
        tapuDurumu?: string
        imarDurumu?: string
        gabari?: string
        kaks?: string
        taks?: string
        elektrik?: boolean
        sanayiElektrigi?: boolean
        su?: boolean
        telefon?: boolean
        dogalgaz?: boolean
        kanalizasyon?: boolean
        aritma?: boolean
        sondajKuyu?: boolean
        zeminEtudu?: boolean
        yoluAcilmis?: boolean
        yoluAcilmamis?: boolean
        yoluYok?: boolean
        anaYolaYakin?: boolean
        denizeSifir?: boolean
        denizeYakin?: boolean
        havaalaninYakin?: boolean
        topluUlasimaYakin?: boolean
        ifrazli?: boolean
        parselli?: boolean
        projeli?: boolean
        koseParsel?: boolean
        manzara?: string[]
        krediyeUygun?: boolean
        tapikas?: boolean
    }
    category: string
    status: string
    createdAt: string
    publishedAt: string
    images: Array<{
        id: string
        url: string
        alt?: string
        order: number
    }>
    location: {
        id: string
        name: string
        type: string
    }
    owner: {
        id: string
        firstName: string
        lastName: string
        phone?: string
        email: string
    }
    features: Array<{
        feature: {
            id: string
            name: string
            category: string
            icon?: string
        }
    }>
}

export default function PropertyDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuthStore()
    const [property, setProperty] = useState<Property | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [showContactForm, setShowContactForm] = useState(false)
    const [activeTab, setActiveTab] = useState<'details' | 'map'>('details')
    const { isFavorite, toggle: toggleFavorite, isLoading: favoriteLoading } = useFavoriteStatus(params.id as string)
    const { createConversation, createConversationLoading } = useMessages()

    useEffect(() => {
        if (params.id) {
            fetchProperty(params.id as string)
        }
    }, [params.id])

    const fetchProperty = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3001/api/properties/${id}`)
            if (response.ok) {
                const data = await response.json()
                setProperty(data.property || data)
            }
        } catch (error) {
            console.error('Error fetching property:', error)
        } finally {
            setLoading(false)
        }
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

    const nextImage = () => {
        if (property?.images && property.images.length > 0) {
            setCurrentImageIndex((prev) => prev === property.images.length - 1 ? 0 : prev + 1)
        }
    }

    const prevImage = () => {
        if (property?.images && property.images.length > 0) {
            setCurrentImageIndex((prev) => prev === 0 ? property.images.length - 1 : prev - 1)
        }
    }

    const FeatureItem = ({ label, value, isBoolean = false }: { label: string; value: any; isBoolean?: boolean }) => {
        if (isBoolean) {
            return (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{label}</span>
                    <span className={`flex items-center ${value ? 'text-green-600' : 'text-gray-400'}`}>
                        {value ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </span>
                </div>
            )
        }
        return (
            <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium text-gray-900">{value || 'Belirtilmemiş'}</span>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-32 mb-6"></div>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="h-96 bg-gray-300"></div>
                            <div className="p-8">
                                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">İlan bulunamadı</h1>
                    <Link href="/ilanlar" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
                        Tüm İlanlar
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <Link href="/ilanlar" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tüm İlanlar
                </Link>

                {/* Title and Price Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                {property.title}
                            </h1>
                            <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                                <span>{property.address}</span>
                            </div>
                        </div>
                        <div className="mt-4 lg:mt-0 lg:text-right">
                            <div className="text-3xl lg:text-4xl font-bold text-green-600">
                                {formatPrice(property.price, property.currency)}
                            </div>
                            {property.details?.metrekareFiyati && (
                                <div className="text-sm text-gray-500">
                                    m² fiyatı: {property.details.metrekareFiyati.toLocaleString('tr-TR')} TL/m²
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="relative">
                                {property.images && property.images.length > 0 ? (
                                    <>
                                        <div className="h-80 lg:h-[500px] relative">
                                            <img
                                                src={property.images[currentImageIndex]?.url}
                                                alt={property.title}
                                                className="w-full h-full object-cover"
                                            />
                                            {property.images.length > 1 && (
                                                <>
                                                    <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                                                        <ChevronLeft className="w-6 h-6" />
                                                    </button>
                                                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                                                        <ChevronRight className="w-6 h-6" />
                                                    </button>
                                                </>
                                            )}
                                            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                                                {currentImageIndex + 1}/{property.images.length} Fotoğraf
                                            </div>
                                        </div>
                                        {property.images.length > 1 && (
                                            <div className="flex space-x-2 p-4 overflow-x-auto">
                                                {property.images.map((image, index) => (
                                                    <button
                                                        key={image.id}
                                                        onClick={() => setCurrentImageIndex(index)}
                                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${index === currentImageIndex ? 'border-green-600' : 'border-gray-200'}`}
                                                    >
                                                        <img src={image.url} alt="" className="w-full h-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="h-80 bg-gray-200 flex items-center justify-center">
                                        <Eye className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* İlan Detayları Tab */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="border-b border-gray-200">
                                <div className="flex">
                                    <button
                                        onClick={() => setActiveTab('details')}
                                        className={`px-6 py-4 font-medium ${activeTab === 'details' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        İlan Detayları
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('map')}
                                        className={`px-6 py-4 font-medium ${activeTab === 'map' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Konumu ve Sokak Görünümü
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'details' ? (
                                <div className="p-6">
                                    {/* Açıklama */}
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Açıklama</h3>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                            {property.description}
                                        </p>
                                    </div>

                                    {/* Özellikler Grid - Sahibinden Formatı */}
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Özellikler</h3>

                                        {/* Altyapı */}
                                        <div className="mb-6">
                                            <h4 className="text-sm font-medium text-green-600 mb-3">Altyapı</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {[
                                                    { key: 'elektrik', label: 'Elektrik' },
                                                    { key: 'sanayiElektrigi', label: 'Sanayi Elektriği' },
                                                    { key: 'su', label: 'Su' },
                                                    { key: 'telefon', label: 'Telefon' },
                                                    { key: 'dogalgaz', label: 'Doğalgaz' },
                                                    { key: 'kanalizasyon', label: 'Kanalizasyon' },
                                                    { key: 'aritma', label: 'Arıtma' },
                                                    { key: 'sondajKuyu', label: 'Sondaj & Kuyu' },
                                                    { key: 'zeminEtudu', label: 'Zemin Etüdü' },
                                                    { key: 'yoluAcilmis', label: 'Yolu Açılmış' },
                                                ].map(item => (
                                                    <div key={item.key} className={`flex items-center space-x-2 ${property.details?.[item.key as keyof typeof property.details] ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {property.details?.[item.key as keyof typeof property.details] ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                        <span className="text-sm">{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Konum */}
                                        <div className="mb-6">
                                            <h4 className="text-sm font-medium text-green-600 mb-3">Konum</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {[
                                                    { key: 'anaYolaYakin', label: 'Ana Yola Yakın' },
                                                    { key: 'denizeSifir', label: 'Denize Sıfır' },
                                                    { key: 'denizeYakin', label: 'Denize Yakın' },
                                                    { key: 'havaalaninYakin', label: 'Havaalanına Yakın' },
                                                    { key: 'topluUlasimaYakin', label: 'Toplu Ulaşıma Yakın' },
                                                ].map(item => (
                                                    <div key={item.key} className={`flex items-center space-x-2 ${property.details?.[item.key as keyof typeof property.details] ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {property.details?.[item.key as keyof typeof property.details] ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                        <span className="text-sm">{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Genel Özellikler */}
                                        <div className="mb-6">
                                            <h4 className="text-sm font-medium text-green-600 mb-3">Genel Özellikler</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {[
                                                    { key: 'ifrazli', label: 'İfrazlı' },
                                                    { key: 'parselli', label: 'Parselli' },
                                                    { key: 'projeli', label: 'Projeli' },
                                                    { key: 'koseParsel', label: 'Köşe Parsel' },
                                                ].map(item => (
                                                    <div key={item.key} className={`flex items-center space-x-2 ${property.details?.[item.key as keyof typeof property.details] ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {property.details?.[item.key as keyof typeof property.details] ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                        <span className="text-sm">{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Manzara */}
                                        {property.details?.manzara && property.details.manzara.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-green-600 mb-3">Manzara</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {property.details.manzara.map((m, i) => (
                                                        <span key={i} className="flex items-center space-x-1 text-green-600">
                                                            <Check className="w-4 h-4" />
                                                            <span className="text-sm">{m}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Konum</h3>
                                    {property.latitude && property.longitude ? (
                                        <div className="space-y-4">
                                            <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
                                                <MapContainer
                                                    center={[property.latitude, property.longitude]}
                                                    zoom={15}
                                                    style={{ height: '100%', width: '100%' }}
                                                >
                                                    <TileLayer
                                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                    />
                                                    <Marker position={[property.latitude, property.longitude]}>
                                                        <Popup>
                                                            <div className="text-center">
                                                                <strong>{property.title}</strong>
                                                                <br />
                                                                {property.address}
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                </MapContainer>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center text-gray-700">
                                                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                                                    <span>{property.address}</span>
                                                </div>
                                                <div className="mt-2 text-sm text-gray-500">
                                                    Koordinatlar: {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
                                                </div>
                                            </div>
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                <h4 className="font-medium text-yellow-800 mb-2">Sokak Görünümü</h4>
                                                <p className="text-sm text-yellow-700">
                                                    Sokak görünümü için{' '}
                                                    <a
                                                        href={`https://www.google.com/maps/@${property.latitude},${property.longitude},3a,75y,90t/data=!3m6!1e1!3m4!1s!2e0!7i16384!8i8192`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-600 hover:underline font-medium"
                                                    >
                                                        Google Maps'te açın
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                            <p>Bu ilan için konum bilgisi bulunmamaktadır.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* İlan Bilgileri */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="space-y-3">
                                <FeatureItem label="İlan Tarihi" value={new Date(property.publishedAt || property.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })} />
                                <FeatureItem label="Emlak Tipi" value="Satılık Arsa" />
                                <FeatureItem label="İmar Durumu" value={property.details?.imarDurumu} />
                                <FeatureItem label="m²" value={property.details?.area?.toLocaleString('tr-TR')} />
                                <FeatureItem label="m² Fiyatı" value={property.details?.metrekareFiyati ? `${property.details.metrekareFiyati.toLocaleString('tr-TR')} TL` : undefined} />
                                <FeatureItem label="Ada No" value={property.details?.adaNo} />
                                <FeatureItem label="Parsel No" value={property.details?.parselNo} />
                                <FeatureItem label="Pafta No" value={property.details?.paftaNo} />
                                <FeatureItem label="Kaks (Emsal)" value={property.details?.kaks} />
                                <FeatureItem label="Gabari" value={property.details?.gabari} />
                                <FeatureItem label="Krediye Uygunluk" value={property.details?.krediyeUygun ? 'Evet' : 'Hayır'} />
                                <FeatureItem label="Tapu Durumu" value={property.details?.tapuDurumu} />
                                <FeatureItem label="Takas" value={property.details?.tapikas ? 'Evet' : 'Hayır'} />
                            </div>
                        </div>

                        {/* İletişim */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">İletişim</h3>
                            <div className="space-y-4">
                                <div className="text-center pb-4 border-b border-gray-100">
                                    <div className="text-lg font-medium text-gray-900">
                                        {property.owner.firstName} {property.owner.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">AYDOĞAN ARSA OFİSİ</div>
                                </div>

                                {property.owner.phone && (
                                    <a href={`tel:${property.owner.phone}`} className="flex items-center justify-center space-x-2 w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                                        <Phone className="w-5 h-5" />
                                        <span>Ara</span>
                                    </a>
                                )}

                                <button onClick={() => setShowContactForm(true)} className="flex items-center justify-center space-x-2 w-full border border-green-600 text-green-600 py-3 px-4 rounded-lg hover:bg-green-50 transition-colors">
                                    <Mail className="w-5 h-5" />
                                    <span>Mesaj Gönder</span>
                                </button>

                                <button
                                    onClick={toggleFavorite}
                                    disabled={favoriteLoading}
                                    className={`flex items-center justify-center space-x-2 w-full py-3 px-4 rounded-lg transition-colors ${isFavorite ? 'bg-red-50 text-red-600 border border-red-200' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                    <span>{isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}</span>
                                </button>

                                <button className="flex items-center justify-center space-x-2 w-full border border-gray-200 text-gray-600 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                                    <Share2 className="w-5 h-5" />
                                    <span>Paylaş</span>
                                </button>
                            </div>
                        </div>

                        {/* Kategori Badge */}
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                            <span className="text-green-700 font-medium">{getCategoryName(property.category)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {showContactForm && (
                <ContactForm
                    propertyId={property.id}
                    propertyTitle={property.title}
                    onClose={() => setShowContactForm(false)}
                    onSuccess={() => console.log('Contact form submitted')}
                />
            )}
        </div>
    )
}
