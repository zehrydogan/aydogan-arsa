import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMessageDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsUUID()
    receiverId: string;

    @IsUUID()
    conversationId: string;
}