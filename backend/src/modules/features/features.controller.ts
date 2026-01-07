import { Controller, Get, Param, Query } from '@nestjs/common';
import { FeaturesService } from './features.service';

@Controller('features')
export class FeaturesController {
    constructor(private readonly featuresService: FeaturesService) { }

    @Get()
    async findAll(@Query('category') category?: string) {
        if (category) {
            const features = await this.featuresService.findByCategory(category);
            return { features };
        }

        const features = await this.featuresService.findAll();
        return { features };
    }

    @Get('grouped')
    async getFeaturesGroupedByCategory() {
        const featuresGrouped = await this.featuresService.getFeaturesGroupedByCategory();
        return { featuresGrouped };
    }

    @Get('categories')
    async getCategories() {
        const categories = await this.featuresService.getCategories();
        return { categories };
    }

    @Get('stats')
    async getFeatureUsageStats() {
        const stats = await this.featuresService.getFeatureUsageStats();
        return { stats };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const feature = await this.featuresService.findById(id);
        return { feature };
    }

    @Get(':id/properties')
    async getPropertiesWithFeature(@Param('id') id: string) {
        const propertyIds = await this.featuresService.getPropertiesWithFeature(id);
        return { propertyIds };
    }
}