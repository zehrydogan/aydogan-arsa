'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react'

const forgotPasswordSchema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz')
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema)
    })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true)
        setError('')

        try {
            // TODO: Backend'de şifre sıfırlama endpoint'i oluşturulacak
            // Şimdilik mock işlem
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Demo için her zaman başarılı kabul ediyoruz
            setIsSubmitted(true)
        } catch (error) {
            console.error('Şifre sıfırlama hatası:', error)
            setError('Şifre sıfırlama e-postası gönderilirken bir hata oluştu. Lütfen tekrar deneyin.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Link href="/" className="flex justify-center">
                        <img src="/logo.png" alt="Aydoğan Arsa" className="h-16 w-auto" />
                    </Link>
                    <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                        E-posta Gönderildi
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Şifre Sıfırlama E-postası Gönderildi
                            </h3>
                            <p className="text-gray-600 mb-6">
                                <strong>{getValues('email')}</strong> adresine şifre sıfırlama bağlantısı gönderildi.
                                E-posta kutunuzu kontrol edin ve spam klasörünü de kontrol etmeyi unutmayın.
                            </p>
                            <div className="space-y-3">
                                <Link
                                    href="/giris"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                >
                                    Giriş Sayfasına Dön
                                </Link>
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                >
                                    Tekrar Gönder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center">
                    <img src="/logo.png" alt="Aydoğan Arsa" className="h-16 w-auto" />
                </Link>
                <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                    Şifremi Unuttum
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                <div className="flex">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                E-posta Adresi
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('email')}
                                    type="email"
                                    autoComplete="email"
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    placeholder="ornek@email.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Gönderiliyor...
                                    </div>
                                ) : (
                                    'Şifre Sıfırlama E-postası Gönder'
                                )}
                            </button>
                        </div>

                        <div className="flex items-center justify-center space-x-4 text-sm">
                            <Link
                                href="/giris"
                                className="flex items-center text-green-600 hover:text-green-500 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Giriş Sayfasına Dön
                            </Link>
                        </div>
                    </form>
                </div>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-50 text-gray-500">Hesabınız yok mu?</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Link
                            href="/kayit"
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                            Yeni Hesap Oluştur
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}