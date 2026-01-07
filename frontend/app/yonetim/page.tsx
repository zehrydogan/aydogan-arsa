'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Building2, MessageSquare, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface DashboardStats {
    totalUsers: number;
    totalProperties: number;
    totalMessages: number;
    activeListings: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalProperties: 0,
        totalMessages: 0,
        activeListings: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // TODO: Backend'de admin stats endpoint'i oluşturulacak
            // Şimdilik mock data kullanıyoruz
            setStats({
                totalUsers: 150,
                totalProperties: 45,
                totalMessages: 320,
                activeListings: 38
            });
        } catch (error) {
            console.error('İstatistikler yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            name: 'Toplam Kullanıcı',
            value: stats.totalUsers,
            icon: Users,
            color: 'bg-green-500',
            change: '+12%'
        },
        {
            name: 'Toplam İlan',
            value: stats.totalProperties,
            icon: Building2,
            color: 'bg-green-500',
            change: '+8%'
        },
        {
            name: 'Aktif İlan',
            value: stats.activeListings,
            icon: TrendingUp,
            color: 'bg-green-600',
            change: '+5%'
        },
        {
            name: 'Toplam Mesaj',
            value: stats.totalMessages,
            icon: MessageSquare,
            color: 'bg-green-700',
            change: '+23%'
        }
    ];

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-64 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                                <div className="h-4 bg-gray-300 rounded w-24 mb-4"></div>
                                <div className="h-8 bg-gray-300 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    Sistem genel bakış ve istatistikler
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-medium text-green-600">{stat.change}</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Son Aktiviteler</h2>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Yeni kullanıcı kaydı</p>
                                <p className="text-xs text-gray-500">5 dakika önce</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Yeni ilan eklendi</p>
                                <p className="text-xs text-gray-500">15 dakika önce</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">İlan güncellendi</p>
                                <p className="text-xs text-gray-500">1 saat önce</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
                    <div className="space-y-3">
                        <Link href="/yonetim/kullanicilar" className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                            <span className="font-medium text-green-900">Kullanıcı Yönetimi</span>
                            <Users className="w-5 h-5 text-green-600" />
                        </Link>
                        <Link href="/yonetim/ilanlar" className="w-full flex items-center justify-between p-4 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">
                            <span className="font-medium text-green-900">İlan Yönetimi</span>
                            <Building2 className="w-5 h-5 text-green-700" />
                        </Link>
                        <Link href="/yonetim/ayarlar" className="w-full flex items-center justify-between p-4 bg-green-200 hover:bg-green-300 rounded-lg transition-colors">
                            <span className="font-medium text-green-900">Sistem Ayarları</span>
                            <TrendingUp className="w-5 h-5 text-green-800" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
