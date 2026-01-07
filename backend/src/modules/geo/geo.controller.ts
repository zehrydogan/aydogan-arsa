import { Controller, Get, Query, BadRequestException, ParseIntPipe, ParseFloatPipe } from '@nestjs/common';
import { GeoService, NearbySearchParams, BoundingBoxParams } from './geo.service';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

class NearbySearchDto implements NearbySearchParams {
    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0.1)
    @Max(100)
    radius: number;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 50;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(0)
    offset?: number = 0;
}

class BoundingBoxDto implements BoundingBoxParams {
    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    neLat: number;

    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    neLng: number;

    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    swLat: number;

    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    swLng: number;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(200)
    limit?: number = 100;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(0)
    offset?: number = 0;

    get northEast() {
        return { lat: this.neLat, lng: this.neLng };
    }

    get southWest() {
        return { lat: this.swLat, lng: this.swLng };
    }
}

@Controller('geo')
export class GeoController {
    constructor(private readonly geoService: GeoService) { }

    @Get('nearby')
    async findNearbyProperties(@Query() query: NearbySearchDto) {
        const result = await this.geoService.findPropertiesNearby(query);

        return {
            message: `Found ${result.total} properties within ${query.radius}km`,
            ...result
        };
    }

    @Get('bounds')
    async findPropertiesInBounds(
        @Query('neLat') neLat: string,
        @Query('neLng') neLng: string,
        @Query('swLat') swLat: string,
        @Query('swLng') swLng: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string
    ) {
        const query = {
            northEast: { lat: parseFloat(neLat), lng: parseFloat(neLng) },
            southWest: { lat: parseFloat(swLat), lng: parseFloat(swLng) },
            limit: limit ? parseInt(limit) : 100,
            offset: offset ? parseInt(offset) : 0
        };

        // Validate coordinates
        if (isNaN(query.northEast.lat) || isNaN(query.northEast.lng) ||
            isNaN(query.southWest.lat) || isNaN(query.southWest.lng)) {
            throw new BadRequestException('Invalid coordinates provided');
        }

        const result = await this.geoService.findPropertiesInBounds(query);

        return {
            message: `Found ${result.total} properties in the specified area`,
            ...result
        };
    }

    @Get('clusters')
    async getPropertyClusters(
        @Query('neLat') neLat: string,
        @Query('neLng') neLng: string,
        @Query('swLat') swLat: string,
        @Query('swLng') swLng: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
        @Query('zoom') zoom?: string
    ) {
        const query = {
            northEast: { lat: parseFloat(neLat), lng: parseFloat(neLng) },
            southWest: { lat: parseFloat(swLat), lng: parseFloat(swLng) },
            limit: limit ? parseInt(limit) : 100,
            offset: offset ? parseInt(offset) : 0
        };

        // Validate coordinates
        if (isNaN(query.northEast.lat) || isNaN(query.northEast.lng) ||
            isNaN(query.southWest.lat) || isNaN(query.southWest.lng)) {
            throw new BadRequestException('Invalid coordinates provided');
        }

        const clusters = await this.geoService.getPropertyClusters({
            ...query,
            zoom: zoom ? parseInt(zoom) : 10
        });

        return {
            message: `Found ${clusters.length} property clusters`,
            clusters
        };
    }

    @Get('distance')
    async calculateDistance(
        @Query('lat1') lat1: number,
        @Query('lng1') lng1: number,
        @Query('lat2') lat2: number,
        @Query('lng2') lng2: number
    ) {
        if (!lat1 || !lng1 || !lat2 || !lng2) {
            throw new BadRequestException('All coordinates (lat1, lng1, lat2, lng2) are required');
        }

        const distance = await this.geoService.calculateDistance(
            { latitude: Number(lat1), longitude: Number(lng1) },
            { latitude: Number(lat2), longitude: Number(lng2) }
        );

        return {
            distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
            unit: 'kilometers'
        };
    }

    @Get('route')
    async findPropertiesAlongRoute(
        @Query('waypoints') waypointsStr: string,
        @Query('buffer') buffer: number = 2
    ) {
        if (!waypointsStr) {
            throw new BadRequestException('Waypoints parameter is required');
        }

        try {
            // Parse waypoints from string format: "lat1,lng1;lat2,lng2;..."
            const waypoints = waypointsStr.split(';').map(point => {
                const [lat, lng] = point.split(',').map(Number);
                if (isNaN(lat) || isNaN(lng)) {
                    throw new Error('Invalid coordinate format');
                }
                return { latitude: lat, longitude: lng };
            });

            const properties = await this.geoService.findPropertiesAlongRoute(
                waypoints,
                Number(buffer)
            );

            return {
                message: `Found ${properties.length} properties along the route`,
                properties,
                waypoints,
                buffer: Number(buffer)
            };
        } catch (error) {
            throw new BadRequestException(
                'Invalid waypoints format. Use: "lat1,lng1;lat2,lng2;..." format'
            );
        }
    }

    @Get('stats')
    async getGeoStatistics() {
        const stats = await this.geoService.getGeoStatistics();

        return {
            message: 'Geographic statistics for all published properties',
            ...stats
        };
    }
}