import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    BadRequestException
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyQueryDto } from './dto/property-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole, PropertyStatus } from '@prisma/client';

@Controller('properties')
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Post()
    async create(
        @Body() createPropertyDto: CreatePropertyDto,
        @CurrentUser() user: User
    ) {
        const property = await this.propertiesService.create(createPropertyDto, user.id);
        return {
            message: 'Property created successfully',
            property
        };
    }

    @Get('search')
    async searchWithSuggestions(@Query() query: PropertyQueryDto) {
        const results = await this.propertiesService.searchWithSuggestions(query);
        return {
            message: `Found ${results.properties.length} properties`,
            ...results
        };
    }

    @Get()
    async findAll(@Query() query: PropertyQueryDto) {
        return this.propertiesService.findAll(query);
    }

    @Get('owner')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    async findOwnerProperties(
        @CurrentUser() user: User,
        @Query() query: PropertyQueryDto
    ) {
        return this.propertiesService.findByOwner(user.id, query);
    }

    @Get('owner/stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    async getOwnerPropertyStats(
        @CurrentUser() user: User
    ) {
        return this.propertiesService.getOwnerStats(user.id);
    }

    @Get('by-features')
    async findPropertiesByFeatures(
        @Query('featureIds') featureIds: string | string[],
        @Query() query: PropertyQueryDto
    ) {
        // Handle both single string and array of strings
        const featureIdsArray = Array.isArray(featureIds) ? featureIds : [featureIds];

        if (!featureIdsArray || featureIdsArray.length === 0) {
            throw new BadRequestException('At least one featureId is required');
        }

        return this.propertiesService.getPropertiesByFeatures(featureIdsArray, query);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const property = await this.propertiesService.findOne(id);
        return {
            property
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updatePropertyDto: UpdatePropertyDto,
        @CurrentUser() user: User
    ) {
        const property = await this.propertiesService.update(id, updatePropertyDto, user.id);
        return {
            message: 'Property updated successfully',
            property
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: PropertyStatus,
        @CurrentUser() user: User
    ) {
        const property = await this.propertiesService.updateStatus(id, status, user.id);
        return {
            message: 'Property status updated successfully',
            property
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Patch(':id/features')
    async updatePropertyFeatures(
        @Param('id') id: string,
        @Body('featureIds') featureIds: string[],
        @CurrentUser() user: User
    ) {
        if (!Array.isArray(featureIds)) {
            throw new BadRequestException('featureIds must be an array');
        }

        const property = await this.propertiesService.addFeaturesToProperty(id, featureIds, user.id);
        return {
            message: 'Property features updated successfully',
            property
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Delete(':id/features/:featureId')
    async removePropertyFeature(
        @Param('id') id: string,
        @Param('featureId') featureId: string,
        @CurrentUser() user: User
    ) {
        const property = await this.propertiesService.removeFeatureFromProperty(id, featureId, user.id);
        return {
            message: 'Feature removed from property successfully',
            property
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('id') id: string,
        @CurrentUser() user: User
    ) {
        await this.propertiesService.remove(id, user.id);
    }
}