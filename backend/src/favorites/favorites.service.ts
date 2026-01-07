import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Favorite } from '@prisma/client';

@Injectable()
export class FavoritesService {
    constructor(private prisma: PrismaService) { }

    /**
     * Add property to favorites
     */
    async addFavorite(userId: string, propertyId: string): Promise<Favorite> {
        // Check if property exists
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId }
        });

        if (!property) {
            throw new NotFoundException('Property not found');
        }

        // Check if already favorited
        const existingFavorite = await this.prisma.favorite.findUnique({
            where: {
                userId_propertyId: {
                    userId,
                    propertyId
                }
            }
        });

        if (existingFavorite) {
            throw new ConflictException('Property already in favorites');
        }

        // Create favorite
        return this.prisma.favorite.create({
            data: {
                userId,
                propertyId
            },
            include: {
                property: {
                    include: {
                        location: true,
                        images: {
                            orderBy: { order: 'asc' },
                            take: 1
                        },
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Remove property from favorites
     */
    async removeFavorite(userId: string, propertyId: string): Promise<void> {
        const favorite = await this.prisma.favorite.findUnique({
            where: {
                userId_propertyId: {
                    userId,
                    propertyId
                }
            }
        });

        if (!favorite) {
            throw new NotFoundException('Favorite not found');
        }

        await this.prisma.favorite.delete({
            where: {
                userId_propertyId: {
                    userId,
                    propertyId
                }
            }
        });
    }

    /**
     * Get all favorites for a user
     */
    async getUserFavorites(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [favorites, total] = await Promise.all([
            this.prisma.favorite.findMany({
                where: { userId },
                include: {
                    property: {
                        include: {
                            location: true,
                            features: {
                                include: {
                                    feature: true
                                }
                            },
                            images: {
                                orderBy: { order: 'asc' },
                                take: 1
                            },
                            owner: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.favorite.count({ where: { userId } })
        ]);

        return {
            favorites: favorites.map(f => ({
                ...f.property,
                favoritedAt: f.createdAt
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Check if property is favorited by user
     */
    async isFavorited(userId: string, propertyId: string): Promise<boolean> {
        const favorite = await this.prisma.favorite.findUnique({
            where: {
                userId_propertyId: {
                    userId,
                    propertyId
                }
            }
        });

        return !!favorite;
    }

    /**
     * Get favorite count for a property
     */
    async getPropertyFavoriteCount(propertyId: string): Promise<number> {
        return this.prisma.favorite.count({
            where: { propertyId }
        });
    }

    /**
     * Get user's favorite property IDs (for quick lookup)
     */
    async getUserFavoriteIds(userId: string): Promise<string[]> {
        const favorites = await this.prisma.favorite.findMany({
            where: { userId },
            select: { propertyId: true }
        });

        return favorites.map(f => f.propertyId);
    }

    /**
     * Remove all favorites for a property (when property is deleted)
     */
    async removePropertyFavorites(propertyId: string): Promise<void> {
        await this.prisma.favorite.deleteMany({
            where: { propertyId }
        });
    }
}
