'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, BellOff, Trash2, Play, Calendar, Filter } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';

interface SavedSearch {
    id: string;
    name: string;
    criteria: {
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        minRooms?: number;
        maxRooms?: number;
        category?: string;
        cityId?: string;
    };
    notificationsEnabled: boolean;
    lastExecutedAt: string | null;
    resultCount: number;
    createdAt: string;
}

export default function SavedSearchesPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();
    const [searches, setSearches] = useState<SavedSearch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoading) return // Loading durumunda bekle

        if (!isAuthenticated) {
            router.push('/giris?redirect=/kayitli-aramalar');
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchSavedSearches();
        }
    }, [isAuthenticated]);

    const fetchSavedSearches = async () => {
        try {
            const response = await apiClient.get<SavedSearch[]>('/saved-searches');
            setSearches(response || []);
        } catch (error) {
            console.error('Kayıtlı aramalar yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleNotification = async (id: string) => {
        try {
            await apiClient.patch(`/saved-searches/${id}/toggle-notification`);
            setSearches(searches.map(s =>
                s.id === id ? { ...s, notificationsEnabled: !s.notificationsEnabled } : s
            ));
        } catch (error) {
            console.error('Bildirim ayarı değiştirilemedi:', error);
        }
    };

    const deleteSearch = async (id: string) => {
        if (!confirm('Bu aramayı silmek istediğinizden emin misiniz?')) return;

        try {
            await apiClient.delete(`/saved-searches/${id}`);
            setSearches(searches.filter(s => s.id !== id));
        } catch (error) {
            console.error('Arama silinemedi:', error);
        }
    };

    const executeSearch = (search: SavedSearch) => {
        const params = new URLSearchParams();
        if (search.criteria.search) params.set('search', search.criteria.search);
        if (search.criteria.minPrice) params.set('minPrice', search.criteria.minPrice.toString());
        if (search.criteria.maxPrice) params.set('maxPrice', search.criteria.maxPrice.toString());
        if (search.criteria.category) params.set('category', search.criteria.category);
        router.push(`/arama?${params.toString()}`);
    };

    const formatCriteria = (criteria: SavedSearch['criteria']) => {
        const parts = [];
        if (criteria.search) parts.push(`"${criteria.search}"`);
        if (criteria.minPrice || criteria.maxPrice) {
            parts.push(`${criteria.minPrice || 0} - ${criteria.maxPrice || '...'} TL`);
        }
        if (criteria.category) parts.push(criteria.category);
        return parts.join(' | ') || 'Tüm ilanlar';
    };

    if (isLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kayıtlı Aramalarım</h1>
                        <p className="text-gray-600 mt-2">
                            Kaydettiğiniz arama kriterlerini buradan yönetebilirsiniz
                        </p>
                    </div>
                    <Link
                        href="/arama"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <Search className="w-4 h-4" />
                        Yeni Arama
                    </Link>
                </div>

                {searches.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Henüz kayıtlı aramanız yok
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Arama yaparken "Aramayı Kaydet" butonuna tıklayarak aramalarınızı kaydedebilirsiniz.
                        </p>
                        <Link
                            href="/arama"
                            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Search className="w-5 h-5" />
                            Arama Yap
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {searches.map((search) => (
                            <div
                                key={search.id}
                                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {search.name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                            <span className="flex items-center gap-1">
                                                <Filter className="w-4 h-4" />
                                                {formatCriteria(search.criteria)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(search.createdAt).toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                        <p className="text-green-600 font-medium">
                                            {search.resultCount} ilan bulundu
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => executeSearch(search)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Aramayı çalıştır"
                                        >
                                            <Play className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => toggleNotification(search.id)}
                                            className={`p-2 rounded-lg transition-colors ${search.notificationsEnabled
                                                ? 'text-green-600 hover:bg-green-50'
                                                : 'text-gray-400 hover:bg-gray-50'
                                                }`}
                                            title={search.notificationsEnabled ? 'Bildirimleri kapat' : 'Bildirimleri aç'}
                                        >
                                            {search.notificationsEnabled ? (
                                                <Bell className="w-5 h-5" />
                                            ) : (
                                                <BellOff className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => deleteSearch(search.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Aramayı sil"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
