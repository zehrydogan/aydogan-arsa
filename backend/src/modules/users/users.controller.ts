import {
    Controller,
    Get,
    Put,
    Body,
    Param,
    UseGuards,
    ForbiddenException,
    NotFoundException
} from '@nestjs/common';
import { UsersService, UpdateUserDto } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from '@prisma/client';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getMyProfile(@CurrentUser() user: User) {
        const profile = await this.usersService.getUserProfile(user.id);

        if (!profile) {
            throw new NotFoundException('User profile not found');
        }

        return {
            message: 'Profile retrieved successfully',
            user: profile,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Put('profile')
    async updateMyProfile(
        @CurrentUser() user: User,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        const updatedUser = await this.usersService.update(user.id, updateUserDto);

        return {
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                phone: updatedUser.phone,
                avatar: updatedUser.avatar,
                role: updatedUser.role,
                isActive: updatedUser.isActive,
                updatedAt: updatedUser.updatedAt,
            },
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get()
    async getAllUsers() {
        const users = await this.usersService.findAll();

        return {
            message: 'Users retrieved successfully',
            users,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getUserById(
        @Param('id') id: string,
        @CurrentUser() currentUser: User,
    ) {
        // Users can only view their own profile, unless they are admin
        if (currentUser.id !== id && currentUser.role !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only view your own profile');
        }

        const user = await this.usersService.getUserProfile(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            message: 'User retrieved successfully',
            user,
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Put(':id')
    async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        const updatedUser = await this.usersService.update(id, updateUserDto);

        return {
            message: 'User updated successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                phone: updatedUser.phone,
                avatar: updatedUser.avatar,
                role: updatedUser.role,
                isActive: updatedUser.isActive,
                updatedAt: updatedUser.updatedAt,
            },
        };
    }
}