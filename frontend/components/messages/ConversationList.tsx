'use client';

import { useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface ConversationListProps {
    onSelectConversation: (conversationId: string) => void;
    selectedConversationId?: string;
}

export function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
    const { user } = useAuthStore();
    const {
        conversations,
        conversationsLoading,
        deleteConversation,
        deleteConversationLoading
    } = useMessages();

    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeletingId(conversationId);
        try {
            await deleteConversation(conversationId);
        } finally {
            setDeletingId(null);
        }
    };

    if (conversationsLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!conversations.length) {
        return (
            <div className="text-center py-12">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz mesajınız yok</h3>
                <p className="text-gray-500">
                    İlan sahipleriyle iletişime geçtiğinizde mesajlarınız burada görünecek.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {conversations.map((conversation: any) => {
                const otherParticipant = conversation.participants.find((p: any) => p.userId !== user?.id);
                const lastMessage = conversation.messages[0];
                const unreadCount = conversation._count.messages;
                const isSelected = selectedConversationId === conversation.id;

                return (
                    <Card
                        key={conversation.id}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                            }`}
                        onClick={() => onSelectConversation(conversation.id)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={otherParticipant?.user.avatar} />
                                    <AvatarFallback>
                                        {otherParticipant?.user.firstName[0]}{otherParticipant?.user.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                            {otherParticipant?.user.firstName} {otherParticipant?.user.lastName}
                                        </h4>
                                        <div className="flex items-center space-x-2">
                                            {unreadCount > 0 && (
                                                <Badge variant="destructive" className="text-xs">
                                                    {unreadCount}
                                                </Badge>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                                onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                                disabled={deletingId === conversation.id}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-2 truncate">
                                        {conversation.property.title}
                                    </p>

                                    {lastMessage && (
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-gray-500 truncate flex-1">
                                                {lastMessage.senderId === user?.id ? 'Siz: ' : ''}
                                                {lastMessage.content}
                                            </p>
                                            <span className="text-xs text-gray-400 ml-2">
                                                {formatDistanceToNow(new Date(lastMessage.createdAt), {
                                                    addSuffix: true,
                                                    locale: tr
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}