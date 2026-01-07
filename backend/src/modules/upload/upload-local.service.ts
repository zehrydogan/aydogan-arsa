import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { PropertyImage } from '@prisma/client';

@Injectable()
export class UploadLocalService {
    private readonly uploadDir = path.join(process.cwd(), 'uploads', 'properties');

    constructor(private prisma: PrismaService) {
        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async uploadPropertyImage(
        file: Express.Multer.File,
        propertyId: string,
        alt?: string
    ): Promise<PropertyImage> {
        try {
            // Validate file type
            if (!file.mimetype.startsWith('image/')) {
                throw new BadRequestException('File must be an image');
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                throw new BadRequestException('File size must be less than 10MB');
            }

            // Verify property exists
            const property = await this.prisma.property.findUnique({
                where: { id: propertyId },
                select: { id: true, ownerId: true }
            });

            if (!property) {
                throw new BadRequestException('Property not found');
            }

            // Create property-specific directory
            const propertyDir = path.join(this.uploadDir, propertyId);
            if (!fs.existsSync(propertyDir)) {
                fs.mkdirSync(propertyDir, { recursive: true });
            }

            // Generate unique filename
            const timestamp = Date.now();
            const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.jpg`;
            const filepath = path.join(propertyDir, filename);

            // Optimize image with Sharp
            await sharp(file.buffer)
                .resize(1920, 1080, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({
                    quality: 85,
                    progressive: true
                })
                .toFile(filepath);

            // Get next order number
            const lastImage = await this.prisma.propertyImage.findFirst({
                where: { propertyId },
                orderBy: { order: 'desc' }
            });

            const nextOrder = lastImage ? lastImage.order + 1 : 0;

            // Generate URL (relative to server)
            const url = `/uploads/properties/${propertyId}/${filename}`;

            // Save to database
            const propertyImage = await this.prisma.propertyImage.create({
                data: {
                    propertyId,
                    url,
                    publicId: filename, // Use filename as publicId for local storage
                    alt: alt || `Property image ${nextOrder + 1}`,
                    order: nextOrder
                }
            });

            return propertyImage;

        } catch (error) {
            console.error('Image upload error:', error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to upload image');
        }
    }

    async uploadMultiplePropertyImages(
        files: Express.Multer.File[],
        propertyId: string
    ): Promise<PropertyImage[]> {
        const uploadPromises = files.map((file, index) =>
            this.uploadPropertyImage(file, propertyId, `Property image ${index + 1}`)
        );

        return Promise.all(uploadPromises);
    }

    async deletePropertyImage(imageId: string, userId: string): Promise<void> {
        // Get image with property owner info
        const image = await this.prisma.propertyImage.findUnique({
            where: { id: imageId },
            include: {
                property: {
                    select: { ownerId: true }
                }
            }
        });

        if (!image) {
            throw new BadRequestException('Image not found');
        }

        if (image.property.ownerId !== userId) {
            throw new BadRequestException('You can only delete images from your own properties');
        }

        try {
            // Delete file from local storage
            const filepath = path.join(process.cwd(), 'uploads', 'properties', image.propertyId, image.publicId);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }

            // Delete from database
            await this.prisma.propertyImage.delete({
                where: { id: imageId }
            });

        } catch (error) {
            console.error('Image deletion error:', error);
            throw new InternalServerErrorException('Failed to delete image');
        }
    }

    async reorderPropertyImages(
        propertyId: string,
        imageOrders: { id: string; order: number }[],
        userId: string
    ): Promise<PropertyImage[]> {
        // Verify property ownership
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
            select: { ownerId: true }
        });

        if (!property) {
            throw new BadRequestException('Property not found');
        }

        if (property.ownerId !== userId) {
            throw new BadRequestException('You can only reorder images from your own properties');
        }

        // Update image orders
        const updatePromises = imageOrders.map(({ id, order }) =>
            this.prisma.propertyImage.update({
                where: { id },
                data: { order }
            })
        );

        await Promise.all(updatePromises);

        // Return updated images
        return this.prisma.propertyImage.findMany({
            where: { propertyId },
            orderBy: { order: 'asc' }
        });
    }

    async getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
        return this.prisma.propertyImage.findMany({
            where: { propertyId },
            orderBy: { order: 'asc' }
        });
    }

    // For local storage, we'll just return the original URL
    getResponsiveImageUrl(url: string, width: number, height?: number): string {
        return url; // In production, you'd implement image resizing
    }

    getThumbnailUrl(url: string): string {
        return url;
    }

    getMediumUrl(url: string): string {
        return url;
    }

    getLargeUrl(url: string): string {
        return url;
    }
}