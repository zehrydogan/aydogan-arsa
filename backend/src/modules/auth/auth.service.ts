import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '@prisma/client';

export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    type: 'access' | 'refresh';
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.usersService.findByEmail(email);

        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        }

        return null;
    }

    async login(user: User): Promise<AuthTokens> {
        const payload: Omit<JwtPayload, 'type'> = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(
            { ...payload, type: 'access' },
            {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
            }
        );

        const refreshToken = this.jwtService.sign(
            { ...payload, type: 'refresh' },
            {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
            }
        );

        return {
            accessToken,
            refreshToken,
        };
    }

    async refreshTokens(refreshToken: string): Promise<AuthTokens> {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            }) as JwtPayload;

            if (payload.type !== 'refresh') {
                throw new UnauthorizedException('Invalid token type');
            }

            const user = await this.usersService.findById(payload.sub);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            return this.login(user);
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async register(email: string, password: string, firstName: string, lastName: string, phone?: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);

        return this.usersService.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            role: UserRole.VISITOR, // Default role for new registrations
        });
    }

    async validateJwtPayload(payload: JwtPayload): Promise<User> {
        const user = await this.usersService.findById(payload.sub);

        if (!user || !user.isActive) {
            throw new UnauthorizedException('User not found or inactive');
        }

        return user;
    }
}