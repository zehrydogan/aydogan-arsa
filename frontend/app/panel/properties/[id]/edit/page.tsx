'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    ArrowLeft,
    Save,
    AlertCircle,
    Loader2,
    MapPin,
    Upload,
    X
} from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useUpdateProperty } from '@/hooks/usePropertyManagement'
import { useProperty } from '@/hooks/useProperties'
import { useLocations } from '@/hooks/useLocations'
import { useFeatures } from '@/hooks/useFeatures'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

// Form validation schema
const editPropertySchema = z.object({
    title: z.string().min(5, 'Başlık en az 5 karakter olmalıdır'),
    description: z.string().min(20, 'Açıklama en az 20 karakter olmalıdır'),
    price: z.string().min(1, 'Fiyat gereklidir'),
    currency: z.enum(['TRY', 'USD', 'EUR']),
    category: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'OFFICE', 'COMMERCIAL', 'LAND']),
    address: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),
    locationId: z.string().min(1, 'Konum seçimi gereklidir'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    status: z.enum(['DRAFT', 'PUBLISHED', 'SOLD', 'RENTED', 'INACTIVE']),
    details: z.object({
        rooms: z.number().min(0).optional(),
        bathrooms: z.number().min(0).optional(),
        area: z.number().min(1).optional(),
        floor: z.number().optional(),
        buildYear: z.number().min(1900).max(new Date().getFullYear()).optional(),
        furnished: z.boolean().optional(),
        balcony: z.boolean().optional(),
        parking: z.boolean().optional(),
    }),
    featureIds: z.array(z.string()).optional()
})

type EditPropertyFormData = z.infer<typeof editPropertySchema>

export default function EditPropertyPage() {
    const router = useRouter()
    const params = useParams()
    const propertyId = params.id as string
    const { user, isAuthenticated } = useAuthStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const { data: property, isLoading: propertyLoading, error: propertyError } = useProperty(propertyId)
    const { data: locations } = useLocations()
    const { data: features } = useFeatures()
    const updateProperty = useUpdateProperty()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset
    } = useForm<EditPropertyFormData>({
        resolver: zodResolver(editPropertySchema)
    })

    const watchedFeatureIds = watch('featureIds') || []

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.push('/giris')
            return
        }

        if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
            router.push('/')
            return
        }
    }, [isAuthenticated, user, router])

    useEffect(() => {
        if (property) {
            // Populate form with existing property data
            reset({
                title: property.title,
                description: property.description,
                price: property.price,
                currency: property.currency as any,
                category: property.category as any,
                address: property.address,
                locationId: property.location.id,
                latitude: property.latitude,
                longitude: property.longitude,
                status: property.status as any,
                details: {
                    rooms: property.details?.rooms || undefined,
                    bathrooms: property.details?.bathrooms || undefined,
                    area: property.details?.area || undefined,
                    floor: property.details?.floor || undefined,
                    buildYear: property.details?.buildYear || undefined,
                    furnished: property.details?.furnished || false,
                    balcony: property.details?.balcony || false,
                    parking: property.details?.parking || false,
                },
                featureIds: property.features?.map(f => f.feature.id) || []
            })
        }
    }, [property, reset])

    const onSubmit = async (data: EditPropertyFormData) => {
        setIsSubmitting(true)
        setSubmitError(null)

        try {
            await updateProperty.mutateAsync({
                id: propertyId,
                ...data
            })

            router.push('/panel/ilanlar?success=updated')
        } catch (error: any) {
            console.error('Property update failed:', error)
            setSubmitError(error.response?.data?.message || 'İlan güncellenirken bir hata oluştu')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFeatureToggle = (featureId: string) => {
        const currentFeatures = watchedFeatureIds
        const newFeatures = currentFeatures.includes(featureId)
            ? currentFeatures.filter(id => id !== featureId)
            : [...currentFeatures, featureId]

        setValue('featureIds', newFeatures)
    }

    const getCategoryText = (category: string) => {
        const categoryMap: Record<string, string> = {
            'APARTMENT': 'Daire',
            'HOUSE': 'Ev',
            'VILLA': 'Villa',
            'OFFICE': 'Ofis',
            'COMMERCIAL': 'Ticari',
            'LAND': 'Arsa'
        }
        return categoryMap[category] || category
    }

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            'DRAFT': 'Taslak',
            'PUBLISHED': 'Yayında',
            'SOLD': 'Satıldı',
            'RENTED': 'Kiralandı',
            'INACTIVE': 'Pasif'
        }
        return statusMap[status] || status
    }

    if (!isAuthenticated || !user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-48 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>
            </div>
        )
    }

    if (propertyLoading) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
                        <div className="space-y-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-6 border">
                                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-10 bg-gray-300 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (propertyError || !property) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">İlan Bulunamadı</h3>
                        <p className="text-gray-600 mb-6">Düzenlemek istediğiniz ilan bulunamadı.</p>
                        <Link
                            href="/panel/ilanlar"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            İlanlarıma Dön
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/panel/ilanlar"
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">İlan Düzenle</h1>
                            <p className="text-gray-600">{property.title}</p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {submitError && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                            <p className="text-sm text-red-800">{submitError}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Temel Bilgiler</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    İlan Başlığı *
                                </label>
                                <input
                                    {...register('title')}
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Örn: Merkezi Konumda 3+1 Daire"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kategori *
                                </label>
                                <select
                                    {...register('category')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Kategori Seçin</option>
                                    <option value="APARTMENT">Daire</option>
                                    <option value="HOUSE">Ev</option>
                                    <option value="VILLA">Villa</option>
                                    <option value="OFFICE">Ofis</option>
                                    <option value="COMMERCIAL">Ticari</option>
                                    <option value="LAND">Arsa</option>
                                </select>
                                {errors.category && (
                                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Durum *
                                </label>
                                <select
                                    {...register('status')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="DRAFT">Taslak</option>
                                    <option value="PUBLISHED">Yayında</option>
                                    <option value="SOLD">Satıldı</option>
                                    <option value="RENTED">Kiralandı</option>
                                    <option value="INACTIVE">Pasif</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Açıklama *
                                </label>
                                <textarea
                                    {...register('description')}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="İlan açıklamasını yazın..."
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Price Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Fiyat Bilgileri</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fiyat *
                                </label>
                                <input
                                    {...register('price')}
                                    type="number"
                                    min="0"
                                    step="1000"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                />
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Para Birimi *
                                </label>
                                <select
                                    {...register('currency')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="TRY">TRY (₺)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                                {errors.currency && (
                                    <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Konum Bilgileri</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Konum *
                                </label>
                                <select
                                    {...register('locationId')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Konum Seçin</option>
                                    {locations?.map((location) => (
                                        <option key={location.id} value={location.id}>
                                            {location.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.locationId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.locationId.message}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Adres *
                                </label>
                                <input
                                    {...register('address')}
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Tam adres bilgisi"
                                />
                                {errors.address && (
                                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enlem *
                                </label>
                                <input
                                    {...register('latitude', { valueAsNumber: true })}
                                    type="number"
                                    step="any"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="41.0082"
                                />
                                {errors.latitude && (
                                    <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Boylam *
                                </label>
                                <input
                                    {...register('longitude', { valueAsNumber: true })}
                                    type="number"
                                    step="any"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="28.9784"
                                />
                                {errors.longitude && (
                                    <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Emlak Detayları</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Oda Sayısı
                                </label>
                                <input
                                    {...register('details.rooms', { valueAsNumber: true })}
                                    type="number"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                />
                                {errors.details?.rooms && (
                                    <p className="mt-1 text-sm text-red-600">{errors.details.rooms.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Banyo Sayısı
                                </label>
                                <input
                                    {...register('details.bathrooms', { valueAsNumber: true })}
                                    type="number"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                />
                                {errors.details?.bathrooms && (
                                    <p className="mt-1 text-sm text-red-600">{errors.details.bathrooms.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alan (m²)
                                </label>
                                <input
                                    {...register('details.area', { valueAsNumber: true })}
                                    type="number"
                                    min="1"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                />
                                {errors.details?.area && (
                                    <p className="mt-1 text-sm text-red-600">{errors.details.area.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kat
                                </label>
                                <input
                                    {...register('details.floor', { valueAsNumber: true })}
                                    type="number"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                />
                                {errors.details?.floor && (
                                    <p className="mt-1 text-sm text-red-600">{errors.details.floor.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Yapım Yılı
                                </label>
                                <input
                                    {...register('details.buildYear', { valueAsNumber: true })}
                                    type="number"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="2020"
                                />
                                {errors.details?.buildYear && (
                                    <p className="mt-1 text-sm text-red-600">{errors.details.buildYear.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Boolean Features */}
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Özellikler</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <label className="flex items-center space-x-3">
                                    <input
                                        {...register('details.furnished')}
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Eşyalı</span>
                                </label>

                                <label className="flex items-center space-x-3">
                                    <input
                                        {...register('details.balcony')}
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Balkon</span>
                                </label>

                                <label className="flex items-center space-x-3">
                                    <input
                                        {...register('details.parking')}
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Otopark</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    {features && features.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Ek Özellikler</h2>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {features.map((feature) => (
                                    <label
                                        key={feature.id}
                                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${watchedFeatureIds.includes(feature.id)
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={watchedFeatureIds.includes(feature.id)}
                                            onChange={() => handleFeatureToggle(feature.id)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{feature.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex items-center justify-end space-x-4 pt-6">
                        <Link
                            href="/panel/ilanlar"
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            İptal
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>{isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    )
}