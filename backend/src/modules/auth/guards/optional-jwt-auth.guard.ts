import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    // Override handleRequest to make authentication optional
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        // If there's an error or no user, just return null (no authentication)
        // This allows the request to proceed without authentication
        return user || null;
    }

    // Override canActivate to always return true
    canActivate(context: ExecutionContext) {
        // Always allow the request to proceed
        return super.canActivate(context) as boolean | Promise<boolean>;
    }

    // Override getRequest to handle cases where JWT validation fails
    getRequest(context: ExecutionContext) {
        return context.switchToHttp().getRequest();
    }
}