import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    Put,
    Delete,
    ParseIntPipe,
    DefaultValuePipe
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post('conversations')
    async createConversation(@Body() createConversationDto: CreateConversationDto, @Request() req) {
        return this.messagesService.createConversation(createConversationDto, req.user.id);
    }

    @Post()
    async createMessage(@Body() createMessageDto: CreateMessageDto, @Request() req) {
        return this.messagesService.createMessage(createMessageDto, req.user.id);
    }

    @Get('conversations')
    async getConversations(
        @Request() req,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    ) {
        return this.messagesService.getConversations(req.user.id, page, limit);
    }

    @Get('conversations/:id/messages')
    async getConversationMessages(
        @Param('id') conversationId: string,
        @Request() req,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    ) {
        return this.messagesService.getConversationMessages(conversationId, req.user.id, page, limit);
    }

    @Put('conversations/:id/read')
    async markMessagesAsRead(@Param('id') conversationId: string, @Request() req) {
        return this.messagesService.markMessagesAsRead(conversationId, req.user.id);
    }

    @Get('unread-count')
    async getUnreadCount(@Request() req) {
        return this.messagesService.getUnreadCount(req.user.id);
    }

    @Delete('conversations/:id')
    async deleteConversation(@Param('id') conversationId: string, @Request() req) {
        return this.messagesService.deleteConversation(conversationId, req.user.id);
    }
}