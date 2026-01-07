import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

export function OwnerOnly() {
    return applyDecorators(
        Roles(UserRole.OWNER, UserRole.ADMIN),
        UseGuards(JwtAuthGuard, RolesGuard),
    );
}

export function AdminOnly() {
    return applyDecorators(
        Roles(UserRole.ADMIN),
        UseGuards(JwtAuthGuard, RolesGuard),
    );
}

export function AuthenticatedOnly() {
    return applyDecorators(
        UseGuards(JwtAuthGuard),
    );
}