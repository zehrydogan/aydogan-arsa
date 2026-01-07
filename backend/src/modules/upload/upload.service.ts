import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';
import * as sharp from 'sharp';
import { PropertyImage } from '@prisma/client';

@Injectable()
export class UploadService {
    constructor(private prisma: PrismaService) {
        // Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
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

            // Verify property exists and get owner
            const property = await this.prisma.property.findUnique({
                where: { id: propertyId },
                select: { id: true, ownerId: true }
            });

            if (!property) {
                throw new BadRequestException('Property not found');
            }

            // Optimize image with Sharp
            const optimizedBuffer = await sharp(file.buffer)
                .resize(1920, 1080, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({
                    quality: 85,
                    progressive: true
                })
                .toBuffer();

            // Upload to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: `real-estate/properties/${propertyId}`,
                        resource_type: 'image',
                        format: 'jpg',
                        transformation: [
                            { width: 1920, height: 1080, crop: 'limit' },
                            { quality: 'auto:good' },
                            { fetch_format: 'auto' }
                        ]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(optimizedBuffer);
            });

            const cloudinaryResult = uploadResult as any;

            // Get next order number
            const lastImage = await this.prisma.propertyImage.findFirst({
                where: { propertyId },
                orderBy: { order: 'desc' }
            });

            const nextOrder = lastImage ? lastImage.order + 1 : 0;

            // Save to database
            const propertyImage = await this.prisma.propertyImage.create({
                data: {
                    propertyId,
                    url: cloudinaryResult.secure_url,
                    publicId: cloudinaryResult.public_id,
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
            // Delete from Cloudinary
            await cloudinary.uploader.destroy(image.publicId);

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

    // Generate different image sizes for responsive display
    getResponsiveImageUrl(url: string, width: number, height?: number): string {
        if (!url.includes('cloudinary.com')) {
            return url; // Return original if not Cloudinary
        }

        const transformation = height
            ? `w_${width},h_${height},c_fill,f_auto,q_auto`
            : `w_${width},c_scale,f_auto,q_auto`;

        return url.replace('/upload/', `/upload/${transformation}/`);
    }

    // Get optimized thumbnail
    getThumbnailUrl(url: string): string {
        return this.getResponsiveImageUrl(url, 300, 200);
    }

    // Get medium size for listings
    getMediumUrl(url: string): string {
        return this.getResponsiveImageUrl(url, 800, 600);
    }

    // Get large size for detail view
    getLargeUrl(url: string): string {
        return this.getResponsiveImageUrl(url, 1200, 800);
    }
}