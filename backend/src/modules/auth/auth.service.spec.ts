import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '@prisma/client';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let usersService: jest.Mocked<UsersService>;
    let jwtService: jest.Mocked<JwtService>;
    let configService: jest.Mocked<ConfigService>;

    const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        phone: '+905551234567',
        role: UserRole.VISITOR,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        avatar: null,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: {
                        findByEmail: jest.fn(),
                        findById: jest.fn(),
                        create: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                        verify: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string, defaultValue?: string) => {
                            const config = {
                                JWT_SECRET: 'test-secret',
                                JWT_REFRESH_SECRET: 'test-refresh-secret',
                                JWT_EXPIRATION: '15m',
                                JWT_REFRESH_EXPIRATION: '7d',
                            };
                            return config[key] || defaultValue;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get(UsersService);
        jwtService = module.get(JwtService);
        configService = module.get(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('validateUser', () => {
        it('should return user when credentials are valid', async () => {
            usersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser('test@example.com', 'password123');

            expect(result).toEqual(mockUser);
            expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
        });

        it('should return null when user not found', async () => {
            usersService.findByEmail.mockResolvedValue(null);

            const result = await service.validateUser('nonexistent@example.com', 'password123');

            expect(result).toBeNull();
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        it('should return null when password is incorrect', async () => {
            usersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const result = await service.validateUser('test@example.com', 'wrongpassword');

            expect(result).toBeNull();
        });
    });

    describe('login', () => {
        it('should return access and refresh tokens', async () => {
            const mockAccessToken = 'mock-access-token';
            const mockRefreshToken = 'mock-refresh-token';

            jwtService.sign
                .mockReturnValueOnce(mockAccessToken)
                .mockReturnValueOnce(mockRefreshToken);

            const result = await service.login(mockUser);

            expect(result).toEqual({
                accessToken: mockAccessToken,
                refreshToken: mockRefreshToken,
            });
            expect(jwtService.sign).toHaveBeenCalledTimes(2);
            expect(jwtService.sign).toHaveBeenCalledWith(
                {
                    sub: mockUser.id,
                    email: mockUser.email,
                    role: mockUser.role,
                    type: 'access',
                },
                expect.objectContaining({
                    secret: 'test-secret',
                    expiresIn: '15m',
                }),
            );
        });
    });

    describe('refreshTokens', () => {
        it('should return new tokens when refresh token is valid', async () => {
            const mockRefreshToken = 'valid-refresh-token';
            const mockPayload = {
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
                type: 'refresh' as const,
            };

            jwtService.verify.mockReturnValue(mockPayload);
            usersService.findById.mockResolvedValue(mockUser);
            jwtService.sign
                .mockReturnValueOnce('new-access-token')
                .mockReturnValueOnce('new-refresh-token');

            const result = await service.refreshTokens(mockRefreshToken);

            expect(result).toEqual({
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
            });
            expect(jwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
                secret: 'test-refresh-secret',
            });
        });

        it('should throw UnauthorizedException when token type is invalid', async () => {
            const mockPayload = {
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
                type: 'access' as const,
            };

            jwtService.verify.mockReturnValue(mockPayload);

            await expect(service.refreshTokens('invalid-token')).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw UnauthorizedException when user not found', async () => {
            const mockPayload = {
                sub: 'nonexistent-id',
                email: 'test@example.com',
                role: UserRole.VISITOR,
                type: 'refresh' as const,
            };

            jwtService.verify.mockReturnValue(mockPayload);
            usersService.findById.mockResolvedValue(null);

            await expect(service.refreshTokens('valid-token')).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    describe('register', () => {
        it('should create a new user with hashed password', async () => {
            const hashedPassword = 'hashed-password-123';
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
            usersService.create.mockResolvedValue(mockUser);

            const result = await service.register(
                'newuser@example.com',
                'password123',
                'New',
                'User',
                '+905551234567',
            );

            expect(result).toEqual(mockUser);
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(usersService.create).toHaveBeenCalledWith({
                email: 'newuser@example.com',
                password: hashedPassword,
                firstName: 'New',
                lastName: 'User',
                phone: '+905551234567',
                role: UserRole.VISITOR,
            });
        });
    });

    describe('validateJwtPayload', () => {
        it('should return user when payload is valid', async () => {
            const mockPayload = {
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
                type: 'access' as const,
            };

            usersService.findById.mockResolvedValue(mockUser);

            const result = await service.validateJwtPayload(mockPayload);

            expect(result).toEqual(mockUser);
            expect(usersService.findById).toHaveBeenCalledWith(mockUser.id);
        });

        it('should throw UnauthorizedException when user not found', async () => {
            const mockPayload = {
                sub: 'nonexistent-id',
                email: 'test@example.com',
                role: UserRole.VISITOR,
                type: 'access' as const,
            };

            usersService.findById.mockResolvedValue(null);

            await expect(service.validateJwtPayload(mockPayload)).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw UnauthorizedException when user is inactive', async () => {
            const inactiveUser = { ...mockUser, isActive: false };
            const mockPayload = {
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
                type: 'access' as const,
            };

            usersService.findById.mockResolvedValue(inactiveUser);

            await expect(service.validateJwtPayload(mockPayload)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });
});
