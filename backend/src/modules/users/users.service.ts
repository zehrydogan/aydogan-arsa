import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

export interface CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
}

export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    isActive?: boolean;
}

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateUserDto): Promise<User> {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        return this.prisma.user.create({
            data: {
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                role: data.role || UserRole.VISITOR,
            },
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async update(id: string, data: UpdateUserDto): Promise<User> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async findAll(skip?: number, take?: number): Promise<Omit<User, 'password'>[]> {
        return this.prisma.user.findMany({
            skip,
            take,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                // Exclude password from results
            },
        });
    }

    async delete(id: string): Promise<void> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.prisma.user.delete({
            where: { id },
        });
    }

    async getUserProfile(id: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return user;
    }
}