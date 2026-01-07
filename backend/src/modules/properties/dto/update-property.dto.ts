import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';
import { IsEnum, IsOptional, IsArray } from 'class-validator';
import { PropertyStatus } from '@prisma/client';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
    @IsEnum(PropertyStatus)
    @IsOptional()
    status?: PropertyStatus;

    @IsOptional()
    @IsArray()
    featureIds?: string[];
}