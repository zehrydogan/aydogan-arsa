import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface NotificationPayload {
    userId: string;
    type: 'NEW_MESSAGE' | 'MESSAGE_READ' | 'CONTACT_REQUEST' | 'PROPERTY_UPDATE';
    title: string;
    message: string;
    data?: any;
}

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Yeni mesaj bildirimi gönder
     */
    async sendNewMessageNotification(
        receiverId: string,
        senderName: string,
        messageContent: string,
        conversationId: string
    ) {
        const notification: NotificationPayload = {
            userId: receiverId,
            type: 'NEW_MESSAGE',
            title: `${senderName}'dan yeni mesaj`,
            message: messageContent.substring(0, 100),
            data: {
                conversationId,
                type: 'message'
            }
        };

        // In-app notification (WebSocket üzerinden gönderilecek)
        this.logger.log(`Bildirim gönderildi: ${receiverId} - ${notification.title}`);

        // TODO: Email bildirimi (opsiyonel)
        // await this.sendEmailNotification(receiverId, notification);

        return notification;
    }

    /**
     * Mesaj okundu bildirimi
     */
    async sendMessageReadNotification(
        senderId: string,
        readerName: string,
        conversationId: string
    ) {
        const notification: NotificationPayload = {
            userId: senderId,
            type: 'MESSAGE_READ',
            title: 'Mesajınız okundu',
            message: `${readerName} mesajınızı okudu`,
            data: {
                conversationId,
                type: 'message_read'
            }
        };

        this.logger.log(`Okundu bildirimi: ${senderId} - ${notification.title}`);

        return notification;
    }

    /**
     * İletişim talebi bildirimi
     */
    async sendContactRequestNotification(
        ownerId: string,
        visitorName: string,
        propertyTitle: string,
        contactRequestId: string
    ) {
        const notification: NotificationPayload = {
            userId: ownerId,
            type: 'CONTACT_REQUEST',
            title: 'Yeni iletişim talebi',
            message: `${visitorName}, "${propertyTitle}" ilanınız için iletişim talebinde bulundu`,
            data: {
                contactRequestId,
                type: 'contact_request'
            }
        };

        this.logger.log(`İletişim talebi bildirimi: ${ownerId} - ${notification.title}`);

        return notification;
    }

    /**
     * Favori ilan güncellemesi bildirimi
     */
    async sendPropertyUpdateNotification(
        userId: string,
        propertyTitle: string,
        updateType: 'price_change' | 'status_change' | 'updated',
        propertyId: string
    ) {
        const messages = {
            price_change: 'Fiyat değişti',
            status_change: 'Durum güncellendi',
            updated: 'İlan güncellendi'
        };

        const notification: NotificationPayload = {
            userId,
            type: 'PROPERTY_UPDATE',
            title: 'Favori ilanınız güncellendi',
            message: `"${propertyTitle}" - ${messages[updateType]}`,
            data: {
                propertyId,
                updateType,
                type: 'property_update'
            }
        };

        this.logger.log(`İlan güncelleme bildirimi: ${userId} - ${notification.title}`);

        return notification;
    }

    /**
     * Email bildirimi gönder (opsiyonel - gelecekte implement edilecek)
     */
    private async sendEmailNotification(userId: string, notification: NotificationPayload) {
        // TODO: Email servis entegrasyonu
        // - NodeMailer veya SendGrid kullanılabilir
        // - Kullanıcının email tercihlerini kontrol et
        // - Email template'i oluştur ve gönder

        this.logger.log(`Email bildirimi gönderilecek: ${userId}`);
    }

    /**
     * Push notification gönder (opsiyonel - gelecekte implement edilecek)
     */
    private async sendPushNotification(userId: string, notification: NotificationPayload) {
        // TODO: Push notification servis entegrasyonu
        // - Firebase Cloud Messaging veya OneSignal kullanılabilir
        // - Kullanıcının cihaz token'larını al
        // - Push notification gönder

        this.logger.log(`Push bildirimi gönderilecek: ${userId}`);
    }
}