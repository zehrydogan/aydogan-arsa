import { IsString, IsEmail, IsOptional, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateContactRequestDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(5, { message: 'Konu en az 5 karakter olmalıdır' })
    @MaxLength(100, { message: 'Konu en fazla 100 karakter olabilir' })
    subject: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(10, { message: 'Mesaj en az 10 karakter olmalıdır' })
    @MaxLength(1000, { message: 'Mesaj en fazla 1000 karakter olabilir' })
    message: string;

    @IsString()
    @IsNotEmpty()
    propertyId: string;

    // Guest contact fields (for non-registered users)
    @IsOptional()
    @IsString()
    @MaxLength(50, { message: 'İsim en fazla 50 karakter olabilir' })
    guestName?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
    guestEmail?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20, { message: 'Telefon numarası en fazla 20 karakter olabilir' })
    guestPhone?: string;
}