'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Send, User, Mail, Phone, MessageSquare } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCreateContactRequest } from '@/hooks/useContact'

const contactSchema = z.object({
    subject: z.string()
        .min(5, 'Konu en az 5 karakter olmalıdır')
        .max(100, 'Konu en fazla 100 karakter olabilir'),
    message: z.string()
        .min(10, 'Mesaj en az 10 karakter olmalıdır')
        .max(1000, 'Mesaj en fazla 1000 karakter olabilir'),
    guestName: z.string()
        .max(50, 'İsim en fazla 50 karakter olabilir')
        .optional(),
    guestEmail: z.string()
        .email('Geçerli bir email adresi giriniz')
        .optional(),
    guestPhone: z.string()
        .max(20, 'Telefon numarası en fazla 20 karakter olabilir')
        .optional()
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactFormProps {
    propertyId: string
    propertyTitle: string
    onClose: () => void
    onSuccess?: () => void
}

export default function ContactForm({ propertyId, propertyTitle, onClose, onSuccess }: ContactFormProps) {
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const { user, isAuthenticated } = useAuthStore()
    const createContactRequest = useCreateContactRequest()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            subject: `${propertyTitle} hakkında bilgi`,
            guestName: isAuthenticated ? `${user?.firstName} ${user?.lastName}` : '',
            guestEmail: isAuthenticated ? user?.email : '',
            guestPhone: isAuthenticated ? user?.phone || '' : ''
        }
    })

    const onSubmit = async (data: ContactFormData) => {
        try {
            const payload = {
                subject: data.subject,
                message: data.message,
                propertyId,
                // Only include guest fields if user is not authenticated
                ...((!isAuthenticated || !user) && {
                    guestName: data.guestName,
                    guestEmail: data.guestEmail,
                    guestPhone: data.guestPhone
                })
            }

            await createContactRequest.mutateAsync(payload)
            setSubmitSuccess(true)
            reset()

            // Auto close after 2 seconds
            setTimeout(() => {
                onSuccess?.()
                onClose()
            }, 2000)
        } catch (error: any) {
            console.error('Contact form submission error:', error)
            // Handle error - could show toast notification
        }
    }

    if (submitSuccess) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Mesajınız Gönderildi!
                    </h3>
                    <p className="text-gray-600">
                        Mesajınız emlak sahibine iletildi. En kısa sürede size dönüş yapılacaktır.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">İletişim Formu</h3>
                        <p className="text-sm text-gray-600 mt-1">{propertyTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Konu *
                        </label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                {...register('subject')}
                                type="text"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Konu başlığı"
                            />
                        </div>
                        {errors.subject && (
                            <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                        )}
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mesaj *
                        </label>
                        <textarea
                            {...register('message')}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Mesajınızı buraya yazın..."
                        />
                        {errors.message && (
                            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                        )}
                    </div>

                    {/* Guest Information (only show if not authenticated) */}
                    {(!isAuthenticated || !user) && (
                        <>
                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">İletişim Bilgileri</h4>
                            </div>

                            {/* Guest Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ad Soyad *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        {...register('guestName')}
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Adınız ve soyadınız"
                                        required={!isAuthenticated}
                                    />
                                </div>
                                {errors.guestName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.guestName.message}</p>
                                )}
                            </div>

                            {/* Guest Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        {...register('guestEmail')}
                                        type="email"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="email@example.com"
                                        required={!isAuthenticated}
                                    />
                                </div>
                                {errors.guestEmail && (
                                    <p className="mt-1 text-sm text-red-600">{errors.guestEmail.message}</p>
                                )}
                            </div>

                            {/* Guest Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Telefon
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        {...register('guestPhone')}
                                        type="tel"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="05XX XXX XX XX"
                                    />
                                </div>
                                {errors.guestPhone && (
                                    <p className="mt-1 text-sm text-red-600">{errors.guestPhone.message}</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Authenticated User Info Display */}
                    {isAuthenticated && user && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">Gönderen Bilgileri</h4>
                            <div className="text-sm text-blue-800">
                                <p><strong>Ad Soyad:</strong> {user.firstName} {user.lastName}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                {user.phone && <p><strong>Telefon:</strong> {user.phone}</p>}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={createContactRequest.isPending}
                            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {createContactRequest.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Gönderiliyor...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span>Mesaj Gönder</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}