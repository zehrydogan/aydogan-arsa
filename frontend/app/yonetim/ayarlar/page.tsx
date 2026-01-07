'use client';

import { useState, useEffect } from 'react';
import { Save, Database, Mail, Shield, Globe, Bell, Trash2 } from 'lucide-react';

interface SystemSettings {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportPhone: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SystemSettings>({
        siteName: 'Aydoğan Arsa',
        siteDescription: 'Türkiye genelinde güvenilir arsa satışı',
        contactEmail: 'info@aydoganarsa.com',
        supportPhone: '+90 555 123 45 67',
        maintenanceMode: false,
        registrationEnabled: true,
        emailNotifications: true,
        smsNotifications: false,
        maxFileSize: 5,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf']
    });
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess('');

        try {
            // TODO: Backend entegrasyonu
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSaveSuccess('Ayarlar başarıyla kaydedildi');
        } catch (error) {
            console.error('Ayarlar kaydedilemedi:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (key: keyof SystemSettings, value: any) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const tabs = [
        { id: 'general', name: 'Genel Ayarlar', icon: Globe },
        { id: 'notifications', name: 'Bildirimler', icon: Bell },
        { id: 'security', name: 'Güvenlik', icon: Shield },
        { id: 'database', name: 'Veritabanı', icon: Database }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Sistem Ayarları</h1>
                <p className="text-gray-600 mt-2">
                    Sistem genelindeki ayarları yönetin
                </p>
            </div>

            {saveSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {saveSuccess}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="lg:w-64 flex-shrink-0">
                    <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <ul className="space-y-2">
                            {tabs.map((tab) => (
                                <li key={tab.id}>
                                    <button
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                                ? 'bg-green-50 text-green-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <tab.icon className="w-5 h-5" />
                                        <span>{tab.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Genel Ayarlar</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Site Adı
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.siteName}
                                            onChange={(e) => handleInputChange('siteName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Site Açıklaması
                                        </label>
                                        <textarea
                                            value={settings.siteDescription}
                                            onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                İletişim E-postası
                                            </label>
                                            <input
                                                type="email"
                                                value={settings.contactEmail}
                                                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Destek Telefonu
                                            </label>
                                            <input
                                                type="tel"
                                                value={settings.supportPhone}
                                                onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Maksimum Dosya Boyutu (MB)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.maxFileSize}
                                            onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value))}
                                            min="1"
                                            max="50"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">Bakım Modu</h3>
                                                <p className="text-sm text-gray-500">Site bakım modunda olduğunda sadece adminler erişebilir</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.maintenanceMode}
                                                    onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">Kayıt Olma Aktif</h3>
                                                <p className="text-sm text-gray-500">Yeni kullanıcıların kayıt olmasına izin ver</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.registrationEnabled}
                                                    onChange={(e) => handleInputChange('registrationEnabled', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Settings */}
                        {activeTab === 'notifications' && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Bildirim Ayarları</h2>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">E-posta Bildirimleri</h3>
                                            <p className="text-sm text-gray-500">Sistem e-posta bildirimleri göndersin</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.emailNotifications}
                                                onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">SMS Bildirimleri</h3>
                                            <p className="text-sm text-gray-500">Sistem SMS bildirimleri göndersin</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.smsNotifications}
                                                onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-blue-800 mb-2">E-posta Ayarları</h3>
                                        <p className="text-sm text-blue-700">
                                            E-posta bildirimleri için SMTP ayarlarını yapılandırmanız gerekiyor.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Güvenlik Ayarları</h2>

                                <div className="space-y-6">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-yellow-800 mb-2">Güvenlik Uyarısı</h3>
                                        <p className="text-sm text-yellow-700">
                                            Güvenlik ayarlarını değiştirirken dikkatli olun. Yanlış ayarlar sisteme erişimi engelleyebilir.
                                        </p>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Oturum Ayarları</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm text-gray-700 mb-1">Oturum Süresi (dakika)</label>
                                                <input
                                                    type="number"
                                                    defaultValue={60}
                                                    min="15"
                                                    max="1440"
                                                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-700 mb-1">Maksimum Giriş Denemesi</label>
                                                <input
                                                    type="number"
                                                    defaultValue={5}
                                                    min="3"
                                                    max="10"
                                                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">API Güvenliği</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700">Rate Limiting Aktif</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                                </label>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700">CORS Koruması</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Database Settings */}
                        {activeTab === 'database' && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Veritabanı Yönetimi</h2>

                                <div className="space-y-6">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-red-800 mb-2">Dikkat!</h3>
                                        <p className="text-sm text-red-700">
                                            Veritabanı işlemleri geri alınamaz. İşlem yapmadan önce yedek aldığınızdan emin olun.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="border border-gray-200 rounded-lg p-4">
                                            <h3 className="text-sm font-medium text-gray-900 mb-3">Veritabanı Yedekleme</h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Tüm veritabanının yedeğini alın
                                            </p>
                                            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                                Yedek Al
                                            </button>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg p-4">
                                            <h3 className="text-sm font-medium text-gray-900 mb-3">Veritabanı Temizleme</h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Eski logları ve geçici dosyaları temizle
                                            </p>
                                            <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                                                Temizle
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border border-red-200 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-red-900 mb-3">Tehlikeli İşlemler</h3>
                                        <div className="space-y-3">
                                            <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                                                <Trash2 className="w-4 h-4" />
                                                <span>Tüm Verileri Sil</span>
                                            </button>
                                            <p className="text-xs text-red-600">
                                                Bu işlem tüm kullanıcı verilerini, ilanları ve mesajları kalıcı olarak siler.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}