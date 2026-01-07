'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, User, Mail, Phone, Calendar, Eye, EyeOff, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useOwnerContactRequests, useUpdateContactStatus, useDeleteContactRequest } from '@/hooks/useContact'
import { ContactRequest } from '@/lib/types'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default function ContactsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuthStore()
    const [page, setPage] = useState(1)
    const [selectedContact, setSelectedContact] = useState<ContactRequest | null>(null)

    const { data: contactsData, isLoading, error } = useOwnerContactRequests(page, 20)
    const updateStatus = useUpdateContactStatus()
    const deleteContact = useDeleteContactRequest()

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.push('/giris')
            return
        }

        if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
            router.push('/')
            return
        }
    }, [isAuthenticated, user, router])

    const handleMarkAsRead = async (contact: ContactRequest) => {
        if (!contact.isRead) {
            try {
                await updateStatus.mutateAsync({
                    id: contact.id,
                    isRead: true
                })
            } catch (error) {
                console.error('Failed to mark as read:', error)
            }
        }
    }

    const handleStatusChange = async (contact: ContactRequest, status: string) => {
        try {
            await updateStatus.mutateAsync({
                id: contact.id,
                status
            })
        } catch (error) {
            console.error('Failed to update status:', error)
        }
    }

    const handleDelete = async (contact: ContactRequest) => {
        if (confirm('Bu iletişim talebini silmek istediğinizden emin misiniz?')) {
            try {
                await deleteContact.mutateAsync(contact.id)
            } catch (error) {
                console.error('Failed to delete contact:', error)
            }
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800'
            case 'RESPONDED':
                return 'bg-green-100 text-green-800'
            case 'CLOSED':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Bekliyor'
            case 'RESPONDED':
                return 'Yanıtlandı'
            case 'CLOSED':
                return 'Kapatıldı'
            default:
                return status
        }
    }

    if (!isAuthenticated || !user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-48 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-6">
                                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Hata Oluştu</h1>
                        <p className="text-gray-600 mb-6">İletişim talepleri yüklenirken bir hata oluştu.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    const contacts = contactsData?.data || []

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">İletişim Talepleri</h1>
                        <p className="text-gray-600">
                            Toplam {contactsData?.total || 0} iletişim talebi
                        </p>
                    </div>
                </div>

                {/* Contacts List */}
                {contacts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Henüz İletişim Talebi Yok
                        </h3>
                        <p className="text-gray-600">
                            Arsa ilanlarınız için gelen iletişim talepleri burada görünecek.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {contacts.map((contact: ContactRequest) => (
                            <div
                                key={contact.id}
                                className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${contact.isRead ? 'border-gray-200' : 'border-green-500'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Contact Header */}
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="flex items-center space-x-2">
                                                {contact.visitor ? (
                                                    <div className="flex items-center space-x-2">
                                                        <User className="w-5 h-5 text-gray-400" />
                                                        <span className="font-medium text-gray-900">
                                                            {contact.visitor.firstName} {contact.visitor.lastName}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <User className="w-5 h-5 text-gray-400" />
                                                        <span className="font-medium text-gray-900">
                                                            {contact.guestName}
                                                        </span>
                                                        <span className="text-sm text-gray-500">(Misafir)</span>
                                                    </div>
                                                )}
                                            </div>

                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                                                {getStatusText(contact.status)}
                                            </span>

                                            {!contact.isRead && (
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            )}
                                        </div>

                                        {/* Property info */}
                                        <div className="mb-3">
                                            <Link
                                                href={`/ilanlar/${contact.propertyId}`}
                                                className="text-green-600 hover:text-green-700 font-medium"
                                            >
                                                {contact.property?.title}
                                            </Link>
                                        </div>

                                        {/* Subject */}
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {contact.subject}
                                        </h3>

                                        {/* Message Preview */}
                                        <p className="text-gray-700 mb-4 line-clamp-2">
                                            {contact.message}
                                        </p>

                                        {/* Contact info */}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center space-x-1">
                                                <Mail className="w-4 h-4" />
                                                <span>{contact.visitor?.email || contact.guestEmail}</span>
                                            </div>
                                            {(contact.visitor?.phone || contact.guestPhone) && (
                                                <div className="flex items-center space-x-1">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{contact.visitor?.phone || contact.guestPhone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(contact.createdAt).toLocaleDateString('tr-TR')}</span>
                                            </div>
                                        </div>

                                        {/* Full Message (expandable) */}
                                        {selectedContact?.id === contact.id && (
                                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                <h4 className="font-medium text-gray-900 mb-2">Tam Mesaj:</h4>
                                                <p className="text-gray-700 whitespace-pre-line">
                                                    {contact.message}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            onClick={() => {
                                                if (selectedContact?.id === contact.id) {
                                                    setSelectedContact(null)
                                                } else {
                                                    setSelectedContact(contact)
                                                    handleMarkAsRead(contact)
                                                }
                                            }}
                                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                            title={selectedContact?.id === contact.id ? "Kapat" : "Detayları Göster"}
                                        >
                                            {selectedContact?.id === contact.id ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>

                                        {/* Status Actions */}
                                        {contact.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleStatusChange(contact, 'RESPONDED')}
                                                className="p-2 text-green-400 hover:text-green-600 transition-colors"
                                                title="Yanıtlandı Olarak İşaretle"
                                                disabled={updateStatus.isPending}
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                        )}

                                        {contact.status !== 'CLOSED' && (
                                            <button
                                                onClick={() => handleStatusChange(contact, 'CLOSED')}
                                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                                title="Kapat"
                                                disabled={updateStatus.isPending}
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDelete(contact)}
                                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                            title="Sil"
                                            disabled={deleteContact.isPending}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {contactsData && contactsData.totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <div className="flex space-x-2">
                            {Array.from({ length: contactsData.totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`px-4 py-2 rounded-lg ${page === pageNum
                                        ? 'bg-green-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}