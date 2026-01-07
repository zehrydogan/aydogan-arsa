import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    SetMetadata
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
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

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('favorites')
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) { }

    @Post(':propertyId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async addFavorite(
        @Param('propertyId') propertyId: string,
        @CurrentUser() user: User
    ) {
        const favorite = await this.favoritesService.addFavorite(user.id, propertyId);
        return {
            message: 'Property added to favorites',
            favorite
        };
    }

    @Delete(':propertyId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeFavorite(
        @Param('propertyId') propertyId: string,
        @CurrentUser() user: User
    ) {
        await this.favoritesService.removeFavorite(user.id, propertyId);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getUserFavorites(
        @CurrentUser() user: User,
        @Query() query: PaginationDto
    ) {
        const result = await this.favoritesService.getUserFavorites(
            user.id,
            query.page,
            query.limit
        );
        return {
            message: `Found ${result.favorites.length} favorite properties`,
            ...result
        };
    }

    @Get('check/:propertyId')
    @UseGuards(JwtAuthGuard)
    async checkFavorite(
        @Param('propertyId') propertyId: string,
        @CurrentUser() user: User
    ) {
        const isFavorited = await this.favoritesService.isFavorited(user.id, propertyId);
        return {
            propertyId,
            isFavorited
        };
    }

    @Get('ids')
    @UseGuards(JwtAuthGuard)
    async getUserFavoriteIds(@CurrentUser() user: User) {
        const favoriteIds = await this.favoritesService.getUserFavoriteIds(user.id);
        return {
            favoriteIds,
            count: favoriteIds.length
        };
    }

    @Get('property/:propertyId/count')
    @Public()
    async getPropertyFavoriteCount(@Param('propertyId') propertyId: string) {
        const count = await this.favoritesService.getPropertyFavoriteCount(propertyId);
        return {
            propertyId,
            favoriteCount: count
        };
    }
}
