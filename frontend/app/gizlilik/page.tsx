export default function GizlilikPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-green-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Gizlilik Politikası</h1>
                    <p className="text-green-100">Son güncelleme: Ocak 2024</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto">
                    <div className="prose prose-green max-w-none">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">1. Giriş</h2>
                        <p className="text-gray-600 mb-6">
                            Aydoğan Arsa olarak, kişisel verilerinizin güvenliği bizim için son derece önemlidir.
                            Bu gizlilik politikası, web sitemizi kullanırken toplanan bilgilerin nasıl kullanıldığını açıklar.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mb-4">2. Toplanan Bilgiler</h2>
                        <p className="text-gray-600 mb-4">Aşağıdaki bilgileri toplayabiliriz:</p>
                        <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                            <li>Ad, soyad ve iletişim bilgileri</li>
                            <li>E-posta adresi ve telefon numarası</li>
                            <li>Arsa arama tercihleri ve favoriler</li>
                            <li>Site kullanım verileri ve çerezler</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mb-4">3. Bilgilerin Kullanımı</h2>
                        <p className="text-gray-600 mb-4">Topladığımız bilgileri şu amaçlarla kullanırız:</p>
                        <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                            <li>Size uygun arsa ilanlarını göstermek</li>
                            <li>İletişim taleplerinize yanıt vermek</li>
                            <li>Hizmetlerimizi geliştirmek</li>
                            <li>Yasal yükümlülüklerimizi yerine getirmek</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. Bilgi Güvenliği</h2>
                        <p className="text-gray-600 mb-6">
                            Kişisel verilerinizi korumak için uygun teknik ve organizasyonel önlemler alıyoruz.
                            Verileriniz şifreli bağlantılar üzerinden iletilir ve güvenli sunucularda saklanır.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mb-4">5. Çerezler</h2>
                        <p className="text-gray-600 mb-6">
                            Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanır.
                            Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mb-4">6. Üçüncü Taraflarla Paylaşım</h2>
                        <p className="text-gray-600 mb-6">
                            Kişisel bilgilerinizi, yasal zorunluluklar dışında üçüncü taraflarla paylaşmıyoruz.
                            Arsa sahipleriyle iletişim kurmanız durumunda, iletişim bilgileriniz ilgili tarafla paylaşılabilir.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mb-4">7. Haklarınız</h2>
                        <p className="text-gray-600 mb-4">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
                        <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                            <li>Kişisel verilerinize erişim talep etme</li>
                            <li>Yanlış verilerin düzeltilmesini isteme</li>
                            <li>Kişisel verilerinizin silinmesini talep etme</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mb-4">8. İletişim</h2>
                        <p className="text-gray-600">
                            Gizlilik politikamız hakkında sorularınız için{' '}
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
