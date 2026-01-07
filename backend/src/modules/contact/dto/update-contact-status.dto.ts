import { IsEnum, IsOptional, IsBoolean } from 'class-validator';

export enum ContactStatus {
    PENDING = 'PENDING',
    RESPONDED = 'RESPONDED',
    CLOSED = 'CLOSED'
}

export class UpdateContactStatusDto {
    @IsOptional()
    @IsEnum(ContactStatus, { message: 'Geçerli bir durum seçiniz' })
    status?: ContactStatus;

    @IsOptional()
    @IsBoolean()
    isRead?: boolean;
}