import { IsString, IsOptional, IsPhoneNumber, IsUrl, IsBoolean, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    lastName?: string;

    @IsOptional()
    @IsPhoneNumber('TR')
    phone?: string;

    @IsOptional()
    @IsUrl()
    avatar?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}