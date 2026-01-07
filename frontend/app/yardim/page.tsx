'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Mail, Phone, MessageCircle, MapPin } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: 'Aydoğan Arsa nedir?',
        answer: 'Aydoğan Arsa, Türkiye genelinde arsa, tarla, bahçe ve zeytinlik satışı yapan aile şirketimizdir. Bilecik, Kütahya, Edirne, Afyonkarahisar ve daha birçok ilde güvenilir arsa satışı hizmeti sunmaktayız.'
    },
    {
        question: 'Hangi bölgelerde arsa satışı yapıyorsunuz?',
        answer: 'Bilecik (Bozüyük, Gölpazarı, Söğüt), Kütahya (Simav, Gediz, Tavşanlı), Edirne (Keşan, Uzunköprü), Afyonkarahisar, Konya, Ankara, Bolu, Karabük ve daha birçok ilde arsa satışı yapmaktayız. İmarlı arsalar, tarım arazileri, zeytinlikler ve bahçeler portföyümüzde yer almaktadır.'
    },
    {
        question: 'Arsaların imar durumu hakkında bilgi alabilir miyim?',
        answer: 'Evet, her arsanın imar durumu, ada-parsel bilgisi, gabari, kat sayısı ve emsal değerleri ilan detaylarında belirtilmektedir. Daha fazla bilgi için bizimle iletişime geçebilirsiniz.'
    },
    {
        question: 'Tapu işlemleri nasıl yapılıyor?',
        answer: 'Tüm arsalarımız tapulu ve hukuki açıdan sorunsuzdur. Satış işlemlerinde tapu devri noter ve tapu müdürlüğü aracılığıyla resmi olarak gerçekleştirilmektedir.'
    },
    {
        question: 'Arsa fiyatları neye göre belirleniyor?',
        answer: 'Arsa fiyatları; konumu, imar durumu, yüzölçümü, yola cephesi, altyapı imkanları ve bölgenin gelişim potansiyeline göre belirlenmektedir.'
    },
    {
        question: 'Arsaları yerinde görebilir miyim?',
        answer: 'Elbette! Randevu alarak arsaları yerinde gezebilir, detaylı bilgi alabilirsiniz. Bölgeyi tanımayanlar için rehberlik hizmeti de sunmaktayız.'
    },
    {
        question: 'Taksitli satış yapıyor musunuz?',
        answer: 'Bazı arsalarımızda taksitli ödeme seçeneği mevcuttur. Detaylı bilgi için lütfen bizimle iletişime geçin.'
    },
    {
        question: 'Yatırım için hangi arsaları önerirsiniz?',
        answer: 'Yatırım amacına göre farklı önerilerimiz olabilir. İmar beklentisi olan arsalar, gelişen bölgelerdeki araziler veya tarımsal getiri sağlayan zeytinlikler değerlendirilebilir. Size özel danışmanlık için bizi arayın.'
    }
];

export default function HelpPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFaqs = faqs.filter(
        faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Yardım Merkezi</h1>
                    <p className="text-gray-600 text-lg">
                        Arsa alım satımı hakkında merak ettikleriniz
                    </p>
                </div>

                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Soru ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-xl shadow-sm mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 p-6 border-b">
                        Sıkça Sorulan Sorular
                    </h2>
                    <div className="divide-y">
                        {filteredFaqs.map((faq, index) => (
                            <div key={index} className="p-6">
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full flex items-center justify-between text-left"
                                >
                                    <span className="font-medium text-gray-900">{faq.question}</span>
                                    {openIndex === index ? (
                                        <ChevronUp className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                    )}
                                </button>
                                {openIndex === index && (
                                    <p className="mt-4 text-gray-600 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                        Bize Ulaşın
                    </h2>
                    <p className="text-center text-gray-600 mb-6">
                        Arsa satın almak veya detaylı bilgi almak için bizimle iletişime geçin.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <a
                            href="mailto:info@aydoganarsa.com"
                            className="flex flex-col items-center p-6 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
                        >
                            <Mail className="w-8 h-8 text-green-600 mb-3" />
                            <span className="font-medium text-gray-900">E-posta</span>
                            <span className="text-sm text-gray-500 text-center">info@aydoganarsa.com</span>
                        </a>
                        <a
                            href="tel:+905551234567"
                            className="flex flex-col items-center p-6 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
                        >
                            <Phone className="w-8 h-8 text-green-600 mb-3" />
                            <span className="font-medium text-gray-900">Telefon</span>
                            <span className="text-sm text-gray-500">+90 555 123 45 67</span>
                        </a>
                        <a
                            href="https://wa.me/905551234567"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center p-6 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
                        >
                            <MessageCircle className="w-8 h-8 text-green-600 mb-3" />
                            <span className="font-medium text-gray-900">WhatsApp</span>
                            <span className="text-sm text-gray-500">Hızlı İletişim</span>
                        </a>
                        <div className="flex flex-col items-center p-6 rounded-xl border border-gray-200 bg-gray-50">
                            <MapPin className="w-8 h-8 text-green-600 mb-3" />
                            <span className="font-medium text-gray-900">Bölge</span>
                            <span className="text-sm text-gray-500 text-center">Türkiye Geneli</span>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="bg-green-50 rounded-xl p-8 mt-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                        Neden Aydoğan Arsa?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-3xl font-bold text-green-600 mb-2">15+</div>
                            <div className="text-gray-600">Yıllık Tecrübe</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                            <div className="text-gray-600">Mutlu Müşteri</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-green-600 mb-2">%100</div>
                            <div className="text-gray-600">Güvenilir Tapu</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
