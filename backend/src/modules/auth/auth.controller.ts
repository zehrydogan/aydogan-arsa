import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    HttpCode,
    HttpStatus,
    ConflictException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User, UserRole } from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        try {
            const user = await this.authService.register(
                registerDto.email,
                registerDto.password,
                registerDto.firstName,
                registerDto.lastName,
                registerDto.phone,
            );

            const tokens = await this.authService.login(user);

            return {
                message: 'Registration successful',
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                ...tokens,
            };
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('User with this email already exists');
            }
            throw error;
        }
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@CurrentUser() user: User, @Body() loginDto: LoginDto) {
        const tokens = await this.authService.login(user);

        return {
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            ...tokens,
        };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
        const tokens = await this.authService.refreshTokens(refreshTokenDto.refreshToken);

        return {
            message: 'Tokens refreshed successfully',
            ...tokens,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@CurrentUser() user: User) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout() {
        // In a real application, you might want to blacklist the token
        // For now, we'll just return a success message
        return {
            message: 'Logout successful',
        };
    }

    // Test endpoints for role-based access
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Get('owner-only')
    async ownerOnlyEndpoint(@CurrentUser() user: User) {
        return {
            message: 'This endpoint is only accessible by property owners and admins',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('admin-only')
    async adminOnlyEndpoint(@CurrentUser() user: User) {
        return {
            message: 'This endpoint is only accessible by admins',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }
}