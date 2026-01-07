import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { SavedSearchesService } from './saved-searches.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../modules/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber, Min } from 'class-validator';

class PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 20;
}

@Controller('saved-searches')
@UseGuards(JwtAuthGuard)
export class SavedSearchesController {
    constructor(private readonly savedSearchesService: SavedSearchesService) { }

    @Post()
    async create(
        @Body() createDto: CreateSavedSearchDto,
        @CurrentUser() user: User
    ) {
        const savedSearch = await this.savedSearchesService.create(user.id, createDto);
        return {
            message: 'Search saved successfully',
            savedSearch
        };
    }

    @Get()
    async findAll(@CurrentUser() user: User) {
        const savedSearches = await this.savedSearchesService.findAllByUser(user.id);
        return {
            message: `Found ${savedSearches.length} saved searches`,
            savedSearches
        };
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
        @CurrentUser() user: User
    ) {
        const savedSearch = await this.savedSearchesService.findOne(id, user.id);
        return {
            savedSearch
        };
    }

    @Get(':id/execute')
    async executeSearch(
        @Param('id') id: string,
        @CurrentUser() user: User,
        @Query() query: PaginationDto
    ) {
        const result = await this.savedSearchesService.executeSearch(
            id,
            user.id,
            query.page,
            query.limit
        );
        return {
            message: `Found ${result.properties.length} matching properties`,
            ...result
        };
    }

    @Get(':id/count')
    async getMatchCount(
        @Param('id') id: string,
        @CurrentUser() user: User
    ) {
        const count = await this.savedSearchesService.getMatchCount(id, user.id);
        return {
            savedSearchId: id,
            matchCount: count
        };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateSavedSearchDto,
        @CurrentUser() user: User
    ) {
        const savedSearch = await this.savedSearchesService.update(id, user.id, updateDto);
        return {
            message: 'Saved search updated successfully',
            savedSearch
        };
    }

    @Patch(':id/toggle-notification')
    async toggleNotification(
        @Param('id') id: string,
        @CurrentUser() user: User
    ) {
        const savedSearch = await this.savedSearchesService.toggleNotification(id, user.id);
        return {
            message: `Notifications ${savedSearch.isActive ? 'enabled' : 'disabled'}`,
            savedSearch
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('id') id: string,
        @CurrentUser() user: User
    ) {
        await this.savedSearchesService.remove(id, user.id);
    }
}
