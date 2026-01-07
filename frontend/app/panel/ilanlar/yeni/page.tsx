'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Home,
    MapPin,
    Settings,
    Save,
    Eye,
    FileText,
    Image as ImageIcon
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCreateProperty } from '@/hooks/usePropertyManagement'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

// Form validation schema - Arsa formatında
const propertySchema = z.object({
    title: z.string().min(5, 'Başlık en az 5 karakter olmalıdır').max(150, 'Başlık en fazla 150 karakter olabilir'),
    description: z.string().min(20, 'Açıklama en az 20 karakter olmalıdır').max(5000, 'Açıklama en fazla 5000 karakter olabilir'),
    category: z.enum(['IMARLIARSA', 'TARLA', 'BAHCE', 'ZEYTINLIK', 'BAGLIK', 'SANAYI', 'KONUT', 'TICARI'], {
        errorMap: () => ({ message: 'Geçerli bir kategori seçiniz' })
    }),
    price: z.string().min(1, 'Fiyat gereklidir'),
    currency: z.string().default('TRY'),
    address: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),
    locationId: z.string().min(1, 'Konum seçimi gereklidir'),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    details: z.object({
        // Temel Bilgiler
        area: z.number().min(1, 'Alan gereklidir').optional(),
        adaNo: z.string().optional(),
        parselNo: z.string().optional(),
        paftaNo: z.string().optional(),

        // İmar Bilgileri
        imarDurumu: z.string().optional(),
        gabari: z.string().optional(),
        katSayisi: z.number().min(0).max(50).optional(),
        emsal: z.string().optional(),
        taks: z.string().optional(),

        // Tapu Bilgileri
        tapuDurumu: z.string().optional(),
        krediyeUygun: z.boolean().optional(),
        tapiCinsi: z.string().optional(),

        // Fiziksel Özellikler
        yolCephesi: z.number().min(0).optional(),
        derinlik: z.number().min(0).optional(),
        sekil: z.string().optional(),
        egim: z.string().optional(),
        zeminYapisi: z.string().optional(),

        // Altyapı
        elektrik: z.boolean().optional(),
        su: z.boolean().optional(),
        dogalgaz: z.boolean().optional(),
        kanalizasyon: z.boolean().optional(),
        telefon: z.boolean().optional(),
        zeminEtudu: z.boolean().optional(),
        yoluAcilmis: z.boolean().optional(),
        sondajKuyu: z.boolean().optional(),
        aritma: z.boolean().optional(),
        sanayiElektrik: z.boolean().optional(),

        // Konum Özellikleri
        anaYolaYakin: z.boolean().optional(),
        denizeSifir: z.boolean().optional(),
        denizeYakin: z.boolean().optional(),
        topluUlasimaYakin: z.boolean().optional(),
        havaalaninaYakin: z.boolean().optional(),
        merkezeYakin: z.boolean().optional(),

        // Genel Özellikler
        ifrazli: z.boolean().optional(),
        parselli: z.boolean().optional(),
        projeli: z.boolean().optional(),
        koseParsel: z.boolean().optional(),

        // Manzara
        manzaraSehir: z.boolean().optional(),
        manzaraDeniz: z.boolean().optional(),
        manzaraDoga: z.boolean().optional(),
        manzaraGol: z.boolean().optional(),
        manzaraDag: z.boolean().optional(),

        // Diğer
        tapiSuresi: z.string().optional(),
        takas: z.boolean().optional(),
    }),
    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT')
})

type PropertyFormData = z.infer<typeof propertySchema>

const STEPS = [
    { id: 1, name: 'Temel Bilgiler', icon: Home },
    { id: 2, name: 'Konum & Fiyat', icon: MapPin },
    { id: 3, name: 'Tapu & İmar', icon: FileText },
    { id: 4, name: 'Altyapı & Özellikler', icon: Settings },
    { id: 5, name: 'Önizleme', icon: Eye }
]

export default function NewPropertyPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuthStore()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const createProperty = useCreateProperty()

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        getValues,
        trigger
    } = useForm<PropertyFormData>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            currency: 'TRY',
            status: 'DRAFT',
            details: {
                krediyeUygun: false,
                takas: false
            }
        }
    })

    // m² fiyatı hesaplama
    const price = watch('price')
    const area = watch('details.area')
    const m2Price = price && area ? Math.round(parseFloat(price) / area) : 0

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

    const nextStep = async () => {
        const fieldsToValidate = getFieldsForStep(currentStep)
        const isValid = await trigger(fieldsToValidate)
        if (isValid && currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1)
    }

    const getFieldsForStep = (step: number): (keyof PropertyFormData)[] => {
        switch (step) {
            case 1: return ['title', 'description', 'category']
            case 2: return ['price', 'address', 'locationId']
            case 3: return []
            case 4: return []
            default: return []
        }
    }

    const onSubmit = async (data: PropertyFormData) => {
        setIsSubmitting(true)
        try {
            // Mock data için geçici çözüm
            const mockData = {
                ...data,
                locationId: '1', // Mock location ID
                latitude: 39.9334,
                longitude: 32.8597
            }

            console.log('Creating property with data:', mockData)
            // TODO: Backend entegrasyonu tamamlandığında bu kısım düzeltilecek
            // await createProperty.mutateAsync(mockData)

            // Şimdilik başarılı olarak kabul ediyoruz
            router.push('/panel/ilanlar?success=created')
        } catch (error) {
            console.error('İlan oluşturma hatası:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const saveDraft = async () => {
        const data = getValues()
        data.status = 'DRAFT'
        await onSubmit(data)
    }

    const publishProperty = async () => {
        const data = getValues()
        data.status = 'PUBLISHED'
        await onSubmit(data)
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

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <button onClick={() => router.push('/panel')} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Yeni Arsa İlanı</h1>
                            <p className="text-gray-600">Detaylı arsa ilanı oluşturun</p>
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="flex items-center justify-between overflow-x-auto pb-2">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-shrink-0">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.id ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-400'}`}>
                                    {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                                </div>
                                <div className="ml-3 hidden md:block">
                                    <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-green-600' : 'text-gray-400'}`}>{step.name}</div>
                                </div>
                                {index < STEPS.length - 1 && <div className={`w-8 md:w-16 h-0.5 mx-2 md:mx-4 ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 md:p-8">

                        {/* Step 1: Temel Bilgiler */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Temel Bilgiler</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        İlan Başlığı *
                                    </label>
                                    <input
                                        {...register('title')}
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Örn: Bilecik Bozüyük'te Satılık İmarlı Arsa"
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Arsa Kategorisi *
                                    </label>
                                    <select
                                        {...register('category')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">Kategori Seçin</option>
                                        <option value="IMARLIARSA">İmarlı Arsa</option>
                                        <option value="KONUT">Konut Arsası</option>
                                        <option value="TICARI">Ticari Arsa</option>
                                        <option value="SANAYI">Sanayi Arsası</option>
                                        <option value="TARLA">Tarla</option>
                                        <option value="BAHCE">Bahçe</option>
                                        <option value="ZEYTINLIK">Zeytinlik</option>
                                        <option value="BAGLIK">Bağlık</option>
                                    </select>
                                    {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Açıklama *
                                    </label>
                                    <textarea
                                        {...register('description')}
                                        rows={6}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Arsanızın detaylı açıklamasını yazın..."
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Konum & Fiyat */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Konum ve Fiyat</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fiyat (TL) *
                                    </label>
                                    <input
                                        {...register('price')}
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Örn: 850000"
                                    />
                                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Alan (m²)
                                    </label>
                                    <input
                                        {...register('details.area', { valueAsNumber: true })}
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Örn: 1000"
                                    />
                                    {m2Price > 0 && (
                                        <p className="mt-1 text-sm text-gray-600">
                                            m² Fiyatı: {new Intl.NumberFormat('tr-TR').format(m2Price)} TL
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Adres *
                                    </label>
                                    <textarea
                                        {...register('address')}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Tam adres bilgisini yazın..."
                                    />
                                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        İl/İlçe *
                                    </label>
                                    <select
                                        {...register('locationId')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">İl/İlçe Seçin</option>
                                        <option value="bilecik">Bilecik</option>
                                        <option value="kutahya">Kütahya</option>
                                        <option value="edirne">Edirne</option>
                                        <option value="afyonkarahisar">Afyonkarahisar</option>
                                        <option value="konya">Konya</option>
                                        <option value="ankara">Ankara</option>
                                    </select>
                                    {errors.locationId && <p className="mt-1 text-sm text-red-600">{errors.locationId.message}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Tapu & İmar */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tapu ve İmar Bilgileri</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ada No</label>
                                        <input
                                            {...register('details.adaNo')}
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Parsel No</label>
                                        <input
                                            {...register('details.parselNo')}
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Pafta No</label>
                                        <input
                                            {...register('details.paftaNo')}
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">İmar Durumu</label>
                                        <select
                                            {...register('details.imarDurumu')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="">Seçin</option>
                                            <option value="imarlı">İmarlı</option>
                                            <option value="imar-dışı">İmar Dışı</option>
                                            <option value="tarla">Tarla</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tapu Durumu</label>
                                        <select
                                            {...register('details.tapuDurumu')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="">Seçin</option>
                                            <option value="tek-tapu">Tek Tapu</option>
                                            <option value="müşterek">Müşterek</option>
                                            <option value="kat-irtifakı">Kat İrtifakı</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-6">
                                    <label className="flex items-center">
                                        <input
                                            {...register('details.krediyeUygun')}
                                            type="checkbox"
                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Krediye Uygun</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            {...register('details.takas')}
                                            type="checkbox"
                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Takasa Uygun</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Altyapı & Özellikler */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Altyapı ve Özellikler</h3>

                                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-3">Altyapı</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <label className="flex items-center">
                                            <input {...register('details.elektrik')} type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                            <span className="ml-2 text-sm text-gray-700">Elektrik</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input {...register('details.su')} type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                            <span className="ml-2 text-sm text-gray-700">Su</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input {...register('details.dogalgaz')} type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                            <span className="ml-2 text-sm text-gray-700">Doğalgaz</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input {...register('details.kanalizasyon')} type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                            <span className="ml-2 text-sm text-gray-700">Kanalizasyon</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input {...register('details.telefon')} type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                            <span className="ml-2 text-sm text-gray-700">Telefon</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input {...register('details.yoluAcilmis')} type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                            <span className="ml-2 text-sm text-gray-700">Yolu Açılmış</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-3">Konum Özellikleri</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <label className="flex items-center">
                                            <input {...register('details.anaYolaYakin')} type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                            <span className="ml-2 text-sm text-gray-700">Ana Yola Yakın</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input {...register('details.merkezeYakin')} type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                            <span className="ml-2 text-sm text-gray-700">Merkeze Yakın</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input {...register('details.topluUlasimaYakin')} type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                            <span className="ml-2 text-sm text-gray-700">Toplu Ulaşıma Yakın</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-3">Manzara</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <label className="flex items-center">
                                            <input {...register('details.manzaraSehir')} type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                            <span className="ml-2 text-sm text-gray-700">Şehir Manzarası</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input {...register('details.manzaraDoga')} type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                            <span className="ml-2 text-sm text-gray-700">Doğa Manzarası</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input {...register('details.manzaraDag')} type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                            <span className="ml-2 text-sm text-gray-700">Dağ Manzarası</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Önizleme */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">İlan Önizleme</h3>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">{watch('title')}</h4>
                                    <p className="text-green-600 font-semibold text-lg mb-4">
                                        {watch('price') ? new Intl.NumberFormat('tr-TR').format(parseInt(watch('price'))) + ' TL' : 'Fiyat belirtilmedi'}
                                    </p>
                                    <p className="text-gray-700 mb-4">{watch('description')}</p>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><strong>Kategori:</strong> {watch('category')}</div>
                                        <div><strong>Alan:</strong> {watch('details.area')} m²</div>
                                        <div><strong>Adres:</strong> {watch('address')}</div>
                                        <div><strong>İmar Durumu:</strong> {watch('details.imarDurumu')}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6 border-t">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Önceki
                            </button>

                            <div className="flex space-x-3">
                                {currentStep === STEPS.length ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={saveDraft}
                                            disabled={isSubmitting}
                                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Taslak Kaydet
                                        </button>
                                        <button
                                            type="button"
                                            onClick={publishProperty}
                                            disabled={isSubmitting}
                                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Yayınlanıyor...' : 'Yayınla'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                                    >
                                        Sonraki
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    )
}