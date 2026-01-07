import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Property, PropertyStatus, Prisma } from '@prisma/client';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyQueryDto } from './dto/property-query.dto';

@Injectable()
export class PropertiesService {
    constructor(private prisma: PrismaService) { }

    async create(createPropertyDto: CreatePropertyDto, ownerId: string): Promise<Property> {
        const { featureIds, ...propertyData } = createPropertyDto;

        // Verify location exists
        const location = await this.prisma.location.findUnique({
            where: { id: createPropertyDto.locationId }
        });

        if (!location) {
            throw new BadRequestException('Invalid location ID');
        }

        // Create property
        const propertyCreateData: any = {
            ...propertyData,
            ownerId
        };

        const property = await this.prisma.property.create({
            data: propertyCreateData,
            include: {
                location: true,
                features: {
                    include: {
                        feature: true
                    }
                },
                images: true,
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        // Add features if provided
        if (featureIds && featureIds.length > 0) {
            await this.prisma.propertyFeature.createMany({
                data: featureIds.map(featureId => ({
                    propertyId: property.id,
                    featureId
                }))
            });

            // Refetch property with features
            return this.prisma.property.findUnique({
                where: { id: property.id },
                include: {
                    location: true,
                    features: {
                        include: {
                            feature: true
                        }
                    },
                    images: true,
                    owner: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            });
        }

        return property;
    }

    async findAll(query: PropertyQueryDto) {
        const {
            search,
            minPrice,
            maxPrice,
            minRooms,
            maxRooms,
            minArea,
            maxArea,
            minPricePerSqm,
            maxPricePerSqm,
            minBuildYear,
            maxBuildYear,
            minBathrooms,
            maxBathrooms,
            minFloor,
            maxFloor,
            hasBalcony,
            hasParking,
            isFurnished,
            category,
            status = PropertyStatus.PUBLISHED,
            locationId,
            cityId,
            districtId,
            neighborhoodId,
            featureIds,
            featureLogic = 'OR',
            latitude,
            longitude,
            radius,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = query;

        const skip = (page - 1) * limit;

        // Build where clause with advanced filtering
        const where: Prisma.PropertyWhereInput = {
            status,
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { address: { contains: search, mode: 'insensitive' } }
                ]
            }),
            ...(minPrice && { price: { gte: minPrice } }),
            ...(maxPrice && { price: { lte: maxPrice } }),
            ...(category && { category }),
            ...(locationId && { locationId }),

            // Room and area filters
            ...(minRooms && { details: { path: ['rooms'], gte: minRooms } }),
            ...(maxRooms && { details: { path: ['rooms'], lte: maxRooms } }),
            ...(minArea && { details: { path: ['area'], gte: minArea } }),
            ...(maxArea && { details: { path: ['area'], lte: maxArea } }),

            // Build year filters
            ...(minBuildYear && { details: { path: ['buildYear'], gte: minBuildYear } }),
            ...(maxBuildYear && { details: { path: ['buildYear'], lte: maxBuildYear } }),

            // Bathroom filters
            ...(minBathrooms && { details: { path: ['bathrooms'], gte: minBathrooms } }),
            ...(maxBathrooms && { details: { path: ['bathrooms'], lte: maxBathrooms } }),

            // Floor filters
            ...(minFloor && { details: { path: ['floor'], gte: minFloor } }),
            ...(maxFloor && { details: { path: ['floor'], lte: maxFloor } }),

            // Boolean feature filters
            ...(hasBalcony !== undefined && { details: { path: ['balcony'], equals: hasBalcony } }),
            ...(hasParking !== undefined && { details: { path: ['parking'], equals: hasParking } }),
            ...(isFurnished !== undefined && { details: { path: ['furnished'], equals: isFurnished } })
        };

        // Location hierarchy filtering
        if (cityId || districtId || neighborhoodId) {
            const locationFilter: any = {};

            if (neighborhoodId) {
                // If neighborhood is specified, use it directly
                locationFilter.locationId = neighborhoodId;
            } else if (districtId) {
                // If district is specified, find all neighborhoods in that district
                locationFilter.location = {
                    OR: [
                        { id: districtId },
                        { parentId: districtId }
                    ]
                };
            } else if (cityId) {
                // If city is specified, find all districts and neighborhoods in that city
                locationFilter.location = {
                    OR: [
                        { id: cityId },
                        { parentId: cityId },
                        { parent: { parentId: cityId } }
                    ]
                };
            }

            Object.assign(where, locationFilter);
        }

        // Feature filtering with AND/OR logic
        if (featureIds && featureIds.length > 0) {
            if (featureLogic === 'AND') {
                // All features must be present
                where.AND = featureIds.map(featureId => ({
                    features: {
                        some: {
                            featureId
                        }
                    }
                }));
            } else {
                // Any feature can be present (OR logic)
                where.features = {
                    some: {
                        featureId: { in: featureIds }
                    }
                };
            }
        }

        // Handle geographic search
        if (latitude && longitude && radius) {
            // For now, we'll use a simple bounding box approach
            // In production, you'd want to use PostGIS ST_DWithin
            const latDelta = radius / 111; // Rough conversion: 1 degree ≈ 111 km
            const lngDelta = radius / (111 * Math.cos(latitude * Math.PI / 180));

            where.latitude = {
                gte: latitude - latDelta,
                lte: latitude + latDelta
            };
            where.longitude = {
                gte: longitude - lngDelta,
                lte: longitude + lngDelta
            };
        }

        // Build order by with enhanced sorting
        const orderBy: Prisma.PropertyOrderByWithRelationInput[] = [];

        if (sortBy === 'price') {
            orderBy.push({ price: sortOrder });
        } else if (sortBy === 'title') {
            orderBy.push({ title: sortOrder });
        } else if (sortBy === 'updatedAt') {
            orderBy.push({ updatedAt: sortOrder });
        } else if (sortBy === 'area') {
            // For JSON field sorting, we need to use raw query or handle differently
            orderBy.push({ createdAt: sortOrder }); // Fallback to createdAt
        } else if (sortBy === 'rooms') {
            // For JSON field sorting, we need to use raw query or handle differently  
            orderBy.push({ createdAt: sortOrder }); // Fallback to createdAt
        } else if (sortBy === 'buildYear') {
            // For JSON field sorting, we need to use raw query or handle differently
            orderBy.push({ createdAt: sortOrder }); // Fallback to createdAt
        } else {
            orderBy.push({ createdAt: sortOrder });
        }

        // Add secondary sort by createdAt for consistent ordering
        if (sortBy !== 'createdAt') {
            orderBy.push({ createdAt: 'desc' });
        }

        const [properties, total] = await Promise.all([
            this.prisma.property.findMany({
                where,
                include: {
                    location: {
                        include: {
                            parent: {
                                include: {
                                    parent: true
                                }
                            }
                        }
                    },
                    features: {
                        include: {
                            feature: true
                        }
                    },
                    images: {
                        orderBy: { order: 'asc' },
                        take: 1 // Only get the first image for listing
                    },
                    owner: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                orderBy,
                skip,
                take: limit
            }),
            this.prisma.property.count({ where })
        ]);

        // Calculate price per square meter for properties and apply filters if needed
        let filteredProperties = properties;

        if (minPricePerSqm || maxPricePerSqm) {
            filteredProperties = properties.filter(property => {
                const area = property.details?.['area'] as number;
                if (!area || area <= 0) return false;

                const pricePerSqm = Number(property.price) / area;

                if (minPricePerSqm && pricePerSqm < minPricePerSqm) return false;
                if (maxPricePerSqm && pricePerSqm > maxPricePerSqm) return false;

                return true;
            });
        }

        // Add calculated fields to properties
        const enrichedProperties = filteredProperties.map(property => {
            const area = property.details?.['area'] as number;
            const pricePerSqm = area && area > 0 ? Number(property.price) / area : null;

            return {
                ...property,
                calculatedFields: {
                    pricePerSqm: pricePerSqm ? Math.round(pricePerSqm) : null
                }
            };
        });

        return {
            properties: enrichedProperties,
            pagination: {
                page,
                limit,
                total: minPricePerSqm || maxPricePerSqm ? filteredProperties.length : total,
                totalPages: Math.ceil((minPricePerSqm || maxPricePerSqm ? filteredProperties.length : total) / limit)
            },
            filters: {
                appliedFilters: this.getAppliedFilters(query),
                availableFilters: await this.getAvailableFilters(where)
            }
        };
    }

    async findOne(id: string): Promise<Property> {
        const property = await this.prisma.property.findUnique({
            where: { id },
            include: {
                location: {
                    include: {
                        parent: {
                            include: {
                                parent: true
                            }
                        }
                    }
                },
                features: {
                    include: {
                        feature: true
                    }
                },
                images: {
                    orderBy: { order: 'asc' }
                },
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        if (!property) {
            throw new NotFoundException('Property not found');
        }

        return property;
    }

    async update(id: string, updatePropertyDto: UpdatePropertyDto, userId: string): Promise<Property> {
        const property = await this.prisma.property.findUnique({
            where: { id },
            select: { ownerId: true, publishedAt: true }
        });

        if (!property) {
            throw new NotFoundException('Property not found');
        }

        if (property.ownerId !== userId) {
            throw new ForbiddenException('You can only update your own properties');
        }

        const { featureIds, ...propertyData } = updatePropertyDto;

        // Handle status change to published
        if (updatePropertyDto.status === PropertyStatus.PUBLISHED && !property.publishedAt) {
            (propertyData as any).publishedAt = new Date();
        }

        const updatedProperty = await this.prisma.property.update({
            where: { id },
            data: propertyData,
            include: {
                location: true,
                features: {
                    include: {
                        feature: true
                    }
                },
                images: true,
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        // Update features if provided
        if (featureIds !== undefined) {
            // Delete existing features
            await this.prisma.propertyFeature.deleteMany({
                where: { propertyId: id }
            });

            // Add new features
            if (featureIds.length > 0) {
                await this.prisma.propertyFeature.createMany({
                    data: featureIds.map(featureId => ({
                        propertyId: id,
                        featureId
                    }))
                });
            }

            // Refetch property with updated features
            return this.prisma.property.findUnique({
                where: { id },
                include: {
                    location: true,
                    features: {
                        include: {
                            feature: true
                        }
                    },
                    images: true,
                    owner: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            });
        }

        return updatedProperty;
    }

    async remove(id: string, userId: string): Promise<void> {
        const property = await this.prisma.property.findUnique({
            where: { id },
            select: { ownerId: true }
        });

        if (!property) {
            throw new NotFoundException('Property not found');
        }

        if (property.ownerId !== userId) {
            throw new ForbiddenException('You can only delete your own properties');
        }

        await this.prisma.property.delete({
            where: { id }
        });
    }

    async findByOwner(ownerId: string, query: PropertyQueryDto) {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', status } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.PropertyWhereInput = {
            ownerId,
            ...(status && { status })
        };

        const orderBy: Prisma.PropertyOrderByWithRelationInput = {};
        if (sortBy === 'price') {
            orderBy.price = sortOrder;
        } else if (sortBy === 'title') {
            orderBy.title = sortOrder;
        } else if (sortBy === 'updatedAt') {
            orderBy.updatedAt = sortOrder;
        } else {
            orderBy.createdAt = sortOrder;
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
                    }
                },
                orderBy,
                skip,
                take: limit
            }),
            this.prisma.property.count({ where })
        ]);

        return {
            properties,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async updateStatus(id: string, status: PropertyStatus, userId: string): Promise<Property> {
        const property = await this.prisma.property.findUnique({
            where: { id },
            select: { ownerId: true }
        });

        if (!property) {
            throw new NotFoundException('Property not found');
        }

        if (property.ownerId !== userId) {
            throw new ForbiddenException('You can only update your own properties');
        }

        const updateData: any = { status };

        // Set publishedAt when publishing for the first time
        if (status === PropertyStatus.PUBLISHED) {
            updateData.publishedAt = new Date();
        }

        return this.prisma.property.update({
            where: { id },
            data: updateData,
            include: {
                location: true,
                features: {
                    include: {
                        feature: true
                    }
                },
                images: true
            }
        });
    }

    async addFeaturesToProperty(
        propertyId: string,
        featureIds: string[],
        userId: string
    ): Promise<Property> {
        // Verify property ownership
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
            select: { ownerId: true }
        });

        if (!property) {
            throw new NotFoundException('Property not found');
        }

        if (property.ownerId !== userId) {
            throw new ForbiddenException('You can only manage features for your own properties');
        }

        // Verify all features exist
        const features = await this.prisma.feature.findMany({
            where: { id: { in: featureIds } }
        });

        if (features.length !== featureIds.length) {
            throw new BadRequestException('One or more features not found');
        }

        // Remove existing features and add new ones
        await this.prisma.propertyFeature.deleteMany({
            where: { propertyId }
        });

        if (featureIds.length > 0) {
            await this.prisma.propertyFeature.createMany({
                data: featureIds.map(featureId => ({
                    propertyId,
                    featureId
                }))
            });
        }

        // Return updated property with features
        return this.prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                location: true,
                features: {
                    include: {
                        feature: true
                    }
                },
                images: true,
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
    }

    async removeFeatureFromProperty(
        propertyId: string,
        featureId: string,
        userId: string
    ): Promise<Property> {
        // Verify property ownership
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
            select: { ownerId: true }
        });

        if (!property) {
            throw new NotFoundException('Property not found');
        }

        if (property.ownerId !== userId) {
            throw new ForbiddenException('You can only manage features for your own properties');
        }

        // Remove the specific feature
        await this.prisma.propertyFeature.deleteMany({
            where: {
                propertyId,
                featureId
            }
        });

        // Return updated property
        return this.prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                location: true,
                features: {
                    include: {
                        feature: true
                    }
                },
                images: true,
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
    }

    async getPropertiesByFeatures(featureIds: string[], query: PropertyQueryDto) {
        const {
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            status = PropertyStatus.PUBLISHED
        } = query;

        const skip = (page - 1) * limit;

        // Build where clause for properties that have ALL specified features
        const where: Prisma.PropertyWhereInput = {
            status,
            features: {
                some: {
                    featureId: { in: featureIds }
                }
            }
        };

        // If multiple features are specified, ensure property has ALL of them
        if (featureIds.length > 1) {
            where.AND = featureIds.map(featureId => ({
                features: {
                    some: { featureId }
                }
            }));
        }

        const orderBy: Prisma.PropertyOrderByWithRelationInput = {};
        if (sortBy === 'price') {
            orderBy.price = sortOrder;
        } else if (sortBy === 'title') {
            orderBy.title = sortOrder;
        } else if (sortBy === 'updatedAt') {
            orderBy.updatedAt = sortOrder;
        } else {
            orderBy.createdAt = sortOrder;
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
                orderBy,
                skip,
                take: limit
            }),
            this.prisma.property.count({ where })
        ]);

        return {
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
     * Get applied filters summary
     */
    private getAppliedFilters(query: PropertyQueryDto) {
        const applied = [];

        if (query.search) applied.push({ type: 'search', value: query.search });
        if (query.minPrice || query.maxPrice) {
            applied.push({
                type: 'price',
                value: `${query.minPrice || 0} - ${query.maxPrice || '∞'}`
            });
        }
        if (query.minRooms || query.maxRooms) {
            applied.push({
                type: 'rooms',
                value: `${query.minRooms || 0} - ${query.maxRooms || '∞'}`
            });
        }
        if (query.minArea || query.maxArea) {
            applied.push({
                type: 'area',
                value: `${query.minArea || 0} - ${query.maxArea || '∞'} m²`
            });
        }
        if (query.category) applied.push({ type: 'category', value: query.category });
        if (query.hasBalcony !== undefined) applied.push({ type: 'balcony', value: query.hasBalcony });
        if (query.hasParking !== undefined) applied.push({ type: 'parking', value: query.hasParking });
        if (query.isFurnished !== undefined) applied.push({ type: 'furnished', value: query.isFurnished });
        if (query.featureIds?.length) applied.push({ type: 'features', value: query.featureIds.length });

        return applied;
    }

    /**
     * Get available filter options based on current results
     */
    private async getAvailableFilters(where: Prisma.PropertyWhereInput) {
        // Get price range
        const priceStats = await this.prisma.property.aggregate({
            where,
            _min: { price: true },
            _max: { price: true }
        });

        // Get available categories
        const categories = await this.prisma.property.groupBy({
            by: ['category'],
            where,
            _count: { category: true }
        });

        // Get available locations
        const locations = await this.prisma.property.findMany({
            where,
            select: {
                location: {
                    include: {
                        parent: {
                            include: {
                                parent: true
                            }
                        }
                    }
                }
            },
            distinct: ['locationId']
        });

        return {
            priceRange: {
                min: priceStats._min.price ? Number(priceStats._min.price) : 0,
                max: priceStats._max.price ? Number(priceStats._max.price) : 0
            },
            categories: categories.map(c => ({
                category: c.category,
                count: c._count.category
            })),
            locations: locations.map(l => l.location)
        };
    }

    /**
     * Advanced search with suggestions
     */
    async searchWithSuggestions(query: PropertyQueryDto) {
        const results = await this.findAll(query);

        // If no results, provide suggestions
        if (results.properties.length === 0) {
            const suggestions = await this.generateSearchSuggestions(query);
            return {
                ...results,
                suggestions
            };
        }

        return results;
    }

    /**
     * Generate search suggestions when no results found
     */
    private async generateSearchSuggestions(query: PropertyQueryDto) {
        const suggestions = [];

        // Suggest relaxing price range
        if (query.minPrice || query.maxPrice) {
            const relaxedPriceQuery = { ...query };
            if (query.minPrice) relaxedPriceQuery.minPrice = Math.floor(query.minPrice * 0.8);
            if (query.maxPrice) relaxedPriceQuery.maxPrice = Math.ceil(query.maxPrice * 1.2);

            const relaxedResults = await this.findAll(relaxedPriceQuery);
            if (relaxedResults.properties.length > 0) {
                suggestions.push({
                    type: 'price_range',
                    message: 'Fiyat aralığını genişletmeyi deneyin',
                    query: relaxedPriceQuery,
                    resultCount: relaxedResults.pagination.total
                });
            }
        }

        // Suggest nearby locations
        if (query.locationId) {
            const nearbyQuery = { ...query };
            delete nearbyQuery.locationId;

            // Get parent location
            const location = await this.prisma.location.findUnique({
                where: { id: query.locationId },
                include: { parent: true }
            });

            if (location?.parent) {
                nearbyQuery.locationId = location.parent.id;
                const nearbyResults = await this.findAll(nearbyQuery);

                if (nearbyResults.properties.length > 0) {
                    suggestions.push({
                        type: 'location',
                        message: `${location.parent.name} bölgesindeki diğer emlakları inceleyin`,
                        query: nearbyQuery,
                        resultCount: nearbyResults.pagination.total
                    });
                }
            }
        }

        return suggestions;
    }

    /**
     * Get owner property statistics
     */
    async getOwnerStats(ownerId: string) {
        const [totalProperties, publishedProperties, draftProperties, inactiveProperties] = await Promise.all([
            this.prisma.property.count({ where: { ownerId } }),
            this.prisma.property.count({ where: { ownerId, status: PropertyStatus.PUBLISHED } }),
            this.prisma.property.count({ where: { ownerId, status: PropertyStatus.DRAFT } }),
            this.prisma.property.count({ where: { ownerId, status: PropertyStatus.INACTIVE } })
        ]);

        return {
            total: totalProperties,
            published: publishedProperties,
            draft: draftProperties,
            inactive: inactiveProperties
        };
    }
}