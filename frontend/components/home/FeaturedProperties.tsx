'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import PropertyCard from '@/components/properties/PropertyCard'
import { Property } from '@/lib/types'

export default function FeaturedProperties() {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchFeaturedProperties()
    }, [])

    const fetchFeaturedProperties = async () => {
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
            const response = await fetch(`${API_BASE_URL}/properties?limit=6&status=PUBLISHED`)
            if (response.ok) {
                const data = await response.json()
                setProperties(data.properties || [])
            }
        } catch (error) {
            console.error('Error fetching properties:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Öne Çıkan Arsa İlanları
                        </h2>
                        <p className="text-xl text-gray-600">
                            En popüler ve güncel arsa ilanlarımızı keşfedin
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-300"></div>
                                <div className="p-6">
                                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-6 bg-gray-300 rounded mb-4"></div>
                                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                                        <div className="h-4 bg-gray-300 rounded w-16"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Öne Çıkan Arsa İlanları
                    </h2>
                    <p className="text-xl text-gray-600">
                        En popüler ve güncel arsa ilanlarımızı keşfedin
                    </p>
                </div>

                {properties.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">Henüz yayınlanmış ilan bulunmuyor.</p>
                        <Link href="/ilanlar" className="inline-block mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                            Tüm İlanları Görüntüle
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {properties.map((property) => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <Link
                                href="/ilanlar"
                                className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                Tüm İlanları Görüntüle
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}