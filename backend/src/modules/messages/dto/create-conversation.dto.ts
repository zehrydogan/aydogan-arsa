import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
    @IsUUID()
    propertyId: string;

    @IsUUID()
    participantId: string;

    @IsString()
    @IsNotEmpty()
    initialMessage: string;
}