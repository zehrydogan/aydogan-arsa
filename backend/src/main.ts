import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // CORS configuration
    app.enableCors({
        origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });

    // Serve static files (uploaded images)
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });

    // Global prefix for API routes
    app.setGlobalPrefix('api');

    const configService = app.get(ConfigService);
    const port = configService.get('PORT') || 3001;

    await app.listen(port);
    console.log(`🚀 Real Estate Marketplace Backend running on port ${port}`);
}

bootstrap();