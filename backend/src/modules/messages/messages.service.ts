import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    async createConversation(dto: CreateConversationDto, userId: string) {
        // Mülk var mı ve yayınlanmış mı kontrol et
        const property = await this.prisma.property.findFirst({
            where: {
                id: dto.propertyId,
                status: 'PUBLISHED'
            },
            include: {
                owner: true
            }
        });

        if (!property) {
            throw new NotFoundException('İlan bulunamadı veya yayınlanmamış');
        }

        // Kendi ilanına mesaj göndermeyi engelle
        if (property.ownerId === userId) {
            throw new BadRequestException('Kendi ilanınıza mesaj gönderemezsiniz');
        }

        // Katılımcı var mı kontrol et
        const participant = await this.prisma.user.findUnique({
            where: { id: dto.participantId }
        });

        if (!participant) {
            throw new NotFoundException('Katılımcı bulunamadı');
        }

        // Bu mülk için bu iki kullanıcı arasında zaten konuşma var mı kontrol et
        const existingConversation = await this.prisma.conversation.findFirst({
            where: {
                propertyId: dto.propertyId,
                participants: {
                    every: {
                        userId: {
                            in: [userId, dto.participantId]
                        }
                    }
                }
            },
            include: {
                participants: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (existingConversation) {
            // Varolan konuşmaya ilk mesajı ekle
            const message = await this.createMessage({
                content: dto.initialMessage,
                receiverId: dto.participantId,
                conversationId: existingConversation.id
            }, userId);

            return {
                conversation: existingConversation,
                message
            };
        }

        // Yeni konuşma oluştur
        const conversation = await this.prisma.conversation.create({
            data: {
                propertyId: dto.propertyId,
                participants: {
                    create: [
                        { userId: userId },
                        { userId: dto.participantId }
                    ]
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                avatar: true
                            }
                        }
                    }
                },
                property: {
                    select: {
                        id: true,
                        title: true,
                        images: {
                            select: { url: true },
                            orderBy: { order: 'asc' },
                            take: 1
                        }
                    }
                }
            }
        });

        // İlk mesajı oluştur
        const message = await this.createMessage({
            content: dto.initialMessage,
            receiverId: dto.participantId,
            conversationId: conversation.id
        }, userId);

        return {
            conversation,
            message
        };
    }

    async createMessage(dto: CreateMessageDto, senderId: string) {
        // Konuşma var mı ve kullanıcı katılımcı mı kontrol et
        const conversation = await this.prisma.conversation.findFirst({
            where: {
                id: dto.conversationId,
                participants: {
                    some: {
                        userId: senderId
                    }
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });

        if (!conversation) {
            throw new NotFoundException('Konuşma bulunamadı veya erişim yetkiniz yok');
        }

        // Alıcı konuşmada katılımcı mı kontrol et
        const receiverParticipant = conversation.participants.find(p => p.userId === dto.receiverId);
        if (!receiverParticipant) {
            throw new BadRequestException('Alıcı bu konuşmada katılımcı değil');
        }

        // Mesajı oluştur
        const message = await this.prisma.message.create({
            data: {
                content: dto.content,
                senderId: senderId,
                receiverId: dto.receiverId,
                conversationId: dto.conversationId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        // Konuşmanın updatedAt'ini güncelle
        await this.prisma.conversation.update({
            where: { id: dto.conversationId },
            data: { updatedAt: new Date() }
        });

        // Bildirim gönder
        const senderParticipant = conversation.participants.find(p => p.userId === senderId);
        if (senderParticipant) {
            await this.notificationsService.sendNewMessageNotification(
                dto.receiverId,
                `${senderParticipant.user.firstName} ${senderParticipant.user.lastName}`,
                dto.content,
                dto.conversationId
            );
        }

        return message;
    }

    async getConversations(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [conversations, total] = await Promise.all([
            this.prisma.conversation.findMany({
                where: {
                    participants: {
                        some: {
                            userId: userId
                        }
                    }
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true
                                }
                            }
                        }
                    },
                    property: {
                        select: {
                            id: true,
                            title: true,
                            images: {
                                select: { url: true },
                                orderBy: { order: 'asc' },
                                take: 1
                            }
                        }
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            messages: {
                                where: {
                                    receiverId: userId,
                                    isRead: false
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    updatedAt: 'desc'
                },
                skip,
                take: limit
            }),
            this.prisma.conversation.count({
                where: {
                    participants: {
                        some: {
                            userId: userId
                        }
                    }
                }
            })
        ]);

        return {
            data: conversations,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getConversationMessages(conversationId: string, userId: string, page = 1, limit = 50) {
        // Kullanıcının bu konuşmaya erişimi var mı kontrol et
        const conversation = await this.prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: {
                        userId: userId
                    }
                }
            }
        });

        if (!conversation) {
            throw new NotFoundException('Konuşma bulunamadı veya erişim yetkiniz yok');
        }

        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            this.prisma.message.findMany({
                where: {
                    conversationId: conversationId
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            this.prisma.message.count({
                where: {
                    conversationId: conversationId
                }
            })
        ]);

        return {
            data: messages.reverse(), // En eski mesajlar önce gelsin
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async markMessagesAsRead(conversationId: string, userId: string) {
        // Kullanıcının bu konuşmaya erişimi var mı kontrol et
        const conversation = await this.prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: {
                        userId: userId
                    }
                }
            }
        });

        if (!conversation) {
            throw new NotFoundException('Konuşma bulunamadı veya erişim yetkiniz yok');
        }

        // Bu kullanıcıya gönderilen okunmamış mesajları okundu olarak işaretle
        await this.prisma.message.updateMany({
            where: {
                conversationId: conversationId,
                receiverId: userId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        // Katılımcının lastReadAt'ini güncelle
        await this.prisma.conversationParticipant.updateMany({
            where: {
                conversationId: conversationId,
                userId: userId
            },
            data: {
                lastReadAt: new Date()
            }
        });

        return { success: true };
    }

    async getUnreadCount(userId: string) {
        const count = await this.prisma.message.count({
            where: {
                receiverId: userId,
                isRead: false
            }
        });

        return { unreadCount: count };
    }

    async deleteConversation(conversationId: string, userId: string) {
        // Kullanıcının bu konuşmaya erişimi var mı kontrol et
        const conversation = await this.prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: {
                        userId: userId
                    }
                }
            }
        });

        if (!conversation) {
            throw new NotFoundException('Konuşma bulunamadı veya erişim yetkiniz yok');
        }

        // Konuşmayı sil (cascade ile mesajlar ve katılımcılar da silinir)
        await this.prisma.conversation.delete({
            where: { id: conversationId }
        });

        return { message: 'Konuşma başarıyla silindi' };
    }
}