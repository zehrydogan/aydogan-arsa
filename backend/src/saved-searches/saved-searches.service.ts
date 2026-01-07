import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SavedSearch } from '@prisma/client';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';

@Injectable()
export class SavedSearchesService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create a new saved search
     */
    async create(userId: string, createDto: CreateSavedSearchDto): Promise<SavedSearch> {
        const { name, notifyOnNewMatch, ...criteria } = createDto;

        return this.prisma.savedSearch.create({
            data: {
                userId,
                name,
                filters: criteria as any,
                isActive: notifyOnNewMatch || false
            }
        });
    }

    /**
     * Get all saved searches for a user
     */
    async findAllByUser(userId: string): Promise<SavedSearch[]> {
        return this.prisma.savedSearch.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get a single saved search
     */
    async findOne(id: string, userId: string): Promise<SavedSearch> {
        const savedSearch = await this.prisma.savedSearch.findUnique({
            where: { id }
        });

        if (!savedSearch) {
            throw new NotFoundException('Saved search not found');
        }

        if (savedSearch.userId !== userId) {
            throw new ForbiddenException('You can only access your own saved searches');
        }

        return savedSearch;
    }

    /**
     * Update a saved search
     */
    async update(
        id: string,
        userId: string,
        updateDto: UpdateSavedSearchDto
    ): Promise<SavedSearch> {
        const savedSearch = await this.findOne(id, userId);

        const { name, notifyOnNewMatch, ...criteria } = updateDto;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (notifyOnNewMatch !== undefined) updateData.isActive = notifyOnNewMatch;
        if (Object.keys(criteria).length > 0) {
            updateData.filters = {
                ...(savedSearch.filters as any),
                ...criteria
            };
        }

        return this.prisma.savedSearch.update({
            where: { id },
            data: updateData
        });
    }

    /**
     * Delete a saved search
     */
    async remove(id: string, userId: string): Promise<void> {
        await this.findOne(id, userId);

        await this.prisma.savedSearch.delete({
            where: { id }
        });
    }

    /**
     * Execute a saved search (get matching properties)
     */
    async executeSearch(id: string, userId: string, page: number = 1, limit: number = 20) {
        const savedSearch = await this.findOne(id, userId);
        const criteria = savedSearch.filters as any;

        const skip = (page - 1) * limit;

        // Build where clause from saved criteria
        const where: any = {
            status: 'PUBLISHED',
            ...(criteria.search && {
                OR: [
                    { title: { contains: criteria.search, mode: 'insensitive' } },
                    { description: { contains: criteria.search, mode: 'insensitive' } },
                    { address: { contains: criteria.search, mode: 'insensitive' } }
                ]
            }),
            ...(criteria.minPrice && { price: { gte: criteria.minPrice } }),
            ...(criteria.maxPrice && { price: { lte: criteria.maxPrice } }),
            ...(criteria.category && { category: criteria.category }),
            ...(criteria.locationId && { locationId: criteria.locationId }),
            ...(criteria.minRooms && { details: { path: ['rooms'], gte: criteria.minRooms } }),
            ...(criteria.maxRooms && { details: { path: ['rooms'], lte: criteria.maxRooms } }),
            ...(criteria.minArea && { details: { path: ['area'], gte: criteria.minArea } }),
            ...(criteria.maxArea && { details: { path: ['area'], lte: criteria.maxArea } })
        };

        // Handle feature filtering
        if (criteria.featureIds && criteria.featureIds.length > 0) {
            where.features = {
                some: {
                    featureId: { in: criteria.featureIds }
                }
            };
        }

        // Handle geographic search
        if (criteria.latitude && criteria.longitude && criteria.radius) {
            const latDelta = criteria.radius / 111;
            const lngDelta = criteria.radius / (111 * Math.cos(criteria.latitude * Math.PI / 180));

            where.latitude = {
                gte: criteria.latitude - latDelta,
                lte: criteria.latitude + latDelta
            };
            where.longitude = {
                gte: criteria.longitude - lngDelta,
                lte: criteria.longitude + lngDelta
            };
        }

        const [properties, total] = await Promise.all([
            this.prisma.property.findMany({
                where,
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
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.property.count({ where })
        ]);

        return {
            savedSearch,
            properties,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get count of matching properties for a saved search
     */
    async getMatchCount(id: string, userId: string): Promise<number> {
        const savedSearch = await this.findOne(id, userId);
        const criteria = savedSearch.filters as any;

        const where: any = {
            status: 'PUBLISHED',
            ...(criteria.minPrice && { price: { gte: criteria.minPrice } }),
            ...(criteria.maxPrice && { price: { lte: criteria.maxPrice } }),
            ...(criteria.category && { category: criteria.category }),
            ...(criteria.locationId && { locationId: criteria.locationId })
        };

        return this.prisma.property.count({ where });
    }

    /**
     * Toggle notification for a saved search
     */
    async toggleNotification(id: string, userId: string): Promise<SavedSearch> {
        const savedSearch = await this.findOne(id, userId);

        return this.prisma.savedSearch.update({
            where: { id },
            data: {
                isActive: !savedSearch.isActive
            }
        });
    }

    /**
     * Get all saved searches with notification enabled
     */
    async findAllWithNotifications(): Promise<SavedSearch[]> {
        return this.prisma.savedSearch.findMany({
            where: { isActive: true },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
    }
}
