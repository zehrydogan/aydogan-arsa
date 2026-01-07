import { IsString, IsNumber, IsOptional, IsEnum, IsObject, IsNotEmpty, Min, Max } from 'class-validator';
import { PropertyCategory } from '@prisma/client';

export class CreatePropertyDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsString()
    @IsOptional()
    currency?: string = 'TRY';

    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    locationId: string;

    @IsObject()
    @IsOptional()
    details?: {
        area?: number;           // m² cinsinden alan
        adaParsel?: string;      // Ada/Parsel numarası
        imarDurumu?: string;     // İmar durumu
        tapuDurumu?: string;     // Tapu durumu
        gabari?: string;         // Gabari bilgisi
        katSayisi?: number;      // İzin verilen kat sayısı
        emsal?: string;          // Emsal değeri
        yolCephesi?: number;     // Yol cephesi (metre)
        altyapi?: boolean;       // Altyapı var mı
        elektrik?: boolean;      // Elektrik var mı
        su?: boolean;            // Su var mı
        dogalgaz?: boolean;      // Doğalgaz var mı
        [key: string]: any;
    };

    @IsEnum(PropertyCategory)
    category: PropertyCategory;

    @IsOptional()
    featureIds?: string[];
}