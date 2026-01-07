'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Search, Heart, User, LogOut, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useFavoriteIds } from '@/hooks/useFavorites'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const { user, isAuthenticated, logout, checkAuth } = useAuthStore()
    const { data: favoriteIds } = useFavoriteIds()

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    const handleLogout = () => {
        logout()
        setShowUserMenu(false)
    }

    const getUserDisplayName = () => {
        if (!user) return ''
        return `${user.firstName} ${user.lastName}`
    }

    const favoriteCount = favoriteIds?.length || 0

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <img src="/logo.png" alt="Aydoğan Arsa" className="h-10 w-auto" />
                        <span className="text-xl font-bold text-gray-900">Aydoğan Arsa</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href="/ilanlar" className="text-gray-700 hover:text-blue-600 transition-colors">
                            İlanlar
                        </Link>
                        <Link href="/arama" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Arama
                        </Link>
                        <Link href="/hakkimizda" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Hakkımızda
                        </Link>
                        <Link href="/iletisim" className="text-gray-700 hover:text-blue-600 transition-colors">
                            İletişim
                        </Link>
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link href="/favoriler" className="relative p-2 text-gray-600 hover:text-red-500 transition-colors">
                                    <Heart className="w-5 h-5" />
                                    {favoriteCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {favoriteCount > 9 ? '9+' : favoriteCount}
                                        </span>
                                    )}
                                </Link>

                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                                    >
                                        <User className="w-5 h-5" />
                                        <span className="hidden lg:block">{getUserDisplayName()}</span>
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                                            <div className="px-4 py-2 border-b">
                                                <div className="font-medium text-gray-900">{getUserDisplayName()}</div>
                                                <div className="text-sm text-gray-500">{user?.email}</div>
                                            </div>

                                            {user?.role === 'OWNER' && (
                                                <Link
                                                    href="/panel"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    Panel
                                                </Link>
                                            )}

                                            {user?.role === 'ADMIN' && (
                                                <Link
                                                    href="/yonetim"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    Yönetim Paneli
                                                </Link>
                                            )}

                                            <Link
                                                href="/profil"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <User className="w-4 h-4 mr-2" />
                                                Profil
                                            </Link>

                                            <Link
                                                href="/favoriler"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <Heart className="w-4 h-4 mr-2" />
                                                Favoriler ({favoriteCount})
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Çıkış Yap
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/giris" className="text-gray-700 hover:text-blue-600 transition-colors">
                                    Giriş Yap
                                </Link>
                                <Link href="/kayit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Kayıt Ol
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <nav className="flex flex-col space-y-4">
                            <Link href="/ilanlar" className="text-gray-700 hover:text-blue-600 transition-colors">
                                İlanlar
                            </Link>
                            <Link href="/arama" className="text-gray-700 hover:text-blue-600 transition-colors">
                                Arama
                            </Link>
                            <Link href="/hakkimizda" className="text-gray-700 hover:text-blue-600 transition-colors">
                                Hakkımızda
                            </Link>
                            <Link href="/iletisim" className="text-gray-700 hover:text-blue-600 transition-colors">
                                İletişim
                            </Link>

                            <div className="pt-4 border-t">
                                {isAuthenticated ? (
                                    <div className="space-y-4">
                                        <div className="text-sm text-gray-600">
                                            Merhaba, {getUserDisplayName()}
                                        </div>
                                        <Link
                                            href="/favoriler"
                                            className="flex items-center space-x-2 text-gray-700 hover:text-red-500 transition-colors"
                                        >
                                            <Heart className="w-5 h-5" />
                                            <span>Favoriler ({favoriteCount})</span>
                                        </Link>
                                        {user?.role === 'OWNER' && (
                                            <Link href="/panel" className="text-gray-700 hover:text-blue-600 transition-colors">
                                                Panel
                                            </Link>
                                        )}
                                        {user?.role === 'ADMIN' && (
                                            <Link href="/yonetim" className="text-gray-700 hover:text-blue-600 transition-colors">
                                                Yönetim Paneli
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="text-gray-700 hover:text-blue-600 transition-colors"
                                        >
                                            Çıkış Yap
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-4">
                                        <Link href="/giris" className="text-gray-700 hover:text-blue-600 transition-colors">
                                            Giriş Yap
                                        </Link>
                                        <Link href="/kayit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                            Kayıt Ol
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}