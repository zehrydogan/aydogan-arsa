import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(private configService: ConfigService) {
        super({
            datasources: {
                db: {
                    url: configService.get('DATABASE_URL'),
                },
            },
        });
    }

    async onModuleInit() {
        await this.$connect();
        console.log('✅ Database connected successfully');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('🔌 Database disconnected');
    }

    async cleanDb() {
        // For testing purposes - clean database in reverse order of dependencies
        if (process.env.NODE_ENV === 'test') {
            const modelNames = Reflect.ownKeys(this).filter(
                (key) => key[0] !== '_' && key !== 'constructor'
            );

            return Promise.all(
                modelNames.map((modelName) => this[modelName].deleteMany())
            );
        }
    }
}