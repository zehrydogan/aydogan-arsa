'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    window.location.href = '/'
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <img
                        src="/logo.png"
                        alt="Aydoğan Arsa"
                        className="h-20 w-20 mx-auto rounded-full mb-4"
                    />
                    <h1 className="text-6xl font-bold text-green-600 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Sayfa Bulunamadı
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <p className="text-gray-600 mb-4">
                        <span className="font-semibold text-green-600">{countdown}</span> saniye içinde ana sayfaya yönlendirileceksiniz.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Ana Sayfaya Git
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Geri Dön
                        </button>
                    </div>
                </div>

                <p className="text-sm text-gray-500">
                    Yardıma mı ihtiyacınız var?{' '}
                    <Link href="/yardim" className="text-green-600 hover:text-green-700">
                        Yardım Merkezi
                    </Link>
                </p>
            </div>
        </div>
    )
}
