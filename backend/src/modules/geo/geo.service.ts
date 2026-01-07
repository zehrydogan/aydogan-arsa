import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Property } from '@prisma/client';

export interface NearbySearchParams {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
    limit?: number;
    offset?: number;
}

export interface BoundingBoxParams {
    northEast: { lat: number; lng: number };
    southWest: { lat: number; lng: number };
    limit?: number;
    offset?: number;
}

export interface GeoSearchResult {
    properties: (Property & { distance?: number })[];
    total: number;
    center?: { latitude: number; longitude: number };
    bounds?: {
        northEast: { lat: number; lng: number };
        southWest: { lat: number; lng: number };
    };
}

@Injectable()
export class GeoService {
    constructor(private prisma: PrismaService) { }

    /**
     * Find properties within a radius of a given point using PostGIS
     */
    async findPropertiesNearby(params: NearbySearchParams): Promise<GeoSearchResult> {
        const { latitude, longitude, radius, limit = 50, offset = 0 } = params;

        // Validate coordinates
        if (latitude < -90 || latitude > 90) {
            throw new BadRequestException('Latitude must be between -90 and 90');
        }
        if (longitude < -180 || longitude > 180) {
            throw new BadRequestException('Longitude must be between -180 and 180');
        }
        if (radius <= 0 || radius > 100) {
            throw new BadRequestException('Radius must be between 0 and 100 kilometers');
        }

        // Use PostGIS ST_DWithin for efficient geographic search
        // Convert radius from kilometers to meters
        const radiusInMeters = radius * 1000;

        const query = `
            SELECT 
                p.*,
                ST_Distance(
                    ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
                    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                ) / 1000 as distance_km
            FROM properties p
            WHERE 
                p.status = 'PUBLISHED'
                AND ST_DWithin(
                    ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
                    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                    $3
                )
            ORDER BY distance_km ASC
            LIMIT $4 OFFSET $5
        `;

        const countQuery = `
            SELECT COUNT(*) as total
            FROM properties p
            WHERE 
                p.status = 'PUBLISHED'
                AND ST_DWithin(
                    ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
                    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                    $3
                )
        `;

        const [properties, countResult] = await Promise.all([
            this.prisma.$queryRawUnsafe(query, longitude, latitude, radiusInMeters, limit, offset),
            this.prisma.$queryRawUnsafe(countQuery, longitude, latitude, radiusInMeters)
        ]);

        const total = Number((countResult as any)[0].total);

        // Return properties with basic enrichment
        const enrichedProperties = (properties as any[]).map((property: any) => ({
            ...property,
            distance: property.distance_km ? Number(property.distance_km) : undefined
        }));

        return {
            properties: enrichedProperties,
            total,
            center: { latitude, longitude }
        };
    }

    /**
     * Find properties within a bounding box (for map viewport)
     */
    async findPropertiesInBounds(params: BoundingBoxParams): Promise<GeoSearchResult> {
        const { northEast, southWest, limit = 100, offset = 0 } = params;

        // Validate bounding box
        if (northEast.lat <= southWest.lat || northEast.lng <= southWest.lng) {
            throw new BadRequestException('Invalid bounding box coordinates');
        }

        try {
            // Use Prisma query instead of raw SQL for debugging
            const properties = await this.prisma.property.findMany({
                where: {
                    status: 'PUBLISHED',
                    latitude: {
                        gte: southWest.lat,
                        lte: northEast.lat
                    },
                    longitude: {
                        gte: southWest.lng,
                        lte: northEast.lng
                    }
                },
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
                take: limit,
                skip: offset
            });

            const total = await this.prisma.property.count({
                where: {
                    status: 'PUBLISHED',
                    latitude: {
                        gte: southWest.lat,
                        lte: northEast.lat
                    },
                    longitude: {
                        gte: southWest.lng,
                        lte: northEast.lng
                    }
                }
            });

            return {
                properties,
                total,
                bounds: { northEast, southWest }
            };
        } catch (error) {
            console.error('Error in findPropertiesInBounds:', error);
            throw new BadRequestException('Error searching properties in bounds');
        }
    }

    /**
     * Get property clusters for map display (simplified clustering)
     */
    async getPropertyClusters(params: BoundingBoxParams & { zoom: number }) {
        const { northEast, southWest, zoom } = params;

        try {
            // For now, return individual properties as "clusters" for simplicity
            // In a production app, you'd implement proper clustering algorithms
            const properties = await this.prisma.property.findMany({
                where: {
                    status: 'PUBLISHED',
                    latitude: {
                        gte: southWest.lat,
                        lte: northEast.lat
                    },
                    longitude: {
                        gte: southWest.lng,
                        lte: northEast.lng
                    }
                },
                select: {
                    id: true,
                    latitude: true,
                    longitude: true,
                    price: true,
                    title: true
                },
                take: 50 // Limit for performance
            });

            // Convert properties to simple clusters
            const clusters = properties.map(property => ({
                latitude: property.latitude,
                longitude: property.longitude,
                count: 1,
                avgPrice: Number(property.price),
                minPrice: Number(property.price),
                maxPrice: Number(property.price),
                propertyIds: [property.id]
            }));

            return clusters;
        } catch (error) {
            console.error('Error in getPropertyClusters:', error);
            throw new BadRequestException('Error getting property clusters');
        }
    }

    /**
     * Calculate distance between two points using PostGIS
     */
    async calculateDistance(
        point1: { latitude: number; longitude: number },
        point2: { latitude: number; longitude: number }
    ): Promise<number> {
        const query = `
            SELECT ST_Distance(
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
            ) / 1000 as distance_km
        `;

        const result = await this.prisma.$queryRawUnsafe(
            query,
            point1.longitude,
            point1.latitude,
            point2.longitude,
            point2.latitude
        );

        return Number((result as any)[0].distance_km);
    }

    /**
     * Get properties along a route (for future route-based search)
     */
    async findPropertiesAlongRoute(
        waypoints: { latitude: number; longitude: number }[],
        bufferKm: number = 2
    ): Promise<Property[]> {
        if (waypoints.length < 2) {
            throw new BadRequestException('At least 2 waypoints are required');
        }

        try {
            // For simplicity, find properties within buffer distance of any waypoint
            // In production, you'd use PostGIS ST_Buffer with LineString
            const allProperties = [];

            for (const waypoint of waypoints) {
                const properties = await this.prisma.property.findMany({
                    where: {
                        status: 'PUBLISHED'
                    },
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
                });

                // Filter properties within buffer distance (simplified calculation)
                const nearbyProperties = properties.filter(property => {
                    const distance = this.calculateSimpleDistance(
                        waypoint.latitude,
                        waypoint.longitude,
                        property.latitude,
                        property.longitude
                    );
                    return distance <= bufferKm;
                });

                allProperties.push(...nearbyProperties);
            }

            // Remove duplicates
            const uniqueProperties = allProperties.filter((property, index, self) =>
                index === self.findIndex(p => p.id === property.id)
            );

            return uniqueProperties;
        } catch (error) {
            console.error('Error in findPropertiesAlongRoute:', error);
            throw new BadRequestException('Error finding properties along route');
        }
    }

    /**
     * Simple distance calculation (Haversine formula approximation)
     */
    private calculateSimpleDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Get geographic statistics for properties
     */
    async getGeoStatistics() {
        const query = `
            SELECT 
                COUNT(*) as total_properties,
                MIN(latitude) as min_lat,
                MAX(latitude) as max_lat,
                MIN(longitude) as min_lng,
                MAX(longitude) as max_lng,
                AVG(latitude) as center_lat,
                AVG(longitude) as center_lng
            FROM properties 
            WHERE status = 'PUBLISHED'
        `;

        const result = await this.prisma.$queryRawUnsafe(query);
        const stats = (result as any)[0];

        return {
            totalProperties: Number(stats.total_properties),
            bounds: {
                northEast: {
                    lat: Number(stats.max_lat),
                    lng: Number(stats.max_lng)
                },
                southWest: {
                    lat: Number(stats.min_lat),
                    lng: Number(stats.min_lng)
                }
            },
            center: {
                latitude: Number(stats.center_lat),
                longitude: Number(stats.center_lng)
            }
        };
    }
}