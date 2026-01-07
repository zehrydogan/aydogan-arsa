'use client'

import { MapPin, Users, Award, Shield, Target } from 'lucide-react'
import Link from 'next/link'

export default function HakkimizdaPage() {
    const bolgeler = [
        { il: 'Bilecik', ilceler: ['Bozüyük', 'Gölpazarı', 'Söğüt', 'Merkez', 'Osmaneli'] },
        { il: 'Kütahya', ilceler: ['Simav', 'Altıntaş', 'Gediz', 'Tavşanlı'] },
        { il: 'Edirne', ilceler: ['Keşan', 'Uzunköprü', 'Meriç', 'Lalapaşa'] },
        { il: 'Afyonkarahisar', ilceler: ['Merkez', 'Emirdağ', 'Başmakçı'] },
        { il: 'Kırıkkale', ilceler: ['Delice', 'Karakeçili', 'Keskin'] },
        { il: 'Konya', ilceler: ['Bozkır', 'Beyşehir', 'Çumra'] },
        { il: 'Manisa', ilceler: ['Demirci', 'Soma'] },
        { il: 'Ordu', ilceler: ['Akkuş', 'Perşembe', 'Ünye'] },
        { il: 'Kastamonu', ilceler: ['İhsangazi', 'Taşköprü'] },
        { il: 'Ankara', ilceler: ['Nallıhan', 'Çubuk'] },
        { il: 'Bolu', ilceler: ['Gerede', 'Göynük'] },
        { il: 'Karabük', ilceler: ['Safranbolu', 'Eskipazar'] },
        { il: 'Çankırı', ilceler: ['Şabanözü', 'Korgun'] },
        { il: 'Isparta', ilceler: ['Merkez'] },
        { il: 'İzmir', ilceler: ['Menemen'] },
        { il: 'Düzce', ilceler: ['Merkez'] },
        { il: 'Çorum', ilceler: ['İskilip'] },
        { il: 'Sivas', ilceler: ['Gürün'] },
        { il: 'Tekirdağ', ilceler: ['Saray'] },
        { il: 'Giresun', ilceler: ['Piraziz'] },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-green-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Hakkımızda</h1>
                    <p className="text-xl text-green-100 max-w-2xl mx-auto">
                        Türkiye genelinde güvenilir arsa satışının adresi
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Aydoğan Arsa Ofisi</h2>
                            <p className="text-gray-600 mb-4">
                                Aydoğan Arsa, Türkiye genelinde arsa, tarla, zeytinlik ve bahçe satışı konusunda
                                uzmanlaşmış güvenilir bir emlak ofisidir. Yıllardır edindiğimiz tecrübe ve
                                müşteri memnuniyeti odaklı yaklaşımımızla sizlere en iyi hizmeti sunmayı hedefliyoruz.
                            </p>
                            <p className="text-gray-600 mb-4">
                                Bilecik, Kütahya, Edirne, Afyonkarahisar, Konya ve daha birçok ilde geniş bir portföye sahibiz.
                                İmarlı arsalardan tarım arazilerine, zeytinliklerden sanayi arsalarına kadar
                                her türlü arazi ihtiyacınızda yanınızdayız.
                            </p>
                            <p className="text-gray-600">
                                Profesyonel ekibimiz, tapu işlemlerinden imar durumu araştırmasına kadar
                                tüm süreçlerde size rehberlik eder.
                            </p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-8">
                            <img src="/logo.png" alt="Aydoğan Arsa" className="w-32 h-auto mx-auto mb-6" />
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aydoğan Arsa Ofisi</h3>
                                <p className="text-gray-600">Güvenilir Arsa Satışının Adresi</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Values */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Güvenilirlik</h3>
                        <p className="text-sm text-gray-600">Tüm işlemlerimizde şeffaflık ve dürüstlük ilkesiyle çalışıyoruz.</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Tecrübe</h3>
                        <p className="text-sm text-gray-600">Yılların verdiği deneyimle bölgeleri ve piyasayı çok iyi tanıyoruz.</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Müşteri Odaklı</h3>
                        <p className="text-sm text-gray-600">Müşterilerimizin ihtiyaçlarını anlamak ve en uygun çözümü sunmak önceliğimiz.</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Profesyonellik</h3>
                        <p className="text-sm text-gray-600">Her aşamada profesyonel destek ve danışmanlık hizmeti sunuyoruz.</p>
                    </div>
                </div>

                {/* Çalıştığımız Bölgeler */}
                <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center">
                        <MapPin className="w-6 h-6 mr-2 text-green-600" />
                        Çalıştığımız Bölgeler
                    </h2>
                    <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {bolgeler.map((bolge, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                                <h3 className="font-semibold text-green-600 mb-2">{bolge.il}</h3>
                                <p className="text-xs text-gray-600">{bolge.ilceler.join(', ')}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Services */}
                <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Hizmetlerimiz</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">İmarlı Arsa Satışı</h3>
                            <p className="text-sm text-gray-600">Konut, ticari ve sanayi imarlı arsalar</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Tarla ve Arazi Satışı</h3>
                            <p className="text-sm text-gray-600">Tarım arazileri ve tarlalar</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Zeytinlik Satışı</h3>
                            <p className="text-sm text-gray-600">Verimli zeytinlikler ve bahçeler</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Tapu İşlemleri</h3>
                            <p className="text-sm text-gray-600">Tapu devir ve tescil işlemlerinde destek</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">İmar Durumu Araştırması</h3>
                            <p className="text-sm text-gray-600">Detaylı imar ve kadastro araştırması</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Yatırım Danışmanlığı</h3>
                            <p className="text-sm text-gray-600">Arsa yatırımı konusunda profesyonel danışmanlık</p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-green-600 rounded-xl p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Hayalinizdeki Arsayı Birlikte Bulalım</h2>
                    <p className="text-green-100 mb-6">Türkiye genelinde arsa arıyorsanız, hemen bizimle iletişime geçin.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/ilanlar" className="bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors">
                            İlanları İncele
                        </Link>
                        <Link href="/iletisim" className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                            İletişime Geç
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
