import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { FeaturesModule } from './modules/features/features.module';
import { GeoModule } from './modules/geo/geo.module';
import { UploadModule } from './modules/upload/upload.module';
import { ContactModule } from './modules/contact/contact.module';
import { MessagesModule } from './modules/messages/messages.module';
import { FavoritesModule } from './favorites/favorites.module';
import { SavedSearchesModule } from './saved-searches/saved-searches.module';

@Module({
    imports: [
        // Configuration module
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Rate limiting
        ThrottlerModule.forRoot([
            {
                ttl: 60000, // 1 minute
                limit: 100, // 100 requests per minute
            },
        ]),

        // Core modules
        PrismaModule,
        AuthModule,
        UsersModule,
        PropertiesModule,
        FeaturesModule,
        GeoModule,
        UploadModule,
        ContactModule,
        MessagesModule,
        FavoritesModule,
        SavedSearchesModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }