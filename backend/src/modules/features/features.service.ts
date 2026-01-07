import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Feature } from '@prisma/client';

@Injectable()
export class FeaturesService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<Feature[]> {
        return this.prisma.feature.findMany({
            orderBy: [
                { category: 'asc' },
                { name: 'asc' }
            ]
        });
    }

    async findByCategory(category: string): Promise<Feature[]> {
        return this.prisma.feature.findMany({
            where: { category },
            orderBy: { name: 'asc' }
        });
    }

    async findById(id: string): Promise<Feature | null> {
        return this.prisma.feature.findUnique({
            where: { id }
        });
    }

    async getCategories(): Promise<string[]> {
        const features = await this.prisma.feature.findMany({
            select: { category: true },
            distinct: ['category']
        });

        return features.map(f => f.category).sort();
    }

    async getFeaturesGroupedByCategory(): Promise<Record<string, Feature[]>> {
        const features = await this.findAll();

        return features.reduce((acc, feature) => {
            if (!acc[feature.category]) {
                acc[feature.category] = [];
            }
            acc[feature.category].push(feature);
            return acc;
        }, {} as Record<string, Feature[]>);
    }

    async getPropertyFeatures(propertyId: string): Promise<Feature[]> {
        const propertyFeatures = await this.prisma.propertyFeature.findMany({
            where: { propertyId },
            include: { feature: true }
        });

        return propertyFeatures.map(pf => pf.feature);
    }

    async getPropertiesWithFeature(featureId: string): Promise<string[]> {
        const propertyFeatures = await this.prisma.propertyFeature.findMany({
            where: { featureId },
            select: { propertyId: true }
        });

        return propertyFeatures.map(pf => pf.propertyId);
    }

    async getFeatureUsageStats(): Promise<Array<{ feature: Feature; count: number }>> {
        const features = await this.prisma.feature.findMany({
            include: {
                properties: {
                    select: { propertyId: true }
                }
            }
        });

        return features.map(feature => ({
            feature: {
                id: feature.id,
                name: feature.name,
                category: feature.category,
                icon: feature.icon
            },
            count: feature.properties.length
        })).sort((a, b) => b.count - a.count);
    }
}