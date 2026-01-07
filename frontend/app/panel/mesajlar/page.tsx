'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Send, Search, Filter, User, Clock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

interface Message {
    id: string
    content: string
    senderId: string
    receiverId: string
    sender: {
        firstName: string
        lastName: string
        email: string
    }
    receiver: {
        firstName: string
        lastName: string
        email: string
    }
    createdAt: string
    isRead: boolean
}

interface Conversation {
    id: string
    participants: Array<{
        id: string
        firstName: string
        lastName: string
        email: string
    }>
    lastMessage: Message
    unreadCount: number
}

export default function MessagesPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuthStore()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [sendingMessage, setSendingMessage] = useState(false)

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

    useEffect(() => {
        fetchConversations()
    }, [])

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id)
        }
    }, [selectedConversation])

    const fetchConversations = async () => {
        try {
            // TODO: Backend entegrasyonu
            // Mock data
            const mockConversations: Conversation[] = [
                {
                    id: '1',
                    participants: [
                        { id: '1', firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet@example.com' },
                        { id: '2', firstName: 'Ayşe', lastName: 'Demir', email: 'ayse@example.com' }
                    ],
                    lastMessage: {
                        id: '1',
                        content: 'Merhaba, arsa hakkında bilgi alabilir miyim?',
                        senderId: '2',
                        receiverId: '1',
                        sender: { firstName: 'Ayşe', lastName: 'Demir', email: 'ayse@example.com' },
                        receiver: { firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet@example.com' },
                        createdAt: '2024-01-15T10:30:00Z',
                        isRead: false
                    },
                    unreadCount: 2
                },
                {
                    id: '2',
                    participants: [
                        { id: '1', firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet@example.com' },
                        { id: '3', firstName: 'Mehmet', lastName: 'Kaya', email: 'mehmet@example.com' }
                    ],
                    lastMessage: {
                        id: '2',
                        content: 'Teşekkürler, bilgi için.',
                        senderId: '3',
                        receiverId: '1',
                        sender: { firstName: 'Mehmet', lastName: 'Kaya', email: 'mehmet@example.com' },
                        receiver: { firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet@example.com' },
                        createdAt: '2024-01-14T15:45:00Z',
                        isRead: true
                    },
                    unreadCount: 0
                }
            ]
            setConversations(mockConversations)
        } catch (error) {
            console.error('Konuşmalar yüklenemedi:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (conversationId: string) => {
        try {
            // TODO: Backend entegrasyonu
            // Mock data
            const mockMessages: Message[] = [
                {
                    id: '1',
                    content: 'Merhaba, Bilecik Bozüyük\'teki arsanız hakkında bilgi alabilir miyim?',
                    senderId: '2',
                    receiverId: '1',
                    sender: { firstName: 'Ayşe', lastName: 'Demir', email: 'ayse@example.com' },
                    receiver: { firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet@example.com' },
                    createdAt: '2024-01-15T10:30:00Z',
                    isRead: true
                },
                {
                    id: '2',
                    content: 'Tabii ki! Hangi konularda bilgi almak istiyorsunuz?',
                    senderId: '1',
                    receiverId: '2',
                    sender: { firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet@example.com' },
                    receiver: { firstName: 'Ayşe', lastName: 'Demir', email: 'ayse@example.com' },
                    createdAt: '2024-01-15T10:35:00Z',
                    isRead: true
                },
                {
                    id: '3',
                    content: 'Arsanın m² fiyatı nedir? Ayrıca imar durumu nasıl?',
                    senderId: '2',
                    receiverId: '1',
                    sender: { firstName: 'Ayşe', lastName: 'Demir', email: 'ayse@example.com' },
                    receiver: { firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet@example.com' },
                    createdAt: '2024-01-15T10:40:00Z',
                    isRead: false
                }
            ]
            setMessages(mockMessages)
        } catch (error) {
            console.error('Mesajlar yüklenemedi:', error)
        }
    }

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return

        setSendingMessage(true)
        try {
            // TODO: Backend entegrasyonu
            const message: Message = {
                id: Date.now().toString(),
                content: newMessage,
                senderId: user!.id,
                receiverId: selectedConversation.participants.find(p => p.id !== user!.id)!.id,
                sender: {
                    firstName: user!.firstName,
                    lastName: user!.lastName,
                    email: user!.email
                },
                receiver: selectedConversation.participants.find(p => p.id !== user!.id)!,
                createdAt: new Date().toISOString(),
                isRead: false
            }

            setMessages(prev => [...prev, message])
            setNewMessage('')
        } catch (error) {
            console.error('Mesaj gönderilemedi:', error)
        } finally {
            setSendingMessage(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)

        if (diffInHours < 24) {
            return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        } else {
            return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
        }
    }

    const getOtherParticipant = (conversation: Conversation) => {
        return conversation.participants.find(p => p.id !== user?.id)
    }

    const filteredConversations = conversations.filter(conversation => {
        const otherParticipant = getOtherParticipant(conversation)
        if (!otherParticipant) return false

        const fullName = `${otherParticipant.firstName} ${otherParticipant.lastName}`.toLowerCase()
        return fullName.includes(searchTerm.toLowerCase()) ||
            otherParticipant.email.toLowerCase().includes(searchTerm.toLowerCase())
    })

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

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
                        <div className="bg-white rounded-xl p-6">
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                <div className="h-32 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Mesajlar</h1>
                    <p className="text-gray-600">Müşterilerinizle iletişim kurun</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-200px)]">
                    <div className="flex h-full">
                        {/* Conversations Sidebar */}
                        <div className="w-1/3 border-r border-gray-200 flex flex-col">
                            {/* Search */}
                            <div className="p-4 border-b border-gray-200">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Konuşma ara..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Conversations List */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredConversations.length === 0 ? (
                                    <div className="p-6 text-center">
                                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">Henüz mesaj yok</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200">
                                        {filteredConversations.map((conversation) => {
                                            const otherParticipant = getOtherParticipant(conversation)
                                            if (!otherParticipant) return null

                                            return (
                                                <button
                                                    key={conversation.id}
                                                    onClick={() => setSelectedConversation(conversation)}
                                                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedConversation?.id === conversation.id ? 'bg-green-50 border-r-2 border-green-500' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <User className="w-5 h-5 text-gray-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                                    {otherParticipant.firstName} {otherParticipant.lastName}
                                                                </h3>
                                                                <span className="text-xs text-gray-500">
                                                                    {formatTime(conversation.lastMessage.createdAt)}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 truncate">
                                                                {conversation.lastMessage.content}
                                                            </p>
                                                            {conversation.unreadCount > 0 && (
                                                                <div className="mt-1">
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        {conversation.unreadCount} yeni
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 flex flex-col">
                            {selectedConversation ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-gray-200">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {(() => {
                                                        const otherParticipant = getOtherParticipant(selectedConversation)
                                                        return otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Bilinmeyen Kullanıcı'
                                                    })()}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {(() => {
                                                        const otherParticipant = getOtherParticipant(selectedConversation)
                                                        return otherParticipant?.email || ''
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId === user.id
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-gray-100 text-gray-900'
                                                        }`}
                                                >
                                                    <p className="text-sm">{message.content}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span
                                                            className={`text-xs ${message.senderId === user.id ? 'text-green-100' : 'text-gray-500'
                                                                }`}
                                                        >
                                                            {formatTime(message.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-gray-200">
                                        <div className="flex space-x-4">
                                            <textarea
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Mesajınızı yazın..."
                                                rows={2}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                            />
                                            <button
                                                onClick={sendMessage}
                                                disabled={!newMessage.trim() || sendingMessage}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                                            >
                                                <Send className="w-4 h-4" />
                                                <span>Gönder</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Mesaj Seçin</h3>
                                        <p className="text-gray-500">
                                            Mesajlaşmaya başlamak için sol taraftaki konuşmalardan birini seçin
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}