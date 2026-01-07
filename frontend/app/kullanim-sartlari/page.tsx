export default function KullanimSartlariPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-green-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Kullanım Şartları</h1>
                    <p className="text-green-100">Son güncelleme: Ocak 2024</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto">
                    <div className="prose prose-green max-w-none">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">1. Genel Hükümler</h2>
                        <p className="text-gray-600 mb-6">
                            Bu web sitesini kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
                            Aydoğan Arsa, bu şartları önceden haber vermeksizin değiştirme hakkını saklı tutar.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mb-4">2. Hizmet Tanımı</h2>
                        <p className="text-gray-600 mb-6">
                            Aydoğan Arsa, arsa, tarla, zeytinlik ve diğer arazi türlerinin satışına aracılık eden
                            bir emlak platformudur. Site üzerinden ilan görüntüleme, favorilere ekleme ve
                            iletişim kurma hizmetleri sunulmaktadır.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mb-4">3. Kullanıcı Sorumlulukları</h2>
                        <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                            <li>Doğru ve güncel bilgiler sağlamak</li>
                            <li>Hesap güvenliğini korumak</li>
                            <li>Yasalara uygun davranmak</li>
                            <li>Diğer kullanıcıların haklarına saygı göstermek</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. İlan Bilgileri</h2>
                        <p className="text-gray-600 mb-6">
                            Sitede yayınlanan ilanlar bilgilendirme amaçlıdır. Fiyatlar ve özellikler değişiklik
                            gösterebilir. Kesin bilgi için ofisimizle iletişime geçmenizi öneririz.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mb-4">5. Fikri Mülkiyet</h2>
                        <p className="text-gray-600 mb-6">
                            Site içeriği, tasarımı ve logosu Aydoğan Arsa'ya aittir. İzinsiz kullanımı yasaktır.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mb-4">6. Sorumluluk Reddi</h2>
                        <p className="text-gray-600 mb-6">
                            Aydoğan Arsa, site kullanımından doğabilecek doğrudan veya dolaylı zararlardan
                            sorumlu tutulamaz. İlan bilgilerinin doğruluğu ilan sahibinin sorumluluğundadır.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mb-4">7. İletişim</h2>
                        <p className="text-gray-600">
                            Sorularınız için{' '}
                            <a href="mailto:info@aydoganarsa.com" className="text-green-600 hover:underline">
                                info@aydoganarsa.com
                            </a>{' '}
                            adresinden bize ulaşabilirsiniz.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
