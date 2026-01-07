import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center space-x-2">
                            <img src="/logo.png" alt="Aydoğan Arsa" className="h-10 w-auto" />
                            <span className="text-xl font-bold">Aydoğan Arsa</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Türkiye genelinde güvenilir arsa satış platformu. Bilecik, Kütahya, Edirne, Afyon ve daha birçok ilde hizmetinizdeyiz.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://www.facebook.com/aydoganarsa" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://twitter.com/aydoganarsa" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="https://www.instagram.com/aydoganarsa/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Hızlı Linkler</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/ilanlar" className="text-gray-400 hover:text-white transition-colors">
                                    Tüm İlanlar
                                </Link>
                            </li>
                            <li>
                                <Link href="/arama" className="text-gray-400 hover:text-white transition-colors">
                                    Gelişmiş Arama
                                </Link>
                            </li>
                            <li>
                                <Link href="/hakkimizda" className="text-gray-400 hover:text-white transition-colors">
                                    Hakkımızda
                                </Link>
                            </li>
                            <li>
                                <Link href="/iletisim" className="text-gray-400 hover:text-white transition-colors">
                                    İletişim
                                </Link>
                            </li>
                            <li>
                                <Link href="/yardim" className="text-gray-400 hover:text-white transition-colors">
                                    Yardım
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Arsa Türleri - Kompakt ve responsive */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Arsa Türleri</h3>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                            <Link href="/ilanlar?category=IMARLIARSA" className="text-gray-400 hover:text-white transition-colors">
                                İmarlı Arsa
                            </Link>
                            <Link href="/ilanlar?category=TARLA" className="text-gray-400 hover:text-white transition-colors">
                                Tarla
                            </Link>
                            <Link href="/ilanlar?category=ZEYTINLIK" className="text-gray-400 hover:text-white transition-colors">
                                Zeytinlik
                            </Link>
                            <Link href="/ilanlar?category=BAHCE" className="text-gray-400 hover:text-white transition-colors">
                                Bahçe
                            </Link>
                            <Link href="/ilanlar?category=SANAYI" className="text-gray-400 hover:text-white transition-colors">
                                Sanayi Arsası
                            </Link>
                            <Link href="/ilanlar?category=TICARI" className="text-gray-400 hover:text-white transition-colors">
                                Ticari Arsa
                            </Link>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">İletişim</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center space-x-3">
                                <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span className="text-gray-400">+90 212 XXX XX XX</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span className="text-gray-400">info@aydoganarsa.com</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <MapPin className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span className="text-gray-400">Türkiye Geneli</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-gray-400 text-sm">
                            © 2024 Aydoğan Arsa. Tüm hakları saklıdır.
                        </p>
                        <div className="flex space-x-6 text-sm">
                            <Link href="/gizlilik" className="text-gray-400 hover:text-white transition-colors">
                                Gizlilik Politikası
                            </Link>
                            <Link href="/kullanim-sartlari" className="text-gray-400 hover:text-white transition-colors">
                                Kullanım Şartları
                            </Link>
                            <Link href="/yardim" className="text-gray-400 hover:text-white transition-colors">
                                Yardım
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}