import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
    userId?: string;
}

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
    namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(MessagesGateway.name);
    private connectedUsers = new Map<string, string>(); // userId -> socketId

    constructor(
        private messagesService: MessagesService,
        private jwtService: JwtService,
    ) { }

    async handleConnection(client: AuthenticatedSocket) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                this.logger.warn('WebSocket bağlantısı reddedildi: Token bulunamadı');
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            client.userId = payload.sub;

            this.connectedUsers.set(payload.sub, client.id);

            this.logger.log(`Kullanıcı bağlandı: ${payload.sub} (${client.id})`);

            // Kullanıcıyı kendi odasına ekle
            client.join(`user:${payload.sub}`);

        } catch (error) {
            this.logger.warn('WebSocket kimlik doğrulama hatası:', error.message);
            client.disconnect();
        }
    }

    handleDisconnect(client: AuthenticatedSocket) {
        if (client.userId) {
            this.connectedUsers.delete(client.userId);
            this.logger.log(`Kullanıcı bağlantısı kesildi: ${client.userId} (${client.id})`);
        }
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() data: CreateMessageDto,
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        try {
            if (!client.userId) {
                client.emit('error', { message: 'Kimlik doğrulaması gerekli' });
                return;
            }

            const message = await this.messagesService.createMessage(data, client.userId);

            // Mesajı konuşmadaki tüm katılımcılara gönder
            this.server.to(`user:${data.receiverId}`).emit('newMessage', message);
            this.server.to(`user:${client.userId}`).emit('messageSent', message);

            this.logger.log(`Mesaj gönderildi: ${client.userId} -> ${data.receiverId}`);

        } catch (error) {
            this.logger.error('Mesaj gönderme hatası:', error);
            client.emit('error', { message: error.message });
        }
    }

    @SubscribeMessage('joinConversation')
    async handleJoinConversation(
        @MessageBody() data: { conversationId: string },
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        try {
            if (!client.userId) {
                client.emit('error', { message: 'Kimlik doğrulaması gerekli' });
                return;
            }

            // Kullanıcının bu konuşmaya erişimi var mı kontrol et (service'den)
            const messages = await this.messagesService.getConversationMessages(
                data.conversationId,
                client.userId,
                1,
                1
            );

            // Konuşma odasına katıl
            client.join(`conversation:${data.conversationId}`);

            this.logger.log(`Kullanıcı konuşmaya katıldı: ${client.userId} -> ${data.conversationId}`);

        } catch (error) {
            this.logger.error('Konuşmaya katılma hatası:', error);
            client.emit('error', { message: error.message });
        }
    }

    @SubscribeMessage('leaveConversation')
    async handleLeaveConversation(
        @MessageBody() data: { conversationId: string },
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        client.leave(`conversation:${data.conversationId}`);
        this.logger.log(`Kullanıcı konuşmadan ayrıldı: ${client.userId} -> ${data.conversationId}`);
    }

    @SubscribeMessage('markAsRead')
    async handleMarkAsRead(
        @MessageBody() data: { conversationId: string },
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        try {
            if (!client.userId) {
                client.emit('error', { message: 'Kimlik doğrulaması gerekli' });
                return;
            }

            await this.messagesService.markMessagesAsRead(data.conversationId, client.userId);

            // Diğer katılımcılara mesajların okunduğunu bildir
            client.to(`conversation:${data.conversationId}`).emit('messagesRead', {
                conversationId: data.conversationId,
                userId: client.userId,
                readAt: new Date(),
            });

            this.logger.log(`Mesajlar okundu olarak işaretlendi: ${client.userId} -> ${data.conversationId}`);

        } catch (error) {
            this.logger.error('Mesajları okundu işaretleme hatası:', error);
            client.emit('error', { message: error.message });
        }
    }

    // Kullanıcının çevrimiçi durumunu kontrol etmek için yardımcı method
    isUserOnline(userId: string): boolean {
        return this.connectedUsers.has(userId);
    }

    // Belirli bir kullanıcıya mesaj göndermek için yardımcı method
    sendToUser(userId: string, event: string, data: any) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
}