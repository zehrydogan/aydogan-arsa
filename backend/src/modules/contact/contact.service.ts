import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ContactService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    async createContactRequest(dto: CreateContactRequestDto, userId?: string) {
        // Verify property exists and is published
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

        // Prevent owner from contacting their own property
        if (userId && property.ownerId === userId) {
            throw new BadRequestException('Kendi ilanınıza mesaj gönderemezsiniz');
        }

        // For registered users, use their ID
        // For guests, require name and email
        if (!userId && (!dto.guestName || !dto.guestEmail)) {
            throw new BadRequestException('Misafir kullanıcılar için isim ve email gereklidir');
        }

        const contactRequest = await this.prisma.contactRequest.create({
            data: {
                subject: dto.subject,
                message: dto.message,
                propertyId: dto.propertyId,
                visitorId: userId,
                guestName: dto.guestName,
                guestEmail: dto.guestEmail,
                guestPhone: dto.guestPhone,
            },
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                },
                visitor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        // Bildirim gönder
        const visitorName = userId
            ? `${contactRequest.visitor.firstName} ${contactRequest.visitor.lastName}`
            : dto.guestName || 'Misafir';

        await this.notificationsService.sendContactRequestNotification(
            contactRequest.property.owner.id,
            visitorName,
            contactRequest.property.title,
            contactRequest.id
        );

        return contactRequest;
    }

    async getContactRequestsForOwner(ownerId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [contactRequests, total] = await Promise.all([
            this.prisma.contactRequest.findMany({
                where: {
                    property: {
                        ownerId: ownerId
                    }
                },
                include: {
                    property: {
                        select: {
                            id: true,
                            title: true,
                            images: {
                                select: {
                                    url: true
                                },
                                orderBy: {
                                    order: 'asc'
                                },
                                take: 1
                            }
                        }
                    },
                    visitor: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            this.prisma.contactRequest.count({
                where: {
                    property: {
                        ownerId: ownerId
                    }
                }
            })
        ]);

        return {
            data: contactRequests,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getContactRequestById(id: string, userId: string, userRole: string) {
        const contactRequest = await this.prisma.contactRequest.findUnique({
            where: { id },
            include: {
                property: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                },
                visitor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        if (!contactRequest) {
            throw new NotFoundException('İletişim talebi bulunamadı');
        }

        // Check permissions
        const isOwner = contactRequest.property.ownerId === userId;
        const isVisitor = contactRequest.visitorId === userId;
        const isAdmin = userRole === 'ADMIN';

        if (!isOwner && !isVisitor && !isAdmin) {
            throw new ForbiddenException('Bu iletişim talebini görme yetkiniz yok');
        }

        return contactRequest;
    }

    async updateContactStatus(id: string, dto: UpdateContactStatusDto, userId: string, userRole: string) {
        const contactRequest = await this.prisma.contactRequest.findUnique({
            where: { id },
            include: {
                property: {
                    select: {
                        ownerId: true
                    }
                }
            }
        });

        if (!contactRequest) {
            throw new NotFoundException('İletişim talebi bulunamadı');
        }

        // Only property owner or admin can update status
        const isOwner = contactRequest.property.ownerId === userId;
        const isAdmin = userRole === 'ADMIN';

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException('Bu iletişim talebini güncelleme yetkiniz yok');
        }

        const updatedContactRequest = await this.prisma.contactRequest.update({
            where: { id },
            data: {
                ...(dto.status && { status: dto.status }),
                ...(dto.isRead !== undefined && { isRead: dto.isRead })
            },
            include: {
                property: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                visitor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        return updatedContactRequest;
    }

    async markAsRead(id: string, userId: string, userRole: string) {
        return this.updateContactStatus(id, { isRead: true }, userId, userRole);
    }

    async getUnreadCount(ownerId: string) {
        const count = await this.prisma.contactRequest.count({
            where: {
                property: {
                    ownerId: ownerId
                },
                isRead: false
            }
        });

        return { unreadCount: count };
    }

    async deleteContactRequest(id: string, userId: string, userRole: string) {
        const contactRequest = await this.prisma.contactRequest.findUnique({
            where: { id },
            include: {
                property: {
                    select: {
                        ownerId: true
                    }
                }
            }
        });

        if (!contactRequest) {
            throw new NotFoundException('İletişim talebi bulunamadı');
        }

        // Only property owner or admin can delete
        const isOwner = contactRequest.property.ownerId === userId;
        const isAdmin = userRole === 'ADMIN';

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException('Bu iletişim talebini silme yetkiniz yok');
        }

        await this.prisma.contactRequest.delete({
            where: { id }
        });

        return { message: 'İletişim talebi başarıyla silindi' };
    }
}