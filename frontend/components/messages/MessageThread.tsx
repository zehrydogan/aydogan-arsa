'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMessages } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';

interface Message {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    conversationId: string;
    isRead: boolean;
    createdAt: string;
    sender: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
}

interface MessageThreadProps {
    conversationId: string;
}

export function MessageThread({ conversationId }: MessageThreadProps) {
    const { user } = useAuthStore();
    const { sendMessage, joinConversation, leaveConversation, markAsRead, isConnected } = useMessages();
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Konuşma mesajlarını getir
    const {
        data: messagesData,
        isLoading: messagesLoading,
        error: messagesError
    } = useQuery({
        queryKey: ['conversation-messages', conversationId],
        queryFn: async () => {
            const response = await apiClient.get(`/messages/conversations/${conversationId}/messages`);
            return response;
        },
        enabled: !!conversationId
    });

    // Konuşma detaylarını getir
    const {
        data: conversationData,
        isLoading: conversationLoading
    } = useQuery({
        queryKey: ['conversation', conversationId],
        queryFn: async () => {
            const response = await apiClient.get<{ data: any[] }>(`/messages/conversations`);
            const conversations = response.data;
            return conversations.find((conv: any) => conv.id === conversationId);
        },
        enabled: !!conversationId
    });

    // Konuşmaya katıl ve ayrıl
    useEffect(() => {
        if (conversationId && isConnected) {
            joinConversation(conversationId);

            return () => {
                leaveConversation(conversationId);
            };
        }
    }, [conversationId, isConnected, joinConversation, leaveConversation]);

    // Mesajları okundu olarak işaretle
    useEffect(() => {
        const messages = (messagesData as any)?.data || messagesData;
        if (conversationId && messages?.length > 0) {
            const unreadMessages = messages.filter(
                (msg: Message) => msg.receiverId === user?.id && !msg.isRead
            );

            if (unreadMessages.length > 0) {
                markAsRead(conversationId);
            }
        }
    }, [conversationId, messagesData, user?.id, markAsRead]);

    // Otomatik scroll
    useEffect(() => {
        const messages = (messagesData as any)?.data || messagesData;
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messagesData]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !conversationData || isSending) return;

        const otherParticipant = conversationData.participants.find(
            (p: any) => p.userId !== user?.id
        );

        if (!otherParticipant) return;

        setIsSending(true);

        try {
            sendMessage({
                content: newMessage.trim(),
                receiverId: otherParticipant.userId,
                conversationId: conversationId
            });

            setNewMessage('');
        } catch (error) {
            console.error('Mesaj gönderme hatası:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (messagesLoading || conversationLoading) {
        return (
            <div className="flex flex-col h-full">
                <div className="border-b p-4">
                    <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            <Skeleton className="h-12 w-64 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (messagesError) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Mesajlar yüklenemedi</h3>
                    <p className="text-gray-500">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
                </div>
            </div>
        );
    }

    if (!conversationData) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Konuşma bulunamadı</h3>
                    <p className="text-gray-500">Bu konuşmaya erişim yetkiniz olmayabilir.</p>
                </div>
            </div>
        );
    }

    const otherParticipant = conversationData.participants.find(
        (p: any) => p.userId !== user?.id
    );
    const messages = (messagesData as any)?.data || messagesData || [];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b p-4 bg-white">
                <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={otherParticipant?.user.avatar} />
                        <AvatarFallback>
                            {otherParticipant?.user.firstName[0]}{otherParticipant?.user.lastName[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-medium text-gray-900">
                            {otherParticipant?.user.firstName} {otherParticipant?.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{conversationData.property.title}</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">Henüz mesaj yok. İlk mesajı gönderin!</p>
                    </div>
                ) : (
                    messages.map((message: Message) => {
                        const isOwn = message.senderId === user?.id;

                        return (
                            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                                    <Card className={`${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                                        <CardContent className="p-3">
                                            <p className="text-sm">{message.content}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                                                    {formatDistanceToNow(new Date(message.createdAt), {
                                                        addSuffix: true,
                                                        locale: tr
                                                    })}
                                                </span>
                                                {isOwn && (
                                                    <span className={`text-xs ${message.isRead ? 'text-blue-100' : 'text-blue-200'}`}>
                                                        {message.isRead ? '✓✓' : '✓'}
                                                    </span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {!isOwn && (
                                    <Avatar className="h-8 w-8 order-1 mr-2">
                                        <AvatarImage src={message.sender.avatar} />
                                        <AvatarFallback className="text-xs">
                                            {message.sender.firstName[0]}{message.sender.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t p-4 bg-white">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Mesajınızı yazın..."
                        disabled={isSending || !isConnected}
                        className="flex-1"
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || isSending || !isConnected}
                        size="sm"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>

                {!isConnected && (
                    <p className="text-xs text-amber-600 mt-2">
                        Bağlantı kuruluyor... Mesaj gönderemezsiniz.
                    </p>
                )}
            </div>
        </div>
    );
}