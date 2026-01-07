'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
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

interface Conversation {
    id: string;
    propertyId: string;
    createdAt: string;
    updatedAt: string;
    participants: Array<{
        id: string;
        userId: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatar?: string;
        };
    }>;
    property: {
        id: string;
        title: string;
        images: Array<{ url: string }>;
    };
    messages: Message[];
    _count: {
        messages: number;
    };
}

interface CreateConversationData {
    propertyId: string;
    participantId: string;
    initialMessage: string;
}

interface CreateMessageData {
    content: string;
    receiverId: string;
    conversationId: string;
}

export function useMessages() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user, accessToken } = useAuthStore();
    const queryClient = useQueryClient();

    // WebSocket bağlantısını kur
    useEffect(() => {
        if (!accessToken || !user) return;

        const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
            auth: {
                token: accessToken
            },
            transports: ['websocket']
        });

        newSocket.on('connect', () => {
            console.log('WebSocket bağlantısı kuruldu');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('WebSocket bağlantısı kesildi');
            setIsConnected(false);
        });

        newSocket.on('newMessage', (message: Message) => {
            // Yeni mesaj geldiğinde cache'i güncelle
            queryClient.setQueryData(['conversations'], (oldData: any) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    data: oldData.data.map((conv: Conversation) => {
                        if (conv.id === message.conversationId) {
                            return {
                                ...conv,
                                messages: [message],
                                updatedAt: new Date().toISOString(),
                                _count: {
                                    ...conv._count,
                                    messages: conv._count.messages + (message.receiverId === user.id ? 1 : 0)
                                }
                            };
                        }
                        return conv;
                    })
                };
            });

            // Konuşma mesajları cache'ini güncelle
            queryClient.setQueryData(['conversation-messages', message.conversationId], (oldData: any) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    data: [...oldData.data, message]
                };
            });

            // Okunmamış mesaj sayısını güncelle
            queryClient.invalidateQueries({ queryKey: ['unread-count'] });
        });

        newSocket.on('messageSent', (message: Message) => {
            // Gönderilen mesaj onaylandığında cache'i güncelle
            queryClient.setQueryData(['conversation-messages', message.conversationId], (oldData: any) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    data: [...oldData.data, message]
                };
            });
        });

        newSocket.on('messagesRead', (data: { conversationId: string; userId: string; readAt: string }) => {
            // Mesajlar okundu olarak işaretlendiğinde cache'i güncelle
            queryClient.setQueryData(['conversation-messages', data.conversationId], (oldData: any) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    data: oldData.data.map((msg: Message) => {
                        if (msg.receiverId === data.userId) {
                            return { ...msg, isRead: true };
                        }
                        return msg;
                    })
                };
            });
        });

        newSocket.on('error', (error: { message: string }) => {
            console.error('WebSocket hatası:', error.message);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [accessToken, user, queryClient]);

    // Konuşmaları getir
    const {
        data: conversations,
        isLoading: conversationsLoading,
        error: conversationsError
    } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const response = await apiClient.get('/messages/conversations');
            return response;
        },
        enabled: !!user
    });

    // Konuşma mesajlarını getir
    const getConversationMessages = useCallback((conversationId: string, page = 1) => {
        return useQuery({
            queryKey: ['conversation-messages', conversationId, page],
            queryFn: async () => {
                const response = await apiClient.get(`/messages/conversations/${conversationId}/messages?page=${page}`);
                return response;
            },
            enabled: !!conversationId
        });
    }, []);

    // Okunmamış mesaj sayısını getir
    const {
        data: unreadCount,
        isLoading: unreadCountLoading
    } = useQuery({
        queryKey: ['unread-count'],
        queryFn: async () => {
            const response = await apiClient.get('/messages/unread-count');
            return response;
        },
        enabled: !!user,
        refetchInterval: 30000 // 30 saniyede bir güncelle
    });

    // Yeni konuşma oluştur
    const createConversationMutation = useMutation({
        mutationFn: async (data: CreateConversationData) => {
            const response = await apiClient.post('/messages/conversations', data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });

    // Mesaj gönder (WebSocket ile)
    const sendMessage = useCallback((data: CreateMessageData) => {
        if (socket && isConnected) {
            socket.emit('sendMessage', data);
        }
    }, [socket, isConnected]);

    // Konuşmaya katıl
    const joinConversation = useCallback((conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('joinConversation', { conversationId });
        }
    }, [socket, isConnected]);

    // Konuşmadan ayrıl
    const leaveConversation = useCallback((conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('leaveConversation', { conversationId });
        }
    }, [socket, isConnected]);

    // Mesajları okundu olarak işaretle
    const markAsReadMutation = useMutation({
        mutationFn: async (conversationId: string) => {
            if (socket && isConnected) {
                socket.emit('markAsRead', { conversationId });
            }
            const response = await apiClient.put(`/messages/conversations/${conversationId}/read`);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['unread-count'] });
        }
    });

    // Konuşmayı sil
    const deleteConversationMutation = useMutation({
        mutationFn: async (conversationId: string) => {
            const response = await apiClient.delete(`/messages/conversations/${conversationId}`);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });

    return {
        // Data
        conversations: (conversations as any)?.data || conversations || [],
        unreadCount: (unreadCount as any)?.unreadCount || unreadCount || 0,

        // Loading states
        conversationsLoading,
        unreadCountLoading,

        // Errors
        conversationsError,

        // WebSocket state
        isConnected,

        // Functions
        getConversationMessages,
        sendMessage,
        joinConversation,
        leaveConversation,

        // Mutations
        createConversation: createConversationMutation.mutate,
        createConversationLoading: createConversationMutation.isPending,
        markAsRead: markAsReadMutation.mutate,
        markAsReadLoading: markAsReadMutation.isPending,
        deleteConversation: deleteConversationMutation.mutate,
        deleteConversationLoading: deleteConversationMutation.isPending
    };
}