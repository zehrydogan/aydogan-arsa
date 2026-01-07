import { IsString, IsOptional, IsNumber, IsEnum, IsArray, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyCategory } from '@prisma/client';

export class CreateSavedSearchDto {
    @IsString()
    name: string;

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
    @IsEnum(PropertyCategory)
    category?: PropertyCategory;

    @IsOptional()
    @IsString()
    locationId?: string;

    @IsOptional()
    @IsArray()
    featureIds?: string[];

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
    radius?: number;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    notifyOnNewMatch?: boolean = false;
}
