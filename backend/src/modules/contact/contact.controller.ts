import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    ParseIntPipe,
    DefaultValuePipe
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    @Post()
    @UseGuards(OptionalJwtAuthGuard)
    async createContactRequest(@Body() dto: CreateContactRequestDto, @Request() req) {
        const userId = req.user?.id;
        return this.contactService.createContactRequest(dto, userId);
    }

    @Get('owner')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('OWNER', 'ADMIN')
    async getContactRequestsForOwner(
        @Request() req,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number
    ) {
        const ownerId = req.user.role === 'ADMIN' ? req.query.ownerId : req.user.id;
        return this.contactService.getContactRequestsForOwner(ownerId, page, limit);
    }

    @Get('unread-count')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('OWNER', 'ADMIN')
    async getUnreadCount(@Request() req) {
        const ownerId = req.user.role === 'ADMIN' ? req.query.ownerId : req.user.id;
        return this.contactService.getUnreadCount(ownerId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getContactRequestById(@Param('id') id: string, @Request() req) {
        return this.contactService.getContactRequestById(id, req.user.id, req.user.role);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('OWNER', 'ADMIN')
    async updateContactStatus(
        @Param('id') id: string,
        @Body() dto: UpdateContactStatusDto,
        @Request() req
    ) {
        return this.contactService.updateContactStatus(id, dto, req.user.id, req.user.role);
    }

    @Patch(':id/read')
    @UseGuards(JwtAuthGuard)
    async markAsRead(@Param('id') id: string, @Request() req) {
        return this.contactService.markAsRead(id, req.user.id, req.user.role);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('OWNER', 'ADMIN')
    async deleteContactRequest(@Param('id') id: string, @Request() req) {
        return this.contactService.deleteContactRequest(id, req.user.id, req.user.role);
    }
}