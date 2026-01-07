import { IsOptional, IsString, IsNumber, IsEnum, IsArray, Min, Max, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PropertyCategory, PropertyStatus } from '@prisma/client';

export class PropertyQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    minRooms?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    maxRooms?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    minArea?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    maxArea?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPricePerSqm?: number; // Minimum price per square meter

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPricePerSqm?: number; // Maximum price per square meter

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1900)
    @Max(2030)
    minBuildYear?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1900)
    @Max(2030)
    maxBuildYear?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    minBathrooms?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    maxBathrooms?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    minFloor?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    maxFloor?: number;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    hasBalcony?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    hasParking?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isFurnished?: boolean;

    @IsOptional()
    @IsEnum(PropertyCategory)
    category?: PropertyCategory;

    @IsOptional()
    @IsEnum(PropertyStatus)
    status?: PropertyStatus;

    @IsOptional()
    @IsString()
    locationId?: string;

    // Location hierarchy filtering
    @IsOptional()
    @IsString()
    cityId?: string; // Filter by city

    @IsOptional()
    @IsString()
    districtId?: string; // Filter by district

    @IsOptional()
    @IsString()
    neighborhoodId?: string; // Filter by neighborhood

    @IsOptional()
    @IsArray()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    featureIds?: string[];

    @IsOptional()
    @IsString()
    featureLogic?: 'AND' | 'OR' = 'OR'; // How to combine multiple features

    // Geographic search
    @IsOptional()
    @Type(() => Number)
    @Min(-90)
    @Max(90)
    latitude?: number;

    @IsOptional()
    @Type(() => Number)
    @Min(-180)
    @Max(180)
    longitude?: number;

    @IsOptional()
    @Type(() => Number)
    @Min(0.1)
    @Max(100)
    radius?: number; // in kilometers

    // Pagination
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    limit?: number = 20;

    // Enhanced sorting options
    @IsOptional()
    @IsString()
    sortBy?: 'price' | 'createdAt' | 'updatedAt' | 'title' | 'pricePerSqm' | 'area' | 'rooms' | 'buildYear' = 'createdAt';

    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc' = 'desc';
}