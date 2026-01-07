import {
    Controller,
    Post,
    Delete,
    Patch,
    Get,
    Param,
    Body,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    BadRequestException,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadLocalService } from './upload-local.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from '@prisma/client';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadLocalService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Post('property/:propertyId/image')
    @UseInterceptors(FileInterceptor('image'))
    async uploadPropertyImage(
        @Param('propertyId') propertyId: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
                    new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ })
                ]
            })
        ) file: Express.Multer.File,
        @Body('alt') alt?: string,
        @CurrentUser() user?: User
    ) {
        const image = await this.uploadService.uploadPropertyImage(file, propertyId, alt);

        return {
            message: 'Image uploaded successfully',
            image: {
                ...image,
                thumbnailUrl: this.uploadService.getThumbnailUrl(image.url),
                mediumUrl: this.uploadService.getMediumUrl(image.url),
                largeUrl: this.uploadService.getLargeUrl(image.url)
            }
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Post('property/:propertyId/images')
    @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images at once
    async uploadMultiplePropertyImages(
        @Param('propertyId') propertyId: string,
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB per file
                    new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ })
                ]
            })
        ) files: Express.Multer.File[],
        @CurrentUser() user: User
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files provided');
        }

        const images = await this.uploadService.uploadMultiplePropertyImages(files, propertyId);

        return {
            message: `${images.length} images uploaded successfully`,
            images: images.map(image => ({
                ...image,
                thumbnailUrl: this.uploadService.getThumbnailUrl(image.url),
                mediumUrl: this.uploadService.getMediumUrl(image.url),
                largeUrl: this.uploadService.getLargeUrl(image.url)
            }))
        };
    }

    @Get('property/:propertyId/images')
    async getPropertyImages(@Param('propertyId') propertyId: string) {
        const images = await this.uploadService.getPropertyImages(propertyId);

        return {
            images: images.map(image => ({
                ...image,
                thumbnailUrl: this.uploadService.getThumbnailUrl(image.url),
                mediumUrl: this.uploadService.getMediumUrl(image.url),
                largeUrl: this.uploadService.getLargeUrl(image.url)
            }))
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Delete('image/:imageId')
    async deletePropertyImage(
        @Param('imageId') imageId: string,
        @CurrentUser() user: User
    ) {
        await this.uploadService.deletePropertyImage(imageId, user.id);

        return {
            message: 'Image deleted successfully'
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Patch('property/:propertyId/images/reorder')
    async reorderPropertyImages(
        @Param('propertyId') propertyId: string,
        @Body('imageOrders') imageOrders: { id: string; order: number }[],
        @CurrentUser() user: User
    ) {
        if (!imageOrders || !Array.isArray(imageOrders)) {
            throw new BadRequestException('Invalid image orders data');
        }

        const images = await this.uploadService.reorderPropertyImages(
            propertyId,
            imageOrders,
            user.id
        );

        return {
            message: 'Images reordered successfully',
            images: images.map(image => ({
                ...image,
                thumbnailUrl: this.uploadService.getThumbnailUrl(image.url),
                mediumUrl: this.uploadService.getMediumUrl(image.url),
                largeUrl: this.uploadService.getLargeUrl(image.url)
            }))
        };
    }
}