'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().min(1, 'E-posta adresi gereklidir').email('Geçerli bir e-posta adresi girin'),
    password: z.string().min(1, 'Şifre gereklidir').min(6, 'Şifre en az 6 karakter olmalıdır')
})

export default function LoginPage() {
    const router = useRouter()
    const { login, isLoading } = useAuthStore()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setFieldErrors({})

        // Check if fields are empty
        if (!formData.email.trim() || !formData.password.trim()) {
            const errors: { email?: string; password?: string } = {}
            if (!formData.email.trim()) errors.email = 'E-posta adresi gereklidir'
            if (!formData.password.trim()) errors.password = 'Şifre gereklidir'
            setFieldErrors(errors)
            return
        }

        // Validate with Zod
        const result = loginSchema.safeParse(formData)
        if (!result.success) {
            const errors: { email?: string; password?: string } = {}
            result.error.errors.forEach((err) => {
                if (err.path[0] === 'email') errors.email = err.message
                if (err.path[0] === 'password') errors.password = err.message
            })
            setFieldErrors(errors)
            return
        }

        try {
            await login(formData)

            // Get user role and redirect accordingly
            const { user } = useAuthStore.getState()
            if (user?.role === 'ADMIN') {
                router.push('/yonetim')
            } else if (user?.role === 'OWNER') {
                router.push('/panel')
            } else {
                router.push('/')
            }
        } catch (error: any) {
            setError(error.message || 'Giriş yapılırken bir hata oluştu')
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center space-x-2 mb-8">
                        <img src="/logo.png" alt="Aydoğan Arsa" className="h-10 w-10 rounded-full" />
                        <span className="text-2xl font-bold text-gray-900">Aydoğan Arsa</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Hesabınıza giriş yapın
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Henüz hesabınız yok mu?{' '}
                        <Link href="/kayit" className="font-medium text-green-600 hover:text-green-500">
                            Kayıt olun
                        </Link>
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow-lg rounded-xl">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                E-posta Adresi
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="ornek@email.com"
                                />
                            </div>
                            {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Şifre
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Şifrenizi girin"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Beni hatırla
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link href="/sifremi-unuttum" className="font-medium text-green-600 hover:text-green-500">
                                    Şifremi unuttum
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !formData.email.trim() || !formData.password.trim()}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Giriş yapılıyor...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    Giriş Yap
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Demo Hesaplar</span>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <button
                                onClick={() => setFormData({ email: 'info@aydoganarsa.com', password: 'owner123' })}
                                className="w-full text-left px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="font-medium">Arsa Sahibi Hesabı</div>
                                <div className="text-xs text-gray-500">info@aydoganarsa.com / owner123</div>
                            </button>
                            <button
                                onClick={() => setFormData({ email: 'admin@aydoganarsa.com', password: 'owner123' })}
                                className="w-full text-left px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="font-medium">Admin Hesabı</div>
                                <div className="text-xs text-gray-500">admin@aydoganarsa.com / owner123</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
