'use client';

import { useState } from 'react';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageThread } from '@/components/messages/MessageThread';
import { Card } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

export default function MessagesPage() {
    const [selectedConversationid, setSelectedConversationid] = useState<string | null>(null);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Mesajlar</h1>
                <p className="text-gray-600 mt-2">
                    ilan sahipleri ve alicilarla mesajlaSin
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                {/* KonuSma Listesi */}
                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <div className="p-4 border-b">
                            <h2 className="font-semibold text-gray-900">KonuSmalar</h2>
                        </div>
                        <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
                            <ConversationList
                                onSelectConversation={setSelectedConversationid}
                                selectedConversationid={selectedConversationid || undefined}
                            />
                        </div>
                    </Card>
                </div>

                {/* Mesaj Thread'i */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        {selectedConversationid ? (
                            <MessageThread conversationid={selectedConversationid} />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <MessageCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                                        Bir konuSma seCin
                                    </h3>
                                    <p className="text-gray-500">
                                        MesajlaSmaya baSlamak iCin sol taraftan bir konuSma seCin
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
