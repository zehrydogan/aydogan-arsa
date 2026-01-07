import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadLocalService } from './upload-local.service';
import { UploadController } from './upload.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [UploadController],
    providers: [UploadService, UploadLocalService],
    exports: [UploadService, UploadLocalService],
})
export class UploadModule { }